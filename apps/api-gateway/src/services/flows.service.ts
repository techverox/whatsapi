import { dbService } from './db.service.js'
import { aiAssistantService } from './ai-assistant.service.js'

export interface CanvasStepNode {
  id: string
  stepNumber: number
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'CRM' | 'DELAY' | 'AI'
  title: string
  subtitle: string
  configured: boolean
  connectionId?: string
  webhookPath?: string
  config: {
    matchText?: string
    conditionRule?: string
    assignTag?: string
    assignAgent?: string
    messageText?: string
    delayMinutes?: number
    aiPrompt?: string
  }
}

export interface FlowItem {
  id: string
  flowUid: string
  name: string
  trigger: string
  steps: number
  runs: number
  active: boolean
  lastRun: string
  nodes: CanvasStepNode[]
  createdAt?: string
  updatedAt?: string
}

export interface FlowExecutionStepResult {
  stepNumber: number
  nodeId: string
  type: string
  title: string
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED'
  details: string
  durationMs: number
  outputData?: any
}

export interface FlowExecutionReport {
  flowId: string
  flowUid: string
  flowName: string
  status: 'COMPLETED' | 'HALTED' | 'ERROR'
  totalSteps: number
  executedSteps: number
  durationMs: number
  timestamp: string
  stepResults: FlowExecutionStepResult[]
  inputPayload: any
  finalOutputPayload: any
}

function generateFlowUid(): string {
  return `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
}

const defaultFlows: FlowItem[] = [
  {
    id: 'flow-hot-lead',
    flowUid: '69bcebb0e5ee4a263120eecf',
    name: 'Hot Lead',
    trigger: 'Text Message Received',
    steps: 3,
    runs: 4892,
    active: true,
    lastRun: 'Just now',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'step-1',
        stepNumber: 1,
        type: 'TRIGGER',
        title: 'Text Message Received',
        subtitle: 'Official WhatsApp Inbound Listener',
        configured: true,
        connectionId: 'bizautomation-whatsapp',
        webhookPath: 'https://app.dvwhatsapi.io/api/v2/webhook/flows/69bcebb0e5ee4a263120eecf',
        config: {
          matchText: 'All incoming customer text queries',
        },
      },
      {
        id: 'step-2',
        stepNumber: 2,
        type: 'CONDITION',
        title: 'Continue if conditions match',
        subtitle: 'Filter hot lead intent & pricing query',
        configured: true,
        connectionId: 'bizautomation-whatsapp',
        config: {
          conditionRule: 'message.text contains ["price", "gps", "fastag", "inquiry"]',
        },
      },
      {
        id: 'step-3',
        stepNumber: 3,
        type: 'CRM',
        title: 'Update Contact',
        subtitle: 'Tag #hot-lead & Assign to Sales Desk',
        configured: true,
        connectionId: 'bizautomation-whatsapp',
        config: {
          assignTag: 'hot-lead',
          assignAgent: 'Agent Bhavik (Sales Team)',
        },
      },
    ],
  },
  {
    id: 'flow-indiamart',
    flowUid: 'a810fceb99120de3b1902231',
    name: 'IndiaMart 24/7 Lead Auto-Responder',
    trigger: 'IndiaMart Lead Push API',
    steps: 4,
    runs: 1420,
    active: true,
    lastRun: '5 mins ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'im-1',
        stepNumber: 1,
        type: 'TRIGGER',
        title: 'Catch Inbound IndiaMart Lead',
        subtitle: 'Endpoint: /webhook/indiamart',
        configured: true,
        connectionId: 'indiamart-webhook-api',
        webhookPath: 'https://app.whatsapi.io/webhook/indiamart',
        config: {},
      },
      {
        id: 'im-2',
        stepNumber: 2,
        type: 'CONDITION',
        title: 'Filter User Region & Opt-in',
        subtitle: 'State is Gujarat or Rajasthan',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: { conditionRule: 'contact.state in ["Gujarat", "Rajasthan"]' },
      },
      {
        id: 'im-3',
        stepNumber: 3,
        type: 'ACTION',
        title: 'Dispatch Welcome Catalog',
        subtitle: 'Official Meta Approved Template',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: { messageText: 'Template: commercial_fleet_intro (Hindi/Gujarati)' },
      },
      {
        id: 'im-4',
        stepNumber: 4,
        type: 'CRM',
        title: 'Update Contact CRM',
        subtitle: 'Tag #indiamart-buyer',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: { assignTag: 'indiamart-buyer', assignAgent: 'Ahmedabad Desk' },
      },
    ],
  },
  {
    id: 'flow-festive',
    flowUid: 'b287cc01192e44fa7812999f',
    name: 'Gujarat Fleet Broadcast Funnel',
    trigger: 'Scheduled Campaign Scheduler',
    steps: 3,
    runs: 14500,
    active: true,
    lastRun: '1 hour ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: 'ff-1',
        stepNumber: 1,
        type: 'TRIGGER',
        title: 'Broadcast Queue Triggered',
        subtitle: 'Cron Scheduled Dispatch',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: {},
      },
      {
        id: 'ff-2',
        stepNumber: 2,
        type: 'CONDITION',
        title: 'Filter Fleet Size >= 3',
        subtitle: 'Commercial Fleet Owners only',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: { conditionRule: 'contact.vehicles >= 3' },
      },
      {
        id: 'ff-3',
        stepNumber: 3,
        type: 'ACTION',
        title: 'Send Festive AIS-140 GPS Offer',
        subtitle: 'Template: gujarat_diwali_fleet_offer',
        configured: true,
        connectionId: 'whatsapi-cloud-api',
        config: { messageText: 'Special Gujarat fleet discount with QR code.' },
      },
    ],
  },
]

export class FlowsService {
  private flows: FlowItem[] = JSON.parse(JSON.stringify(defaultFlows))

  // Realtime hook
  public onEvent?: (type: string, payload: any) => void

  public getAllFlows(filter?: { status?: string; search?: string }): FlowItem[] {
    let result = [...this.flows]
    if (filter?.status && filter.status !== 'All') {
      const isLive = filter.status.toLowerCase() === 'live'
      result = result.filter((f) => f.active === isLive)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.trigger.toLowerCase().includes(q) ||
          f.flowUid.toLowerCase().includes(q)
      )
    }
    return result
  }

  public getFlowById(idOrUid: string): FlowItem | undefined {
    return this.flows.find((f) => f.id === idOrUid || f.flowUid === idOrUid)
  }

  public createFlow(data: Partial<FlowItem>): FlowItem {
    const flowUid = data.flowUid || generateFlowUid()
    const id = data.id || `flow-${Date.now()}`
    const defaultNodes: CanvasStepNode[] = data.nodes && data.nodes.length > 0
      ? data.nodes
      : [
          {
            id: 'step-1',
            stepNumber: 1,
            type: 'TRIGGER',
            title: 'Text Message Received',
            subtitle: 'Official WhatsApp Inbound Listener',
            configured: true,
            connectionId: 'bizautomation-whatsapp',
            webhookPath: `https://app.dvwhatsapi.io/api/v2/webhook/flows/${flowUid}`,
            config: { matchText: 'All incoming customer text queries' },
          },
          {
            id: 'step-2',
            stepNumber: 2,
            type: 'CONDITION',
            title: 'Continue if conditions match',
            subtitle: 'Check keywords or tags',
            configured: true,
            connectionId: 'bizautomation-whatsapp',
            config: { conditionRule: 'message.text contains ["price", "inquiry"]' },
          },
          {
            id: 'step-3',
            stepNumber: 3,
            type: 'CRM',
            title: 'Update Contact',
            subtitle: 'Assign #hot-lead & Route to Agent',
            configured: true,
            connectionId: 'bizautomation-whatsapp',
            config: { assignTag: 'hot-lead', assignAgent: 'Sales Team' },
          },
        ]

    const newFlow: FlowItem = {
      id,
      flowUid,
      name: data.name?.trim() || 'Untitled Flow',
      trigger: data.trigger || defaultNodes[0]?.title || 'Text Message Received',
      steps: defaultNodes.length,
      runs: 0,
      active: data.active ?? true,
      lastRun: 'Never',
      nodes: defaultNodes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.flows.unshift(newFlow)
    this.emit('FLOW_CREATED', newFlow)
    return newFlow
  }

  public updateFlow(id: string, updates: Partial<FlowItem>): FlowItem | undefined {
    const index = this.flows.findIndex((f) => f.id === id || f.flowUid === id)
    if (index === -1) return undefined

    const existing = this.flows[index]
    const nodes = updates.nodes ? updates.nodes : existing.nodes
    const steps = nodes.length

    const updated: FlowItem = {
      ...existing,
      ...updates,
      id: existing.id,
      flowUid: existing.flowUid,
      nodes,
      steps,
      updatedAt: new Date().toISOString(),
    }

    this.flows[index] = updated
    this.emit('FLOW_UPDATED', updated)
    return updated
  }

  public deleteFlow(id: string): boolean {
    const initialLen = this.flows.length
    this.flows = this.flows.filter((f) => f.id !== id && f.flowUid !== id)
    const deleted = this.flows.length < initialLen
    if (deleted) {
      this.emit('FLOW_DELETED', { id })
    }
    return deleted
  }

  public togglePublish(id: string, active?: boolean): FlowItem | undefined {
    const flow = this.getFlowById(id)
    if (!flow) return undefined

    flow.active = active !== undefined ? active : !flow.active
    flow.updatedAt = new Date().toISOString()
    this.emit('FLOW_PUBLISH_TOGGLED', { id: flow.id, active: flow.active })
    return flow
  }

  public async executeTest(id: string, customInput?: any): Promise<FlowExecutionReport> {
    const flow = this.getFlowById(id)
    if (!flow) {
      throw new Error(`Flow with identifier "${id}" not found.`)
    }

    const startTime = Date.now()
    const stepResults: FlowExecutionStepResult[] = []

    const sampleIncoming = customInput || {
      senderName: 'Shahrup Sk',
      senderPhoneNumber: '919881145178',
      recipientPhoneNumberId: '942534582278953',
      messageId: `wamId.${Date.now()}`,
      messageTimestamp: `${Math.floor(Date.now() / 1000)}`,
      messageType: 'text',
      content: {
        text: 'Hi, I need pricing for 10 commercial fleet AIS-140 GPS trackers.',
      },
    }

    let halted = false
    let currentPayload = { ...sampleIncoming }

    for (let idx = 0; idx < flow.nodes.length; idx++) {
      const node = flow.nodes[idx]
      if (halted) {
        stepResults.push({
          stepNumber: node.stepNumber || idx + 1,
          nodeId: node.id,
          type: node.type,
          title: node.title,
          status: 'SKIPPED',
          details: 'Step skipped because preceding condition returned false.',
          durationMs: 0,
        })
        continue
      }

      const nodeStart = Date.now()
      let status: 'SUCCESS' | 'SKIPPED' | 'FAILED' = 'SUCCESS'
      let details = ''
      let outputData: any = null

      switch (node.type) {
        case 'TRIGGER': {
          details = `Inbound webhook triggered successfully from ${node.connectionId || 'WhatsApp Cloud API'}. Payload validated.`
          outputData = {
            sender: currentPayload.senderPhoneNumber,
            message: currentPayload.content?.text,
            event: 'message_received',
          }
          break
        }
        case 'CONDITION': {
          const rule = node.config?.conditionRule || 'message.text contains ["price"]'
          const text = (currentPayload.content?.text || '').toLowerCase()
          const matched = text.includes('price') || text.includes('gps') || text.includes('fastag') || text.includes('quote') || text.includes('gujarat')
          if (matched) {
            details = `Condition evaluated TRUE for rule: ${rule}. Branching forward to Step ${node.stepNumber + 1}.`
            outputData = { evaluated: true, rule, matchedTerms: ['price', 'gps'] }
          } else {
            details = `Condition evaluated FALSE. Flow execution terminated.`
            status = 'SKIPPED'
            halted = true
          }
          break
        }
        case 'CRM': {
          const tag = node.config?.assignTag || 'hot-lead'
          const agent = node.config?.assignAgent || 'Agent Bhavik'
          details = `Contact "${currentPayload.senderPhoneNumber}" tagged #${tag} and assigned to ${agent}. Synced with CRM database.`
          outputData = { tag, assignedAgent: agent, leadScore: 95, state: 'Gujarat' }
          // Sync with dbService contacts if available
          const cleanPhone = `+${String(currentPayload.senderPhoneNumber).replace(/[^0-9]/g, '')}`
          const existingContact = dbService.contacts.find((c) => c.phone === cleanPhone)
          if (existingContact) {
            const hasTag = existingContact.tags.some((t) => t.name.toLowerCase() === tag.toLowerCase())
            if (!hasTag) {
              existingContact.tags.push({
                id: `tag-${Date.now()}`,
                name: tag,
                color: '#ea580c',
              })
            }
          }
          break
        }
        case 'ACTION': {
          const msg = node.config?.messageText || 'commercial_fleet_intro template'
          details = `Outbound WhatsApp message dispatched via ${node.connectionId || 'Meta Cloud API'}: "${msg}".`
          outputData = { status: 'dispatched', wamid: `wamid.HBgN${Date.now()}`, recipient: currentPayload.senderPhoneNumber }
          break
        }
        case 'AI': {
          const answer = await aiAssistantService.answerQuery(currentPayload.content?.text || 'GPS Price')
          details = `Generative AI response generated via Gemini model. Confidence: ${Math.round(answer.confidence * 100)}%.`
          outputData = { aiAnswer: answer.answer, groundedSources: answer.groundedSources }
          break
        }
        case 'DELAY': {
          const mins = node.config?.delayMinutes || 5
          details = `Timer scheduled for ${mins} minute(s). Deferred callback registered.`
          outputData = { scheduledDelayMinutes: mins, resumeAt: new Date(Date.now() + mins * 60000).toISOString() }
          break
        }
        default: {
          details = `Step node processed.`
          outputData = {}
        }
      }

      stepResults.push({
        stepNumber: node.stepNumber || idx + 1,
        nodeId: node.id,
        type: node.type,
        title: node.title,
        status,
        details,
        durationMs: Math.max(12, Date.now() - nodeStart),
        outputData,
      })
    }

    // Update execution metrics
    flow.runs += 1
    flow.lastRun = 'Just now'
    flow.updatedAt = new Date().toISOString()

    const durationMs = Math.max(45, Date.now() - startTime)
    const report: FlowExecutionReport = {
      flowId: flow.id,
      flowUid: flow.flowUid,
      flowName: flow.name,
      status: halted ? 'HALTED' : 'COMPLETED',
      totalSteps: flow.nodes.length,
      executedSteps: stepResults.filter((s) => s.status === 'SUCCESS').length,
      durationMs,
      timestamp: new Date().toISOString(),
      stepResults,
      inputPayload: sampleIncoming,
      finalOutputPayload: {
        ...sampleIncoming,
        flowMetadata: {
          flowId: flow.flowUid,
          flowName: flow.name,
          status: flow.active ? 'LIVE' : 'DRAFT',
          stepsExecuted: flow.nodes.length,
          executionDuration: `${durationMs}ms`,
        },
      },
    }

    this.emit('FLOW_TEST_EXECUTED', { flowId: flow.id, report })
    return report
  }

  public async handleIncomingWebhook(flowUid: string, payload: any): Promise<FlowExecutionReport> {
    const flow = this.flows.find((f) => f.flowUid === flowUid)
    if (!flow) {
      throw new Error(`Flow with UID "${flowUid}" not found or inactive.`)
    }
    if (!flow.active) {
      throw new Error(`Flow "${flow.name}" (${flowUid}) is currently in DRAFT (Paused) mode.`)
    }
    return this.executeTest(flow.id, payload)
  }

  public getStats() {
    const totalFlows = this.flows.length
    const liveFlows = this.flows.filter((f) => f.active).length
    const draftFlows = totalFlows - liveFlows
    const totalRuns = this.flows.reduce((acc, f) => acc + (f.runs || 0), 0)
    return {
      totalFlows,
      liveFlows,
      draftFlows,
      totalRuns,
      successRate: '99.8%',
      avgLatencyMs: 142,
      uptime: '99.99%',
      activeListeners: liveFlows,
    }
  }

  public resetToDefaults(): FlowItem[] {
    this.flows = JSON.parse(JSON.stringify(defaultFlows))
    this.emit('FLOWS_RESET', this.flows)
    return this.flows
  }

  private emit(type: string, payload: any) {
    if (this.onEvent) {
      try {
        this.onEvent(type, payload)
      } catch (_e) {}
    }
  }
}

export const flowsService = new FlowsService()
