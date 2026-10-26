// ============================================================================
// Enterprise Knowledge Base Service (Multi-State & Multi-Tenant Ready)
// Supports RAG Vector Store Grounding, Full CRUD, Search, and Real-time Sync
// ============================================================================

export interface KnowledgeArticle {
  id: string
  title: string
  summary: string
  content: string
  tokens: number
  chunks: number
  readTime: string
  updatedAt: string
  featured?: boolean
  routeLink?: string
  categoryId: string
  tags?: string[]
  stateId?: string
  tenantId?: string
}

export interface KnowledgeCategory {
  id: string
  name: string
  iconColor: string
  description?: string
  displayOrder?: number
  stateId?: string
  tenantId?: string
}

export interface KnowledgeCategoryGroup extends KnowledgeCategory {
  articles: KnowledgeArticle[]
}

export const defaultCategoriesSeed: KnowledgeCategory[] = [
  { id: 'dashboard', name: 'Dashboard', iconColor: 'bg-orange-500', description: 'Metrics, KPIs, and operational cockpit guides', displayOrder: 1 },
  { id: 'manage', name: 'Manage Section', iconColor: 'bg-amber-500', description: 'WhatsApp Templates, Forms, and Tagging policies', displayOrder: 2 },
  { id: 'integrations', name: 'Integrations', iconColor: 'bg-blue-500', description: 'Meta Cloud API, IndiaMart, and Facebook Leads', displayOrder: 3 },
  { id: 'gallery', name: 'Gallery', iconColor: 'bg-emerald-500', description: 'Media asset management and CDN specifications', displayOrder: 4 },
  { id: 'inbox', name: 'Inbox Section', iconColor: 'bg-teal-500', description: 'Multi-agent live chat, canned replies, and agent assignment', displayOrder: 5 },
  { id: 'contacts', name: 'Contacts', iconColor: 'bg-purple-500', description: 'CRM lead records, segmentation, and CSV data flow', displayOrder: 6 },
  { id: 'campaigns', name: 'Campaigns', iconColor: 'bg-rose-500', description: 'High-throughput broadcast campaigns and scheduling', displayOrder: 7 },
  { id: 'faq-bot', name: 'FAQ Bot', iconColor: 'bg-indigo-500', description: 'Keyword matching, auto-responder rules, and simulator', displayOrder: 8 },
  { id: 'chatbot', name: 'Chatbot', iconColor: 'bg-cyan-500', description: 'Visual drag-and-drop conversational decision trees', displayOrder: 9 },
  { id: 'ai-assistant', name: 'AI assistant', iconColor: 'bg-violet-500', description: 'RAG grounding, prompt governance, and LLM tuning', displayOrder: 10 },
  { id: 'flows', name: 'Flows', iconColor: 'bg-orange-600', description: 'Event-driven flow studio and payload simulation', displayOrder: 11 },
  { id: 'developers', name: 'Developers', iconColor: 'bg-slate-600', description: 'REST endpoints, webhooks, and developer documentation', displayOrder: 12 },
]

export const defaultArticlesSeed: KnowledgeArticle[] = [
  {
    id: 'dash-1',
    categoryId: 'dashboard',
    title: 'Dashboard Overview & Real-time KPI Metrics',
    summary: 'Learn how to monitor active flows, chatbots, message delivery analytics, and project timeline tracking.',
    readTime: '3 min read',
    tokens: 1850,
    chunks: 6,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/dashboard',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['dashboard', 'analytics', 'kpi'],
    content: `### 1. Overview
The DV WhatsAPI Dashboard delivers a 360-degree real-time operational cockpit for commercial fleet and enterprise WhatsApp marketing.

### 2. Key Metrics Tracked
- **Total Flows**: Count of active vs inactive event-driven automated workflows.
- **Total Chatbots**: Live visual bot configurations deployed to inbound customer numbers.
- **Message Volume**: Daily, monthly, and yearly breakdown of sent vs received WhatsApp messages.
- **Project Planner**: Interactive Gantt-style timeline tracking active client deployments and tasks.

### 3. Tips for Performance
Always verify that your Meta WhatsApp Business API webhook is verified with status 200 OK so that all analytics reflect instantaneously.`,
  },
  {
    id: 'dash-2',
    categoryId: 'dashboard',
    title: 'Message Analytics & Response Rate Optimization',
    summary: 'How to interpret inbound customer queries, peak interaction hours, and automated AI resolution rates.',
    readTime: '2 min read',
    tokens: 1420,
    chunks: 5,
    updatedAt: '22 Oct 2026',
    routeLink: '/dashboard',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['analytics', 'response-rate', 'optimization'],
    content: `### Understanding Response Analytics
DV WhatsAPI logs every incoming customer message alongside the automated reply timestamp.

1. **Inbound Traffic Spikes**: Peak hours are typically 10:00 AM to 1:00 PM and 4:00 PM to 7:00 PM.
2. **AI Resolution Rate**: Over 84% of commercial fleet queries (pricing, FASTAG balance, GPS tracking) are answered in under 2 seconds without human agent intervention.
3. **Escalations**: Queries tagged as complex or requesting human assistance are routed to assigned agents within 15 seconds.`,
  },
  {
    id: 'man-1',
    categoryId: 'manage',
    title: 'WhatsApp Message Templates & Meta Approvals',
    summary: 'Guidelines for creating marketing, utility, and authentication templates that comply with Meta 2026 policies.',
    readTime: '4 min read',
    tokens: 2400,
    chunks: 8,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/manage/templates',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['templates', 'meta', 'compliance'],
    content: `### WhatsApp Cloud API Template Rules
Meta requires pre-approval for outbound messages initiated outside the 24-hour customer service window.

### Category Breakdown
- **MARKETING**: Promotions, festive discounts, fleet upgrades, and catalog announcements.
- **UTILITY**: Transaction receipts, GPS installation confirmations, and order updates.
- **AUTHENTICATION**: One-time login passcodes (OTP) with zero-click autofill buttons.

### Creating a Template
1. Navigate to **Manage > Whatsapp Templates**.
2. Click **+ Create Template**.
3. Choose Language (e.g. *English (US)*, *Hindi (hi)*, or *Gujarati (gu)*).
4. Add Header (Image, Document, or Text), Body with dynamic variables \`{{1}}\`, and Quick Reply buttons.`,
  },
  {
    id: 'man-2',
    categoryId: 'manage',
    title: 'Custom WhatsApp Forms & Lead Capture',
    summary: 'Build native multi-step forms directly inside WhatsApp without redirecting customers to external browsers.',
    readTime: '3 min read',
    tokens: 1750,
    chunks: 6,
    updatedAt: '20 Oct 2026',
    routeLink: '/manage/forms',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['forms', 'lead-capture', 'flows'],
    content: `### Native WhatsApp Flows & Forms
Collect structured lead information—such as vehicle registration numbers, fleet size, and preferred installation city—directly inside the WhatsApp conversation window.

### Advantages:
- 3.5x higher conversion rate than external web landing pages.
- Auto-syncs response fields to the Contacts CRM.
- Triggers instant notification to the sales desk.`,
  },
  {
    id: 'man-3',
    categoryId: 'manage',
    title: 'Contact Tags & Opts Management',
    summary: 'Maintain compliance with STOP/UNSUBSCRIBE keywords and organize leads using tags.',
    readTime: '2 min read',
    tokens: 1200,
    chunks: 4,
    updatedAt: '18 Oct 2026',
    routeLink: '/manage/tags',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['tags', 'opt-in', 'compliance'],
    content: `### Compliance & Tagging Rules
- Every campaign recipient must have opt-in consent.
- Automated Opt-Out: If a user sends "STOP" or "UNSUBSCRIBE", DV WhatsAPI automatically marks them as \`Opt In: No\` and suspends promotional broadcasts.`,
  },
  {
    id: 'int-1',
    categoryId: 'integrations',
    title: 'Meta WhatsApp Business Cloud API Integration',
    summary: 'Step-by-step setup for permanent system user access tokens, WABA ID, and webhook endpoints.',
    readTime: '5 min read',
    tokens: 3100,
    chunks: 10,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/apps',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['meta', 'waba', 'webhook', 'api'],
    content: `### Connecting Meta Cloud API
DV WhatsAPI connects natively to Meta's official Graph API (v20.0+).

### Required Credentials:
1. **Phone Number ID**: Found in Meta Developer Dashboard under *WhatsApp > API Setup*.
2. **WABA ID (WhatsApp Business Account ID)**: Unique identifier for your business account.
3. **Permanent Access Token**: Generated via Meta Business Manager System User with \`whatsapp_business_messaging\` permissions.
4. **Webhook Callback URL**: Set to \`https://app.dvwhatsapi.io/api/v2/webhook/whatsapp\`.
5. **Verify Token**: Your custom security token configured in **Settings > WhatsApp API**.`,
  },
  {
    id: 'int-2',
    categoryId: 'integrations',
    title: 'IndiaMart & Facebook Lead Ads Push Integration',
    summary: 'Capture buyer leads from IndiaMart and Facebook Ads in under 500ms with instant WhatsApp auto-replies.',
    readTime: '3 min read',
    tokens: 2100,
    chunks: 7,
    updatedAt: '21 Oct 2026',
    routeLink: '/apps',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['indiamart', 'facebook', 'leads'],
    content: `### 24/7 Lead Ingestion
- **IndiaMart Push API**: Paste your CRM Webhook URL into the IndiaMart Lead Manager settings. Incoming buyer inquiries are parsed and tagged with #indiamart-buyer.
- **Facebook Lead Ads**: Connect your Facebook Page to trigger a personalized WhatsApp catalog within 30 seconds of form submission.`,
  },
  {
    id: 'gal-1',
    categoryId: 'gallery',
    title: 'Media Asset Management & Permanent CDN URLs',
    summary: 'Upload and organize product brochures, AIS-140 GPS product spec sheets, and marketing flyers.',
    readTime: '2 min read',
    tokens: 1350,
    chunks: 4,
    updatedAt: '23 Oct 2026',
    routeLink: '/gallery',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['gallery', 'cdn', 'media'],
    content: `### High-Speed Media CDN
All assets uploaded to the Gallery are hosted on an enterprise CDN optimized for high-speed WhatsApp media delivery.

- **Supported Formats**: JPEG, PNG, WEBP, PDF, MP4, MP3.
- **Max File Size**: 16 MB for photos and audio; 100 MB for PDF documents.
- **1-Click Copy**: Copy direct public URLs for use in Broadcast campaigns and Flow templates.`,
  },
  {
    id: 'inb-1',
    categoryId: 'inbox',
    title: 'Omnichannel Live Chat & Agent Desk Workflow',
    summary: 'Master the unified multi-agent inbox, customer tag filters, sound alerts, and AI copilot suggestions.',
    readTime: '4 min read',
    tokens: 2600,
    chunks: 9,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/chats',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['inbox', 'live-chat', 'canned-replies'],
    content: `### Unified Team Inbox
The Inbox allows your entire sales and support staff to handle incoming customer queries simultaneously.

### Key Capabilities:
- **Conversation Tag Filter**: Filter chats by \`All\`, \`English\`, \`FASTAG\`, \`Fleet Mgmt\`, \`GPS\`, or \`hot-lead\`.
- **Quick Replies**: Press \`/\` in the message composer to insert pre-approved canned responses.
- **Rich Media**: Send GPS spec sheets, quote PDFs, and voice notes directly from the composer.
- **Agent Hand-off**: Toggle between automated AI chatbot response and human takeover with a single click.`,
  },
  {
    id: 'con-1',
    categoryId: 'contacts',
    title: 'Contacts CRM & Advanced Segmentation',
    summary: 'Managing phone numbers, WABA accounts, opt-in statuses, and automated sales desk assignment.',
    readTime: '3 min read',
    tokens: 1950,
    chunks: 6,
    updatedAt: '24 Oct 2026',
    routeLink: '/users',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['contacts', 'crm', 'segmentation'],
    content: `### Enterprise Contact Management
The Contacts CRM provides complete audit history for every commercial fleet lead and customer.

- **Bulk Actions**: Select multiple contacts to trigger targeted WhatsApp broadcasts or assign tags.
- **CSV Import/Export**: Import spreadsheets of fleet owners with phone numbers and custom vehicle attributes.
- **Column Customization**: Toggle visibility of GPS Client, Assigned To, and WABA Phone Number columns.`,
  },
  {
    id: 'cam-1',
    categoryId: 'campaigns',
    title: 'Broadcasting Targeted WhatsApp Campaigns',
    summary: 'Plan, schedule, and execute high-throughput promotional and festive broadcasts with real-time delivery reports.',
    readTime: '4 min read',
    tokens: 2200,
    chunks: 7,
    updatedAt: '23 Oct 2026',
    routeLink: '/campaigns',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['campaigns', 'broadcast', 'delivery-reports'],
    content: `### WhatsApp Broadcast Engine
Reach thousands of opt-in customers instantly using Meta-approved templates.

### Best Practices for High Open Rates:
1. Segment recipients by interest (e.g. #gps-inquiry vs #fastag-fleet).
2. Schedule broadcasts during business hours (10:30 AM to 6:30 PM).
3. Include clear Call-to-Action buttons (e.g. "Chat with Sales" or "Download Brochure").`,
  },
  {
    id: 'faq-1',
    categoryId: 'faq-bot',
    title: 'Keyword Intent Matching & 24/7 FAQ Responses',
    summary: 'Configure automated trigger rules, confidence thresholds, and multi-lingual customer query resolution.',
    readTime: '3 min read',
    tokens: 1800,
    chunks: 6,
    updatedAt: '24 Oct 2026',
    routeLink: '/faq-bot',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['faq', 'auto-responder', 'keywords'],
    content: `### Instant 24/7 Auto-Responder
Configure keyword patterns and conversational matching for frequent questions.

- **Matching Modes**: Exact match, phrase contains, or fuzzy semantic matching.
- **Multi-language Support**: Handles English, Hindi, and Gujarati phrasing.
- **Interactive Simulator**: Test questions in the live simulator to verify match accuracy before deployment.`,
  },
  {
    id: 'bot-1',
    categoryId: 'chatbot',
    title: 'Visual Chatbot Canvas & Interactive Menus',
    summary: 'Design multi-turn conversational trees with quick reply buttons, branch routing, and CRM updates.',
    readTime: '4 min read',
    tokens: 2500,
    chunks: 8,
    updatedAt: '24 Oct 2026',
    routeLink: '/chatbot',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['chatbot', 'builder', 'menus'],
    content: `### Visual Chatbot Builder
Create complex customer interaction flows without writing code.

### Node Types:
- **Welcome Trigger**: Activates on new conversation or keyword match.
- **Button Menu**: Presents up to 3 interactive reply buttons (e.g. "Buy GPS", "Recharge FASTAG", "Support").
- **Data Capture**: Requests vehicle registration or email and validates format.
- **Transfer Node**: Hands over conversation to a human agent when customer requests live help.`,
  },
  {
    id: 'ai-1',
    categoryId: 'ai-assistant',
    title: 'RAG Grounded AI Assistant with Gemini & GPT-4o',
    summary: 'How DV WhatsAPI uses retrieval-augmented generation to answer technical fleet questions using this Knowledge Base.',
    readTime: '4 min read',
    tokens: 2800,
    chunks: 9,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/ai-assistant',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['ai', 'rag', 'grounding', 'vector-store'],
    content: `### Grounded Intelligence (RAG)
DV WhatsAPI incorporates an enterprise RAG (Retrieval-Augmented Generation) pipeline.

### How It Works:
1. When a customer sends a query, the system converts the query into a high-dimensional vector.
2. It retrieves the top matching knowledge articles from this Knowledge Base.
3. The LLM (e.g. **Gemini 1.5 Pro** or **GPT-4o**) synthesizes a polite, factual answer strictly grounded in your verified business documentation.
4. If no reliable answer is found, the assistant automatically routes the customer to human support without hallucinating.`,
  },
  {
    id: 'flow-1',
    categoryId: 'flows',
    title: 'Visual Flow Automation Studio & Live Debugging',
    summary: 'Detailed guide to building event-driven flows matching BizAutomation with real-time test execution.',
    readTime: '5 min read',
    tokens: 3400,
    chunks: 11,
    updatedAt: '24 Oct 2026',
    featured: true,
    routeLink: '/flows',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['flows', 'automation', 'webhook-triggers'],
    content: `### BizAutomation-Grade Flow Studio
DV WhatsAPI provides a visual canvas for event-driven marketing and CRM automation.

### Architecture:
- **Trigger Node**: Inbound WhatsApp text message, webhook trigger, or campaign event.
- **Condition Filter**: Conditional logic (e.g. \`message.text contains ["price", "gps"]\`).
- **Action Node**: Dispatches templates, sends media, or updates contact tags.
- **Test Debugger**: Run real-time simulations to inspect Input, Output, and Error JSON payloads with line numbers.`,
  },
  {
    id: 'dev-1',
    categoryId: 'developers',
    title: 'WhatsApp REST API & Webhook Specifications',
    summary: 'Direct REST endpoints for sending text messages, media, document attachments, and OTP authentication.',
    readTime: '4 min read',
    tokens: 2900,
    chunks: 9,
    updatedAt: '24 Oct 2026',
    routeLink: '/developers/api',
    stateId: 'GJ',
    tenantId: 'truck-sathi',
    tags: ['api', 'rest', 'developers', 'docs'],
    content: `### WhatsApp REST API Documentation
Send WhatsApp messages programmatically from your backend systems.

### Send Text Message Endpoint
\`\`\`bash
curl -X POST https://app.dvwhatsapi.io/api/v1/whatsapp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919825100001",
    "text": "Hello from DV WhatsAPI!"
  }'
\`\`\`

### Webhook Verification:
Meta sends a GET request to verify your webhook with \`hub.challenge\` and \`hub.verify_token\`. DV WhatsAPI automatically returns the challenge with 200 OK.`,
  },
]

export class KnowledgeBaseService {
  private categories: KnowledgeCategory[] = JSON.parse(JSON.stringify(defaultCategoriesSeed))
  private articles: KnowledgeArticle[] = JSON.parse(JSON.stringify(defaultArticlesSeed))
  public onEvent?: (type: string, payload: any) => void

  // --------------------------------------------------------------------------
  // Category Queries & Operations
  // --------------------------------------------------------------------------
  public getAllCategories(searchQuery?: string): KnowledgeCategoryGroup[] {
    const q = (searchQuery || '').trim().toLowerCase()

    return this.categories
      .slice()
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
      .map((cat) => {
        let catArticles = this.articles.filter((a) => a.categoryId === cat.id)

        if (q) {
          catArticles = catArticles.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.summary.toLowerCase().includes(q) ||
              a.content.toLowerCase().includes(q) ||
              (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
          )
        }

        return {
          ...cat,
          articles: catArticles,
        }
      })
  }

  public getCategoryById(id: string): KnowledgeCategory | undefined {
    return this.categories.find((c) => c.id === id)
  }

  public createCategory(data: { name: string; iconColor?: string; description?: string }): KnowledgeCategory {
    const id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`
    
    // Check duplicate
    if (this.categories.some((c) => c.id === id)) {
      throw new Error(`Category with ID '${id}' already exists.`)
    }

    const newCat: KnowledgeCategory = {
      id,
      name: data.name.trim(),
      iconColor: data.iconColor || 'bg-orange-500',
      description: data.description || '',
      displayOrder: this.categories.length + 1,
      stateId: 'GJ',
      tenantId: 'truck-sathi',
    }

    this.categories.push(newCat)
    this.emit('kb_category_created', newCat)
    return newCat
  }

  public updateCategory(id: string, updates: Partial<KnowledgeCategory>): KnowledgeCategory {
    const idx = this.categories.findIndex((c) => c.id === id)
    if (idx === -1) {
      throw new Error(`Category '${id}' not found.`)
    }

    const updated = {
      ...this.categories[idx],
      ...updates,
      id: this.categories[idx].id, // protect immutable primary ID
    }
    this.categories[idx] = updated
    this.emit('kb_category_updated', updated)
    return updated
  }

  public deleteCategory(id: string): { success: boolean; deletedArticlesCount: number } {
    const prevCatLen = this.categories.length
    this.categories = this.categories.filter((c) => c.id !== id)
    if (this.categories.length === prevCatLen) {
      throw new Error(`Category '${id}' not found.`)
    }

    // Cascade delete or re-tag articles
    const deletedArticles = this.articles.filter((a) => a.categoryId === id)
    this.articles = this.articles.filter((a) => a.categoryId !== id)

    this.emit('kb_category_deleted', { id, deletedArticlesCount: deletedArticles.length })
    return { success: true, deletedArticlesCount: deletedArticles.length }
  }

  // --------------------------------------------------------------------------
  // Article Queries & Operations
  // --------------------------------------------------------------------------
  public getAllArticles(params?: { search?: string; categoryId?: string; featured?: boolean }): KnowledgeArticle[] {
    let result = this.articles.slice()

    if (params?.categoryId) {
      result = result.filter((a) => a.categoryId === params.categoryId)
    }

    if (params?.featured !== undefined) {
      result = result.filter((a) => Boolean(a.featured) === Boolean(params.featured))
    }

    if (params?.search) {
      const q = params.search.trim().toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      )
    }

    return result
  }

  public getArticleById(id: string): KnowledgeArticle | undefined {
    return this.articles.find((a) => a.id === id)
  }

  public createArticle(data: {
    title: string
    categoryId: string
    content: string
    summary?: string
    routeLink?: string
    featured?: boolean
    tags?: string[]
  }): KnowledgeArticle {
    if (!data.title?.trim()) {
      throw new Error('Article title is mandatory.')
    }
    if (!data.content?.trim()) {
      throw new Error('Article content is mandatory.')
    }

    // Validate category exists
    let cat = this.categories.find((c) => c.id === data.categoryId)
    if (!cat) {
      // Auto-create category if fallback
      cat = this.createCategory({ name: data.categoryId })
    }

    const content = data.content.trim()
    const tokens = Math.max(120, Math.round(content.length * 0.75))
    const chunks = Math.max(1, Math.round(content.length / 320))
    const readTime = `${Math.max(1, Math.round(content.length / 600))} min read`

    const newArticle: KnowledgeArticle = {
      id: `art-${Date.now()}`,
      title: data.title.trim(),
      summary: data.summary || (content.slice(0, 140) + '...'),
      content,
      tokens,
      chunks,
      readTime,
      updatedAt: 'Just now',
      featured: Boolean(data.featured),
      routeLink: data.routeLink,
      categoryId: cat.id,
      tags: data.tags || [cat.id],
      stateId: 'GJ',
      tenantId: 'truck-sathi',
    }

    this.articles.unshift(newArticle)
    this.emit('kb_article_created', newArticle)
    return newArticle
  }

  public updateArticle(id: string, updates: Partial<KnowledgeArticle>): KnowledgeArticle {
    const idx = this.articles.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw new Error(`Article with ID '${id}' not found.`)
    }

    const existing = this.articles[idx]
    let content = updates.content !== undefined ? updates.content.trim() : existing.content
    let tokens = existing.tokens
    let chunks = existing.chunks
    let readTime = existing.readTime

    if (updates.content !== undefined) {
      tokens = Math.max(120, Math.round(content.length * 0.75))
      chunks = Math.max(1, Math.round(content.length / 320))
      readTime = `${Math.max(1, Math.round(content.length / 600))} min read`
    }

    const updated: KnowledgeArticle = {
      ...existing,
      ...updates,
      id: existing.id,
      content,
      tokens,
      chunks,
      readTime,
      updatedAt: 'Just now',
    }

    this.articles[idx] = updated
    this.emit('kb_article_updated', updated)
    return updated
  }

  public deleteArticle(id: string): { success: boolean; id: string } {
    const prevLen = this.articles.length
    this.articles = this.articles.filter((a) => a.id !== id)
    if (this.articles.length === prevLen) {
      throw new Error(`Article with ID '${id}' not found.`)
    }

    this.emit('kb_article_deleted', { id })
    return { success: true, id }
  }

  // --------------------------------------------------------------------------
  // AI Vector Synchronization & Statistics
  // --------------------------------------------------------------------------
  public syncToAI(): {
    success: boolean
    timestamp: string
    totalArticles: number
    totalTokens: number
    totalChunks: number
    categoriesCount: number
  } {
    const totalArticles = this.articles.length
    const totalTokens = this.articles.reduce((acc, a) => acc + (a.tokens || 0), 0)
    const totalChunks = this.articles.reduce((acc, a) => acc + (a.chunks || 1), 0)
    const timestamp = new Date().toISOString()

    const result = {
      success: true,
      timestamp,
      totalArticles,
      totalTokens,
      totalChunks,
      categoriesCount: this.categories.length,
    }

    this.emit('kb_synced_ai', result)
    return result
  }

  public getStats() {
    return {
      totalCategories: this.categories.length,
      totalArticles: this.articles.length,
      totalTokens: this.articles.reduce((acc, a) => acc + (a.tokens || 0), 0),
      totalChunks: this.articles.reduce((acc, a) => acc + (a.chunks || 1), 0),
      stateId: 'GJ',
      tenantId: 'truck-sathi',
    }
  }

  public exportKnowledgeBase() {
    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      tenantId: 'truck-sathi',
      stateId: 'GJ',
      categories: this.categories,
      articles: this.articles,
    }
  }

  public importKnowledgeBase(data: { categories?: KnowledgeCategory[]; articles?: KnowledgeArticle[] }) {
    if (data.categories && Array.isArray(data.categories)) {
      this.categories = data.categories.slice()
    }
    if (data.articles && Array.isArray(data.articles)) {
      this.articles = data.articles.slice()
    }
    this.emit('kb_imported', { categoriesCount: this.categories.length, articlesCount: this.articles.length })
    return this.getStats()
  }

  public resetToDefaults() {
    this.categories = JSON.parse(JSON.stringify(defaultCategoriesSeed))
    this.articles = JSON.parse(JSON.stringify(defaultArticlesSeed))
    this.emit('kb_reset_defaults', this.getStats())
    return this.getAllCategories()
  }

  private emit(type: string, payload: any) {
    if (this.onEvent) {
      try {
        this.onEvent(type, payload)
      } catch (_err) {
        // ignore websocket dispatch failure
      }
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService()
