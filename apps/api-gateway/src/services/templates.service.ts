export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO'
  text?: string
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'FLOW'
    text: string
    url?: string
    phone_number?: string
    flow_id?: string
  }>
}

export interface WhatsAppTemplate {
  id: string
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED'
  rejectionReason?: string
  components: TemplateComponent[]
  createdAt: string
  updatedAt: string
}

export const initialTemplates: WhatsAppTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'diwali_special_offer_v1',
    language: 'gu',
    category: 'MARKETING',
    status: 'APPROVED',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'શુભ દિવાળી અને નૂતન વર્ષાભિનંદન! 🪔',
      },
      {
        type: 'BODY',
        text: 'નમસ્તે {{1}},\n\nઆ દિવાળી પર VEROX Automation તમારા બિઝનેસ માટે લાવ્યું છે 30% સ્પેશિયલ ડિસ્કાઉન્ટ! તમારા બધા WhatsApp માર્કેટિંગ અને IndiaMart લીડ્સ હવે થશે 100% ઓટોમેટિક.\n\nઑફર મેળવવા માટે નીચે આપેલા બટન પર ક્લિક કરો.',
      },
      {
        type: 'FOOTER',
        text: 'VEROX Automation • ગુજરાત',
      },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'QUICK_REPLY', text: 'ઑફર બુક કરો 🚀' },
          { type: 'URL', text: 'ડેમો જુઓ', url: 'https://veroxautomation.local/demo' },
        ],
      },
    ],
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T11:30:00Z',
  },
  {
    id: 'tmpl-2',
    name: 'lead_nurture_followup',
    language: 'hi',
    category: 'MARKETING',
    status: 'APPROVED',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Lead Follow-up: VEROX Automation',
      },
      {
        type: 'BODY',
        text: 'नमस्ते {{1}},\n\nहमे आपकी IndiaMart इन्क्वायरी प्राप्त हुई है। हमारे एग्जीक्यूटिव {{2}} आपसे संपर्क करना चाहते हैं। क्या हम अभी बात कर सकते हैं?',
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to unsubscribe',
      },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'QUICK_REPLY', text: 'हाँ, कॉल करें' },
          { type: 'QUICK_REPLY', text: 'WhatsApp पर बात करें' },
        ],
      },
    ],
    createdAt: '2026-10-19T08:00:00Z',
    updatedAt: '2026-10-19T08:15:00Z',
  },
  {
    id: 'tmpl-3',
    name: 'fastag_renewal_alert',
    language: 'en',
    category: 'UTILITY',
    status: 'APPROVED',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'FASTAG Renewal Reminder',
      },
      {
        type: 'BODY',
        text: 'Dear {{1}},\n\nYour fleet FASTAG balance for vehicle {{2}} is below ₹500. Please recharge immediately to avoid toll delays.',
      },
      {
        type: 'FOOTER',
        text: 'Fleet Support 24x7',
      },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'Recharge Now', url: 'https://veroxautomation.local/recharge' },
        ],
      },
    ],
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-10-20T14:10:00Z',
  },
]

class TemplatesService {
  private templates: WhatsAppTemplate[] = [...initialTemplates]

  public getTemplates(): WhatsAppTemplate[] {
    return this.templates
  }

  public getTemplateByName(name: string): WhatsAppTemplate | undefined {
    return this.templates.find((t) => t.name === name)
  }

  public createTemplate(data: {
    name: string
    language: string
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
    headerText?: string
    bodyText: string
    footerText?: string
    buttons?: Array<{ type: 'QUICK_REPLY' | 'URL'; text: string; url?: string }>
  }): WhatsAppTemplate {
    const components: TemplateComponent[] = []

    if (data.headerText) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: data.headerText,
      })
    }

    components.push({
      type: 'BODY',
      text: data.bodyText,
    })

    if (data.footerText) {
      components.push({
        type: 'FOOTER',
        text: data.footerText,
      })
    }

    if (data.buttons && data.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: data.buttons.map((b) => ({
          type: b.type,
          text: b.text,
          url: b.url,
        })),
      })
    }

    const newTemplate: WhatsAppTemplate = {
      id: `tmpl-${Date.now()}`,
      name: data.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      language: data.language || 'en',
      category: data.category,
      status: 'APPROVED', // Sandbox instant approval for testing
      components,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.templates.unshift(newTemplate)
    return newTemplate
  }

  public renderPreview(templateName: string, variables: Record<string, string>): {
    header?: string
    body: string
    footer?: string
    buttons?: string[]
  } {
    const template = this.getTemplateByName(templateName)
    if (!template) {
      throw new Error(`Template '${templateName}' not found`)
    }

    let header: string | undefined
    let body = ''
    let footer: string | undefined
    let buttons: string[] = []

    for (const comp of template.components) {
      if (comp.type === 'HEADER') {
        header = comp.text
      } else if (comp.type === 'BODY') {
        body = comp.text || ''
        // Replace {{1}}, {{2}}, etc.
        Object.entries(variables).forEach(([idx, val]) => {
          body = body.replace(new RegExp(`\\{\\{${idx}\\}\\}`, 'g'), val)
        })
      } else if (comp.type === 'FOOTER') {
        footer = comp.text
      } else if (comp.type === 'BUTTONS' && comp.buttons) {
        buttons = comp.buttons.map((b) => b.text)
      }
    }

    return { header, body, footer, buttons }
  }
}

export const templatesService = new TemplatesService()
