export interface TagItem {
  id: string
  name: string
  color: string
  createdAt?: string
  count?: number
}

export interface ContactItem {
  id: string
  name: string
  phone: string
  email?: string
  source: string // 'whatsapp' | 'facebook' | 'indiamart' | 'manual'
  optIn: boolean
  tags: TagItem[]
  assignedToName?: string
  assignedAt?: string
  status: 'active' | 'archived' | 'deleted'
  customFields?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface MessageItem {
  id: string
  conversationId: string
  senderType: 'contact' | 'agent' | 'bot' | 'system'
  senderName?: string
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive' | 'location'
  content: string
  mediaUrl?: string
  wamid?: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: string
}

export interface ConversationItem {
  id: string
  contactId: string
  contactName: string
  contactPhone: string
  channel: string
  status: 'open' | 'pending' | 'resolved' | 'snoozed'
  lastMessageText: string
  lastMessageAt: string
  unreadCount: number
  tags: TagItem[]
  messages: MessageItem[]
}

export interface CampaignItem {
  id: string
  name: string
  templateName: string
  templateLang: string
  totalContacts: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
  scheduledAt?: string
  createdAt: string
}

export type ColumnDataType = 'Text' | 'Number' | 'Select' | 'Boolean' | 'Phone' | 'Date'

export interface ColumnItem {
  id: string
  name: string
  key: string
  type: ColumnDataType
  options: string
  required?: boolean
  description?: string
  isSystem?: boolean
  createdAt: string
  updatedAt: string
}

export const initialTags: TagItem[] = [
  { id: 'tag-1', name: 'IndiaMart Lead', color: '#f97316' },
  { id: 'tag-2', name: 'FB Ads', color: '#3b82f6' },
  { id: 'tag-3', name: 'Hot Lead', color: '#ef4444' },
  { id: 'tag-4', name: 'FASTAG Client', color: '#10b981' },
  { id: 'tag-5', name: 'Fleet Mgmt', color: '#8b5cf6' },
  { id: 'tag-6', name: 'Hinglish Support', color: '#06b6d4' },
]

export const initialColumns: ColumnItem[] = [
  {
    id: 'col-1',
    name: 'Email',
    key: 'email',
    type: 'Text',
    options: '-',
    required: false,
    description: 'Customer contact email address',
    isSystem: true,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'col-2',
    name: 'Status',
    key: 'status',
    type: 'Select',
    options: 'New, Contacted, Qualified, Unqualified',
    required: true,
    description: 'CRM lead stage lifecycle',
    isSystem: true,
    createdAt: '2026-10-16T11:00:00.000Z',
    updatedAt: '2026-10-16T11:00:00.000Z',
  },
  {
    id: 'col-3',
    name: 'WABA Phone Number',
    key: 'waba_phone_number',
    type: 'Phone',
    options: '-',
    required: true,
    description: 'WhatsApp Business API designated phone number',
    isSystem: true,
    createdAt: '2026-10-16T12:00:00.000Z',
    updatedAt: '2026-10-16T12:00:00.000Z',
  },
  {
    id: 'col-4',
    name: 'GPS Client',
    key: 'gps_client',
    type: 'Boolean',
    options: 'Yes, No',
    required: false,
    description: 'Whether contact holds an active GPS tracking subscription',
    isSystem: false,
    createdAt: '2026-10-18T09:00:00.000Z',
    updatedAt: '2026-10-18T09:00:00.000Z',
  },
  {
    id: 'col-5',
    name: 'Fleet Size',
    key: 'fleet_size',
    type: 'Number',
    options: '-',
    required: false,
    description: 'Number of commercial vehicles managed by contact',
    isSystem: false,
    createdAt: '2026-10-18T14:30:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'col-6',
    name: 'Preferred RTO State',
    key: 'preferred_rto_state',
    type: 'Select',
    options: 'Gujarat, Rajasthan, Maharashtra, Delhi',
    required: false,
    description: 'State RTO jurisdiction for vehicle registration and FASTag sync',
    isSystem: false,
    createdAt: '2026-10-19T16:00:00.000Z',
    updatedAt: '2026-10-19T16:00:00.000Z',
  },
]

export const initialContacts: ContactItem[] = [
  {
    id: 'cnt-1',
    name: 'Rajesh Sharma',
    phone: '+919825100001',
    email: 'rajesh.sharma@example.com',
    source: 'indiamart',
    optIn: true,
    tags: [initialTags[0], initialTags[2]],
    assignedToName: 'Agent Bhavik',
    assignedAt: '2026-10-22T10:30:00Z',
    status: 'active',
    createdAt: '2026-10-22T10:28:00Z',
    updatedAt: '2026-10-22T11:00:00Z',
  },
  {
    id: 'cnt-2',
    name: 'Vikram Patel',
    phone: '+919426000002',
    email: 'vikram.patel@example.com',
    source: 'facebook',
    optIn: true,
    tags: [initialTags[1], initialTags[4]],
    assignedToName: 'Agent Anjali',
    assignedAt: '2026-10-22T12:00:00Z',
    status: 'active',
    createdAt: '2026-10-22T11:45:00Z',
    updatedAt: '2026-10-22T12:15:00Z',
  },
  {
    id: 'cnt-3',
    name: 'Ananya Desai',
    phone: '+919909000003',
    email: 'ananya.desai@example.com',
    source: 'whatsapp',
    optIn: true,
    tags: [initialTags[3]],
    assignedToName: 'VEROX AI Assistant',
    status: 'active',
    createdAt: '2026-10-22T14:10:00Z',
    updatedAt: '2026-10-22T14:12:00Z',
  },
  {
    id: 'cnt-4',
    name: 'Sunil Mehta',
    phone: '+919898000004',
    email: 'sunil.mehta@example.com',
    source: 'manual',
    optIn: true,
    tags: [initialTags[5]],
    assignedToName: 'Agent Bhavik',
    status: 'active',
    createdAt: '2026-10-21T09:00:00Z',
    updatedAt: '2026-10-21T09:30:00Z',
  },
]

export const initialConversations: ConversationItem[] = [
  {
    id: 'conv-1',
    contactId: 'cnt-1',
    contactName: 'Rajesh Sharma',
    contactPhone: '+919825100001',
    channel: 'whatsapp',
    status: 'open',
    lastMessageText: 'Sir, kya mujhe Gujarat fleet GPS tracking ka quotation mil sakta hai?',
    lastMessageAt: '2026-10-22T17:45:00Z',
    unreadCount: 2,
    tags: [initialTags[0], initialTags[2]],
    messages: [
      {
        id: 'msg-101',
        conversationId: 'conv-1',
        senderType: 'contact',
        senderName: 'Rajesh Sharma',
        messageType: 'text',
        content: 'Namaste, maine IndiaMart par aapka GPS tracker dekha tha.',
        wamid: 'wamid.HBgMOTE5ODI1MTAwMDAxFQIAEhggNTM5QjZDNzk0M0YxMjM0',
        status: 'read',
        createdAt: '2026-10-22T17:40:00Z',
      },
      {
        id: 'msg-102',
        conversationId: 'conv-1',
        senderType: 'bot',
        senderName: 'VEROX AI Bot',
        messageType: 'text',
        content: 'Namaste Rajesh ji! VEROX Automation me aapka swagat hai. Hamare paas 4G Fleet GPS Trackers available hain. Aapke paas kitni gaadiyan hain?',
        status: 'read',
        createdAt: '2026-10-22T17:40:05Z',
      },
      {
        id: 'msg-103',
        conversationId: 'conv-1',
        senderType: 'contact',
        senderName: 'Rajesh Sharma',
        messageType: 'text',
        content: 'Sir, kya mujhe Gujarat fleet GPS tracking ka quotation mil sakta hai?',
        wamid: 'wamid.HBgMOTE5ODI1MTAwMDAxFQIAEhggNjM5QjZDNzk0M0YxOTk5',
        status: 'delivered',
        createdAt: '2026-10-22T17:45:00Z',
      },
    ],
  },
  {
    id: 'conv-2',
    contactId: 'cnt-2',
    contactName: 'Vikram Patel',
    contactPhone: '+919426000002',
    channel: 'whatsapp',
    status: 'open',
    lastMessageText: 'Maine form submit kar diya hai, confirmation chahiye.',
    lastMessageAt: '2026-10-22T16:20:00Z',
    unreadCount: 1,
    tags: [initialTags[1]],
    messages: [
      {
        id: 'msg-201',
        conversationId: 'conv-2',
        senderType: 'contact',
        messageType: 'text',
        content: 'Maine form submit kar diya hai, confirmation chahiye.',
        status: 'delivered',
        createdAt: '2026-10-22T16:20:00Z',
      },
    ],
  },
]

export const initialCampaigns: CampaignItem[] = [
  {
    id: 'cmp-1',
    name: 'Gujarat Business Diwali Mega Broadcast',
    templateName: 'diwali_special_offer_v1',
    templateLang: 'gu',
    totalContacts: 14500,
    sentCount: 14500,
    deliveredCount: 14240,
    readCount: 11980,
    failedCount: 260,
    status: 'completed',
    scheduledAt: '2026-10-20T10:00:00Z',
    createdAt: '2026-10-19T14:00:00Z',
  },
  {
    id: 'cmp-2',
    name: 'IndiaMart Inbound Lead Follow-up Nurture',
    templateName: 'lead_nurture_followup',
    templateLang: 'hi',
    totalContacts: 2850,
    sentCount: 2850,
    deliveredCount: 2800,
    readCount: 2410,
    failedCount: 50,
    status: 'completed',
    scheduledAt: '2026-10-21T11:00:00Z',
    createdAt: '2026-10-21T09:00:00Z',
  },
  {
    id: 'cmp-3',
    name: 'Fleet Owners FASTAG Renewal Reminder',
    templateName: 'fastag_renewal_alert',
    templateLang: 'en',
    totalContacts: 5000,
    sentCount: 3200,
    deliveredCount: 3120,
    readCount: 2650,
    failedCount: 40,
    status: 'running',
    scheduledAt: '2026-10-22T18:00:00Z',
    createdAt: '2026-10-22T15:00:00Z',
  },
]

export interface OptsConfig {
  optOutKeywords: string[]
  optInKeywords: string[]
  autoReplyOnOptOut: boolean
  optOutReplyText: string
  autoReplyOnOptIn: boolean
  optInReplyText: string
  lastUpdated: string
}

export const defaultOptsConfig: OptsConfig = {
  optOutKeywords: ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'ROKO', 'BAND KARO'],
  optInKeywords: ['START', 'JOIN', 'CHALU', 'YES', 'SUBSCRIBE', 'HAAN'],
  autoReplyOnOptOut: true,
  optOutReplyText:
    'You have been unsubscribed from WhatsApp promotional updates. Reply START or CHALU anytime to subscribe again.',
  autoReplyOnOptIn: true,
  optInReplyText: 'Welcome! You have been successfully opted-in to receive WhatsApp updates.',
  lastUpdated: '2026-10-25T10:00:00.000Z',
}
