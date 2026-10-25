import { dbService } from './db.service.js'
import { whatsAppService } from './whatsapp.service.js'
import { aiAssistantService } from './ai-assistant.service.js'

export type BotResponseType = 'text' | 'template' | 'handoff' | 'optout'
export type BotRuleCategory = 'Sales' | 'Operations' | 'Support' | 'Compliance' | 'General'

export interface BotRule {
  id: string
  name?: string
  keywords: string[]
  matchType?: 'contains' | 'exact' | 'regex'
  responseType: BotResponseType
  replyText: string
  reply?: string // Backward compatibility alias
  templateName?: string
  targetAgentName?: string
  category: BotRuleCategory
  active: boolean
  hits: number
  priority?: number
  createdAt: string
  updatedAt: string
}

export const defaultBotRules: BotRule[] = [
  {
    id: 'rule-pricing',
    name: 'GPS Fleet Pricing & Plans',
    keywords: ['price', 'pricing', 'rate', 'cost', 'bhav', 'discount', 'quote', 'charges'],
    responseType: 'text',
    replyText: `🚚 Our Truck Sathi AIS-140 GPS begins at ₹2,999/unit including 1-year government portal subscription, live SIM data, and instant Gujarat fitment.`,
    reply: `🚚 Our Truck Sathi AIS-140 GPS begins at ₹2,999/unit including 1-year government portal subscription, live SIM data, and instant Gujarat fitment.`,
    category: 'Sales',
    active: true,
    hits: 1420,
    priority: 10,
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-25T10:30:00Z',
  },
  {
    id: 'rule-fastag',
    name: 'FASTAG Top-up & Issuance',
    keywords: ['fastag', 'recharge', 'toll', 'balance', 'wallet', 'topup'],
    responseType: 'text',
    replyText: `⚡ Instant Commercial Fastag issuance and automatic wallet top-up for 10-wheeler to 14-wheeler trucks. Send your vehicle RC copy to activate.`,
    reply: `⚡ Instant Commercial Fastag issuance and automatic wallet top-up for 10-wheeler to 14-wheeler trucks. Send your vehicle RC copy to activate.`,
    category: 'Operations',
    active: true,
    hits: 890,
    priority: 8,
    createdAt: '2026-10-20T08:30:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'rule-support',
    name: 'Human Advisor Handoff',
    keywords: ['support', 'agent', 'help', 'human', 'call', 'officer', 'madat', 'problem', 'issue'],
    responseType: 'handoff',
    replyText: `👤 Connecting you to our senior Gujarat fleet logistics advisor. Please hold on while an executive contacts you in 2 minutes.`,
    reply: `👤 Connecting you to our senior Gujarat fleet logistics advisor. Please hold on while an executive contacts you in 2 minutes.`,
    targetAgentName: 'Senior Gujarat Logistics Advisor',
    category: 'Support',
    active: true,
    hits: 615,
    priority: 9,
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-10-25T11:15:00Z',
  },
  {
    id: 'rule-compliance',
    name: 'MoRTH AIS-140 Certification',
    keywords: ['certificate', 'ais140', 'rto', 'morth', 'pass', 'approval', 'fitment'],
    responseType: 'text',
    replyText: `📜 All Truck Sathi GPS units come with MoRTH approved AIS-140 Certificates and SOS panic buttons synced to the Gujarat State Emergency Command Portal.`,
    reply: `📜 All Truck Sathi GPS units come with MoRTH approved AIS-140 Certificates and SOS panic buttons synced to the Gujarat State Emergency Command Portal.`,
    category: 'Compliance',
    active: true,
    hits: 412,
    priority: 7,
    createdAt: '2026-10-20T09:30:00Z',
    updatedAt: '2026-10-25T11:45:00Z',
  },
  {
    id: 'rule-demo',
    name: 'Live Demo Scheduling',
    keywords: ['demo', 'trial', 'test', 'sample'],
    responseType: 'text',
    replyText: `🎉 *Free Live Demo Scheduled!*\n\nAap direct local dashboard access kar sakte hain:\n🔗 http://localhost:3000\n\nHamara executive agle 10 minute me aapse call par connect karega.`,
    reply: `🎉 *Free Live Demo Scheduled!*\n\nAap direct local dashboard access kar sakte hain:\n🔗 http://localhost:3000\n\nHamara executive agle 10 minute me aapse call par connect karega.`,
    category: 'Sales',
    active: true,
    hits: 284,
    priority: 6,
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
  },
  {
    id: 'rule-optout',
    name: 'Opt-out Compliance (STOP)',
    keywords: ['stop', 'unsubscribe', 'band karo', 'ruk jao'],
    responseType: 'optout',
    replyText: `✅ Aapko broadcast list se successfully remove kar diya gaya hai. Ab aapko koi promotional message nahi aayega. Dobara shuru karne ke liye *START* likhein.`,
    reply: `✅ Aapko broadcast list se successfully remove kar diya gaya hai. Ab aapko koi promotional message nahi aayega. Dobara shuru karne ke liye *START* likhein.`,
    category: 'Compliance',
    active: true,
    hits: 198,
    priority: 10,
    createdAt: '2026-10-21T11:00:00Z',
    updatedAt: '2026-10-25T12:30:00Z',
  },
]

class BotService {
  private rules: BotRule[] = JSON.parse(JSON.stringify(defaultBotRules))

  public getRules(filter?: { category?: string; search?: string; activeOnly?: boolean }): BotRule[] {
    let result = [...this.rules]

    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.toLowerCase()
      result = result.filter((r) => r.category.toLowerCase() === catLower)
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
          r.replyText.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.name && r.name.toLowerCase().includes(q))
      )
    }

    if (filter?.activeOnly) {
      result = result.filter((r) => r.active)
    }

    // Sort by priority descending, then hits descending
    return result.sort((a, b) => (b.priority || 0) - (a.priority || 0) || b.hits - a.hits)
  }

  public getRuleById(id: string): BotRule | undefined {
    return this.rules.find((r) => r.id === id)
  }

  public addRule(ruleData: Partial<BotRule>): BotRule {
    const rawKeywords = ruleData.keywords || []
    const cleanedKeywords = rawKeywords
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0)

    const reply = ruleData.replyText || ruleData.reply || ''
    const now = new Date().toISOString()

    const newRule: BotRule = {
      id: ruleData.id || `rule-${Date.now()}`,
      name: ruleData.name || `Rule: ${cleanedKeywords[0] || 'Custom'}`,
      keywords: cleanedKeywords,
      matchType: ruleData.matchType || 'contains',
      responseType: ruleData.responseType || 'text',
      replyText: reply,
      reply: reply,
      templateName: ruleData.templateName,
      targetAgentName: ruleData.targetAgentName,
      category: ruleData.category || 'General',
      active: ruleData.active !== undefined ? ruleData.active : true,
      hits: ruleData.hits || 0,
      priority: ruleData.priority || 5,
      createdAt: now,
      updatedAt: now,
    }

    this.rules.unshift(newRule)
    return newRule
  }

  public updateRule(id: string, updates: Partial<BotRule>): BotRule | null {
    const index = this.rules.findIndex((r) => r.id === id)
    if (index === -1) return null

    const existing = this.rules[index]
    const cleanedKeywords = updates.keywords
      ? updates.keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0)
      : existing.keywords

    const reply = updates.replyText !== undefined ? updates.replyText : (updates.reply !== undefined ? updates.reply : existing.replyText)

    const updated: BotRule = {
      ...existing,
      ...updates,
      keywords: cleanedKeywords,
      replyText: reply,
      reply: reply,
      updatedAt: new Date().toISOString(),
    }

    this.rules[index] = updated
    return updated
  }

  public deleteRule(id: string): boolean {
    const prevLen = this.rules.length
    this.rules = this.rules.filter((r) => r.id !== id)
    return this.rules.length < prevLen
  }

  public toggleRule(id: string, explicitActive?: boolean): BotRule | null {
    const rule = this.rules.find((r) => r.id === id)
    if (!rule) return null

    rule.active = explicitActive !== undefined ? explicitActive : !rule.active
    rule.updatedAt = new Date().toISOString()
    return rule
  }

  public incrementHits(id: string): void {
    const rule = this.rules.find((r) => r.id === id)
    if (rule) {
      rule.hits += 1
      rule.updatedAt = new Date().toISOString()
    }
  }

  public getStats() {
    const totalRules = this.rules.length
    const activeRules = this.rules.filter((r) => r.active).length
    const disabledRules = totalRules - activeRules
    const totalHits = this.rules.reduce((acc, r) => acc + (r.hits || 0), 0)

    const categoryBreakdown: Record<string, number> = {}
    for (const r of this.rules) {
      const cat = r.category || 'General'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
    }

    const topRules = [...this.rules]
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        hits: r.hits,
        keywords: r.keywords,
      }))

    return {
      totalRules,
      activeRules,
      disabledRules,
      totalHits,
      categoryBreakdown,
      topRules,
    }
  }

  public resetDefaults(): BotRule[] {
    this.rules = JSON.parse(JSON.stringify(defaultBotRules))
    return this.rules
  }

  public matchQuery(queryText: string): { matched: boolean; rule?: BotRule; matchedKeyword?: string } {
    if (!queryText || !queryText.trim()) {
      return { matched: false }
    }

    const textLower = queryText.toLowerCase().trim()
    // Sort active rules by priority desc
    const activeRules = this.rules.filter((r) => r.active).sort((a, b) => (b.priority || 0) - (a.priority || 0))

    for (const rule of activeRules) {
      for (const kw of rule.keywords) {
        const kwLower = kw.toLowerCase().trim()
        if (!kwLower) continue

        // Word boundary / substring test
        // If keyword contains space (phrase match), check substring
        // Otherwise word boundary or substring match
        let isMatch = false
        if (kwLower.includes(' ')) {
          isMatch = textLower.includes(kwLower)
        } else {
          const regex = new RegExp(`(^|[^a-zA-Z0-9_])${kwLower}([^a-zA-Z0-9_]|$)`, 'i')
          isMatch = regex.test(textLower) || textLower.includes(kwLower)
        }

        if (isMatch) {
          return {
            matched: true,
            rule,
            matchedKeyword: kw,
          }
        }
      }
    }

    return { matched: false }
  }

  public async evaluateMessage(fromPhone: string, messageText: string, conversationId: string): Promise<{
    handled: boolean
    matchedRule?: BotRule
    replySent?: string
  }> {
    const match = this.matchQuery(messageText)

    if (match.matched && match.rule) {
      const rule = match.rule
      this.incrementHits(rule.id)

      let reply = rule.replyText || rule.reply || ''

      // Special handling
      if (rule.responseType === 'optout') {
        const contact = dbService.contacts.find((c) => c.phone === fromPhone)
        if (contact) {
          contact.optIn = false
          console.log(`🛑 Contact ${contact.phone} opted out via Bot Rule (${rule.id}).`)
        }
      } else if (rule.responseType === 'handoff') {
        const conv = dbService.getConversationById(conversationId)
        if (conv) {
          conv.status = 'open'
          const hasTag = conv.tags.some((t) => t.id === 'tag-priority' || t.name === 'Agent Required')
          if (!hasTag) {
            conv.tags.push({ id: 'tag-priority', name: 'Agent Required', color: '#ef4444' })
          }
        }
      }

      // Send auto-reply
      if (reply) {
        await whatsAppService.sendTextMessage(fromPhone, reply)
        dbService.addMessage(conversationId, {
          senderType: 'bot',
          senderName: 'VEROX Smart Bot',
          messageType: 'text',
          content: reply,
          status: 'delivered',
        })
      }

      return {
        handled: true,
        matchedRule: rule,
        replySent: reply,
      }
    }

    return { handled: false }
  }

  public async simulateTest(queryText: string): Promise<{
    matched: boolean
    source: 'keyword_rule' | 'ai_rag_fallback' | 'unhandled'
    rule?: BotRule
    matchedKeyword?: string
    reply: string
    responseType?: string
    aiDetails?: any
  }> {
    const match = this.matchQuery(queryText)

    if (match.matched && match.rule) {
      // Increment hit counter on successful simulation
      this.incrementHits(match.rule.id)
      return {
        matched: true,
        source: 'keyword_rule',
        rule: match.rule,
        matchedKeyword: match.matchedKeyword,
        reply: match.rule.replyText || match.rule.reply || '',
        responseType: match.rule.responseType,
      }
    }

    // Try AI Assistant RAG Fallback
    try {
      const aiRes = await aiAssistantService.answerQuery(queryText)
      if (aiRes && aiRes.answer) {
        return {
          matched: false,
          source: 'ai_rag_fallback',
          reply: `🤖 [AI RAG Smart Reply]: ${aiRes.answer}`,
          aiDetails: aiRes,
        }
      }
    } catch (err) {
      console.warn('AI fallback failed in simulateTest:', err)
    }

    return {
      matched: false,
      source: 'unhandled',
      reply: '🤖 No keyword rule matched. Inbound customer message routed to Human Agent Desk.',
    }
  }
}

export const botService = new BotService()
