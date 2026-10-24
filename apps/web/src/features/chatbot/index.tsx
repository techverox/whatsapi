import { useState, useMemo } from 'react'
import {
  MessageCircleCode,
  Zap,
  Send,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Layers,
  Sparkles,
  Smartphone,
  Save,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Globe,
  Tag,
  UserCheck,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  HelpCircle,
  CheckCircle2,
  X,
  Play,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  FolderGit2,
  ShieldCheck,
  Bot,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export type NodeType =
  | 'TRIGGER_MESSAGE'
  | 'TRIGGER_KEYWORD'
  | 'TRIGGER_WEBHOOK'
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

export interface BotNode {
  id: string
  stepNumber: number
  type: NodeType
  title: string
  subtitle: string
  config: {
    event?: string
    keyword?: string
    messageText?: string
    buttons?: string[]
    listItems?: string[]
    mediaName?: string
    mediaUrl?: string
    questionPrompt?: string
    saveKey?: string
    aiPrompt?: string
    httpUrl?: string
    httpMethod?: 'GET' | 'POST'
    tag?: string
    assignee?: string
    conditionField?: string
    conditionOperator?: '==' | '!=' | 'contains'
    conditionValue?: string
    delaySeconds?: number
  }
}

interface SimMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  buttons?: string[]
  listItems?: string[]
  mediaName?: string
  time?: string
}

// Enterprise Flow Presets
const FLOW_PRESETS: { id: string; name: string; description: string; nodes: BotNode[] }[] = [
  {
    id: 'preset-fleet-lead',
    name: 'Gujarat Fleet & AIS-140 Funnel',
    description: 'Lead qualifier bot for commercial truck fleet GPS, AIS-140 compliance, and FASTAG.',
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
        subtitle: 'Namaste! Welcome to Truck Sathi & WhatsAPI CRM.',
        config: {
          messageText:
            'નમસ્તે! Welcome to Truck Sathi & WhatsAPI CRM. We provide government-certified AIS-140 GPS, commercial FASTAG KYC, and commercial fleet telemetry across Gujarat & West India.',
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
            '✅ Thank you! Fleet Specialist Bhavik Patel has been assigned to your request and will call you in 5 minutes with bulk discount rates.',
        },
      },
    ],
  },
  {
    id: 'preset-indiamart',
    name: 'IndiaMart 24/7 Instant Responder',
    description: 'Instant lead qualification within 30 seconds of IndiaMart push webhook.',
    nodes: [
      {
        id: 'node-im-1',
        stepNumber: 1,
        type: 'TRIGGER_WEBHOOK',
        title: 'IndiaMart Webhook Push',
        subtitle: 'Triggers on POST /webhook/indiamart',
        config: {
          event: 'webhook.indiamart.lead',
        },
      },
      {
        id: 'node-im-2',
        stepNumber: 2,
        type: 'SEND_TEXT',
        title: 'Instant Outreach Message',
        subtitle: 'Send tailored quote acknowledgment',
        config: {
          messageText:
            'Hello! Thank you for inquiring on IndiaMart for AIS-140 GPS Devices & Telemetry. We have received your requirement.',
        },
      },
      {
        id: 'node-im-3',
        stepNumber: 3,
        type: 'SEND_MEDIA',
        title: 'Send Official Product Brochure',
        subtitle: 'PDF catalog with Gujarat RTO certification',
        config: {
          mediaName: 'AIS140_Gujarat_Gov_Approved_Catalog.pdf',
          mediaUrl: 'https://whatsapicrm.com/assets/brochure.pdf',
        },
      },
      {
        id: 'node-im-4',
        stepNumber: 4,
        type: 'SEND_BUTTONS',
        title: 'Quotation Decision Buttons',
        subtitle: 'Customer self-service choice',
        config: {
          messageText: 'Would you like an instant GST proforma invoice or a demo at your transport hub?',
          buttons: ['Get Instant Proforma', 'Request Hub Demo', 'Not Interested'],
        },
      },
      {
        id: 'node-im-5',
        stepNumber: 5,
        type: 'ADD_TAG',
        title: 'Tag Contact in CRM',
        subtitle: 'Tag: indiamart-buyer',
        config: {
          tag: 'indiamart-buyer',
        },
      },
    ],
  },
  {
    id: 'preset-ai-rag',
    name: 'RAG Grounded AI Assistant',
    description: 'Zero-hallucination support agent reading verified fleet & compliance docs.',
    nodes: [
      {
        id: 'node-ai-1',
        stepNumber: 1,
        type: 'TRIGGER_MESSAGE',
        title: 'On Any User Inquiry',
        subtitle: 'Captures natural language questions',
        config: {
          event: 'messages.inbound',
        },
      },
      {
        id: 'node-ai-2',
        stepNumber: 2,
        type: 'AI_AGENT',
        title: 'Query Grounded RAG Knowledge',
        subtitle: 'Synthesize answer with internal documentation',
        config: {
          aiPrompt:
            'Answer the customer courteously using Gujarat transport regulations, AIS-140 fitment rules, and Truck Sathi pricing. If unsure, offer human agent transfer.',
        },
      },
      {
        id: 'node-ai-3',
        stepNumber: 3,
        type: 'SEND_BUTTONS',
        title: 'Resolution Feedback',
        subtitle: 'Verify if AI answer solved the query',
        config: {
          messageText: 'Did this answer resolve your question?',
          buttons: ['Yes, Thank you! 👍', 'Speak to Support Officer 👤'],
        },
      },
    ],
  },
]

// Component Palette Items definition
interface PaletteItem {
  type: NodeType
  name: string
  description: string
  category: 'Triggers' | 'Actions'
  icon: any
  badgeColor: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Triggers
  {
    type: 'TRIGGER_MESSAGE',
    name: 'On Message',
    description: 'Triggers whenever customer sends any WhatsApp text',
    category: 'Triggers',
    icon: Zap,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    type: 'TRIGGER_KEYWORD',
    name: 'Keyword Match',
    description: 'Triggers on specific phrases like "price", "gps", "fastag"',
    category: 'Triggers',
    icon: Search,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    type: 'TRIGGER_WEBHOOK',
    name: 'Webhook Ingest',
    description: 'Triggers on IndiaMart, Facebook, or CRM API pushes',
    category: 'Triggers',
    icon: Globe,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  // Actions
  {
    type: 'SEND_TEXT',
    name: 'Send Text Message',
    description: 'Standard WhatsApp message with formatting & variables',
    category: 'Actions',
    icon: Send,
    badgeColor: 'bg-blue-500/15 text-blue-600',
  },
  {
    type: 'SEND_BUTTONS',
    name: 'Send Button Message',
    description: 'Interactive WhatsApp buttons for quick customer replies (up to 3)',
    category: 'Actions',
    icon: CheckCircle2,
    badgeColor: 'bg-blue-500/15 text-blue-600',
  },
  {
    type: 'SEND_LIST',
    name: 'Send List Message',
    description: 'WhatsApp multi-item menu picker (up to 10 options)',
    category: 'Actions',
    icon: FileText,
    badgeColor: 'bg-blue-500/15 text-blue-600',
  },
  {
    type: 'SEND_MEDIA',
    name: 'Send Media Message',
    description: 'Deliver PDF catalogs, warranty cards, or images',
    category: 'Actions',
    icon: FileText,
    badgeColor: 'bg-blue-500/15 text-blue-600',
  },
  {
    type: 'ASK_QUESTION',
    name: 'Ask Question',
    description: 'Collect customer response and store into custom CRM field',
    category: 'Actions',
    icon: HelpCircle,
    badgeColor: 'bg-amber-500/15 text-amber-600',
  },
  {
    type: 'AI_AGENT',
    name: 'AI Agent (RAG / LLM)',
    description: 'Smart conversational answer grounded in your documents',
    category: 'Actions',
    icon: Sparkles,
    badgeColor: 'bg-purple-500/15 text-purple-600',
  },
  {
    type: 'HTTP_REQUEST',
    name: 'HTTP / API Request',
    description: 'Query external ERP, FASTAG status, or dispatch webhook',
    category: 'Actions',
    icon: Globe,
    badgeColor: 'bg-indigo-500/15 text-indigo-600',
  },
  {
    type: 'ADD_TAG',
    name: 'Add / Remove Tag',
    description: 'Categorize leads as hot-lead, gujarat-fleet, vip, etc.',
    category: 'Actions',
    icon: Tag,
    badgeColor: 'bg-orange-500/15 text-orange-600',
  },
  {
    type: 'ASSIGN_AGENT',
    name: 'Assign Agent',
    description: 'Route chat to Bhavik, Anjali, Ramesh, or Support Desk',
    category: 'Actions',
    icon: UserCheck,
    badgeColor: 'bg-teal-500/15 text-teal-600',
  },
  {
    type: 'CONDITION_BRANCH',
    name: 'Condition & Branch',
    description: 'Branch conversational path based on state or choice',
    category: 'Actions',
    icon: SlidersHorizontal,
    badgeColor: 'bg-amber-500/15 text-amber-600',
  },
  {
    type: 'WAIT_DELAY',
    name: 'Wait & Delay',
    description: 'Add natural delay (e.g. 3-5 seconds) before next message',
    category: 'Actions',
    icon: Clock,
    badgeColor: 'bg-slate-500/15 text-slate-600',
  },
]

export function Chatbot() {
  // Flow Name & Status State
  const [flowName, setFlowName] = useState('Gujarat Fleet Lead Qualifier & Fastag Funnel')
  const [isLive, setIsLive] = useState(true)

  // Nodes Canvas State
  const [nodes, setNodes] = useState<BotNode[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_chatbot_flows_v2')
      if (saved) return JSON.parse(saved)
    } catch {}
    return FLOW_PRESETS[0].nodes
  })

  const [activePreset, setActivePreset] = useState('preset-fleet-lead')
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-1')
  const [activeTab, setActiveTab] = useState<'inspector' | 'simulator'>('simulator')

  // Search filter for palette
  const [paletteSearch, setPaletteSearch] = useState('')
  const [openTriggers, setOpenTriggers] = useState(true)
  const [openActions, setOpenActions] = useState(true)

  // Zoom level state
  const [zoomLevel, setZoomLevel] = useState(100)

  // Live WhatsApp Simulator State
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: 'm-init-1',
      sender: 'bot',
      text: 'નમસ્તે! Welcome to Truck Sathi & WhatsAPI CRM. We provide government-certified AIS-140 GPS, commercial FASTAG KYC, and commercial fleet telemetry across Gujarat & West India.',
      time: 'Just now',
    },
    {
      id: 'm-init-2',
      sender: 'bot',
      text: 'Please select what you are looking for today:',
      buttons: ['Buy AIS-140 GPS (₹2,999)', 'Commercial Fastag KYC', 'Speak to Fleet Officer'],
      time: 'Just now',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)

  // Filtered Palette Items
  const filteredTriggers = useMemo(() => {
    return PALETTE_ITEMS.filter(
      (item) =>
        item.category === 'Triggers' &&
        (item.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
          item.description.toLowerCase().includes(paletteSearch.toLowerCase()))
    )
  }, [paletteSearch])

  const filteredActions = useMemo(() => {
    return PALETTE_ITEMS.filter(
      (item) =>
        item.category === 'Actions' &&
        (item.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
          item.description.toLowerCase().includes(paletteSearch.toLowerCase()))
    )
  }, [paletteSearch])

  // Get currently selected node
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0]
  }, [nodes, selectedNodeId])

  // Save Flow
  const handleSaveFlow = () => {
    try {
      localStorage.setItem('whatsapi_chatbot_flows_v2', JSON.stringify(nodes))
      toast.success('Chatbot Flow Saved & Deployed to WhatsApp Cloud API!', {
        description: `"${flowName}" is now ${isLive ? 'LIVE' : 'DRAFT'} on WABA (+91 76985 80043).`,
      })
    } catch {
      toast.error('Failed to save chatbot flow.')
    }
  }

  // Add Node from Palette
  const handleAddNodeFromPalette = (paletteItem: PaletteItem) => {
    const nextStep = nodes.length + 1
    const newId = `node-${Date.now()}`

    let defaultTitle = paletteItem.name
    let defaultSub = paletteItem.description
    const config: BotNode['config'] = {}

    switch (paletteItem.type) {
      case 'SEND_TEXT':
        config.messageText = 'Hello! Thank you for contacting our logistics desk. How can we help you today?'
        defaultSub = 'Custom text response'
        break
      case 'SEND_BUTTONS':
        config.messageText = 'Please choose an option to continue:'
        config.buttons = ['Option 1', 'Option 2', 'Speak to Human']
        defaultSub = 'Interactive 3-button reply'
        break
      case 'SEND_LIST':
        config.messageText = 'Select from our available fleet services:'
        config.listItems = ['1. AIS-140 GPS Device', '2. Commercial FASTAG', '3. Fleet Insurance', '4. Driver KYC']
        defaultSub = 'Interactive multi-row picker'
        break
      case 'SEND_MEDIA':
        config.mediaName = 'WhatsAPI_Fleet_Brochure_2026.pdf'
        config.mediaUrl = 'https://whatsapicrm.com/assets/brochure.pdf'
        defaultSub = 'Deliver PDF / Image asset'
        break
      case 'ASK_QUESTION':
        config.questionPrompt = 'Please enter your commercial vehicle registration number (e.g. GJ01XX1234):'
        config.saveKey = 'vehicle_registration_number'
        defaultSub = 'Save user reply to CRM field'
        break
      case 'AI_AGENT':
        config.aiPrompt = 'Answer using Truck Sathi Gujarat transport knowledge base and offer help.'
        defaultSub = 'RAG AI Grounded LLM Response'
        break
      case 'HTTP_REQUEST':
        config.httpUrl = 'https://api.whatsapicrm.com/v1/fastag/lookup'
        config.httpMethod = 'POST'
        defaultSub = 'POST external webhook request'
        break
      case 'ADD_TAG':
        config.tag = 'qualified-lead'
        defaultSub = 'Tag contact: qualified-lead'
        break
      case 'ASSIGN_AGENT':
        config.assignee = 'Agent Bhavik'
        defaultSub = 'Assign to Agent Bhavik'
        break
      case 'CONDITION_BRANCH':
        config.conditionField = 'state'
        config.conditionOperator = '=='
        config.conditionValue = 'Gujarat'
        defaultSub = 'If state == Gujarat'
        break
      case 'WAIT_DELAY':
        config.delaySeconds = 3
        defaultSub = 'Pause flow execution for 3 seconds'
        break
      default:
        break
    }

    const newNode: BotNode = {
      id: newId,
      stepNumber: nextStep,
      type: paletteItem.type,
      title: defaultTitle,
      subtitle: defaultSub,
      config,
    }

    const updated = [...nodes, newNode]
    setNodes(updated)
    setSelectedNodeId(newId)
    setActiveTab('inspector')
    toast.success(`Added "${paletteItem.name}" as Step #${nextStep}!`)
  }

  // Delete Node
  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (nodes.length <= 1) {
      toast.error('Flow must contain at least 1 node.')
      return
    }
    const filtered = nodes.filter((n) => n.id !== id)
    const reindexed = filtered.map((n, idx) => ({ ...n, stepNumber: idx + 1 }))
    setNodes(reindexed)
    if (selectedNodeId === id) {
      setSelectedNodeId(reindexed[0].id)
    }
    toast.info('Node removed from flow.')
  }

  // Duplicate Node
  const handleDuplicateNode = (node: BotNode, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStep = nodes.length + 1
    const newNode: BotNode = {
      ...node,
      id: `node-${Date.now()}`,
      stepNumber: nextStep,
      title: `${node.title} (Copy)`,
    }
    setNodes([...nodes, newNode])
    setSelectedNodeId(newNode.id)
    toast.success(`Duplicated Node #${node.stepNumber} to Step #${nextStep}`)
  }

  // Switch Preset
  const handleApplyPreset = (presetId: string) => {
    const found = FLOW_PRESETS.find((p) => p.id === presetId)
    if (found) {
      setActivePreset(presetId)
      setFlowName(found.name)
      setNodes(found.nodes)
      setSelectedNodeId(found.nodes[0]?.id || '')

      // Sync simulator with preset
      const textNode = found.nodes.find((n) => n.type === 'SEND_TEXT')
      const btnNode = found.nodes.find((n) => n.type === 'SEND_BUTTONS')
      setSimMessages([
        {
          id: `m-preset-1`,
          sender: 'bot',
          text: textNode?.config.messageText || 'Hello! How can we help you?',
          time: 'Just now',
        },
        ...(btnNode
          ? [
              {
                id: `m-preset-2`,
                sender: 'bot' as const,
                text: btnNode.config.messageText || 'Please select an option:',
                buttons: btnNode.config.buttons,
                time: 'Just now',
              },
            ]
          : []),
      ])

      toast.success(`Loaded "${found.name}" Template!`)
    }
  }

  // Reset Flow
  const handleResetFlow = () => {
    handleApplyPreset('preset-fleet-lead')
    localStorage.removeItem('whatsapi_chatbot_flows_v2')
    toast.info('Canvas reset to standard Gujarat Fleet Lead Qualifier.')
  }

  // Update Selected Node Config
  const handleUpdateSelectedNode = (partial: Partial<BotNode> | { config: Partial<BotNode['config']> }) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n
        if ('config' in partial && partial.config) {
          return {
            ...n,
            config: { ...n.config, ...partial.config },
          }
        }
        return { ...n, ...partial }
      })
    )
  }

  // Simulator Interaction
  const handleSimUserReply = (text: string) => {
    const userMsg: SimMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now',
    }

    setSimMessages((prev) => [...prev, userMsg])
    setIsBotTyping(true)

    // Evaluate Next Bot Node Response
    setTimeout(() => {
      setIsBotTyping(false)
      let replyText = ''
      let nextButtons: string[] | undefined = undefined

      if (text.includes('GPS') || text.includes('₹2,999')) {
        replyText =
          '🚚 *AIS-140 GPS Device:* Certified by ARAI & Gujarat Transport Dept. Features 1-year government portal live sync, SOS emergency panic button, fuel monitoring, and 24x7 ignition alerts. How many units do you need?'
        nextButtons = ['1-5 Trucks', '6-20 Trucks', 'Fleet Over 20 Units']
      } else if (text.includes('Fastag')) {
        replyText =
          '⚡ *Commercial FASTAG KYC:* Instant RFID activation for multi-axle trucks with automated balance alerts & GST invoice input. Please share vehicle registration number.'
      } else if (text.includes('Fleet Officer') || text.includes('Speak')) {
        replyText =
          '👤 *Human Agent Assigned:* Transferring your chat to Agent Bhavik (Operations Desk). He will message or call you shortly!'
      } else if (text.match(/\d+/)) {
        replyText = `✅ Recorded capacity of *${text}*. Applying enterprise fleet discount. An official proforma quotation has been generated!`
        nextButtons = ['Download PDF Quotation', 'Schedule Callback']
      } else {
        replyText = `🤖 *WhatsAPI Auto-Responder:* Thank you for inquiring regarding "${text}". Our Gujarat fleet operations desk has been notified!`
        nextButtons = ['Buy AIS-140 GPS', 'Commercial FASTAG', 'Talk to Agent']
      }

      const botReply: SimMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        buttons: nextButtons,
        time: 'Just now',
      }

      setSimMessages((prev) => [...prev, botReply])
    }, 700)
  }

  const handleSimFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const txt = chatInput.trim()
    setChatInput('')
    handleSimUserReply(txt)
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <MessageCircleCode className='h-4 w-4 text-emerald-600' />
          <span>WhatsAPI CRM — Visual Chatbot Flow Builder</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-0 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background'>
        {/* Top Workflow Action Bar */}
        <div className='px-4 py-2.5 border-b border-border/50 bg-card/60 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0'>
          {/* Flow Title & Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <div className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className='h-8 text-xs font-bold w-64 sm:w-80 border-border/60 bg-background/50 hover:bg-background transition-colors'
                placeholder='Enter Flow Name...'
              />
            </div>

            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
              <span className='font-semibold text-[11px]'>{isLive ? 'Live' : 'Draft'}</span>
            </div>
          </div>

          {/* Template Switcher & Top Actions */}
          <div className='flex items-center gap-2 flex-wrap'>
            <div className='hidden md:flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50 text-xs'>
              {FLOW_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    activePreset === p.id
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleResetFlow}
              className='h-8 text-xs gap-1 text-muted-foreground hover:text-foreground'
              title='Reset to default'
            >
              <RotateCcw className='h-3.5 w-3.5' /> Reset
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setActiveTab(activeTab === 'simulator' ? 'inspector' : 'simulator')}
              className='h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
            >
              <Smartphone className='h-3.5 w-3.5' />
              {activeTab === 'simulator' ? 'Open Inspector' : 'Open Simulator'}
            </Button>

            <Button
              size='sm'
              onClick={handleSaveFlow}
              className='h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-xs'
            >
              <Save className='h-3.5 w-3.5' /> Save & Deploy
            </Button>
          </div>
        </div>

        {/* Main 3-Column Studio Workspace */}
        <div className='flex-1 flex overflow-hidden'>
          {/* ======================================================== */}
          {/* LEFT COLUMN: COMPONENT PALETTE (Drag / Click to Add)     */}
          {/* ======================================================== */}
          <div className='w-64 sm:w-72 border-r border-border/50 bg-card/40 flex flex-col shrink-0 overflow-hidden'>
            {/* Palette Header & Search */}
            <div className='p-3 border-b border-border/40 space-y-2'>
              <div className='flex items-center justify-between text-xs font-semibold'>
                <span className='flex items-center gap-1.5'>
                  <Layers className='h-3.5 w-3.5 text-emerald-600' /> Component Library
                </span>
                <Badge variant='outline' className='text-[10px] font-mono'>
                  {nodes.length} Nodes in Flow
                </Badge>
              </div>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                <Input
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  placeholder='Search triggers, actions...'
                  className='h-8 pl-8 text-xs bg-background/60'
                />
              </div>
            </div>

            {/* Scrollable Components List */}
            <div className='flex-1 overflow-y-auto p-3 space-y-4 text-xs'>
              {/* SECTION: TRIGGERS */}
              <div>
                <button
                  onClick={() => setOpenTriggers(!openTriggers)}
                  className='w-full flex items-center justify-between font-bold text-[11px] text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground'
                >
                  <span className='flex items-center gap-1.5'>
                    <Zap className='h-3.5 w-3.5 text-amber-500' /> Triggers ({filteredTriggers.length})
                  </span>
                  {openTriggers ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
                </button>

                {openTriggers && (
                  <div className='space-y-1.5'>
                    {filteredTriggers.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.type}
                          onClick={() => handleAddNodeFromPalette(item)}
                          className='p-2.5 rounded-lg border border-border/60 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all shadow-2xs group flex items-start gap-2.5'
                        >
                          <div className='h-6 w-6 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon className='h-3.5 w-3.5' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-bold text-xs group-hover:text-emerald-600 transition-colors flex items-center justify-between'>
                              <span className='truncate'>{item.name}</span>
                              <Plus className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600' />
                            </div>
                            <div className='text-[10px] text-muted-foreground line-clamp-1 mt-0.5'>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* SECTION: ACTIONS */}
              <div>
                <button
                  onClick={() => setOpenActions(!openActions)}
                  className='w-full flex items-center justify-between font-bold text-[11px] text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground'
                >
                  <span className='flex items-center gap-1.5'>
                    <Sparkles className='h-3.5 w-3.5 text-blue-500' /> Actions & Logic ({filteredActions.length})
                  </span>
                  {openActions ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
                </button>

                {openActions && (
                  <div className='space-y-1.5'>
                    {filteredActions.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.type}
                          onClick={() => handleAddNodeFromPalette(item)}
                          className='p-2.5 rounded-lg border border-border/60 bg-card hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all shadow-2xs group flex items-start gap-2.5'
                        >
                          <div className='h-6 w-6 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon className='h-3.5 w-3.5' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-bold text-xs group-hover:text-blue-600 transition-colors flex items-center justify-between'>
                              <span className='truncate'>{item.name}</span>
                              <Plus className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600' />
                            </div>
                            <div className='text-[10px] text-muted-foreground line-clamp-1 mt-0.5'>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Help Tag */}
            <div className='p-2.5 border-t border-border/40 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between'>
              <span>Click any item to append to canvas</span>
              <Badge variant='outline' className='text-[10px]'>
                v2.4
              </Badge>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CENTER COLUMN: INTERACTIVE VISUAL CANVAS WITH DOT GRID   */}
          {/* ======================================================== */}
          <div className='flex-1 flex flex-col relative overflow-hidden bg-dot-grid'>
            {/* Canvas Header & Zoom Controls */}
            <div className='absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none'>
              <div className='pointer-events-auto flex items-center gap-2 bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shadow-xs text-xs'>
                <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
                <span className='font-semibold'>Connected to WABA:</span>
                <span className='font-mono text-muted-foreground'>+91 76985 80043</span>
              </div>

              {/* Zoom & View Controls */}
              <div className='pointer-events-auto flex items-center gap-1 bg-card/80 backdrop-blur-md p-1 rounded-lg border border-border/50 shadow-xs'>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground'
                  title='Zoom Out'
                >
                  <ZoomOut className='h-3.5 w-3.5' />
                </button>
                <span className='px-1.5 text-[11px] font-mono text-muted-foreground'>{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground'
                  title='Zoom In'
                >
                  <ZoomIn className='h-3.5 w-3.5' />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground ml-1'
                  title='Reset to 100%'
                >
                  <Maximize2 className='h-3.5 w-3.5' />
                </button>
              </div>
            </div>

            {/* Scrollable Dot-Grid Canvas Container */}
            <div
              className='flex-1 overflow-auto p-12 pt-16 flex flex-col items-center gap-6'
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(120,120,120,0.18) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <div
                className='flex flex-col items-center gap-4 transition-transform duration-200'
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {nodes.map((node, index) => {
                  const isSelected = selectedNodeId === node.id
                  const isTrigger = node.type.startsWith('TRIGGER')
                  const isAi = node.type === 'AI_AGENT'
                  const isButtons = node.type === 'SEND_BUTTONS'
                  const isCondition = node.type === 'CONDITION_BRANCH'
                  const isAsk = node.type === 'ASK_QUESTION'

                  // Border styling based on category
                  let nodeBorder = 'border-border/60 hover:border-emerald-500/50'
                  let topBarBg = 'bg-muted/40'
                  let typeColor = 'text-muted-foreground'

                  if (isTrigger) {
                    nodeBorder = isSelected ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-amber-500/40 hover:border-amber-500'
                    topBarBg = 'bg-amber-500/10'
                    typeColor = 'text-amber-600'
                  } else if (isAi) {
                    nodeBorder = isSelected ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg' : 'border-purple-500/40 hover:border-purple-500'
                    topBarBg = 'bg-purple-500/10'
                    typeColor = 'text-purple-600'
                  } else if (isCondition) {
                    nodeBorder = isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg' : 'border-orange-500/40 hover:border-orange-500'
                    topBarBg = 'bg-orange-500/10'
                    typeColor = 'text-orange-600'
                  } else if (isSelected) {
                    nodeBorder = 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    topBarBg = 'bg-emerald-500/10'
                    typeColor = 'text-emerald-600'
                  }

                  return (
                    <div key={node.id} className='flex flex-col items-center group'>
                      {/* NODE CARD ON CANVAS */}
                      <div
                        onClick={() => {
                          setSelectedNodeId(node.id)
                          setActiveTab('inspector')
                        }}
                        className={`w-80 sm:w-96 rounded-xl border-2 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${nodeBorder}`}
                      >
                        {/* Top Node Header */}
                        <div className={`px-3.5 py-2.5 flex items-center justify-between border-b border-border/40 ${topBarBg}`}>
                          <div className='flex items-center gap-2'>
                            <Badge className='h-5 px-1.5 text-[10px] font-bold bg-background text-foreground border border-border/50'>
                              #{node.stepNumber}
                            </Badge>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${typeColor}`}>
                              {node.type.replace('_', ' ')}
                            </span>
                          </div>

                          <div className='flex items-center gap-1'>
                            <button
                              onClick={(e) => handleDuplicateNode(node, e)}
                              className='p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors'
                              title='Duplicate Node'
                            >
                              <Copy className='h-3 w-3' />
                            </button>
                            {nodes.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteNode(node.id, e)}
                                className='p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-background/80 transition-colors'
                                title='Delete Node'
                              >
                                <Trash2 className='h-3 w-3' />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Node Content Body */}
                        <div className='p-3.5 space-y-2.5'>
                          <div className='font-bold text-xs text-foreground flex items-center justify-between'>
                            <span className='truncate'>{node.title}</span>
                            <Edit3 className='h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>

                          {/* Specific Visual Previews */}
                          {node.type === 'SEND_TEXT' && (
                            <div className='p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-foreground leading-relaxed'>
                              "{node.config.messageText || 'Message content...'}"
                            </div>
                          )}

                          {node.type === 'SEND_BUTTONS' && (
                            <div className='space-y-1.5'>
                              <div className='text-[11px] text-muted-foreground line-clamp-1'>
                                "{node.config.messageText}"
                              </div>
                              <div className='flex flex-wrap gap-1 pt-1'>
                                {(node.config.buttons || ['Option 1', 'Option 2']).map((btn, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className='px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-semibold border border-blue-500/20'
                                  >
                                    🔘 {btn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {node.type === 'SEND_LIST' && (
                            <div className='p-2 rounded-lg bg-muted/40 border border-border/40 space-y-1 text-[11px]'>
                              <div className='font-semibold text-muted-foreground text-[10px]'>LIST MENU ITEMS:</div>
                              {(node.config.listItems || []).map((li, liIdx) => (
                                <div key={liIdx} className='truncate text-foreground font-mono text-[10px]'>
                                  • {li}
                                </div>
                              ))}
                            </div>
                          )}

                          {node.type === 'ASK_QUESTION' && (
                            <div className='p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1 text-[11px]'>
                              <div className='text-amber-700 dark:text-amber-400 font-semibold'>
                                ? {node.config.questionPrompt}
                              </div>
                              <div className='text-[10px] text-muted-foreground font-mono'>
                                Save to: <strong>{node.config.saveKey || 'user_response'}</strong>
                              </div>
                            </div>
                          )}

                          {node.type === 'AI_AGENT' && (
                            <div className='p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1 text-[11px]'>
                              <div className='flex items-center gap-1.5 text-purple-600 font-bold text-[10px]'>
                                <Sparkles className='h-3 w-3' /> Grounded Knowledge Retrieval
                              </div>
                              <p className='text-muted-foreground text-[10px] leading-relaxed line-clamp-2'>
                                "{node.config.aiPrompt}"
                              </p>
                            </div>
                          )}

                          {node.type === 'ADD_TAG' && (
                            <div className='flex items-center gap-1.5 text-xs text-orange-600 font-mono bg-orange-500/10 px-2 py-1 rounded'>
                              <Tag className='h-3 w-3' /> + Add Tag: {node.config.tag || 'hot-lead'}
                            </div>
                          )}

                          {node.type === 'ASSIGN_AGENT' && (
                            <div className='flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-500/10 px-2 py-1 rounded'>
                              <UserCheck className='h-3 w-3' /> Assign Lead: {node.config.assignee || 'Agent Bhavik'}
                            </div>
                          )}

                          {node.type === 'CONDITION_BRANCH' && (
                            <div className='p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono'>
                              IF {node.config.conditionField} {node.config.conditionOperator}{' '}
                              "{node.config.conditionValue}"
                            </div>
                          )}

                          {node.type === 'WAIT_DELAY' && (
                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded'>
                              <Clock className='h-3 w-3' /> Delay {node.config.delaySeconds || 3} seconds
                            </div>
                          )}

                          {node.type === 'TRIGGER_MESSAGE' && (
                            <div className='text-[11px] text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded'>
                              event: messages.inbound
                            </div>
                          )}

                          {node.type === 'TRIGGER_WEBHOOK' && (
                            <div className='text-[11px] text-indigo-600 font-mono bg-indigo-500/10 px-2 py-1 rounded truncate'>
                              POST /webhook/indiamart
                            </div>
                          )}
                        </div>

                        {/* Node Footer Status */}
                        <div className='px-3.5 py-1.5 border-t border-border/30 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground'>
                          <span>Click to configure properties</span>
                          {isSelected && <span className='text-emerald-600 font-bold'>Active in Inspector</span>}
                        </div>
                      </div>

                      {/* SVG CONNECTOR WIRE TO NEXT NODE */}
                      {index < nodes.length - 1 && (
                        <div className='py-2 flex flex-col items-center relative'>
                          <div className='h-6 w-0.5 bg-border relative'>
                            <div className='absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background' />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: INSPECTOR & WHATSAPP PHONE SIMULATOR      */}
          {/* ======================================================== */}
          <div className='w-80 sm:w-96 border-l border-border/50 bg-card/40 flex flex-col shrink-0 overflow-hidden'>
            {/* Tabs Header */}
            <div className='p-2 border-b border-border/40 flex items-center gap-1 bg-muted/30'>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className='h-3.5 w-3.5 text-emerald-600' /> Live Simulator
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'inspector'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className='h-3.5 w-3.5 text-blue-600' /> Node Inspector
              </button>
            </div>

            {/* TAB CONTENT 1: NODE PROPERTIES INSPECTOR */}
            {activeTab === 'inspector' && (
              <div className='flex-1 overflow-y-auto p-4 space-y-4 text-xs'>
                <div className='flex items-center justify-between border-b border-border/40 pb-2.5'>
                  <div>
                    <h3 className='font-bold text-sm text-foreground'>Node #{selectedNode.stepNumber} Settings</h3>
                    <p className='text-[10px] text-muted-foreground'>{selectedNode.type}</p>
                  </div>
                  <Badge variant='outline' className='text-[10px] font-mono'>
                    {selectedNode.id}
                  </Badge>
                </div>

                {/* Common Title Field */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Display Label</Label>
                  <Input
                    value={selectedNode.title}
                    onChange={(e) => handleUpdateSelectedNode({ title: e.target.value })}
                    className='text-xs'
                  />
                </div>

                {/* SEND_TEXT & SEND_BUTTONS MESSAGE FIELD */}
                {(selectedNode.type === 'SEND_TEXT' || selectedNode.type === 'SEND_BUTTONS') && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>WhatsApp Message Body</Label>
                    <Textarea
                      rows={4}
                      value={selectedNode.config.messageText || ''}
                      onChange={(e) => handleUpdateSelectedNode({ config: { messageText: e.target.value } })}
                      className='text-xs font-mono leading-relaxed'
                      placeholder='Type message text with emojis & placeholders like {{contact.name}}...'
                    />
                    <p className='text-[10px] text-muted-foreground'>
                      Supports WhatsApp Markdown: *bold*, _italic_, ~strikethrough~.
                    </p>
                  </div>
                )}

                {/* SEND_BUTTONS BUTTON OPTIONS */}
                {selectedNode.type === 'SEND_BUTTONS' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Quick Reply Buttons (Max 3)</Label>
                    <Input
                      value={(selectedNode.config.buttons || []).join(', ')}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          config: {
                            buttons: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className='text-xs'
                      placeholder='Button 1, Button 2, Button 3'
                    />
                    <p className='text-[10px] text-muted-foreground'>Separate options with a comma.</p>
                  </div>
                )}

                {/* SEND_LIST LIST ITEMS */}
                {selectedNode.type === 'SEND_LIST' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Menu List Options (Comma Separated)</Label>
                    <Textarea
                      rows={3}
                      value={(selectedNode.config.listItems || []).join('\n')}
                      onChange={(e) =>
                        handleUpdateSelectedNode({
                          config: {
                            listItems: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className='text-xs font-mono'
                      placeholder='1. Option A&#10;2. Option B&#10;3. Option C'
                    />
                  </div>
                )}

                {/* ASK_QUESTION FIELDS */}
                {selectedNode.type === 'ASK_QUESTION' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Question Prompt</Label>
                      <Input
                        value={selectedNode.config.questionPrompt || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { questionPrompt: e.target.value } })}
                        className='text-xs'
                        placeholder='e.g. Please enter your mobile number'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Save To CRM Contact Field</Label>
                      <Input
                        value={selectedNode.config.saveKey || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { saveKey: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='e.g. truck_capacity or gst_number'
                      />
                    </div>
                  </>
                )}

                {/* AI_AGENT PROMPT */}
                {selectedNode.type === 'AI_AGENT' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>System Prompt / RAG Instructions</Label>
                    <Textarea
                      rows={4}
                      value={selectedNode.config.aiPrompt || ''}
                      onChange={(e) => handleUpdateSelectedNode({ config: { aiPrompt: e.target.value } })}
                      className='text-xs leading-relaxed'
                      placeholder='Instruct the AI on persona, tone, and knowledge boundaries...'
                    />
                  </div>
                )}

                {/* ADD_TAG FIELD */}
                {selectedNode.type === 'ADD_TAG' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Tag Name</Label>
                    <Input
                      value={selectedNode.config.tag || ''}
                      onChange={(e) => handleUpdateSelectedNode({ config: { tag: e.target.value } })}
                      className='text-xs font-mono'
                      placeholder='hot-lead, gujarat-fleet, etc.'
                    />
                  </div>
                )}

                {/* ASSIGN_AGENT FIELD */}
                {selectedNode.type === 'ASSIGN_AGENT' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Assignee Agent Name</Label>
                    <Input
                      value={selectedNode.config.assignee || ''}
                      onChange={(e) => handleUpdateSelectedNode({ config: { assignee: e.target.value } })}
                      className='text-xs'
                      placeholder='Agent Bhavik, Support Desk, etc.'
                    />
                  </div>
                )}

                {/* WAIT_DELAY FIELD */}
                {selectedNode.type === 'WAIT_DELAY' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Delay Duration (Seconds)</Label>
                    <Input
                      type='number'
                      min={1}
                      max={60}
                      value={selectedNode.config.delaySeconds || 3}
                      onChange={(e) =>
                        handleUpdateSelectedNode({ config: { delaySeconds: parseInt(e.target.value) || 3 } })
                      }
                      className='text-xs'
                    />
                  </div>
                )}

                {/* HTTP_REQUEST FIELD */}
                {selectedNode.type === 'HTTP_REQUEST' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Webhook Endpoint URL</Label>
                      <Input
                        value={selectedNode.config.httpUrl || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { httpUrl: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='https://api.domain.com/v1/webhook'
                      />
                    </div>
                  </>
                )}

                <div className='pt-2 border-t border-border/40'>
                  <Button
                    size='sm'
                    onClick={handleSaveFlow}
                    className='w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8'
                  >
                    <Check className='h-3.5 w-3.5' /> Apply Changes & Save
                  </Button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: LIVE WHATSAPP PHONE SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className='flex-1 flex flex-col overflow-hidden bg-muted/20'>
                {/* Phone Header Mockup */}
                <div className='p-3 bg-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs'>
                  <div className='flex items-center gap-2.5'>
                    <div className='h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs'>
                      TS
                    </div>
                    <div>
                      <div className='font-bold text-xs leading-tight'>Truck Sathi WhatsApp Bot</div>
                      <div className='text-[10px] text-emerald-200 flex items-center gap-1'>
                        <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' />
                        Official Cloud API
                      </div>
                    </div>
                  </div>
                  <Badge className='bg-emerald-800 text-emerald-100 text-[9px] border-0'>
                    SIMULATOR
                  </Badge>
                </div>

                {/* Chat Bubbles Scroll Area */}
                <div className='flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5ddd5]/30 dark:bg-muted/10'>
                  {simMessages.map((m) => {
                    const isBot = m.sender === 'bot'
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs leading-relaxed ${
                            isBot
                              ? 'bg-card text-card-foreground border border-border/50 rounded-tl-xs'
                              : 'bg-emerald-600 text-white rounded-tr-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isBot ? 'text-muted-foreground' : 'text-emerald-100'
                            }`}
                          >
                            {m.time || '10:45 AM'}
                          </span>
                        </div>

                        {/* Interactive WhatsApp Quick Reply Buttons */}
                        {m.buttons && m.buttons.length > 0 && (
                          <div className='flex flex-wrap gap-1 max-w-[85%] pt-0.5'>
                            {m.buttons.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSimUserReply(btn)}
                                className='px-2.5 py-1 rounded-full bg-card hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-600 font-semibold text-[11px] shadow-xs transition-all active:scale-95'
                              >
                                {btn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Typing Indicator */}
                  {isBotTyping && (
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground bg-card p-2 rounded-xl w-24 border border-border/40 shadow-xs'>
                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce' />
                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]' />
                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]' />
                    </div>
                  )}
                </div>

                {/* Phone Bottom Input Bar */}
                <form
                  onSubmit={handleSimFormSubmit}
                  className='p-2 bg-card border-t border-border/50 flex items-center gap-2 shrink-0'
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder='Type message or test response...'
                    className='h-8 text-xs bg-muted/30'
                  />
                  <Button
                    type='submit'
                    size='sm'
                    className='h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white'
                  >
                    <Send className='h-3.5 w-3.5' />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
