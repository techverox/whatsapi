import { dbService } from './db.service.js'
import { whatsAppService } from './whatsapp.service.js'

export interface BotRule {
  id: string
  keywords: string[]
  responseType: 'text' | 'template' | 'handoff' | 'optout'
  replyText?: string
  templateName?: string
  targetAgentName?: string
}

export const defaultBotRules: BotRule[] = [
  {
    id: 'rule-pricing',
    keywords: ['price', 'pricing', 'rate', 'cost', 'bhav', 'charge', 'kharch'],
    responseType: 'text',
    replyText: `🚀 *VEROX Automation Pricing Plans:*

1️⃣ *Starter Cloud WABA:* ₹1,499/mo (Unlimited incoming, 5k broadcasts)
2️⃣ *Agency Enterprise:* ₹4,999/mo (Official WABA + Multi-Agent Inbox + IndiaMart & FB Ads Auto-sync)
3️⃣ *Local Self-Hosted:* ₹0/mo (Lifetime Free, Self-managed on your server!)

Kya aapko free live demo dekhna hai? Type *DEMO* karein!`,
  },
  {
    id: 'rule-demo',
    keywords: ['demo', 'trial', 'test', 'sample'],
    responseType: 'text',
    replyText: `🎉 *Free Live Demo Scheduled!*

Aap direct local dashboard access kar sakte hain:
🔗 http://localhost:3000

Hamara executive agle 10 minute me aapse call par connect karega.`,
  },
  {
    id: 'rule-support',
    keywords: ['support', 'help', 'agent', 'human', 'madat', 'problem', 'issue'],
    responseType: 'handoff',
    replyText: `👨‍💼 *Executive Assigned!*
Aapki chat Senior Support Agent Bhavik ko assign kar di gayi hai. Woh kuch hi palon me aapse baat karenge.`,
    targetAgentName: 'Agent Bhavik',
  },
  {
    id: 'rule-optout',
    keywords: ['stop', 'unsubscribe', 'band karo', 'ruk jao'],
    responseType: 'optout',
    replyText: `✅ Aapko broadcast list se successfully remove kar diya gaya hai. Ab aapko koi promotional message nahi aayega. Dobara shuru karne ke liye *START* likhein.`,
  },
]

class BotService {
  private rules: BotRule[] = [...defaultBotRules]

  public getRules(): BotRule[] {
    return this.rules
  }

  public addRule(rule: BotRule) {
    this.rules.unshift(rule)
  }

  public async evaluateMessage(fromPhone: string, messageText: string, conversationId: string): Promise<{
    handled: boolean
    matchedRule?: BotRule
    replySent?: string
  }> {
    const textLower = messageText.toLowerCase().trim()

    for (const rule of this.rules) {
      const isMatched = rule.keywords.some((kw) => textLower.includes(kw.toLowerCase()))
      if (isMatched) {
        let reply = rule.replyText || ''

        // Special handling
        if (rule.responseType === 'optout') {
          const contact = dbService.contacts.find((c) => c.phone === fromPhone)
          if (contact) {
            contact.optIn = false
            console.log(`🛑 Contact ${contact.phone} opted out via STOP keyword.`)
          }
        } else if (rule.responseType === 'handoff') {
          const conv = dbService.getConversationById(conversationId)
          if (conv) {
            conv.status = 'open'
            conv.tags.push({ id: 'tag-priority', name: 'Agent Required', color: '#ef4444' })
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
    }

    return { handled: false }
  }
}

export const botService = new BotService()
