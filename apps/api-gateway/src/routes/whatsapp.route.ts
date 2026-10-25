import { Router, Request, Response } from 'express'
import { whatsAppService } from '../services/whatsapp.service.js'
import { dbService } from '../services/db.service.js'
import { integrationsService } from '../services/integrations.service.js'

export const whatsappRouter = Router()

// 1. Meta Webhook Verification Handshake (hub.challenge)
whatsappRouter.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string
  const token = req.query['hub.verify_token'] as string
  const challenge = req.query['hub.challenge'] as string

  if (!mode || !token) {
    return res.status(400).send('Missing hub parameters')
  }

  const result = whatsAppService.verifyWebhookChallenge(mode, token, challenge)
  if (result) {
    return res.status(200).send(result)
  }

  return res.status(403).send('Forbidden: Token mismatch')
})

// 2. Meta Inbound Webhook Listener (Messages, Statuses)
whatsappRouter.post('/webhooks/whatsapp', (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined

  if (!whatsAppService.verifySignature(JSON.stringify(req.body), signature)) {
    return res.status(401).send('Unauthorized: Invalid cryptographic signature')
  }

  const outcome = whatsAppService.processWebhookPayload(req.body)
  res.status(200).json({ status: 'EVENT_RECEIVED', ...outcome })
})

// 3. Outbound WhatsApp Message Dispatcher
whatsappRouter.post('/whatsapp/send-message', async (req: Request, res: Response) => {
  const { to, text, conversationId } = req.body

  if (!to || !text) {
    return res.status(400).json({
      success: false,
      message: 'Recipient phone number (to) and message text are required.',
    })
  }

  const message = await whatsAppService.sendTextMessage(to, text)

  if (conversationId) {
    dbService.addMessage(conversationId, {
      content: text,
      senderType: 'agent',
      senderName: 'Agent Bhavik',
      messageType: 'text',
      wamid: message.wamid,
      status: 'sent',
    })
  }

  res.status(200).json({
    success: true,
    message: 'Message dispatched via Meta Cloud API transport.',
    data: message,
  })
})

// 4. Outbound WhatsApp Template Dispatcher
whatsappRouter.post('/whatsapp/send-template', async (req: Request, res: Response) => {
  const { to, templateName, languageCode, components } = req.body

  if (!to || !templateName) {
    return res.status(400).json({
      success: false,
      message: 'Recipient phone number (to) and templateName are required.',
    })
  }

  const message = await whatsAppService.sendTemplateMessage(
    to,
    templateName,
    languageCode || 'en_US',
    components
  )

  res.status(200).json({
    success: true,
    message: 'Template message dispatched via Meta Cloud API transport.',
    data: message,
  })
})

// 5. WABA Account & Connection Status
whatsappRouter.get('/whatsapp/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: whatsAppService.getWabaStatus(),
  })
})

// 6. Test Meta Connection Live (Ping Meta Graph API)
whatsappRouter.post('/whatsapp/test-connection', async (req: Request, res: Response) => {
  const { accessToken, phoneNumberId, wabaId } = req.body
  const result = await whatsAppService.testMetaConnection({
    accessToken,
    phoneNumberId,
    wabaId,
  })

  res.json({
    success: result.connected,
    data: result,
  })
})

// 7. Get Credentials Config
whatsappRouter.get('/whatsapp/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: whatsAppService.getWabaStatus(),
  })
})

// 8. Update & Persist Credentials Config
whatsappRouter.post('/whatsapp/config', (req: Request, res: Response) => {
  const { accessToken, phoneNumberId, wabaId, appSecret, verifyToken } = req.body

  const updated = whatsAppService.updateCredentials({
    accessToken,
    phoneNumberId,
    wabaId,
    appSecret,
    verifyToken,
  })

  res.json({
    success: true,
    message: 'WhatsApp Cloud API credentials updated and persisted successfully.',
    data: updated,
  })
})

// 9. Sync Templates from Live Meta WABA
whatsappRouter.post('/whatsapp/templates/sync', async (_req: Request, res: Response) => {
  const result = await whatsAppService.syncMetaTemplates()
  res.json({
    success: result.synced,
    ...result,
  })
})

// 10. Developer Sandbox: Simulate Inbound Customer Message
whatsappRouter.post('/whatsapp/simulate-inbound', (req: Request, res: Response) => {
  const { from, name, text } = req.body

  if (!from || !text) {
    return res.status(400).json({
      success: false,
      message: 'from (phone) and text are required.',
    })
  }

  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '200987654321098',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '919000000000',
                phone_number_id: '100654321098765',
              },
              contacts: [
                {
                  profile: { name: name || 'Interested Customer' },
                  wa_id: from.replace('+', ''),
                },
              ],
              messages: [
                {
                  from: from.replace('+', ''),
                  id: `wamid.HBgM${Date.now()}SIMULATED`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: { body: text },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }

  const outcome = whatsAppService.processWebhookPayload(mockPayload)
  integrationsService.addLog({
    source: 'Meta WhatsApp Cloud',
    event: 'SIMULATED_MESSAGES_RECEIVED',
    status: '200 OK',
    payloadPreview: `{ from: "${from}", name: "${name || 'Customer'}", text: "${text.slice(0, 80)}" }`,
    fullPayload: mockPayload,
  })

  res.status(200).json({
    success: true,
    message: 'Inbound WhatsApp message simulated and recorded in Team Inbox.',
    outcome,
  })
})
