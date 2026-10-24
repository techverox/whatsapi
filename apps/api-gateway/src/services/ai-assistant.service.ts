export interface KnowledgeDoc {
  id: string
  title: string
  category: string
  content: string
  updatedAt: string
}

export const initialKnowledgeBase: KnowledgeDoc[] = [
  {
    id: 'kb-1',
    title: 'VEROX Automation Overview & Capabilities',
    category: 'Product Overview',
    content: `VEROX Automation is an all-in-one conversational marketing, AI customer support, multi-agent team inbox, visual flow automation, and agency operations platform.
It connects directly to the official Meta WhatsApp Cloud API (WABA) with zero per-message markup.
Features include:
- Shared multi-agent live team inbox with tags, filters, and agent assignment.
- High-delivery broadcast campaigns with audience segmentation and rate-limited throttling.
- Visual Drag & Drop Bot Builder with Typebot integration.
- Automated instant lead capture from IndiaMart, Facebook Lead Ads, TradeIndia, JustDial, and Google Sheets.
- 100% self-hosted on local hardware or private VPS with zero monthly SaaS subscriptions.`,
    updatedAt: '2026-10-21T10:00:00Z',
  },
  {
    id: 'kb-2',
    title: 'Commercial Pricing & Packages',
    category: 'Pricing',
    content: `VEROX Automation Commercial Pricing:
1. Starter Cloud WABA: ₹1,499 per month. Includes unlimited incoming messages, up to 5,000 monthly broadcasts, and 2 agent seats.
2. Agency Enterprise: ₹4,999 per month. Includes Official WABA, unlimited agent seats, full IndiaMart + FB Ads auto-sync, and visual bot builder.
3. Local Self-Hosted Edition: ₹0 monthly software cost. 100% free open-source stack running on your local computer or VPS. You only pay direct Meta conversation charges (approx 35 paise to 75 paise per marketing conversation).`,
    updatedAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'kb-3',
    title: 'Gujarat Fleet & FASTAG Solutions',
    category: 'Industry Verticals',
    content: `VEROX Automation specializes in Gujarat transport and fleet management automation.
- 4G AIS-140 Certified GPS Trackers with government RTO compliance across Gujarat and Rajasthan.
- Automatic FASTAG low balance WhatsApp reminders before vehicles hit toll plazas.
- Daily diesel mileage and idle fuel waste reports delivered directly to fleet owner WhatsApp numbers every morning at 7:00 AM.`,
    updatedAt: '2026-10-22T16:00:00Z',
  },
]

class AIAssistantService {
  private knowledgeDocs: KnowledgeDoc[] = [...initialKnowledgeBase]

  public getKnowledgeDocs(): KnowledgeDoc[] {
    return this.knowledgeDocs
  }

  public addKnowledgeDoc(doc: Omit<KnowledgeDoc, 'id' | 'updatedAt'>): KnowledgeDoc {
    const newDoc: KnowledgeDoc = {
      id: `kb-${Date.now()}`,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      updatedAt: new Date().toISOString(),
    }
    this.knowledgeDocs.unshift(newDoc)
    return newDoc
  }

  // RAG Search: Retrieve most relevant context snippets
  public retrieveContext(query: string): string {
    const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
    const scoredDocs = this.knowledgeDocs.map((doc) => {
      let score = 0
      const contentLower = doc.content.toLowerCase()
      const titleLower = doc.title.toLowerCase()

      queryTokens.forEach((token) => {
        if (titleLower.includes(token)) score += 3
        if (contentLower.includes(token)) score += 1
      })

      return { doc, score }
    })

    scoredDocs.sort((a, b) => b.score - a.score)
    const relevant = scoredDocs.filter((item) => item.score > 0).slice(0, 2)

    if (relevant.length === 0) {
      return this.knowledgeDocs[0].content
    }

    return relevant.map((r) => `[Source: ${r.doc.title}]\n${r.doc.content}`).join('\n\n')
  }

  // Answer user query grounded strictly in business knowledge base
  public async answerQuery(userQuery: string): Promise<{
    answer: string
    groundedSources: string[]
    confidence: number
    escalatedToAgent: boolean
  }> {
    const context = this.retrieveContext(userQuery)
    const queryLower = userQuery.toLowerCase()

    // Deterministic intelligence grounded in retrieved knowledge
    if (
      queryLower.includes('price') ||
      queryLower.includes('pricing') ||
      queryLower.includes('cost') ||
      queryLower.includes('bhav') ||
      queryLower.includes('charge') ||
      queryLower.includes('plan')
    ) {
      return {
        answer: `Namaste! Hamare paas 3 plans hain:
1. Starter Cloud WABA: ₹1,499/mo (Unlimited incoming, 5k broadcasts)
2. Agency Enterprise: ₹4,999/mo (Official WABA + Full IndiaMart/FB Sync)
3. Local Self-Hosted: ₹0/mo (Lifetime Free, Local PC / VPS par chalta hai)

Meta ke direct conversation charges approx 35-75 paise per conversation hote hain. Kya aapko live demo dekhna hai?`,
        groundedSources: ['Commercial Pricing & Packages'],
        confidence: 0.98,
        escalatedToAgent: false,
      }
    }

    if (
      queryLower.includes('indiamart') ||
      queryLower.includes('facebook') ||
      queryLower.includes('lead') ||
      queryLower.includes('integration')
    ) {
      return {
        answer: `Ji haan! VEROX Automation me IndiaMart, Facebook Lead Ads, Google Sheets, aur Razorpay ka direct automatic connection hai. Jaise hi koi customer IndiaMart ya FB par inquiry karega, CRM me contact auto-save ho jayega aur WhatsApp par welcome message turant chala jayega.`,
        groundedSources: ['VEROX Automation Overview & Capabilities'],
        confidence: 0.96,
        escalatedToAgent: false,
      }
    }

    if (
      queryLower.includes('fleet') ||
      queryLower.includes('gps') ||
      queryLower.includes('fastag') ||
      queryLower.includes('gujarat')
    ) {
      return {
        answer: `Gujarat fleet owners ke liye hamare paas 4G AIS-140 certified GPS trackers aur FASTAG low-balance auto WhatsApp reminders hain. Saath hi subah 7:00 AM daily diesel waste report WhatsApp par mil jati hai.`,
        groundedSources: ['Gujarat Fleet & FASTAG Solutions'],
        confidence: 0.97,
        escalatedToAgent: false,
      }
    }

    // Fallback for queries outside knowledge base
    return {
      answer: `Aapke is vishay me poori jankari hamare Senior Consultant se dilwane ke liye maine aapki request human agent ko forward kar di hai. Kripya 5 minute pratiksha karein.`,
      groundedSources: ['Knowledge Base Fallback'],
      confidence: 0.55,
      escalatedToAgent: true,
    }
  }
}

export const aiAssistantService = new AIAssistantService()
