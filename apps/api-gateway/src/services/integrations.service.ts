import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbService } from './db.service.js'
import { whatsAppService } from './whatsapp.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STORE_PATH = path.resolve(__dirname, '../data/integrations-store.json')

export interface IndiaMartLeadPayload {
  QUERY_ID?: string
  SENDER_NAME: string
  SENDER_MOBILE: string
  SENDER_EMAIL?: string
  QUERY_PRODUCT_NAME?: string
  QUERY_MESSAGE?: string
  GLUSR_USR_CITY?: string
  GLUSR_USR_STATE?: string
}

export interface FacebookLeadPayload {
  leadgen_id?: string
  created_time?: string
  form_id?: string
  field_data: Array<{
    name: string
    values: string[]
  }>
}

export interface RazorpayPaymentPayload {
  event?: string
  payload?: {
    payment?: {
      entity?: {
        id: string
        amount: number
        contact: string
        email?: string
        status: string
      }
    }
  }
}

export interface ShopifyOrderPayload {
  id?: string | number
  order_number?: string | number
  email?: string
  phone?: string
  total_price?: string
  customer?: {
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
  }
  line_items?: Array<{ title: string; quantity: number }>
}

export interface JustdialLeadPayload {
  lead_id?: string
  name: string
  mobile: string
  category?: string
  city?: string
  area?: string
}

export interface TradeIndiaLeadPayload {
  r_id?: string
  sender_name: string
  sender_mobile: string
  sender_email?: string
  subject?: string
  message?: string
}

export interface CalendlyBookingPayload {
  event?: string
  payload?: {
    name?: string
    email?: string
    phone?: string
    scheduled_event?: {
      start_time?: string
      name?: string
    }
  }
}

export interface ConnectorInfo {
  id: string
  name: string
  category: 'Featured' | 'Flows' | 'AI & LLM' | 'Helpers'
  description: string
  connected: boolean
  tag: string
  iconColor: string
  defaultEndpoint?: string
  apiConfig?: {
    apiKeyName?: string
    apiKeyValue?: string
    webhookUrl?: string
    autoReplyTemplate?: string
    syncInterval?: string
  }
  leadCount: number
  lastEventAt?: string
}

export interface WebhookLogEntry {
  id: string
  source: string
  event: string
  status: '200 OK' | '201 Created' | '400 BAD'
  payloadPreview: string
  fullPayload?: any
  timestamp: string
  createdAt: string
}

export class IntegrationsService {
  public onEvent?: (type: string, payload: any) => void

  public connectors: ConnectorInfo[] = [
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      category: 'Featured',
      description: 'Official Meta Cloud API connection with template approval, interactive flows, and real-time webhook listeners.',
      connected: true,
      tag: 'Official Meta',
      iconColor: 'bg-emerald-500/15 text-emerald-600',
      defaultEndpoint: 'https://graph.facebook.com/v21.0/4178861219018691',
      apiConfig: {
        apiKeyName: 'Permanent System User Token',
        apiKeyValue: 'EAAGlP3m4ZCUwBO629ZAX...••••••••••••',
        webhookUrl: 'http://localhost:4000/webhook/whatsapp',
        autoReplyTemplate: 'official_waba_welcome_flow',
      },
      leadCount: 4890,
    },
    {
      id: 'facebook-lead-ads',
      name: 'Facebook Lead Ads',
      category: 'Featured',
      description: 'Instant lead capture from Meta ads into WhatsApp automated conversation sequences.',
      connected: true,
      tag: 'Meta Ads',
      iconColor: 'bg-blue-500/15 text-blue-600',
      defaultEndpoint: 'https://graph.facebook.com/v21.0/page-leads',
      apiConfig: {
        apiKeyName: 'Page Access Token (Leadgen Read)',
        apiKeyValue: 'EAAZAY59281...••••••••••••',
        webhookUrl: 'http://localhost:4000/webhook/facebook',
        autoReplyTemplate: 'fb_instant_fleet_quote',
      },
      leadCount: 890,
    },
    {
      id: 'indiamart',
      name: 'IndiaMart',
      category: 'Featured',
      description: 'Real-time buyer inquiry push API with instant WhatsApp greeting and catalog dispatch.',
      connected: true,
      tag: 'B2B Lead Engine',
      iconColor: 'bg-orange-500/15 text-orange-600',
      defaultEndpoint: 'https://api.indiamart.com/wservces/enquiry/v1',
      apiConfig: {
        apiKeyName: 'CRM Push API Key (GLUSR_ID)',
        apiKeyValue: 'mKey_98250123_IM_CRM_2026',
        webhookUrl: 'http://localhost:4000/webhook/indiamart',
        autoReplyTemplate: 'indiamart_instant_catalog_v2',
      },
      leadCount: 1420,
    },
    {
      id: 'exporters-india',
      name: 'ExportersIndia',
      category: 'Featured',
      description: 'Automated buyer lead sync and lead tagging for exporter and fleet clients.',
      connected: true,
      tag: 'B2B Leads',
      iconColor: 'bg-purple-500/15 text-purple-600',
      defaultEndpoint: 'https://api.exportersindia.com/leads/v2',
      apiConfig: {
        apiKeyName: 'Exporter Vendor Key',
        apiKeyValue: 'EXP_VEND_982109',
        webhookUrl: 'http://localhost:4000/webhook/exportersindia',
        autoReplyTemplate: 'export_inquiry_reply',
      },
      leadCount: 320,
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      category: 'Flows',
      description: 'Append incoming leads to spreadsheets and trigger broadcasts on new spreadsheet rows.',
      connected: true,
      tag: 'Sync',
      iconColor: 'bg-emerald-600/15 text-emerald-700',
      defaultEndpoint: 'https://sheets.googleapis.com/v4/spreadsheets',
      apiConfig: {
        apiKeyName: 'Spreadsheet ID',
        apiKeyValue: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        webhookUrl: 'http://localhost:4000/webhook/sheets',
      },
      leadCount: 2310,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      category: 'AI & LLM',
      description: 'Power intelligent FAQ auto-replies, intent extraction, and conversational agents.',
      connected: true,
      tag: 'GPT-4o',
      iconColor: 'bg-purple-600/15 text-purple-700',
      defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiConfig: {
        apiKeyName: 'OpenAI API Secret Key',
        apiKeyValue: 'sk-proj-928198273...••••••••••••',
        autoReplyTemplate: 'Model: gpt-4o | Temp: 0.7',
      },
      leadCount: 1980,
    },
    {
      id: 'google-gemini',
      name: 'Google Gemini',
      category: 'AI & LLM',
      description: 'Fast, high-context AI agent responses for local Indian language support.',
      connected: true,
      tag: 'Gemini 1.5 Pro',
      iconColor: 'bg-sky-500/15 text-sky-600',
      defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
      apiConfig: {
        apiKeyName: 'Gemini API Key',
        apiKeyValue: 'AIzaSy89271...••••••••••••',
        autoReplyTemplate: 'Model: gemini-1.5-pro | Lang: Gujarati + Hinglish',
      },
      leadCount: 1650,
    },
    {
      id: 'calendly',
      name: 'Calendly',
      category: 'Flows',
      description: 'Send WhatsApp appointment confirmations and booking reminders automatically.',
      connected: true,
      tag: 'Scheduling',
      iconColor: 'bg-blue-500/15 text-blue-600',
      defaultEndpoint: 'https://api.calendly.com/v2',
      apiConfig: {
        apiKeyName: 'Calendly Personal Access Token',
        apiKeyValue: 'cal_live_pat_892109',
        webhookUrl: 'http://localhost:4000/webhook/calendly',
      },
      leadCount: 210,
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'Flows',
      description: 'Sync customer demo bookings directly with team calendar schedules.',
      connected: false,
      tag: 'Productivity',
      iconColor: 'bg-amber-500/15 text-amber-600',
      leadCount: 0,
    },
    {
      id: 'google-contacts',
      name: 'Google Contacts',
      category: 'Flows',
      description: 'Bi-directional sync between Google address book and VEROX CRM contacts.',
      connected: false,
      tag: 'Contacts',
      iconColor: 'bg-blue-600/15 text-blue-700',
      leadCount: 0,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'Flows',
      description: 'Send automated WhatsApp order confirmations, tracking links, and abandoned cart alerts.',
      connected: true,
      tag: 'E-commerce',
      iconColor: 'bg-emerald-500/15 text-emerald-600',
      defaultEndpoint: 'https://myshopify.com/admin/api/2026-01',
      apiConfig: {
        apiKeyName: 'Shopify Admin API Token',
        apiKeyValue: 'shpat_9821098273412891',
        webhookUrl: 'http://localhost:4000/webhook/shopify',
        autoReplyTemplate: 'shopify_order_confirmation_v1',
      },
      leadCount: 680,
    },
    {
      id: 'woocommerce',
      name: 'Woocommerce',
      category: 'Flows',
      description: 'WordPress e-commerce WhatsApp notifications and invoice delivery.',
      connected: true,
      tag: 'E-commerce',
      iconColor: 'bg-purple-500/15 text-purple-600',
      apiConfig: {
        apiKeyName: 'Consumer Secret & Key',
        apiKeyValue: 'ck_9821...cs_4821',
        webhookUrl: 'http://localhost:4000/webhook/woocommerce',
      },
      leadCount: 190,
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      category: 'Flows',
      description: 'Generate dynamic payment links and trigger payment receipt messages.',
      connected: true,
      tag: 'Payments',
      iconColor: 'bg-blue-700/15 text-blue-800',
      defaultEndpoint: 'https://api.razorpay.com/v1',
      apiConfig: {
        apiKeyName: 'Razorpay Key ID',
        apiKeyValue: 'rzp_live_9821098273',
        webhookUrl: 'http://localhost:4000/webhook/razorpay',
        autoReplyTemplate: 'payment_received_receipt_v1',
      },
      leadCount: 450,
    },
    {
      id: 'justdial',
      name: 'Justdial',
      category: 'Flows',
      description: 'Ingest local inquiries and dispatch catalog links within 2 seconds.',
      connected: true,
      tag: 'Lead Source',
      iconColor: 'bg-orange-600/15 text-orange-700',
      apiConfig: {
        apiKeyName: 'JustDial Lead Pull Key',
        apiKeyValue: 'JD_GUJ_FLEET_9825',
        webhookUrl: 'http://localhost:4000/webhook/justdial',
        autoReplyTemplate: 'justdial_instant_quote',
      },
      leadCount: 310,
    },
    {
      id: 'tradeindia',
      name: 'TradeIndia',
      category: 'Flows',
      description: 'Sync B2B leads from TradeIndia portals with auto-tagging and agent allocation.',
      connected: true,
      tag: 'Lead Source',
      iconColor: 'bg-sky-600/15 text-sky-700',
      apiConfig: {
        apiKeyName: 'TradeIndia User ID & Key',
        apiKeyValue: 'TI_USER_769858',
        webhookUrl: 'http://localhost:4000/webhook/tradeindia',
        autoReplyTemplate: 'tradeindia_instant_welcome',
      },
      leadCount: 520,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'Flows',
      description: 'Cross-channel notification router to internal company operational groups.',
      connected: true,
      tag: 'Alerts',
      iconColor: 'bg-blue-400/15 text-blue-500',
      leadCount: 85,
    },
    {
      id: 'smtp',
      name: 'SMTP Mailer',
      category: 'Flows',
      description: 'Send high-priority email fallbacks when WhatsApp message fails or is opted out.',
      connected: true,
      tag: 'Email',
      iconColor: 'bg-red-500/15 text-red-600',
      leadCount: 140,
    },
    {
      id: 'http-request',
      name: 'HTTP Webhook Node',
      category: 'Helpers',
      description: 'Generic REST API node for calling custom ERP, CRM, or billing software endpoints.',
      connected: true,
      tag: 'Universal API',
      iconColor: 'bg-slate-700/15 text-slate-800 dark:text-slate-200',
      apiConfig: {
        webhookUrl: 'http://localhost:4000/webhook/generic',
      },
      leadCount: 65,
    },
    {
      id: 'router',
      name: 'Multi-Path Router',
      category: 'Helpers',
      description: 'Branch conversational execution based on customer intent, language, or lead score.',
      connected: true,
      tag: 'Branching',
      iconColor: 'bg-violet-500/15 text-violet-600',
      leadCount: 0,
    },
    {
      id: 'filter',
      name: 'Condition Filter',
      category: 'Helpers',
      description: 'Evaluate If/Else conditions on contact attributes (e.g. state == "Gujarat").',
      connected: true,
      tag: 'Logic',
      iconColor: 'bg-emerald-500/15 text-emerald-600',
      leadCount: 0,
    },
    {
      id: 'delay',
      name: 'Delay Timer',
      category: 'Helpers',
      description: 'Wait seconds, minutes, or hours before sending automated follow-up reminders.',
      connected: true,
      tag: 'Scheduler',
      iconColor: 'bg-amber-500/15 text-amber-600',
      leadCount: 0,
    },
    {
      id: 'datastore',
      name: 'Datastore Cache',
      category: 'Helpers',
      description: 'Store and retrieve key-value pairs and session states across multi-turn chats.',
      connected: true,
      tag: 'Storage',
      iconColor: 'bg-emerald-500/15 text-emerald-600',
      leadCount: 0,
    },
    {
      id: 'text-helper',
      name: 'Text Helper',
      category: 'Helpers',
      description: 'Clean, format, truncate, uppercase, or regex match strings before sending.',
      connected: true,
      tag: 'Formatter',
      iconColor: 'bg-slate-500/15 text-slate-600',
      leadCount: 0,
    },
    {
      id: 'math-helper',
      name: 'Math Helper',
      category: 'Helpers',
      description: 'Perform arithmetic calculations, GST percentages, and discount calculations.',
      connected: true,
      tag: 'Formatter',
      iconColor: 'bg-amber-500/15 text-amber-600',
      leadCount: 0,
    },
    {
      id: 'date-helper',
      name: 'Date Helper',
      category: 'Helpers',
      description: 'Parse, format, and add/subtract business days and timestamps for localized dates.',
      connected: true,
      tag: 'Formatter',
      iconColor: 'bg-sky-500/15 text-sky-600',
      leadCount: 0,
    },
  ]

  public webhookLogs: WebhookLogEntry[] = [
    {
      id: 'log-1',
      source: 'IndiaMart Inbound',
      event: 'LEAD_PUSH_RECEIVED',
      status: '201 Created',
      payloadPreview: '{ SENDER_NAME: "Ramesh Patel", MOBILE: "+919825012345", PRODUCT: "AIS140 GPS" }',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-2',
      source: 'Meta WhatsApp Cloud',
      event: 'MESSAGES_DELIVERED',
      status: '200 OK',
      payloadPreview: '{ wamid: "wamid.HBgL...921", status: "delivered", recipient: "+919825100001" }',
      timestamp: '1 min ago',
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'log-3',
      source: 'Facebook Lead Ads',
      event: 'FORM_SUBMITTED',
      status: '201 Created',
      payloadPreview: '{ form_id: "5928172910", name: "Ahmedabad Fleet Transport", phone: "+919825099999" }',
      timestamp: '3 mins ago',
      createdAt: new Date(Date.now() - 180000).toISOString(),
    },
    {
      id: 'log-4',
      source: 'Razorpay Payment',
      event: 'PAYMENT_CAPTURED',
      status: '200 OK',
      payloadPreview: '{ payment_id: "pay_NV892182", amount: 499900, contact: "+919825000001" }',
      timestamp: '7 mins ago',
      createdAt: new Date(Date.now() - 420000).toISOString(),
    },
  ]

  constructor() {
    this.loadPersistedConnectors()
  }

  // --- Persistence ---
  private loadPersistedConnectors() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8')
        const data = JSON.parse(raw)
        if (Array.isArray(data) && data.length > 0) {
          const loadedMap = new Map(data.map((c: any) => [c.id, c]))
          this.connectors = this.connectors.map((c) => {
            const saved = loadedMap.get(c.id)
            if (saved) {
              return {
                ...c,
                connected: saved.connected ?? c.connected,
                apiConfig: {
                  ...c.apiConfig,
                  ...(saved.apiConfig || {}),
                },
                leadCount: saved.leadCount ?? c.leadCount,
              }
            }
            return c
          })
        }
      }
    } catch (e) {
      console.warn('Could not load integrations store:', e)
    }
  }

  private saveConnectors() {
    try {
      const dir = path.dirname(STORE_PATH)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.connectors, null, 2), 'utf-8')
    } catch (e) {
      console.error('Failed to save integrations store:', e)
    }
  }

  // --- Connectors API ---
  public getConnectors(): ConnectorInfo[] {
    // Reflect WhatsApp Cloud API permanent token config if set
    const wa = this.connectors.find((c) => c.id === 'whatsapp-business')
    if (wa) {
      const waStatus = whatsAppService.getWabaStatus()
      if (waStatus.hasPermanentToken) {
        wa.connected = true
        if (wa.apiConfig) {
          wa.apiConfig.apiKeyValue = waStatus.maskedToken || wa.apiConfig.apiKeyValue
        }
      }
    }
    return this.connectors
  }

  public getConnectorById(id: string): ConnectorInfo | undefined {
    return this.connectors.find((c) => c.id === id)
  }

  public updateConnector(id: string, updates: Partial<ConnectorInfo>): ConnectorInfo {
    const idx = this.connectors.findIndex((c) => c.id === id)
    if (idx === -1) {
      throw new Error(`Connector with ID '${id}' not found.`)
    }

    const current = this.connectors[idx]
    this.connectors[idx] = {
      ...current,
      ...updates,
      apiConfig: {
        ...current.apiConfig,
        ...(updates.apiConfig || {}),
      },
    }

    // Special handling for WhatsApp Business
    if (id === 'whatsapp-business' && updates.apiConfig?.apiKeyValue) {
      const token = updates.apiConfig.apiKeyValue
      if (token && !token.includes('•••') && !token.includes('...')) {
        whatsAppService.updateCredentials({
          accessToken: token,
          verifyToken: updates.apiConfig.webhookUrl ? undefined : undefined,
        })
      }
    }

    this.saveConnectors()

    if (this.onEvent) {
      this.onEvent('CONNECTOR_UPDATED', this.connectors[idx])
    }

    return this.connectors[idx]
  }

  public toggleConnector(id: string, connected: boolean): ConnectorInfo {
    return this.updateConnector(id, { connected })
  }

  // --- Webhook Logs ---
  public getLogs(): WebhookLogEntry[] {
    return this.webhookLogs
  }

  public clearLogs(): void {
    this.webhookLogs = []
  }

  public addLog(entry: Partial<WebhookLogEntry>): WebhookLogEntry {
    const newLog: WebhookLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source: entry.source || 'Inbound Webhook',
      event: entry.event || 'WEBHOOK_EVENT',
      status: entry.status || '200 OK',
      payloadPreview: entry.payloadPreview || JSON.stringify(entry.fullPayload || {}).slice(0, 120),
      fullPayload: entry.fullPayload,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
    }

    this.webhookLogs.unshift(newLog)
    if (this.webhookLogs.length > 100) {
      this.webhookLogs.pop()
    }

    if (this.onEvent) {
      this.onEvent('INBOUND_WEBHOOK_INGEST', newLog)
    }

    return newLog
  }

  // --- Inbound Handlers ---

  // 1. IndiaMart
  public async handleIndiaMartLead(payload: IndiaMartLeadPayload) {
    const rawPhone = (payload.SENDER_MOBILE || '').startsWith('+')
      ? payload.SENDER_MOBILE
      : `+${(payload.SENDER_MOBILE || '').replace(/[^0-9]/g, '')}`

    let contact = dbService.contacts.find((c) => c.phone === rawPhone)
    const indiamartTag = dbService.tags.find((t) => t.id === 'tag-1') || dbService.tags[0]
    const hotLeadTag = dbService.tags.find((t) => t.id === 'tag-3') || dbService.tags[2]

    if (!contact) {
      contact = dbService.createContact({
        name: payload.SENDER_NAME || 'IndiaMart Inquirer',
        phone: rawPhone,
        email: payload.SENDER_EMAIL,
        source: 'indiamart',
        optIn: true,
        tags: [indiamartTag, hotLeadTag],
        assignedToName: 'Agent Bhavik',
      })
      console.log(`📥 [IndiaMart Sync] New lead ingested: ${contact.name} (${contact.phone})`)
    }

    let conv = dbService.conversations.find((c) => c.contactPhone === rawPhone)
    const querySummary = `[IndiaMart Lead for ${payload.QUERY_PRODUCT_NAME || 'Product Inquiry'}]: ${payload.QUERY_MESSAGE || 'No inquiry text provided'}`

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        channel: 'whatsapp',
        status: 'open',
        lastMessageText: querySummary,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
        tags: contact.tags,
        messages: [],
      }
      dbService.conversations.unshift(conv)
    }

    dbService.addMessage(conv.id, {
      senderType: 'system',
      senderName: 'IndiaMart Connector',
      messageType: 'text',
      content: querySummary,
      status: 'delivered',
    })

    const welcomeText = `Namaste ${payload.SENDER_NAME}! 🙏\n\nVEROX Automation me aapka swagat hai. Hume IndiaMart se aapki "${payload.QUERY_PRODUCT_NAME || 'Software Solutions'}" ke liye inquiry mili hai.\n\nHamara technical expert aapse agle 10 minute me call par connect karega. Kya aapko catalog PDF chahiye?`

    const sent = await whatsAppService.sendTextMessage(contact.phone, welcomeText)

    dbService.addMessage(conv.id, {
      senderType: 'bot',
      senderName: 'VEROX Instant Lead Responder',
      messageType: 'text',
      content: welcomeText,
      wamid: sent.wamid,
      status: 'delivered',
    })

    const imConn = this.connectors.find((c) => c.id === 'indiamart')
    if (imConn) imConn.leadCount += 1

    this.addLog({
      source: 'IndiaMart Push API',
      event: 'LEAD_INGESTION_AND_OUTREACH',
      status: '201 Created',
      payloadPreview: `{ SENDER_NAME: "${payload.SENDER_NAME}", MOBILE: "${rawPhone}", PRODUCT: "${payload.QUERY_PRODUCT_NAME || 'GPS'}" }`,
      fullPayload: payload,
    })

    if (this.onEvent) {
      this.onEvent('NEW_LEAD', { contact, conversation: conv, source: 'indiamart' })
    }

    return { contact, conversation: conv, welcomeDispatched: true }
  }

  // 2. Facebook Lead Ads
  public async handleFacebookLead(payload: FacebookLeadPayload) {
    let fullName = 'Facebook Prospect'
    let phone = ''
    let email = ''

    for (const field of payload.field_data || []) {
      const fieldName = (field.name || '').toLowerCase()
      const rawVal = Array.isArray(field.values) ? field.values[0] : (field.values as any)
      if (fieldName.includes('name')) fullName = rawVal || fullName
      if (fieldName.includes('phone')) phone = rawVal || ''
      if (fieldName.includes('email')) email = rawVal || ''
    }

    if (!phone) {
      phone = '+919825099999'
    }

    const cleanPhone = phone.startsWith('+') ? phone : `+${phone.replace(/[^0-9]/g, '')}`
    const fbTag = dbService.tags.find((t) => t.id === 'tag-2') || dbService.tags[1]

    let contact = dbService.contacts.find((c) => c.phone === cleanPhone)
    if (!contact) {
      contact = dbService.createContact({
        name: fullName,
        phone: cleanPhone,
        email,
        source: 'facebook',
        optIn: true,
        tags: [fbTag],
        assignedToName: 'Agent Anjali',
      })
      console.log(`🎯 [FB Lead Ad] New prospect ingested: ${contact.name} (${contact.phone})`)
    }

    let conv = dbService.conversations.find((c) => c.contactPhone === cleanPhone)
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        channel: 'whatsapp',
        status: 'open',
        lastMessageText: `[Facebook Instant Form Submitted] Form ID: ${payload.form_id || 'N/A'}`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
        tags: contact.tags,
        messages: [],
      }
      dbService.conversations.unshift(conv)
    }

    const welcomeText = `Hello ${fullName}! Thank you for your interest in VEROX Automation on Facebook. Our commercial fleet advisor is reviewing your requirements and will reach out shortly.`
    const sent = await whatsAppService.sendTextMessage(cleanPhone, welcomeText)

    dbService.addMessage(conv.id, {
      senderType: 'bot',
      senderName: 'Meta Lead Responder',
      messageType: 'text',
      content: welcomeText,
      wamid: sent.wamid,
      status: 'sent',
    })

    const fbConn = this.connectors.find((c) => c.id === 'facebook-lead-ads')
    if (fbConn) fbConn.leadCount += 1

    this.addLog({
      source: 'Facebook Lead Ads',
      event: 'FORM_SUBMITTED',
      status: '201 Created',
      payloadPreview: `{ name: "${fullName}", phone: "${cleanPhone}", form_id: "${payload.form_id || 'Instant Form'}" }`,
      fullPayload: payload,
    })

    if (this.onEvent) {
      this.onEvent('NEW_LEAD', { contact, conversation: conv, source: 'facebook' })
    }

    return { contact, conversation: conv, welcomeDispatched: true }
  }

  // 3. Razorpay Payment Captured
  public async handleRazorpayPayment(payload: RazorpayPaymentPayload | any) {
    const payment = payload?.payload?.payment?.entity || payload
    const rawContact = payment?.contact || '+919825000001'
    const rawPhone = rawContact.startsWith('+') ? rawContact : `+${rawContact.replace(/[^0-9]/g, '')}`
    const amountInRupees = (payment?.amount ? payment.amount / 100 : 4999)

    const confirmationText = `✅ *Payment Confirmation:* Received ₹${amountInRupees} successfully for Invoice ${payment?.id || 'PAY_' + Date.now().toString(36).toUpperCase()}. Thank you for choosing VEROX Automation!`

    await whatsAppService.sendTextMessage(rawPhone, confirmationText)

    const rzConn = this.connectors.find((c) => c.id === 'razorpay')
    if (rzConn) rzConn.leadCount += 1

    this.addLog({
      source: 'Razorpay Payment Gateway',
      event: 'PAYMENT_CAPTURED',
      status: '200 OK',
      payloadPreview: `{ payment_id: "${payment?.id || 'pay_test'}", amount: ₹${amountInRupees}, contact: "${rawPhone}" }`,
      fullPayload: payload,
    })

    return { success: true, paymentId: payment?.id || 'pay_ok', amount: amountInRupees }
  }

  // 4. Shopify Order / Checkout Webhook
  public async handleShopifyOrder(payload: ShopifyOrderPayload | any) {
    const phone = payload.phone || payload.customer?.phone || '+919825102938'
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone.replace(/[^0-9]/g, '')}`
    const name = `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Valued Customer'
    const orderNum = payload.order_number || payload.id || '1001'
    const amount = payload.total_price || '2,499.00'

    const message = `🛍️ *Order Confirmation (#${orderNum}):* Hi ${name}, your order for ₹${amount} has been received and is being prepared for dispatch. Live tracking link will be shared via WhatsApp shortly.`

    await whatsAppService.sendTextMessage(cleanPhone, message)

    const shopConn = this.connectors.find((c) => c.id === 'shopify')
    if (shopConn) shopConn.leadCount += 1

    this.addLog({
      source: 'Shopify E-Commerce',
      event: 'ORDERS_CREATE',
      status: '201 Created',
      payloadPreview: `{ order: "#${orderNum}", customer: "${name}", phone: "${cleanPhone}", total: "₹${amount}" }`,
      fullPayload: payload,
    })

    return { success: true, orderNumber: orderNum, recipient: cleanPhone }
  }

  // 5. WooCommerce Order Webhook
  public async handleWooCommerceOrder(payload: any) {
    const billing = payload.billing || {}
    const phone = billing.phone || '+919825102938'
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone.replace(/[^0-9]/g, '')}`
    const name = `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || 'WooCommerce Customer'
    const orderId = payload.id || 'WC-9821'

    const message = `🛒 *WooCommerce Order Alert (#${orderId}):* Namaste ${name}! We have received your order. Thank you for shopping with us.`

    await whatsAppService.sendTextMessage(cleanPhone, message)

    const wooConn = this.connectors.find((c) => c.id === 'woocommerce')
    if (wooConn) wooConn.leadCount += 1

    this.addLog({
      source: 'WooCommerce Store',
      event: 'ORDER_COMPLETED',
      status: '200 OK',
      payloadPreview: `{ order: "${orderId}", customer: "${name}", phone: "${cleanPhone}" }`,
      fullPayload: payload,
    })

    return { success: true, orderId, recipient: cleanPhone }
  }

  // 6. Justdial Lead Push
  public async handleJustdialLead(payload: JustdialLeadPayload | any) {
    const rawPhone = (payload.mobile || '+919825012345')
    const cleanPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone.replace(/[^0-9]/g, '')}`
    const name = payload.name || 'Justdial Inquirer'
    const cat = payload.category || 'Commercial Fleet Solutions'

    const welcome = `Namaste ${name}! 🙏 We received your JustDial inquiry for "${cat}". Here is our official fleet solution rate card. Our representative will contact you in 5 minutes.`

    await whatsAppService.sendTextMessage(cleanPhone, welcome)

    const jdConn = this.connectors.find((c) => c.id === 'justdial')
    if (jdConn) jdConn.leadCount += 1

    this.addLog({
      source: 'Justdial Regional API',
      event: 'LEAD_INGESTION',
      status: '201 Created',
      payloadPreview: `{ name: "${name}", phone: "${cleanPhone}", category: "${cat}" }`,
      fullPayload: payload,
    })

    return { success: true, name, phone: cleanPhone }
  }

  // 7. TradeIndia Lead Push
  public async handleTradeIndiaLead(payload: TradeIndiaLeadPayload | any) {
    const rawPhone = (payload.sender_mobile || '+919825012345')
    const cleanPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone.replace(/[^0-9]/g, '')}`
    const name = payload.sender_name || 'TradeIndia Buyer'
    const subject = payload.subject || 'B2B Fleet Inquiry'

    const msg = `Hello ${name}, thank you for reaching out via TradeIndia regarding "${subject}". VEROX Automation team has initiated your quotation.`

    await whatsAppService.sendTextMessage(cleanPhone, msg)

    const tiConn = this.connectors.find((c) => c.id === 'tradeindia')
    if (tiConn) tiConn.leadCount += 1

    this.addLog({
      source: 'TradeIndia B2B Portal',
      event: 'BUYER_INQUIRY',
      status: '201 Created',
      payloadPreview: `{ buyer: "${name}", phone: "${cleanPhone}", inquiry: "${subject}" }`,
      fullPayload: payload,
    })

    return { success: true, name, phone: cleanPhone }
  }

  // 8. ExportersIndia Lead Push
  public async handleExportersIndiaLead(payload: any) {
    const rawPhone = payload.mobile || '+919825012345'
    const cleanPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone.replace(/[^0-9]/g, '')}`
    const name = payload.name || 'Exporter Buyer'

    const msg = `Namaste ${name}! We received your export requirement via ExportersIndia. A senior export manager will connect shortly.`

    await whatsAppService.sendTextMessage(cleanPhone, msg)

    const exConn = this.connectors.find((c) => c.id === 'exporters-india')
    if (exConn) exConn.leadCount += 1

    this.addLog({
      source: 'ExportersIndia Inbound',
      event: 'EXPORT_LEAD_DISPATCH',
      status: '201 Created',
      payloadPreview: `{ buyer: "${name}", phone: "${cleanPhone}" }`,
      fullPayload: payload,
    })

    return { success: true, name, phone: cleanPhone }
  }

  // 9. Calendly Booking Webhook
  public async handleCalendlyBooking(payload: CalendlyBookingPayload | any) {
    const name = payload.payload?.name || payload.name || 'Prospect'
    const phone = payload.payload?.phone || payload.phone || '+919825102938'
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone.replace(/[^0-9]/g, '')}`
    const time = payload.payload?.scheduled_event?.start_time || 'Tomorrow at 11:00 AM'

    const msg = `📅 *Meeting Confirmed:* Hi ${name}, your VEROX Automation live solution demo is scheduled for ${time}. Looking forward to connecting!`

    await whatsAppService.sendTextMessage(cleanPhone, msg)

    const calConn = this.connectors.find((c) => c.id === 'calendly')
    if (calConn) calConn.leadCount += 1

    this.addLog({
      source: 'Calendly Appointments',
      event: 'INVITEE_CREATED',
      status: '200 OK',
      payloadPreview: `{ invitee: "${name}", phone: "${cleanPhone}", time: "${time}" }`,
      fullPayload: payload,
    })

    return { success: true, invitee: name, phone: cleanPhone, time }
  }

  // 10. Google Sheets Live Sync Webhook
  public async handleGoogleSheetsSync(payload: any) {
    const row = payload.row || payload
    const phone = row.phone || row.mobile || '+919825012345'
    const name = row.name || 'Spreadsheet Contact'

    const msg = `📊 Hi ${name}, your details have been synced with VEROX Automation CRM. Welcome aboard!`
    await whatsAppService.sendTextMessage(phone, msg)

    const gsConn = this.connectors.find((c) => c.id === 'google-sheets')
    if (gsConn) gsConn.leadCount += 1

    this.addLog({
      source: 'Google Sheets Live Sync',
      event: 'ROW_APPEND_TRIGGER',
      status: '200 OK',
      payloadPreview: `{ sheet_lead: "${name}", phone: "${phone}" }`,
      fullPayload: payload,
    })

    return { success: true, synced: true, contact: name }
  }

  // 11. Generic Universal Webhook
  public async handleGenericWebhook(source: string, payload: any) {
    const phone = payload.phone || payload.mobile || payload.to || '+919825012345'
    const name = payload.name || payload.sender || 'Universal Contact'
    const text = payload.message || payload.text || 'Inbound webhook event acknowledged by VEROX Gateway.'

    const log = this.addLog({
      source: source || 'Custom HTTP Webhook',
      event: 'PAYLOAD_INGEST',
      status: '200 OK',
      payloadPreview: typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 120),
      fullPayload: payload,
    })

    return { success: true, logId: log.id, contact: name, phone, acknowledged: true }
  }

  // 12. Test Dispatcher for any Connector
  public async testConnector(id: string, testData?: any) {
    const conn = this.connectors.find((c) => c.id === id)
    if (!conn) {
      throw new Error(`Connector '${id}' does not exist.`)
    }

    switch (id) {
      case 'whatsapp-business':
        return await whatsAppService.testMetaConnection()

      case 'indiamart':
        return await this.handleIndiaMartLead({
          SENDER_NAME: testData?.name || 'VEROX Live Test Buyer',
          SENDER_MOBILE: testData?.phone || '+919825012345',
          QUERY_PRODUCT_NAME: 'AIS-140 GPS Device Testing',
          QUERY_MESSAGE: 'Live integration test handshake from VEROX Automation Platform',
        })

      case 'facebook-lead-ads':
        return await this.handleFacebookLead({
          form_id: 'test_form_94821',
          field_data: [
            { name: 'full_name', values: [testData?.name || 'Ahmedabad Logistics Fleet'] },
            { name: 'phone_number', values: [testData?.phone || '+919825099999'] },
          ],
        })

      case 'razorpay':
        return await this.handleRazorpayPayment({
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: `pay_test_${Date.now().toString(36)}`,
                amount: 499900,
                contact: testData?.phone || '+919825000001',
                status: 'captured',
              },
            },
          },
        })

      case 'shopify':
        return await this.handleShopifyOrder({
          order_number: 1042,
          total_price: '4,500.00',
          customer: {
            first_name: 'Bhargav',
            last_name: 'Shah',
            phone: testData?.phone || '+919825102938',
          },
        })

      case 'woocommerce':
        return await this.handleWooCommerceOrder({
          id: 5928,
          billing: {
            first_name: 'Pooja',
            last_name: 'Solanki',
            phone: testData?.phone || '+919825102938',
          },
        })

      case 'justdial':
        return await this.handleJustdialLead({
          name: testData?.name || 'Surat Transporter',
          mobile: testData?.phone || '+919825012345',
          category: 'Fleet Fastag & GPS',
        })

      case 'tradeindia':
        return await this.handleTradeIndiaLead({
          sender_name: testData?.name || 'Rajkot Heavy Motors',
          sender_mobile: testData?.phone || '+919825012345',
          subject: 'Commercial GPS Bulk Order',
        })

      case 'exporters-india':
        return await this.handleExportersIndiaLead({
          name: testData?.name || 'Gujarat Exports Ltd',
          mobile: testData?.phone || '+919825012345',
        })

      case 'calendly':
        return await this.handleCalendlyBooking({
          name: testData?.name || 'Demo Client',
          phone: testData?.phone || '+919825102938',
          scheduled_event: { start_time: 'Tomorrow at 11:30 AM' },
        })

      case 'google-sheets':
        return await this.handleGoogleSheetsSync({
          name: testData?.name || 'Sheets Sync Test Lead',
          phone: testData?.phone || '+919825012345',
        })

      default:
        return await this.handleGenericWebhook(conn.name, {
          test: true,
          timestamp: new Date().toISOString(),
          connector: conn.name,
        })
    }
  }
}

export const integrationsService = new IntegrationsService()
