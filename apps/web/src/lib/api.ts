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
  deleteTemplate: (id: string) =>
    request(`/api/templates/${id}`, {
      method: 'DELETE',
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
  clearIntegrationLogs: () =>
    request('/api/integrations/logs', {
      method: 'DELETE',
    }),
  simulateFacebookLead: (payload: { form_id?: string; field_data: Array<{ name: string; values: string[] }> }) =>
    request('/webhook/facebook', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  simulateRazorpayPayment: (payload: Record<string, unknown>) =>
    request('/webhook/razorpay', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
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
  getAiStats: () => request('/api/v1/ai/stats'),
  getAiConfig: () => request('/api/v1/ai/config'),
  saveAiConfig: (config: {
    model?: string
    temperature?: string
    prompt?: string
    autoReply?: boolean
    confidenceThreshold?: string
  }) =>
    request('/api/v1/ai/config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  getAiKnowledge: () => request('/api/v1/ai/knowledge'),
  addAiKnowledge: (doc: { title: string; category?: string; content: string }) =>
    request('/api/v1/ai/knowledge', {
      method: 'POST',
      body: JSON.stringify(doc),
    }),
  updateAiKnowledge: (
    id: string,
    doc: { title?: string; category?: string; content?: string }
  ) =>
    request(`/api/v1/ai/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    }),
  deleteAiKnowledge: (id: string) =>
    request(`/api/v1/ai/knowledge/${id}`, {
      method: 'DELETE',
    }),
  askAi: (query: string) =>
    request('/api/v1/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  resetAiAssistant: () =>
    request('/api/v1/ai/reset', {
      method: 'POST',
    }),

  // Tags
  getTags: () => request('/api/tags'),
  createTag: (name: string, color?: string) =>
    request('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  updateTag: (id: string, name: string, color?: string) =>
    request(`/api/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, color }),
    }),
  deleteTag: (id: string) =>
    request(`/api/tags/${id}`, {
      method: 'DELETE',
    }),
  getTagContacts: (id: string) => request(`/api/tags/${id}/contacts`),

  // Custom Columns & Schema
  getColumns: () => request('/api/columns'),
  createColumn: (data: {
    name: string
    type: string
    options?: string
    required?: boolean
    description?: string
  }) =>
    request('/api/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateColumn: (
    id: string,
    data: {
      name?: string
      type?: string
      options?: string
      required?: boolean
      description?: string
    }
  ) =>
    request(`/api/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteColumn: (id: string) =>
    request(`/api/columns/${id}`, {
      method: 'DELETE',
    }),
  getColumnStats: (id: string) => request(`/api/columns/${id}/stats`),

  // Opts Compliance Management
  getOptsConfig: () => request('/api/opts'),
  updateOptsConfig: (data: {
    optOutKeywords?: string[]
    optInKeywords?: string[]
    autoReplyOnOptOut?: boolean
    optOutReplyText?: string
    autoReplyOnOptIn?: boolean
    optInReplyText?: string
  }) =>
    request('/api/opts', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resetOptsConfig: () =>
    request('/api/opts/reset', {
      method: 'POST',
    }),
  testOptMessage: (message: string, phone?: string) =>
    request('/api/opts/test', {
      method: 'POST',
      body: JSON.stringify({ message, phone }),
    }),

  // Media Gallery & Cloud Storage
  getMedia: (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return request(`/api/media${qs ? `?${qs}` : ''}`)
  },
  getMediaStats: () => request('/api/media/stats'),
  createMedia: (data: {
    name: string
    size?: string
    type?: string
    category?: 'image' | 'document' | 'video'
    customPreviewUrl?: string
  }) =>
    request('/api/media', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMedia: (id: string) =>
    request(`/api/media/${id}`, {
      method: 'DELETE',
    }),
  syncMetaMedia: () =>
    request('/api/media/sync', {
      method: 'POST',
    }),

  // FAQ Bot & NLP Keyword Automation
  getBotRules: (params?: { category?: string; search?: string; activeOnly?: boolean }) => {
    const q = new URLSearchParams()
    if (params?.category && params.category !== 'all') q.set('category', params.category)
    if (params?.search) q.set('search', params.search)
    if (params?.activeOnly) q.set('activeOnly', 'true')
    const qs = q.toString()
    return request(`/api/bot/rules${qs ? `?${qs}` : ''}`)
  },
  getBotStats: () => request('/api/bot/stats'),
  getBotRule: (id: string) => request(`/api/bot/rules/${id}`),
  createBotRule: (data: {
    name?: string
    keywords: string[] | string
    replyText: string
    reply?: string
    responseType?: 'text' | 'template' | 'handoff' | 'optout'
    category?: 'Sales' | 'Operations' | 'Support' | 'Compliance' | 'General'
    targetAgentName?: string
    templateName?: string
    priority?: number
  }) =>
    request('/api/bot/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBotRule: (
    id: string,
    data: {
      name?: string
      keywords?: string[] | string
      replyText?: string
      reply?: string
      responseType?: 'text' | 'template' | 'handoff' | 'optout'
      category?: 'Sales' | 'Operations' | 'Support' | 'Compliance' | 'General'
      targetAgentName?: string
      templateName?: string
      active?: boolean
      priority?: number
    }
  ) =>
    request(`/api/bot/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBotRule: (id: string) =>
    request(`/api/bot/rules/${id}`, {
      method: 'DELETE',
    }),
  toggleBotRule: (id: string, active?: boolean) =>
    request(`/api/bot/rules/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ active }),
    }),
  testBotQuery: (query: string) =>
    request('/api/bot/test', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  resetBotRules: () =>
    request('/api/bot/reset', {
      method: 'POST',
    }),

  // Enterprise Visual Chatbot Studio & Flow Engine
  getChatbotFlow: (id?: string) => {
    const q = id ? `?id=${encodeURIComponent(id)}` : ''
    return request(`/api/chatbot/flow${q}`)
  },
  getChatbotStats: () => request('/api/chatbot/stats'),
  getChatbotFlows: () => request('/api/chatbot/flows'),
  saveChatbotFlow: (data: {
    id?: string
    name?: string
    isLive?: boolean
    wabaPhone?: string
    nodes: any[]
    description?: string
  }) =>
    request('/api/chatbot/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deployChatbotFlow: (id?: string) =>
    request('/api/chatbot/deploy', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
  simulateChatbotStep: (data: {
    nodeIndex?: number
    nodeId?: string
    userReply?: string
  }) =>
    request('/api/chatbot/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetChatbotFlow: () =>
    request('/api/chatbot/reset', {
      method: 'POST',
    }),

  // Visual Automation Flows Engine
  getFlows: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/flows${qs}`)
  },
  getFlow: (id: string) => request(`/api/flows/${id}`),
  getFlowStats: () => request('/api/flows/stats'),
  createFlow: (data: { name: string; trigger?: string; nodes?: any[]; active?: boolean }) =>
    request('/api/flows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFlow: (id: string, data: any) =>
    request(`/api/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  togglePublishFlow: (id: string, active?: boolean) =>
    request(`/api/flows/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),
  deleteFlow: (id: string) =>
    request(`/api/flows/${id}`, {
      method: 'DELETE',
    }),
  runFlowTest: (id: string, inputPayload?: any) =>
    request(`/api/flows/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ inputPayload }),
    }),
  resetFlows: () =>
    request('/api/flows/reset', {
      method: 'POST',
    }),

  // Agency Project & Client Planner
  getProjects: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/projects${qs}`)
  },
  getProject: (id: string) => request(`/api/projects/${id}`),
  getProjectStats: () => request('/api/projects/stats'),
  createProject: (data: {
    name: string
    client: string
    status?: string
    startDate?: string
    dueDate?: string
    priority?: string
    description?: string
    budget?: string
  }) =>
    request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: any) =>
    request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request(`/api/projects/${id}`, {
      method: 'DELETE',
    }),
  getProjectTasks: (params?: { projectId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.projectId) query.set('projectId', params.projectId)
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/projects/tasks${qs}`)
  },
  createProjectTask: (data: {
    title: string
    project: string
    projectId?: string
    assignee?: string
    priority?: string
    status?: string
    dueDate?: string
  }) =>
    request('/api/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProjectTask: (id: string, data: any) =>
    request(`/api/projects/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleProjectTask: (id: string) =>
    request(`/api/projects/tasks/${id}/toggle`, {
      method: 'PATCH',
    }),
  deleteProjectTask: (id: string) =>
    request(`/api/projects/tasks/${id}`, {
      method: 'DELETE',
    }),
  resetProjects: () =>
    request('/api/projects/reset', {
      method: 'POST',
    }),

  // Enterprise Task Pipeline
  getEnterpriseTasks: (params?: {
    search?: string
    status?: string
    priority?: string
    label?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    if (params?.priority && params.priority !== 'All') query.set('priority', params.priority)
    if (params?.label && params.label !== 'All') query.set('label', params.label)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/tasks${qs}`)
  },
  getEnterpriseTaskStats: () => request('/api/tasks/stats'),
  getEnterpriseTask: (id: string) => request(`/api/tasks/${id}`),
  createEnterpriseTask: (data: {
    title: string
    status?: string
    label?: string
    priority?: string
    assignee?: string
  }) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEnterpriseTask: (id: string, data: any) =>
    request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEnterpriseTask: (id: string) =>
    request(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
  bulkDeleteEnterpriseTasks: (ids: string[]) =>
    request('/api/tasks/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  bulkUpdateEnterpriseTaskStatus: (ids: string[], status: string) =>
    request('/api/tasks/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    }),
  bulkUpdateEnterpriseTaskPriority: (ids: string[], priority: string) =>
    request('/api/tasks/bulk-priority', {
      method: 'POST',
      body: JSON.stringify({ ids, priority }),
    }),
  importEnterpriseTasks: (tasks: any[]) =>
    request('/api/tasks/import', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    }),
  resetEnterpriseTasks: () =>
    request('/api/tasks/reset', {
      method: 'POST',
    }),
}

// Backward compatibility alias
export const veroxApi = whatsapiApi

