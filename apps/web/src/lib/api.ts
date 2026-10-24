/**
 * Whatsapi - Enterprise API Client
 * Connects frontend UI components directly to API Gateway on port 4000
 */

const API_BASE_URL = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:4000'

export interface WhatsAppConfigPayload {
  accessToken?: string
  phoneNumberId?: string
  wabaId?: string
  appSecret?: string
  verifyToken?: string
}

export interface MetaConnectionResult {
  connected: boolean
  mode: 'LIVE_META' | 'SANDBOX_SIMULATED'
  verifiedName?: string
  displayPhoneNumber?: string
  phoneNumberId: string
  wabaId: string
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN'
  messagingLimitTier: string
  codeVerificationStatus?: string
  rawMetaResponse?: Record<string, unknown>
  message?: string
}

export interface SendMessagePayload {
  to: string
  text?: string
  conversationId?: string
  template?: {
    name: string
    language?: { code: string }
    components?: Array<Record<string, unknown>>
  }
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: unknown }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const text = await res.text()
    let json: Record<string, unknown> | null = null
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }

    if (!res.ok) {
      return {
        success: false,
        message: (typeof json?.message === 'string' ? json.message : undefined) || `HTTP ${res.status}: ${res.statusText}`,
        error: json,
      }
    }

    return {
      success: true,
      data: (json?.data !== undefined ? json.data : json) as T,
      message: typeof json?.message === 'string' ? json.message : undefined,
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: `Failed to connect to Whatsapi Gateway at ${API_BASE_URL}. Ensure port 4000 is running.`,
      error: err,
    }
  }
}

export const whatsapiApi = {
  baseUrl: API_BASE_URL,

  // Health
  getHealth: () => request('/health'),

  // WhatsApp & Meta Credentials
  getWhatsAppStatus: () => request('/api/whatsapp/status'),
  getWhatsAppConfig: () => request('/api/whatsapp/config'),
  updateWhatsAppConfig: (config: WhatsAppConfigPayload) =>
    request('/api/whatsapp/config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  testMetaConnection: (credentials?: WhatsAppConfigPayload) =>
    request<MetaConnectionResult>('/api/whatsapp/test-connection', {
      method: 'POST',
      body: JSON.stringify(credentials || {}),
    }),

  // Outbound Messaging
  sendMessage: (payload: SendMessagePayload) =>
    request('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Conversations & Team Inbox
  getConversations: () => request('/api/conversations'),
  getConversationById: (id: string) => request(`/api/conversations/${id}`),
  sendConversationMessage: (
    convId: string,
    payload: { content: string; senderType?: string; senderName?: string; messageType?: string }
  ) =>
    request(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Contacts
  getContacts: () => request('/api/contacts'),
  createContact: (contact: { name: string; phone: string; tags?: string[]; source?: string; email?: string; assignedToName?: string }) =>
    request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    }),
  updateContact: (id: string, contact: Partial<{ name: string; phone: string; tags: string[]; source: string; email: string; assignedToName: string; status: string }>) =>
    request(`/api/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contact),
    }),
  deleteContact: (id: string) =>
    request(`/api/contacts/${id}`, {
      method: 'DELETE',
    }),
  bulkDeleteContacts: (ids: string[]) =>
    request('/api/contacts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // Broadcast Campaigns
  getCampaigns: () => request('/api/campaigns'),
  createCampaign: (campaign: {
    name: string
    templateName: string
    templateLang?: string
    totalContacts?: number
    scheduledAt?: string
  }) =>
    request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    }),
  dispatchCampaign: (campaignId: string) =>
    request(`/api/campaigns/${campaignId}/dispatch`, {
      method: 'POST',
    }),
  deleteCampaign: (campaignId: string) =>
    request(`/api/campaigns/${campaignId}`, {
      method: 'DELETE',
    }),

  // Message Templates
  getTemplates: () => request('/api/templates'),
  createTemplate: (template: Record<string, unknown>) =>
    request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    }),
  syncMetaTemplates: () =>
    request('/api/whatsapp/templates/sync', {
      method: 'POST',
    }),

  // Webhook Testing & Sandbox Simulators
  simulateInboundMessage: (payload: { from: string; name?: string; text: string }) =>
    request('/api/whatsapp/simulate-inbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  testIndiamartLead: (lead: {
    SENDER_NAME?: string
    SENDER_MOBILE: string
    SENDER_EMAIL?: string
    QUERY_PRODUCT_NAME?: string
    QUERY_MESSAGE?: string
  }) =>
    request('/webhook/indiamart', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),
  testWebhookHandshake: async (verifyToken: string = 'verox_secure_verify_token_2026') => {
    const testUrl = `${API_BASE_URL}/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
      verifyToken
    )}&hub.challenge=VEROX_CHALLENGE_PING_${Date.now()}`
    try {
      const res = await fetch(testUrl)
      const text = await res.text()
      return {
        success: res.ok && text.includes('VEROX_CHALLENGE'),
        status: res.status,
        challengeResponse: text,
      }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  },

  // Integrations & Connected Apps
  getIntegrations: () => request('/api/integrations'),
  getIntegrationLogs: () => request('/api/integrations/logs'),
  updateIntegration: (id: string, config: Record<string, unknown>) =>
    request(`/api/integrations/${id}/config`, {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  toggleIntegration: (id: string, connected: boolean) =>
    request(`/api/integrations/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ connected }),
    }),
  testIntegration: (id: string, payload?: Record<string, unknown>) =>
    request(`/api/integrations/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  // AI Assistant & RAG Knowledge
  getAiKnowledge: () => request('/api/v1/ai/knowledge'),
  addAiKnowledge: (doc: { title: string; category?: string; content: string }) =>
    request('/api/v1/ai/knowledge', {
      method: 'POST',
      body: JSON.stringify(doc),
    }),
  askAi: (query: string) =>
    request('/api/v1/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Tags
  getTags: () => request('/api/tags'),
  createTag: (name: string, color?: string) =>
    request('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
}

// Backward compatibility alias
export const veroxApi = whatsapiApi

