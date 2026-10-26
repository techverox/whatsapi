export type NodeType =
  // Triggers (5)
  | 'TRIGGER_MESSAGE'
  | 'TRIGGER_KEYWORD'
  | 'TRIGGER_WEBHOOK'
  | 'TRIGGER_AD_CLICK'
  | 'TRIGGER_INACTIVITY'
  // Actions (17)
  | 'SEND_TEXT'
  | 'SEND_BUTTONS'
  | 'SEND_LIST'
  | 'SEND_MEDIA'
  | 'ASK_QUESTION'
  | 'AI_AGENT'
  | 'HTTP_REQUEST'
  | 'ADD_TAG'
  | 'ASSIGN_AGENT'
  | 'CONDITION_BRANCH'
  | 'WAIT_DELAY'
  | 'SET_ATTRIBUTE'
  | 'WHATSAPP_CATALOG'
  | 'REQUEST_LOCATION'
  | 'HUMAN_HANDOVER'
  | 'GOOGLE_SHEETS'
  | 'JUMP_FLOW'

export interface BotNodeConfig {
  event?: string
  keyword?: string
  timeoutHours?: number
  adCampaignId?: string
  messageText?: string
  buttons?: string[]
  listTitle?: string
  listItems?: string[]
  mediaType?: 'pdf' | 'image' | 'video' | 'audio'
  mediaName?: string
  mediaUrl?: string
  questionPrompt?: string
  questionValidation?: 'text' | 'number' | 'email' | 'phone'
  saveKey?: string
  attributeKey?: string
  attributeValue?: string
  aiPrompt?: string
  aiModel?: string
  aiKnowledgeBase?: string
  httpUrl?: string
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  httpHeaders?: string
  httpBody?: string
  tag?: string
  tagAction?: 'add' | 'remove'
  assignee?: string
  conditionField?: string
  conditionOperator?: '==' | '!=' | 'contains' | '>' | '<'
  conditionValue?: string
  delaySeconds?: number
  catalogProductId?: string
  catalogProductName?: string
  catalogPrice?: string
  locationPrompt?: string
  handoverDepartment?: string
  handoverPriority?: 'normal' | 'high' | 'urgent'
  sheetId?: string
  sheetName?: string
  targetFlowId?: string
}

export interface BotNode {
  id: string
  stepNumber: number
  type: NodeType
  title: string
  subtitle: string
  config: BotNodeConfig
}

export interface ChatbotFlow {
  id: string
  name: string
  description?: string
  isLive: boolean
  wabaPhone: string
  nodes: BotNode[]
  version: string
  executionCount: number
  lastDeployedAt: string
  createdAt: string
  updatedAt: string
}

export const initialDefaultChatbotFlow: ChatbotFlow = {
  id: '6adce257851f7407a9019ee3',
  name: 'Gujarat Fleet Lead Qualifier & Fastag Funnel',
  description: 'Commercial fleet AIS-140 GPS, government FASTAG KYC, and telemetry lead capture.',
  isLive: true,
  wabaPhone: '+91 76985 80043',
  version: '2.6.0',
  executionCount: 4280,
  lastDeployedAt: '2026-10-25T11:00:00Z',
  createdAt: '2026-10-15T08:00:00Z',
  updatedAt: '2026-10-25T11:00:00Z',
  nodes: [
    {
      id: 'node-1',
      stepNumber: 1,
      type: 'TRIGGER_MESSAGE',
      title: 'On Customer Inbound Message',
      subtitle: 'Triggers when user initiates WhatsApp chat',
      config: {
        event: 'messages.inbound',
      },
    },
    {
      id: 'node-2',
      stepNumber: 2,
      type: 'SEND_TEXT',
      title: 'Welcome & Value Proposition',
      subtitle: 'Namaste! Welcome to Truck Sathi & DV WhatsAPI.',
      config: {
        messageText:
          'નમસ્તે! Welcome to Truck Sathi & DV WhatsAPI. We provide government-certified AIS-140 GPS devices, commercial FASTAG KYC, and commercial fleet telemetry across Gujarat & West India.',
      },
    },
    {
      id: 'node-3',
      stepNumber: 3,
      type: 'SEND_BUTTONS',
      title: 'Interactive Service Menu',
      subtitle: 'Quick reply buttons for fleet services',
      config: {
        messageText: 'Please select what you are looking for today:',
        buttons: ['Buy AIS-140 GPS (₹2,999)', 'Commercial Fastag KYC', 'Speak to Fleet Officer'],
      },
    },
    {
      id: 'node-4',
      stepNumber: 4,
      type: 'ASK_QUESTION',
      title: 'Collect Fleet Capacity',
      subtitle: 'Ask how many trucks operate in fleet',
      config: {
        questionPrompt: 'Great! How many commercial trucks or commercial vehicles do you manage in your fleet?',
        questionValidation: 'number',
        saveKey: 'fleet_truck_count',
      },
    },
    {
      id: 'node-5',
      stepNumber: 5,
      type: 'ADD_TAG',
      title: 'Apply CRM Lead Tag',
      subtitle: 'Tag contact as "hot-gujarat-fleet"',
      config: {
        tag: 'hot-gujarat-fleet',
        tagAction: 'add',
      },
    },
    {
      id: 'node-6',
      stepNumber: 6,
      type: 'ASSIGN_AGENT',
      title: 'Route to Operations Desk',
      subtitle: 'Assign to Agent Bhavik (Fleet Specialist)',
      config: {
        assignee: 'Agent Bhavik',
      },
    },
    {
      id: 'node-7',
      stepNumber: 7,
      type: 'SEND_TEXT',
      title: 'Confirmation & Direct Call',
      subtitle: 'Officer assigned with direct callback link',
      config: {
        messageText:
          '✅ Thank you! Fleet Specialist Bhavik Patel has been assigned to your request and will call you in 5 minutes with bulk fleet discount rates.',
      },
    },
  ],
}

class ChatbotService {
  private activeFlow: ChatbotFlow = JSON.parse(JSON.stringify(initialDefaultChatbotFlow))
  private flowStore: Map<string, ChatbotFlow> = new Map([
    [initialDefaultChatbotFlow.id, initialDefaultChatbotFlow],
  ])

  public getFlow(id?: string): ChatbotFlow {
    if (id && this.flowStore.has(id)) {
      return this.flowStore.get(id)!
    }
    return this.activeFlow
  }

  public listFlows(): Array<Omit<ChatbotFlow, 'nodes'> & { nodeCount: number }> {
    return Array.from(this.flowStore.values()).map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      isLive: f.isLive,
      wabaPhone: f.wabaPhone,
      version: f.version,
      executionCount: f.executionCount,
      lastDeployedAt: f.lastDeployedAt,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      nodeCount: f.nodes.length,
    }))
  }

  public saveFlow(data: {
    id?: string
    name?: string
    isLive?: boolean
    wabaPhone?: string
    nodes?: BotNode[]
    description?: string
  }): ChatbotFlow {
    const flowId = data.id || this.activeFlow.id
    const now = new Date().toISOString()

    const rawNodes = data.nodes || this.activeFlow.nodes
    // Re-index steps cleanly
    const reindexedNodes: BotNode[] = rawNodes.map((n, idx) => ({
      ...n,
      stepNumber: idx + 1,
    }))

    const updatedFlow: ChatbotFlow = {
      ...this.activeFlow,
      id: flowId,
      name: data.name || this.activeFlow.name,
      description: data.description || this.activeFlow.description,
      isLive: data.isLive !== undefined ? data.isLive : this.activeFlow.isLive,
      wabaPhone: data.wabaPhone || this.activeFlow.wabaPhone,
      nodes: reindexedNodes,
      updatedAt: now,
      lastDeployedAt: data.isLive ? now : this.activeFlow.lastDeployedAt,
    }

    this.activeFlow = updatedFlow
    this.flowStore.set(flowId, updatedFlow)
    return updatedFlow
  }

  public deployFlow(id?: string): { success: boolean; message: string; flow: ChatbotFlow } {
    const target = this.getFlow(id)
    if (!target.nodes || target.nodes.length === 0) {
      throw new Error('Cannot deploy an empty flow with 0 nodes.')
    }

    const hasTrigger = target.nodes.some((n) => n.type.startsWith('TRIGGER_'))
    if (!hasTrigger) {
      throw new Error('Flow must contain at least one Trigger node.')
    }

    target.isLive = true
    target.lastDeployedAt = new Date().toISOString()
    target.updatedAt = new Date().toISOString()
    this.activeFlow = target
    this.flowStore.set(target.id, target)

    return {
      success: true,
      message: `Flow "${target.name}" deployed live to WABA (+91 76985 80043) with ${target.nodes.length} nodes.`,
      flow: target,
    }
  }

  public getStats() {
    const triggerNodes = this.activeFlow.nodes.filter((n) => n.type.startsWith('TRIGGER_')).length
    const actionNodes = this.activeFlow.nodes.filter((n) => !n.type.startsWith('TRIGGER_')).length

    return {
      activeFlowId: this.activeFlow.id,
      flowName: this.activeFlow.name,
      isLive: this.activeFlow.isLive,
      wabaPhone: this.activeFlow.wabaPhone,
      totalNodes: this.activeFlow.nodes.length,
      triggerNodes,
      actionNodes,
      totalExecutions: this.activeFlow.executionCount,
      successRate: '99.8%',
      avgLatencyMs: 42,
      lastDeployedAt: this.activeFlow.lastDeployedAt,
    }
  }

  public simulateStep(input: {
    nodeIndex?: number
    nodeId?: string
    userReply?: string
  }): {
    executed: boolean
    node?: BotNode
    botMessage?: {
      text: string
      buttons?: string[]
      listItems?: string[]
      mediaType?: string
      mediaName?: string
      productCard?: any
    }
    crmUpdates?: Record<string, string>
    log: {
      stepNumber: number
      type: string
      status: string
      details: string
    }
    nextIndex: number
  } {
    const nodes = this.activeFlow.nodes
    let index = input.nodeIndex !== undefined ? input.nodeIndex : 0

    if (input.nodeId) {
      const foundIdx = nodes.findIndex((n) => n.id === input.nodeId)
      if (foundIdx !== -1) index = foundIdx
    }

    if (index >= nodes.length) {
      return {
        executed: false,
        nextIndex: index,
        log: {
          stepNumber: index,
          type: 'END_OF_FLOW',
          status: 'EXECUTED',
          details: 'Flow reached terminal step successfully.',
        },
      }
    }

    const node = nodes[index]
    const crmUpdates: Record<string, string> = {}
    let botMessage: any = undefined

    // Increment execution metric
    this.activeFlow.executionCount += 1

    switch (node.type) {
      case 'TRIGGER_MESSAGE':
      case 'TRIGGER_KEYWORD':
      case 'TRIGGER_WEBHOOK':
      case 'TRIGGER_AD_CLICK':
      case 'TRIGGER_INACTIVITY':
        return {
          executed: true,
          node,
          nextIndex: index + 1,
          log: {
            stepNumber: node.stepNumber,
            type: node.type,
            status: 'EXECUTED',
            details: `Inbound event triggered: ${node.title} (${node.config.event || node.config.keyword || 'active'})`,
          },
        }

      case 'SEND_TEXT':
        botMessage = { text: node.config.messageText || 'Hello from DV WhatsAPI!' }
        break

      case 'SEND_BUTTONS':
        botMessage = {
          text: node.config.messageText || 'Please select an option:',
          buttons: node.config.buttons || ['Option 1', 'Option 2'],
        }
        break

      case 'SEND_LIST':
        botMessage = {
          text: node.config.messageText || 'Services Menu:',
          listItems: node.config.listItems || ['Item 1', 'Item 2'],
        }
        break

      case 'SEND_MEDIA':
        botMessage = {
          text: `Delivered media asset: ${node.config.mediaName || 'document.pdf'}`,
          mediaType: node.config.mediaType || 'pdf',
          mediaName: node.config.mediaName || 'document.pdf',
        }
        break

      case 'ASK_QUESTION':
        botMessage = {
          text: node.config.questionPrompt || 'Please enter details:',
        }
        if (input.userReply && node.config.saveKey) {
          crmUpdates[node.config.saveKey] = input.userReply
        }
        break

      case 'ADD_TAG':
        if (node.config.tag) {
          crmUpdates['applied_tag'] = node.config.tag
        }
        break

      case 'ASSIGN_AGENT':
        crmUpdates['assigned_agent'] = node.config.assignee || 'Agent Bhavik'
        break

      case 'SET_ATTRIBUTE':
        if (node.config.attributeKey) {
          crmUpdates[node.config.attributeKey] = node.config.attributeValue || 'true'
        }
        break

      case 'WHATSAPP_CATALOG':
        botMessage = {
          text: 'Shared WhatsApp catalog item:',
          productCard: {
            id: node.config.catalogProductId || 'PROD-1',
            name: node.config.catalogProductName || 'Commercial Telemetry',
            price: node.config.catalogPrice || '₹2,999',
          },
        }
        break

      default:
        break
    }

    return {
      executed: true,
      node,
      botMessage,
      crmUpdates: Object.keys(crmUpdates).length > 0 ? crmUpdates : undefined,
      nextIndex: index + 1,
      log: {
        stepNumber: node.stepNumber,
        type: node.type,
        status: 'EXECUTED',
        details: `Executed ${node.title} - ${node.subtitle}`,
      },
    }
  }

  public resetDefaults(): ChatbotFlow {
    this.activeFlow = JSON.parse(JSON.stringify(initialDefaultChatbotFlow))
    this.flowStore.set(initialDefaultChatbotFlow.id, this.activeFlow)
    return this.activeFlow
  }
}

export const chatbotService = new ChatbotService()
