import http from 'http'
import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { WebSocketServer, WebSocket } from 'ws'
import { dbService } from './services/db.service.js'
import { contactsRouter } from './routes/contacts.route.js'
import { conversationsRouter } from './routes/conversations.route.js'
import { campaignsRouter } from './routes/campaigns.route.js'
import { tagsRouter } from './routes/tags.route.js'
import { columnsRouter } from './routes/columns.route.js'
import { optsRouter } from './routes/opts.route.js'
import { whatsappRouter } from './routes/whatsapp.route.js'
import { templatesRouter } from './routes/templates.route.js'
import { botRouter } from './routes/bot.route.js'
import { integrationsRouter } from './routes/integrations.route.js'
import { aiRouter } from './routes/ai.route.js'
import { whatsAppService } from './services/whatsapp.service.js'
import { integrationsService } from './services/integrations.service.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// Realtime WebSocket broadcast helper
export const broadcastRealtime = (type: string, payload: any) => {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// Wire internal service events to WebSocket clients
whatsAppService.onEvent = (type, payload) => broadcastRealtime(type, payload)
integrationsService.onEvent = (type, payload) => broadcastRealtime(type, payload)

// Attach WebSocket client handlers
wss.on('connection', (ws: WebSocket) => {
  console.log('⚡ [WhatsAPI Realtime] Client connected to live stream')
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    payload: {
      status: 'active',
      time: new Date().toISOString(),
      channels: ['whatsapp', 'campaigns', 'contacts', 'leads']
    }
  }))

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString())
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }))
      }
    } catch (e) {}
  })
})

// Middlewares
app.use(cors())
app.use(express.json())

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.json(dbService.getHealth())
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json(dbService.getHealth())
})

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json(dbService.getHealth())
})

// =============================================================================
// Webhook Handshake & Inbound Aliases (Direct Meta & Third-Party Compatibility)
// =============================================================================

// 1. WhatsApp Webhook Handshake (GET)
const handleWaGet = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string
  const token = req.query['hub.verify_token'] as string
  const challenge = req.query['hub.challenge'] as string

  if (!mode || !token) {
    integrationsService.addLog({
      source: 'Meta Handshake (GET)',
      event: 'MISSING_HUB_PARAMETERS',
      status: '400 BAD',
      payloadPreview: 'Missing hub.mode or hub.verify_token in query string',
      fullPayload: req.query,
    })
    return res.status(400).send('Missing hub parameters')
  }

  const result = whatsAppService.verifyWebhookChallenge(mode, token, challenge)
  if (result) {
    integrationsService.addLog({
      source: 'Meta Handshake (GET)',
      event: 'HUB_CHALLENGE_VERIFIED',
      status: '200 OK',
      payloadPreview: `hub.mode=${mode} | token=${token.slice(0, 10)}... | challenge=${challenge}`,
      fullPayload: { mode, token, challenge },
    })
    return res.status(200).send(result)
  }

  integrationsService.addLog({
    source: 'Meta Handshake (GET)',
    event: 'TOKEN_MISMATCH_FORBIDDEN',
    status: '400 BAD',
    payloadPreview: `Forbidden: Provided verify_token "${token}" does not match configured token.`,
    fullPayload: { mode, token, challenge },
  })
  return res.status(403).send('Forbidden: Token mismatch')
}

// 2. WhatsApp Inbound Webhook Listener (POST)
const handleWaPost = (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined

  if (!whatsAppService.verifySignature(JSON.stringify(req.body), signature)) {
    integrationsService.addLog({
      source: 'Meta WhatsApp Cloud',
      event: 'SIGNATURE_VERIFICATION_FAILED',
      status: '400 BAD',
      payloadPreview: 'Unauthorized: Invalid cryptographic HMAC-SHA256 signature',
      fullPayload: { signature, body: req.body },
    })
    return res.status(401).send('Unauthorized: Invalid cryptographic signature')
  }

  const outcome = whatsAppService.processWebhookPayload(req.body)
  integrationsService.addLog({
    source: 'Meta WhatsApp Cloud',
    event: outcome.type ? `WHATSAPP_${outcome.type.toUpperCase()}` : 'EVENT_RECEIVED',
    status: '200 OK',
    payloadPreview: JSON.stringify(req.body).slice(0, 140),
    fullPayload: req.body,
  })
  res.status(200).json({ status: 'EVENT_RECEIVED', ...outcome })
}

app.get('/webhook/whatsapp', handleWaGet)
app.get('/webhooks/whatsapp', handleWaGet)
app.post('/webhook/whatsapp', handleWaPost)
app.post('/webhooks/whatsapp', handleWaPost)

// 3. IndiaMart Webhook Alias
app.post('/webhook/indiamart', async (req: Request, res: Response) => {
  const { SENDER_NAME, SENDER_MOBILE, SENDER_EMAIL, QUERY_PRODUCT_NAME, QUERY_MESSAGE } = req.body

  if (!SENDER_MOBILE) {
    return res.status(400).json({
      success: false,
      message: 'SENDER_MOBILE is required for IndiaMart lead ingestion.',
    })
  }

  try {
    const result = await integrationsService.handleIndiaMartLead({
      SENDER_NAME: SENDER_NAME || 'IndiaMart Lead',
      SENDER_MOBILE,
      SENDER_EMAIL,
      QUERY_PRODUCT_NAME,
      QUERY_MESSAGE,
    })

    res.status(201).json({
      success: true,
      message: 'IndiaMart lead captured, contact saved, and WhatsApp welcome outreach sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

// 4. Facebook Lead Ads Webhook Alias
app.post('/webhook/facebook', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleFacebookLead(req.body)
    res.status(201).json({
      success: true,
      message: 'Facebook Lead captured, contact saved, and WhatsApp onboarding triggered.',
      data: result,
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

// 5. Razorpay Payment Webhook Alias
app.post('/webhook/razorpay', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleRazorpayPayment(req.body)
    res.status(200).json({
      success: true,
      message: 'Razorpay payment captured and WhatsApp receipt dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 6. Shopify Webhook Alias
app.post('/webhook/shopify', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleShopifyOrder(req.body)
    res.status(201).json({
      success: true,
      message: 'Shopify order processed and WhatsApp confirmation dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 7. WooCommerce Webhook Alias
app.post('/webhook/woocommerce', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleWooCommerceOrder(req.body)
    res.status(200).json({
      success: true,
      message: 'WooCommerce order captured and WhatsApp alert dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 8. Justdial Webhook Alias
app.post('/webhook/justdial', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleJustdialLead(req.body)
    res.status(201).json({
      success: true,
      message: 'Justdial lead ingested and catalog dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 9. TradeIndia Webhook Alias
app.post('/webhook/tradeindia', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleTradeIndiaLead(req.body)
    res.status(201).json({
      success: true,
      message: 'TradeIndia lead ingested and WhatsApp greeting dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 10. ExportersIndia Webhook Alias
app.post('/webhook/exportersindia', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleExportersIndiaLead(req.body)
    res.status(201).json({
      success: true,
      message: 'ExportersIndia lead ingested and quote dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 11. Calendly Webhook Alias
app.post('/webhook/calendly', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleCalendlyBooking(req.body)
    res.status(200).json({
      success: true,
      message: 'Calendly demo meeting confirmed and WhatsApp reminder sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 12. Google Sheets Webhook Alias
app.post('/webhook/sheets', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleGoogleSheetsSync(req.body)
    res.status(200).json({
      success: true,
      message: 'Google Sheets row synced and WhatsApp outreach sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 13. Generic Inbound Webhook Alias
app.post('/webhook/generic', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleGenericWebhook('Custom HTTP Webhook Node', req.body)
    res.status(200).json({
      success: true,
      message: 'Inbound generic webhook payload acknowledged.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 14. Send Message API Alias (Syncs with DB, Conversations & WebSockets)
app.post('/api/messages/send', async (req: Request, res: Response) => {
  const { to, text, template, conversationId } = req.body

  if (!to) {
    return res.status(400).json({ success: false, message: 'Recipient phone number (to) is required.' })
  }

  const rawPhone = String(to).replace(/[^0-9]/g, '')
  const cleanPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`

  // 1. Find or create Contact in dbService
  let contact = dbService.contacts.find((c) => c.phone === cleanPhone)
  if (!contact) {
    contact = dbService.createContact({
      name: `WhatsApp Lead (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      source: 'whatsapp',
      optIn: true,
      tags: [dbService.tags[0]],
      assignedToName: 'Agent Bhavik',
    })
  }

  // 2. Find or create Conversation in dbService
  let conv = conversationId ? dbService.getConversationById(conversationId) : null
  if (!conv) {
    conv = dbService.conversations.find((c) => c.contactPhone === cleanPhone)
  }
  if (!conv) {
    conv = {
      id: `conv-${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: cleanPhone,
      channel: 'whatsapp',
      status: 'open',
      lastMessageText: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      tags: contact.tags,
      messages: [],
    }
    dbService.conversations.unshift(conv)
  }

  // 3. Dispatch via WhatsApp service (Meta Cloud API or resilient local gateway)
  let sentMsg: any = null
  if (template) {
    sentMsg = await whatsAppService.sendTemplateMessage(
      cleanPhone,
      template.name,
      template.language?.code || 'en_US',
      template.components
    )
  } else {
    sentMsg = await whatsAppService.sendTextMessage(cleanPhone, text || 'Whatsapi Outreach')
  }

  // 4. Save into conversation
  const savedMsg = dbService.addMessage(conv.id, {
    senderType: 'agent',
    senderName: 'Agent Bhavik',
    messageType: template ? 'template' : 'text',
    content: text || `[Template: ${template?.name}]`,
    wamid: sentMsg.wamid,
    status: 'sent',
  })

  // 5. Broadcast in real time
  broadcastRealtime('MESSAGE_SENT', { to: cleanPhone, conversationId: conv.id, message: savedMsg, conversation: conv })

  return res.status(200).json({ success: true, messageId: savedMsg.id, status: 'sent', message: savedMsg, data: savedMsg })
})

// =============================================================================
// Standard API Routes (both /api and /api/v1 prefixes)
// =============================================================================
app.use('/api/contacts', contactsRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/campaigns', campaignsRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/columns', columnsRouter)
app.use('/api/opts', optsRouter)
app.use('/api/templates', templatesRouter)
app.use('/api/integrations', integrationsRouter)
app.use('/api', whatsappRouter)

app.use('/api/v1/contacts', contactsRouter)
app.use('/api/v1/conversations', conversationsRouter)
app.use('/api/v1/campaigns', campaignsRouter)
app.use('/api/v1/tags', tagsRouter)
app.use('/api/v1/columns', columnsRouter)
app.use('/api/v1/opts', optsRouter)
app.use('/api/v1/templates', templatesRouter)
app.use('/api/v1/whatsapp/templates', templatesRouter)
app.use('/api/v1/whatsapp', whatsappRouter)
app.use('/api/v1/bot', botRouter)
app.use('/api/v1/integrations', integrationsRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1', whatsappRouter)

// Global Root Information
app.get('/', (_req: Request, res: Response) => {
  res.json({
    platform: 'Whatsapi — Enterprise Omnichannel & AI Orchestration Platform',
    version: '1.0.0',
    websocket: `ws://localhost:${PORT}`,
    endpoints: {
      health: '/api/v1/health',
      contacts: '/api/v1/contacts',
      conversations: '/api/v1/conversations',
      campaigns: '/api/v1/campaigns',
      tags: '/api/v1/tags',
      templates: '/api/v1/whatsapp/templates',
      templatesPreview: '/api/v1/whatsapp/templates/preview',
      campaignDispatch: '/api/v1/campaigns/:id/dispatch',
      botRules: '/api/v1/bot/rules',
      integrations: '/api/v1/integrations',
      webhooks: '/api/v1/webhooks/whatsapp',
      webhookDirect: '/webhook/whatsapp',
      indiamartDirect: '/webhook/indiamart',
      facebookDirect: '/webhook/facebook',
      aiAssistant: '/api/v1/ai/ask',
    },
  })
})

// Server Listen (HTTP + WebSocket)
server.listen(PORT, () => {
  console.log(`🚀 Whatsapi Gateway running on http://localhost:${PORT}`)
  console.log(`⚡ Realtime WebSocket running on ws://localhost:${PORT}`)
  console.log(`📡 WhatsApp Webhook URL: http://localhost:${PORT}/webhook/whatsapp`)
  console.log(`📦 IndiaMart Webhook URL: http://localhost:${PORT}/webhook/indiamart`)
})
