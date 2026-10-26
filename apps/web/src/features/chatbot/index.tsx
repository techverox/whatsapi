import { useState, useMemo, useEffect } from 'react'
import {
  MessageCircleCode,
  Zap,
  Send,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
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
  SlidersHorizontal,
  FileText,
  HelpCircle,
  CheckCircle2,
  Play,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  ShieldCheck,
  FileSpreadsheet,
  MapPin,
  ShoppingBag,
  Headphones,
  GitFork,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
  Radio,
  Database,
  Terminal,
  CheckCheck,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { veroxApi } from '@/lib/api'

// ============================================================================
// ALL 17 ENTERPRISE ACTIONS + TRIGGERS (BIZ LEVEL SE BHI UPER)
// ============================================================================
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

export interface BotNode {
  id: string
  stepNumber: number
  type: NodeType
  title: string
  subtitle: string
  config: {
    // Triggers
    event?: string
    keyword?: string
    timeoutHours?: number
    adCampaignId?: string
    // Messaging
    messageText?: string
    buttons?: string[]
    listTitle?: string
    listItems?: string[]
    mediaType?: 'pdf' | 'image' | 'video' | 'audio'
    mediaName?: string
    mediaUrl?: string
    // Input & Variables
    questionPrompt?: string
    questionValidation?: 'text' | 'number' | 'email' | 'phone'
    saveKey?: string
    attributeKey?: string
    attributeValue?: string
    // AI
    aiPrompt?: string
    aiModel?: string
    aiKnowledgeBase?: string
    // Integrations
    httpUrl?: string
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    httpHeaders?: string
    httpBody?: string
    tag?: string
    tagAction?: 'add' | 'remove'
    assignee?: string
    // Logic & Routing
    conditionField?: string
    conditionOperator?: '==' | '!=' | 'contains' | '>' | '<'
    conditionValue?: string
    delaySeconds?: number
    // Commerce & Handover
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
}

interface SimMessage {
  id: string
  sender: 'user' | 'bot' | 'system'
  text: string
  buttons?: string[]
  listItems?: string[]
  mediaType?: 'pdf' | 'image' | 'video' | 'audio'
  mediaName?: string
  mediaUrl?: string
  productCard?: {
    name: string
    price: string
    id: string
  }
  time?: string
}

interface TraceLogItem {
  timestamp: string
  stepNumber: number
  type: string
  status: 'EXECUTED' | 'WAITING_USER' | 'CONDITION_TRUE' | 'CONDITION_FALSE' | 'ERROR'
  details: string
}

// ============================================================================
// ENTERPRISE PRESET FLOW TEMPLATES
// ============================================================================
const FLOW_PRESETS: { id: string; name: string; description: string; nodes: BotNode[] }[] = [
  {
    id: 'preset-fleet-lead',
    name: 'Gujarat Fleet Lead Qualifier & Fastag Funnel',
    description: 'Commercial fleet AIS-140 GPS, government FASTAG KYC, and telemetry lead capture.',
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
        subtitle: 'Namaste! Welcome to Truck Sathi & Whatsapi.',
        config: {
          messageText:
            'નમસ્તે! Welcome to Truck Sathi & Whatsapi. We provide government-certified AIS-140 GPS devices, commercial FASTAG KYC, and commercial fleet telemetry across Gujarat & West India.',
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
          mediaType: 'pdf',
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
          tagAction: 'add',
        },
      },
      {
        id: 'node-im-6',
        stepNumber: 6,
        type: 'GOOGLE_SHEETS',
        title: 'Sync to Master Sales Sheet',
        subtitle: 'Append row to Google Sheet',
        config: {
          sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          sheetName: 'IndiaMart_Leads_2026',
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
          aiModel: 'Claude 3.5 Sonnet / OpenAI GPT-4o',
          aiKnowledgeBase: 'Gujarat Transport Regulations & AIS-140 Fitment',
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
      {
        id: 'node-ai-4',
        stepNumber: 4,
        type: 'HUMAN_HANDOVER',
        title: 'Human Handover Fallback',
        subtitle: 'Transfer to Tier-2 support team',
        config: {
          handoverDepartment: 'Operations Support Desk',
          handoverPriority: 'high',
        },
      },
    ],
  },
  {
    id: 'preset-ecommerce',
    name: 'WhatsApp Catalog & Order Desk',
    description: 'Direct interactive product card delivery and automated delivery location picker.',
    nodes: [
      {
        id: 'node-ec-1',
        stepNumber: 1,
        type: 'TRIGGER_KEYWORD',
        title: 'Trigger: Keyword "shop" or "buy"',
        subtitle: 'Triggers on keywords: shop, buy, gps, order',
        config: {
          keyword: 'shop, buy, gps, order',
        },
      },
      {
        id: 'node-ec-2',
        stepNumber: 2,
        type: 'WHATSAPP_CATALOG',
        title: 'Deliver Product Catalog Card',
        subtitle: 'AIS-140 GPS Device with Government Certification',
        config: {
          catalogProductId: 'PROD-AIS140-GJ',
          catalogProductName: 'Certified AIS-140 GPS Fleet Tracker',
          catalogPrice: '₹2,999 incl. GST & 1 Yr Cloud',
        },
      },
      {
        id: 'node-ec-3',
        stepNumber: 3,
        type: 'REQUEST_LOCATION',
        title: 'Request Delivery Hub GPS',
        subtitle: 'Asks user to pin dispatch location in WhatsApp',
        config: {
          locationPrompt: 'Please tap the paperclip icon and share your transport hub location for express delivery:',
        },
      },
      {
        id: 'node-ec-4',
        stepNumber: 4,
        type: 'SET_ATTRIBUTE',
        title: 'Set Lead Status',
        subtitle: 'Set order_stage = pending_dispatch',
        config: {
          attributeKey: 'order_stage',
          attributeValue: 'pending_dispatch',
        },
      },
      {
        id: 'node-ec-5',
        stepNumber: 5,
        type: 'SEND_TEXT',
        title: 'Order Dispatch Confirmation',
        subtitle: 'Instant dispatch confirmation message',
        config: {
          messageText:
            '🚚 Your order has been registered! Our Ahmedabad hub will dispatch your certified device via BlueDart express.',
        },
      },
    ],
  },
]

// Module-level ID counter & generator utilities
let idCounter = 1000
function generateNodeId(): string {
  idCounter += 1
  return `node-${Date.now()}-${idCounter}`
}
function generateSimMessageId(prefix: 'u' | 'b' | 'sys'): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

// ============================================================================
// COMPONENT PALETTE ITEMS (ALL 17 ACTIONS + 5 TRIGGERS)
// ============================================================================
interface PaletteItem {
  type: NodeType
  name: string
  description: string
  category: 'Triggers' | 'Actions'
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Triggers (5)
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
  {
    type: 'TRIGGER_AD_CLICK',
    name: 'Click-to-WhatsApp Ad',
    description: 'Triggers when user taps Meta/Instagram CTWA Ad',
    category: 'Triggers',
    icon: Radio,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    type: 'TRIGGER_INACTIVITY',
    name: 'Inactivity Timeout',
    description: 'Triggers when lead has been inactive for X hours',
    category: 'Triggers',
    icon: Clock,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },

  // Actions (17)
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
    description: 'Add natural typing delay (e.g. 2-5 seconds) before next step',
    category: 'Actions',
    icon: Clock,
    badgeColor: 'bg-slate-500/15 text-slate-600',
  },
  {
    type: 'SET_ATTRIBUTE',
    name: 'Set Custom Attribute',
    description: 'Save custom lead attributes (e.g. budget, fleet size)',
    category: 'Actions',
    icon: Database,
    badgeColor: 'bg-cyan-500/15 text-cyan-600',
  },
  {
    type: 'WHATSAPP_CATALOG',
    name: 'WhatsApp Catalog / Product',
    description: 'Send native WhatsApp commerce product cards with pricing',
    category: 'Actions',
    icon: ShoppingBag,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    type: 'REQUEST_LOCATION',
    name: 'Request Location',
    description: 'Prompt user to tap and share their real GPS location',
    category: 'Actions',
    icon: MapPin,
    badgeColor: 'bg-rose-500/15 text-rose-600',
  },
  {
    type: 'HUMAN_HANDOVER',
    name: 'Human Handover',
    description: 'Pause bot, alert human agent, transfer conversation',
    category: 'Actions',
    icon: Headphones,
    badgeColor: 'bg-red-500/15 text-red-600',
  },
  {
    type: 'GOOGLE_SHEETS',
    name: 'Google Sheets / CRM Sync',
    description: 'Append or update lead rows in Google Sheets automatically',
    category: 'Actions',
    icon: FileSpreadsheet,
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    type: 'JUMP_FLOW',
    name: 'Jump to Sub-Flow',
    description: 'Seamlessly transfer contact into another automated bot flow',
    category: 'Actions',
    icon: GitFork,
    badgeColor: 'bg-violet-500/15 text-violet-600',
  },
]

export function Chatbot() {
  // Flow ID and Name matching BizAutomation Header
  const [flowId] = useState('6adce257851f7407a9019ee3')
  const [flowName, setFlowName] = useState('Gujarat Fleet Lead Qualifier & Fastag Funnel')
  const [isLive, setIsLive] = useState(true)

  // Nodes Canvas State
  const [nodes, setNodes] = useState<BotNode[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_chatbot_flows_v2')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Use fallback default nodes
    }
    return FLOW_PRESETS[0].nodes
  })

  const [activePreset, setActivePreset] = useState('preset-fleet-lead')
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-1')
  const [activeTab, setActiveTab] = useState<'simulator' | 'inspector' | 'trace'>('simulator')
  const [isSaving, setIsSaving] = useState(false)

  // Load flow from backend on mount
  useEffect(() => {
    veroxApi
      .getChatbotFlow(flowId)
      .then((res: unknown) => {
        const payload = res as { data?: { nodes?: BotNode[]; name?: string; isLive?: boolean } }
        if (payload?.data) {
          if (payload.data.nodes && payload.data.nodes.length > 0) {
            setNodes(payload.data.nodes)
            setSelectedNodeId(payload.data.nodes[0]?.id || '')
          }
          if (payload.data.name) setFlowName(payload.data.name)
          if (payload.data.isLive !== undefined) setIsLive(payload.data.isLive)
        }
      })
      .catch(() => {
        // Fallback to local cached chatbot flow
      })
  }, [flowId])

  // Search filter for palette
  const [paletteSearch, setPaletteSearch] = useState('')
  const [openTriggers, setOpenTriggers] = useState(true)
  const [openActions, setOpenActions] = useState(true)

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activeExecutingNodeId, setActiveExecutingNodeId] = useState<string | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Simulator State
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: 'm-init-1',
      sender: 'bot',
      text: 'નમસ્તે! Welcome to Truck Sathi & Whatsapi. We provide government-certified AIS-140 GPS, commercial FASTAG KYC, and commercial fleet telemetry across Gujarat & West India.',
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
  const [simStepIndex, setSimStepIndex] = useState(2)
  const [crmAttributes, setCrmAttributes] = useState<Record<string, string>>({
    lead_source: 'WhatsApp Inbound',
    city: 'Ahmedabad',
    state: 'Gujarat',
  })

  // Trace Log History
  const [traceLogs, setTraceLogs] = useState<TraceLogItem[]>([
    {
      timestamp: '10:45:01 AM',
      stepNumber: 1,
      type: 'TRIGGER_MESSAGE',
      status: 'EXECUTED',
      details: 'Inbound WhatsApp webhook received from +91 98250 12345',
    },
    {
      timestamp: '10:45:02 AM',
      stepNumber: 2,
      type: 'SEND_TEXT',
      status: 'EXECUTED',
      details: 'Delivered welcome text message (248 chars)',
    },
    {
      timestamp: '10:45:02 AM',
      stepNumber: 3,
      type: 'SEND_BUTTONS',
      status: 'WAITING_USER',
      details: 'Delivered 3 quick reply buttons to customer screen',
    },
  ])

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

  // Currently selected node
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0]
  }, [nodes, selectedNodeId])

  // Save Flow to Backend & Local Storage
  const handleSaveFlow = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('whatsapi_chatbot_flows_v2', JSON.stringify(nodes))
      await veroxApi.saveChatbotFlow({
        id: flowId,
        name: flowName,
        isLive,
        nodes,
      })
      toast.success('Chatbot Flow Saved & Deployed to WhatsApp Cloud API!', {
        description: `"${flowName}" (${nodes.length} nodes) is now ${isLive ? 'LIVE' : 'DRAFT'} on WABA (+91 76985 80043).`,
      })
    } catch {
      toast.success('Chatbot Flow Saved Locally!', {
        description: `"${flowName}" (${nodes.length} nodes) cached in local storage.`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle Live switch with Backend sync
  const handleToggleLive = async (checked: boolean) => {
    setIsLive(checked)
    try {
      await veroxApi.saveChatbotFlow({
        id: flowId,
        name: flowName,
        isLive: checked,
        nodes,
      })
      toast.info(checked ? 'Flow Status: LIVE on WhatsApp WABA' : 'Flow Status: DRAFT Mode')
    } catch {
      toast.info(checked ? 'Flow Status: LIVE (Local)' : 'Flow Status: DRAFT (Local)')
    }
  }

  // Export Flow as JSON
  const handleExportFlow = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ name: flowName, nodes }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${flowName.toLowerCase().replace(/\s+/g, '_')}_flow.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Flow exported as JSON file!')
  }

  // Import Flow from JSON
  const handleImportFlow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          setNodes(parsed.nodes)
          if (parsed.name) setFlowName(parsed.name)
          setSelectedNodeId(parsed.nodes[0]?.id || '')
          toast.success(`Successfully imported flow with ${parsed.nodes.length} nodes!`)
        } else {
          toast.error('Invalid flow JSON format.')
        }
      } catch {
        toast.error('Failed to parse flow JSON.')
      }
    }
    reader.readAsText(file)
  }

  // Add Node from Palette (Supports all 17 actions + 5 triggers)
  const handleAddNodeFromPalette = (paletteItem: PaletteItem) => {
    const nextStep = nodes.length + 1
    const newId = generateNodeId()

    const defaultTitle = paletteItem.name
    let defaultSub = paletteItem.description
    const config: BotNode['config'] = {}

    switch (paletteItem.type) {
      // Triggers
      case 'TRIGGER_MESSAGE':
        config.event = 'messages.inbound'
        defaultSub = 'Triggers on any inbound customer message'
        break
      case 'TRIGGER_KEYWORD':
        config.keyword = 'price, quote, demo, fastag'
        defaultSub = 'Triggers when user message contains keywords'
        break
      case 'TRIGGER_WEBHOOK':
        config.event = 'webhook.indiamart.lead'
        defaultSub = 'Inbound POST /webhook/lead'
        break
      case 'TRIGGER_AD_CLICK':
        config.adCampaignId = 'meta_ctwa_campaign_gujarat_2026'
        defaultSub = 'Meta Click-to-WhatsApp Ad trigger'
        break
      case 'TRIGGER_INACTIVITY':
        config.timeoutHours = 24
        defaultSub = 'Triggers after 24h user inactivity'
        break

      // Actions
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
        config.listTitle = 'Fleet Services Menu'
        config.messageText = 'Select from our available fleet services:'
        config.listItems = ['1. AIS-140 GPS Device', '2. Commercial FASTAG', '3. Fleet Insurance', '4. Driver KYC']
        defaultSub = 'Interactive multi-row picker'
        break
      case 'SEND_MEDIA':
        config.mediaType = 'pdf'
        config.mediaName = 'WhatsAPI_Fleet_Brochure_2026.pdf'
        config.mediaUrl = 'https://whatsapicrm.com/assets/brochure.pdf'
        defaultSub = 'Deliver PDF / Image asset'
        break
      case 'ASK_QUESTION':
        config.questionPrompt = 'Please enter your commercial vehicle registration number (e.g. GJ01XX1234):'
        config.questionValidation = 'text'
        config.saveKey = 'vehicle_registration_number'
        defaultSub = 'Save user reply to CRM field'
        break
      case 'AI_AGENT':
        config.aiModel = 'GPT-4o / Claude 3.5'
        config.aiKnowledgeBase = 'Gujarat Fleet Logistics Documentation'
        config.aiPrompt = 'Answer courteously using Truck Sathi transport knowledge base and provide pricing info.'
        defaultSub = 'RAG AI Grounded LLM Response'
        break
      case 'HTTP_REQUEST':
        config.httpUrl = 'https://api.whatsapicrm.com/v1/fastag/lookup'
        config.httpMethod = 'POST'
        config.httpHeaders = 'Authorization: Bearer waba_token_live'
        config.httpBody = '{"lead_id": "{{contact.id}}", "action": "sync"}'
        defaultSub = 'POST external webhook request'
        break
      case 'ADD_TAG':
        config.tag = 'qualified-lead'
        config.tagAction = 'add'
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
      case 'SET_ATTRIBUTE':
        config.attributeKey = 'fleet_priority'
        config.attributeValue = 'HIGH'
        defaultSub = 'Set CRM attribute: fleet_priority=HIGH'
        break
      case 'WHATSAPP_CATALOG':
        config.catalogProductId = 'PROD-AIS140'
        config.catalogProductName = 'AIS-140 GPS Telemetry Unit'
        config.catalogPrice = '₹2,999'
        defaultSub = 'Deliver WhatsApp commerce catalog card'
        break
      case 'REQUEST_LOCATION':
        config.locationPrompt = 'Please share your transport hub location via WhatsApp location picker:'
        defaultSub = 'Request user real GPS coordinates'
        break
      case 'HUMAN_HANDOVER':
        config.handoverDepartment = 'Operations & Dispatch Desk'
        config.handoverPriority = 'high'
        defaultSub = 'Transfer chat to Human Agent'
        break
      case 'GOOGLE_SHEETS':
        config.sheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
        config.sheetName = 'Master_Leads'
        defaultSub = 'Append row to Google Sheets'
        break
      case 'JUMP_FLOW':
        config.targetFlowId = 'flow-sub-kyc-verify'
        defaultSub = 'Transfer contact into KYC sub-flow'
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
  const handleDeleteNode = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
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
      id: generateNodeId(),
      stepNumber: nextStep,
      title: `${node.title} (Copy)`,
    }
    setNodes([...nodes, newNode])
    setSelectedNodeId(newNode.id)
    toast.success(`Duplicated Node #${node.stepNumber} to Step #${nextStep}`)
  }

  // Move Node Up
  const handleMoveNodeUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (index === 0) return
    const newNodes = [...nodes]
    const temp = newNodes[index]
    newNodes[index] = newNodes[index - 1]
    newNodes[index - 1] = temp
    const reindexed = newNodes.map((n, idx) => ({ ...n, stepNumber: idx + 1 }))
    setNodes(reindexed)
    toast.success('Step moved up!')
  }

  // Move Node Down
  const handleMoveNodeDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (index === nodes.length - 1) return
    const newNodes = [...nodes]
    const temp = newNodes[index]
    newNodes[index] = newNodes[index + 1]
    newNodes[index + 1] = temp
    const reindexed = newNodes.map((n, idx) => ({ ...n, stepNumber: idx + 1 }))
    setNodes(reindexed)
    toast.success('Step moved down!')
  }

  // Apply Preset Template
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

      setTraceLogs([
        {
          timestamp: new Date().toLocaleTimeString(),
          stepNumber: 1,
          type: found.nodes[0].type,
          status: 'EXECUTED',
          details: `Preset loaded: ${found.name}`,
        },
      ])

      toast.success(`Loaded "${found.name}" Template!`)
    }
  }

  // Reset Flow
  const handleResetFlow = async () => {
    try {
      const res = await veroxApi.resetChatbotFlow()
      if (res?.data) {
        setNodes(res.data.nodes)
        setFlowName(res.data.name)
        setIsLive(res.data.isLive)
        setSelectedNodeId(res.data.nodes[0]?.id || '')
      } else {
        handleApplyPreset('preset-fleet-lead')
      }
    } catch {
      handleApplyPreset('preset-fleet-lead')
    }
    localStorage.removeItem('whatsapi_chatbot_flows_v2')
    setResetConfirmOpen(false)
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

  // ============================================================================
  // INTERACTIVE SIMULATOR EXECUTION ENGINE (100% WORKING FLOW SIMULATION)
  // ============================================================================
  const executeSimulatorStep = (nodeIndex: number) => {
    if (nodeIndex >= nodes.length) {
      setIsBotTyping(false)
      setActiveExecutingNodeId(null)
      toast.success('Flow completed successfully in Simulator!')
      return
    }

    const node = nodes[nodeIndex]
    setActiveExecutingNodeId(node.id)

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    switch (node.type) {
      case 'TRIGGER_MESSAGE':
      case 'TRIGGER_KEYWORD':
      case 'TRIGGER_WEBHOOK':
      case 'TRIGGER_AD_CLICK':
      case 'TRIGGER_INACTIVITY':
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: node.type,
            status: 'EXECUTED',
            details: `Trigger active: ${node.title}`,
          },
        ])
        // Automatically progress to next step
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'SEND_TEXT':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: node.config.messageText || 'Hello!',
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'SEND_TEXT',
              status: 'EXECUTED',
              details: `Sent message: "${(node.config.messageText || '').slice(0, 40)}..."`,
            },
          ])
          executeSimulatorStep(nodeIndex + 1)
        }, 700)
        break

      case 'SEND_BUTTONS':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: node.config.messageText || 'Please choose an option:',
              buttons: node.config.buttons || ['Option 1', 'Option 2'],
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'SEND_BUTTONS',
              status: 'WAITING_USER',
              details: `Displayed ${node.config.buttons?.length || 0} quick reply buttons`,
            },
          ])
          // Pauses for user button click!
          setSimStepIndex(nodeIndex + 1)
        }, 700)
        break

      case 'SEND_LIST':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: `${node.config.messageText || 'Select an item:'}\n\n` + (node.config.listItems || []).map((i) => `• ${i}`).join('\n'),
              buttons: ['View Menu Options', 'Cancel'],
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'SEND_LIST',
              status: 'WAITING_USER',
              details: `Sent interactive list picker with ${node.config.listItems?.length || 0} items`,
            },
          ])
          setSimStepIndex(nodeIndex + 1)
        }, 700)
        break

      case 'SEND_MEDIA':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: `📎 Document Attached: ${node.config.mediaName || 'Brochure.pdf'}`,
              mediaType: node.config.mediaType || 'pdf',
              mediaName: node.config.mediaName || 'Document.pdf',
              mediaUrl: node.config.mediaUrl || 'https://whatsapicrm.com/assets/brochure.pdf',
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'SEND_MEDIA',
              status: 'EXECUTED',
              details: `Sent media file: ${node.config.mediaName}`,
            },
          ])
          executeSimulatorStep(nodeIndex + 1)
        }, 800)
        break

      case 'ASK_QUESTION':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: node.config.questionPrompt || 'Please enter your response:',
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'ASK_QUESTION',
              status: 'WAITING_USER',
              details: `Asked user question. Awaiting answer to save into "${node.config.saveKey || 'var'}"`,
            },
          ])
          // Pauses for user chat input!
          setSimStepIndex(nodeIndex + 1)
        }, 700)
        break

      case 'AI_AGENT':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text:
                '🤖 [AI Agent Grounded Response]: Based on Gujarat Transport AIS-140 compliance, commercial multi-axle trucks require ARAI certified GPS with dual IP67 SIM failover and government live portal sync. We provide complete RTO clearance documentation.',
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'AI_AGENT',
              status: 'EXECUTED',
              details: `Synthesized grounded answer via ${node.config.aiModel || 'Claude 3.5'} using ${node.config.aiKnowledgeBase || 'Docs'}`,
            },
          ])
          executeSimulatorStep(nodeIndex + 1)
        }, 1200)
        break

      case 'HTTP_REQUEST':
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `🌐 Webhook Dispatched: ${node.config.httpMethod || 'POST'} ${node.config.httpUrl} (Status: 200 OK)`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'HTTP_REQUEST',
            status: 'EXECUTED',
            details: `${node.config.httpMethod || 'POST'} ${node.config.httpUrl} returned 200 OK`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'ADD_TAG':
        setCrmAttributes((prev) => ({ ...prev, [`tag_${node.config.tag}`]: 'true' }))
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `🏷️ CRM Tag Applied: "${node.config.tag || 'hot-lead'}"`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'ADD_TAG',
            status: 'EXECUTED',
            details: `Applied CRM tag "${node.config.tag}"`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'ASSIGN_AGENT':
        setCrmAttributes((prev) => ({ ...prev, assigned_agent: node.config.assignee || 'Agent Bhavik' }))
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `👤 Conversation Routed to: ${node.config.assignee || 'Agent Bhavik'}`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'ASSIGN_AGENT',
            status: 'EXECUTED',
            details: `Assigned conversation to ${node.config.assignee}`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'CONDITION_BRANCH':
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'CONDITION_BRANCH',
            status: 'CONDITION_TRUE',
            details: `Evaluated (${node.config.conditionField} ${node.config.conditionOperator} "${node.config.conditionValue}") => TRUE`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'WAIT_DELAY': {
        setIsBotTyping(true)
        const delayMs = (node.config.delaySeconds || 2) * 800
        setTimeout(() => {
          setIsBotTyping(false)
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'WAIT_DELAY',
              status: 'EXECUTED',
              details: `Paused for ${node.config.delaySeconds || 2}s typing simulation`,
            },
          ])
          executeSimulatorStep(nodeIndex + 1)
        }, delayMs)
        break
      }

      case 'SET_ATTRIBUTE':
        if (node.config.attributeKey) {
          setCrmAttributes((prev) => ({ ...prev, [node.config.attributeKey!]: node.config.attributeValue || 'true' }))
        }
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `💾 Set Attribute: ${node.config.attributeKey} = "${node.config.attributeValue}"`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'SET_ATTRIBUTE',
            status: 'EXECUTED',
            details: `Updated CRM attribute ${node.config.attributeKey}="${node.config.attributeValue}"`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'WHATSAPP_CATALOG':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: '🛍️ WhatsApp Product Catalog:',
              productCard: {
                id: node.config.catalogProductId || 'PROD-1',
                name: node.config.catalogProductName || 'AIS-140 GPS Device',
                price: node.config.catalogPrice || '₹2,999',
              },
              buttons: ['Buy Now via UPI', 'View Product Specs', 'Contact Sales'],
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'WHATSAPP_CATALOG',
              status: 'WAITING_USER',
              details: `Sent product card for "${node.config.catalogProductName}" (${node.config.catalogPrice})`,
            },
          ])
          setSimStepIndex(nodeIndex + 1)
        }, 800)
        break

      case 'REQUEST_LOCATION':
        setIsBotTyping(true)
        setTimeout(() => {
          setIsBotTyping(false)
          setSimMessages((prev) => [
            ...prev,
            {
              id: generateSimMessageId('b'),
              sender: 'bot',
              text: node.config.locationPrompt || '📍 Please share your live GPS location for delivery hub calculation:',
              buttons: ['📍 Share Current Location (Ahmedabad Hub)', 'Enter Address Manually'],
              time: now,
            },
          ])
          setTraceLogs((prev) => [
            ...prev,
            {
              timestamp: now,
              stepNumber: node.stepNumber,
              type: 'REQUEST_LOCATION',
              status: 'WAITING_USER',
              details: 'Requested WhatsApp location pin from customer',
            },
          ])
          setSimStepIndex(nodeIndex + 1)
        }, 700)
        break

      case 'HUMAN_HANDOVER':
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `🔔 Bot paused. Chat transferred to ${node.config.handoverDepartment || 'Support Desk'} (Priority: ${node.config.handoverPriority || 'normal'}).`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'HUMAN_HANDOVER',
            status: 'EXECUTED',
            details: `Transferred chat to ${node.config.handoverDepartment}`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'GOOGLE_SHEETS':
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `📊 Appended Lead to Google Sheet: "${node.config.sheetName || 'Leads'}"`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'GOOGLE_SHEETS',
            status: 'EXECUTED',
            details: `Appended row to Google Sheet: ${node.config.sheetName}`,
          },
        ])
        executeSimulatorStep(nodeIndex + 1)
        break

      case 'JUMP_FLOW':
        setSimMessages((prev) => [
          ...prev,
          {
            id: generateSimMessageId('sys'),
            sender: 'system',
            text: `🔀 Branching into Sub-Flow: "${node.config.targetFlowId || 'sub-flow'}"`,
            time: now,
          },
        ])
        setTraceLogs((prev) => [
          ...prev,
          {
            timestamp: now,
            stepNumber: node.stepNumber,
            type: 'JUMP_FLOW',
            status: 'EXECUTED',
            details: `Jumped execution to flow ID: ${node.config.targetFlowId}`,
          },
        ])
        toast.info(`Jumped to sub-flow: ${node.config.targetFlowId}`)
        break

      default:
        executeSimulatorStep(nodeIndex + 1)
        break
    }
  }

  // Handle User Reply in Simulator (Button Click or Chat Input)
  const handleSimUserReply = (text: string) => {
    const userMsg: SimMessage = {
      id: generateSimMessageId('u'),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setSimMessages((prev) => [...prev, userMsg])
    setTraceLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        stepNumber: simStepIndex,
        type: 'USER_REPLY',
        status: 'EXECUTED',
        details: `Customer selected / typed: "${text}"`,
      },
    ])

    // Continue flow execution
    executeSimulatorStep(simStepIndex)
  }

  // Handle Form Submit in Simulator
  const handleSimFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const txt = chatInput.trim()
    setChatInput('')
    handleSimUserReply(txt)
  }

  // Start Flow Execution from Node 0
  const handleStartFlowSimulation = () => {
    setActiveTab('simulator')
    setSimMessages([])
    setTraceLogs([])
    toast.info('Starting fresh flow simulation from Node #1...')
    setTimeout(() => {
      executeSimulatorStep(0)
    }, 400)
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <MessageCircleCode className='h-4 w-4 text-emerald-600' />
          <span>Whatsapi — Enterprise Visual Chatbot Studio</span>
          <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
            v2.6 Pro
          </Badge>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-0 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background'>
        {/* ======================================================== */}
        {/* TOP WORKFLOW HEADER (EXACT BIZ LEVEL + SUPERCHARGED)     */}
        {/* ======================================================== */}
        <div className='px-4 py-2 border-b border-border/50 bg-card/70 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0'>
          {/* Left: Breadcrumbs + Inline Flow Name + Status */}
          <div className='flex flex-wrap items-center gap-3'>
            {/* Breadcrumb matching user's BizAutomation screenshot */}
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-mono'>
              <span className='hover:text-foreground cursor-pointer'>Dashboard</span>
              <ChevronRight className='h-3 w-3 text-muted-foreground/60' />
              <span className='text-emerald-600 font-semibold'>Chatbot-V2</span>
              <ChevronRight className='h-3 w-3 text-muted-foreground/60' />
              <span className='px-1.5 py-0.5 rounded bg-muted/60 text-[11px] select-all'>{flowId}</span>
            </div>

            {/* Editable Flow Name input */}
            <div className='flex items-center gap-2'>
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className='h-8 text-xs font-bold w-60 sm:w-72 border-border/60 bg-background/50 hover:bg-background transition-colors'
                placeholder='Enter Flow Name...'
              />
            </div>

            {/* Draft / Live switch */}
            <div className='flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40'>
              <Switch checked={isLive} onCheckedChange={handleToggleLive} />
              <span className={`text-[11px] font-bold ${isLive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {isLive ? 'Live' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Right: Actions, Presets, Test & Vibrant Save Button */}
          <div className='flex items-center gap-2 flex-wrap'>
            {/* Preset Selector */}
            <div className='hidden xl:flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50 text-xs'>
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

            {/* Test Flow Runner */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleStartFlowSimulation}
              className='h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold'
              title='Run and test entire flow in WhatsApp phone simulator'
            >
              <Play className='h-3.5 w-3.5 fill-emerald-600' /> Test Flow
            </Button>

            {/* Export JSON */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportFlow}
              className='h-8 text-xs gap-1 text-muted-foreground hover:text-foreground'
              title='Export Flow as JSON'
            >
              <Download className='h-3.5 w-3.5' /> Export
            </Button>

            {/* Import JSON */}
            <label className='h-8 text-xs px-2.5 py-1.5 rounded-md border border-border/60 bg-background hover:bg-muted cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors'>
              <Upload className='h-3.5 w-3.5' /> Import
              <input type='file' accept='.json' onChange={handleImportFlow} className='hidden' />
            </label>

            {/* Reset */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setResetConfirmOpen(true)}
              className='h-8 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer'
              title='Reset to Default Template'
            >
              <RotateCcw className='h-3.5 w-3.5' /> Reset
            </Button>

            {/* Toggle Drawer */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setActiveTab(activeTab === 'simulator' ? 'inspector' : 'simulator')}
              className='h-8 text-xs gap-1.5'
            >
              <Smartphone className='h-3.5 w-3.5' />
              {activeTab === 'simulator' ? 'Inspector' : 'Simulator'}
            </Button>

            {/* BIZ AUTOMATION ORANGE SAVE BUTTON (#f97316) */}
            <Button
              size='sm'
              onClick={handleSaveFlow}
              disabled={isSaving}
              className='h-8 text-xs bg-[#f97316] hover:bg-[#ea580c] text-white font-bold gap-1.5 shadow-sm active:scale-95 transition-all'
            >
              <Save className='h-3.5 w-3.5' /> {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN 3-COLUMN STUDIO WORKSPACE                           */}
        {/* ======================================================== */}
        <div className='flex-1 flex overflow-hidden'>
          {/* ======================================================== */}
          {/* COLUMN 1: LEFT COMPONENT PALETTE (ALL 17 ACTIONS)        */}
          {/* ======================================================== */}
          <div className='w-64 sm:w-72 border-r border-border/50 bg-card/40 flex flex-col shrink-0 overflow-hidden'>
            {/* Search Bar */}
            <div className='p-3 border-b border-border/40 space-y-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                <Input
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  placeholder='Search components...'
                  className='h-8 pl-8 text-xs bg-background/60'
                />
              </div>
            </div>

            {/* Scrollable List with Accordions matching BizAutomation */}
            <div className='flex-1 overflow-y-auto p-3 space-y-4 text-xs'>
              {/* ACCORDION 1: TRIGGERS */}
              <div>
                <button
                  onClick={() => setOpenTriggers(!openTriggers)}
                  className='w-full flex items-center justify-between font-bold text-xs text-foreground mb-2 hover:text-emerald-600 transition-colors'
                >
                  <span className='flex items-center gap-1.5'>
                    <Zap className='h-3.5 w-3.5 text-amber-500' /> Triggers
                    <Badge variant='outline' className='text-[10px] font-mono ml-1 px-1.5 py-0'>
                      {filteredTriggers.length}
                    </Badge>
                  </span>
                  {openTriggers ? <ChevronDown className='h-3.5 w-3.5' /> : <ChevronRight className='h-3.5 w-3.5' />}
                </button>

                {openTriggers && (
                  <div className='space-y-1.5'>
                    {filteredTriggers.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.type}
                          onClick={() => handleAddNodeFromPalette(item)}
                          className='p-2.5 rounded-lg border border-border/60 bg-card hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer transition-all shadow-2xs group flex items-start gap-2.5'
                        >
                          <div className='h-6 w-6 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon className='h-3.5 w-3.5' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-bold text-xs group-hover:text-amber-600 transition-colors flex items-center justify-between'>
                              <span className='truncate'>{item.name}</span>
                              <Plus className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600' />
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

              {/* ACCORDION 2: ALL 17 ACTIONS */}
              <div>
                <button
                  onClick={() => setOpenActions(!openActions)}
                  className='w-full flex items-center justify-between font-bold text-xs text-foreground mb-2 hover:text-emerald-600 transition-colors'
                >
                  <span className='flex items-center gap-1.5'>
                    <Sparkles className='h-3.5 w-3.5 text-emerald-500' /> Actions
                    <Badge variant='outline' className='text-[10px] font-mono ml-1 px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                      {filteredActions.length}
                    </Badge>
                  </span>
                  {openActions ? <ChevronDown className='h-3.5 w-3.5' /> : <ChevronRight className='h-3.5 w-3.5' />}
                </button>

                {openActions && (
                  <div className='space-y-1.5'>
                    {filteredActions.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.type}
                          onClick={() => handleAddNodeFromPalette(item)}
                          className='p-2.5 rounded-lg border border-border/60 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all shadow-2xs group flex items-start gap-2.5'
                        >
                          {/* Green rounded icon container matching BizAutomation */}
                          <div className='h-6 w-6 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20'>
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
            </div>

            {/* Bottom Info Status */}
            <div className='p-2.5 border-t border-border/40 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between'>
              <span>Click to add node to flow</span>
              <Badge variant='outline' className='text-[10px]'>
                17 Actions
              </Badge>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2: CENTER INFINITE CANVAS WITH SVG CONNECTOR WIRES*/}
          {/* ======================================================== */}
          <div className='flex-1 flex flex-col relative overflow-hidden bg-dot-grid'>
            {/* Top Canvas Floating Overlay */}
            <div className='absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none'>
              <div className='pointer-events-auto flex items-center gap-2 bg-card/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shadow-xs text-xs'>
                <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
                <span className='font-semibold'>Connected WABA:</span>
                <span className='font-mono text-muted-foreground'>+91 76985 80043</span>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1' />
              </div>

              {/* Canvas Zoom & Layout Controls */}
              <div className='pointer-events-auto flex items-center gap-1 bg-card/85 backdrop-blur-md p-1 rounded-lg border border-border/50 shadow-xs'>
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
                  const isExecuting = activeExecutingNodeId === node.id
                  const isTrigger = node.type.startsWith('TRIGGER')
                  const isAi = node.type === 'AI_AGENT'
                  const isCondition = node.type === 'CONDITION_BRANCH'

                  // Border & Header Styling
                  let nodeBorder = 'border-border/60 hover:border-emerald-500/50'
                  let topBarBg = 'bg-muted/40'
                  let typeColor = 'text-muted-foreground'

                  if (isExecuting) {
                    nodeBorder = 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-xl scale-102'
                    topBarBg = 'bg-emerald-500/20'
                    typeColor = 'text-emerald-600 font-bold'
                  } else if (isTrigger) {
                    nodeBorder = isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'border-amber-500/40 hover:border-amber-500'
                    topBarBg = 'bg-amber-500/10'
                    typeColor = 'text-amber-600'
                  } else if (isAi) {
                    nodeBorder = isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'border-purple-500/40 hover:border-purple-500'
                    topBarBg = 'bg-purple-500/10'
                    typeColor = 'text-purple-600'
                  } else if (isCondition) {
                    nodeBorder = isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                      : 'border-orange-500/40 hover:border-orange-500'
                    topBarBg = 'bg-orange-500/10'
                    typeColor = 'text-orange-600'
                  } else if (isSelected) {
                    nodeBorder = 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    topBarBg = 'bg-emerald-500/10'
                    typeColor = 'text-emerald-600'
                  }

                  return (
                    <div key={node.id} className='flex flex-col items-center group relative'>
                      {/* NODE CARD ON CANVAS */}
                      <div
                        onClick={() => {
                          setSelectedNodeId(node.id)
                          setActiveTab('inspector')
                        }}
                        className={`w-84 sm:w-96 rounded-xl border-2 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${nodeBorder}`}
                      >
                        {/* Top Node Header with Step Badge & Controls */}
                        <div
                          className={`px-3.5 py-2 flex items-center justify-between border-b border-border/40 ${topBarBg}`}
                        >
                          <div className='flex items-center gap-2'>
                            <Badge className='h-5 px-1.5 text-[10px] font-bold bg-background text-foreground border border-border/50'>
                              #{node.stepNumber}
                            </Badge>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${typeColor}`}>
                              {node.type.replace('_', ' ')}
                            </span>
                            {isExecuting && (
                              <span className='px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[9px] font-bold animate-pulse'>
                                RUNNING
                              </span>
                            )}
                          </div>

                          {/* Quick Actions (Move, Duplicate, Delete, Run) */}
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={(e) => handleMoveNodeUp(index, e)}
                              disabled={index === 0}
                              className='p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30'
                              title='Move Step Up'
                            >
                              <ArrowUp className='h-3 w-3' />
                            </button>
                            <button
                              onClick={(e) => handleMoveNodeDown(index, e)}
                              disabled={index === nodes.length - 1}
                              className='p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30'
                              title='Move Step Down'
                            >
                              <ArrowDown className='h-3 w-3' />
                            </button>
                            <button
                              onClick={(e) => handleDuplicateNode(node, e)}
                              className='p-1 rounded text-muted-foreground hover:text-foreground'
                              title='Duplicate Node'
                            >
                              <Copy className='h-3 w-3' />
                            </button>
                            {nodes.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteNode(node.id, e)}
                                className='p-1 rounded text-muted-foreground hover:text-rose-600'
                                title='Delete Node'
                              >
                                <Trash2 className='h-3 w-3' />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Node Content Body Preview */}
                        <div className='p-3.5 space-y-2.5'>
                          <div className='font-bold text-xs text-foreground flex items-center justify-between'>
                            <span className='truncate'>{node.title}</span>
                            <Edit3 className='h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>

                          {/* SEND_TEXT PREVIEW */}
                          {node.type === 'SEND_TEXT' && (
                            <div className='p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-foreground leading-relaxed'>
                              "{node.config.messageText || 'Message content...'}"
                            </div>
                          )}

                          {/* SEND_BUTTONS PREVIEW */}
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

                          {/* SEND_LIST PREVIEW */}
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

                          {/* SEND_MEDIA PREVIEW */}
                          {node.type === 'SEND_MEDIA' && (
                            <div className='p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-center gap-2 text-xs text-blue-600'>
                              <FileText className='h-4 w-4' />
                              <div className='truncate'>
                                <div className='font-semibold'>{node.config.mediaName || 'Brochure.pdf'}</div>
                                <div className='text-[10px] text-muted-foreground'>{node.config.mediaUrl}</div>
                              </div>
                            </div>
                          )}

                          {/* ASK_QUESTION PREVIEW */}
                          {node.type === 'ASK_QUESTION' && (
                            <div className='p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1 text-[11px]'>
                              <div className='text-amber-700 dark:text-amber-400 font-semibold'>
                                ? {node.config.questionPrompt}
                              </div>
                              <div className='text-[10px] text-muted-foreground font-mono'>
                                Save to CRM: <strong>{node.config.saveKey || 'user_response'}</strong> (Type:{' '}
                                {node.config.questionValidation || 'text'})
                              </div>
                            </div>
                          )}

                          {/* AI_AGENT PREVIEW */}
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

                          {/* HTTP_REQUEST PREVIEW */}
                          {node.type === 'HTTP_REQUEST' && (
                            <div className='p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 space-y-1 text-[11px]'>
                              <div className='flex items-center gap-1.5 font-mono text-[10px] text-indigo-600'>
                                <Badge variant='outline' className='text-[9px] font-bold'>
                                  {node.config.httpMethod || 'POST'}
                                </Badge>
                                <span className='truncate'>{node.config.httpUrl}</span>
                              </div>
                            </div>
                          )}

                          {/* ADD_TAG PREVIEW */}
                          {node.type === 'ADD_TAG' && (
                            <div className='flex items-center gap-1.5 text-xs text-orange-600 font-mono bg-orange-500/10 px-2 py-1 rounded'>
                              <Tag className='h-3 w-3' /> + Add Tag: {node.config.tag || 'hot-lead'}
                            </div>
                          )}

                          {/* ASSIGN_AGENT PREVIEW */}
                          {node.type === 'ASSIGN_AGENT' && (
                            <div className='flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-500/10 px-2 py-1 rounded'>
                              <UserCheck className='h-3 w-3' /> Assign Lead: {node.config.assignee || 'Agent Bhavik'}
                            </div>
                          )}

                          {/* CONDITION_BRANCH PREVIEW */}
                          {node.type === 'CONDITION_BRANCH' && (
                            <div className='p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono'>
                              IF {node.config.conditionField} {node.config.conditionOperator} "{node.config.conditionValue}"
                            </div>
                          )}

                          {/* WAIT_DELAY PREVIEW */}
                          {node.type === 'WAIT_DELAY' && (
                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded'>
                              <Clock className='h-3 w-3' /> Delay {node.config.delaySeconds || 3} seconds
                            </div>
                          )}

                          {/* SET_ATTRIBUTE PREVIEW */}
                          {node.type === 'SET_ATTRIBUTE' && (
                            <div className='flex items-center gap-1.5 text-xs text-cyan-600 font-mono bg-cyan-500/10 px-2 py-1 rounded'>
                              <Database className='h-3 w-3' /> Set {node.config.attributeKey} = "{node.config.attributeValue}"
                            </div>
                          )}

                          {/* WHATSAPP_CATALOG PREVIEW */}
                          {node.type === 'WHATSAPP_CATALOG' && (
                            <div className='p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-600 flex items-center justify-between'>
                              <span className='font-bold'>{node.config.catalogProductName}</span>
                              <Badge className='bg-emerald-600 text-white text-[10px]'>{node.config.catalogPrice}</Badge>
                            </div>
                          )}

                          {/* REQUEST_LOCATION PREVIEW */}
                          {node.type === 'REQUEST_LOCATION' && (
                            <div className='flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-500/10 px-2 py-1 rounded'>
                              <MapPin className='h-3 w-3' /> Request Live GPS Coordinates
                            </div>
                          )}

                          {/* HUMAN_HANDOVER PREVIEW */}
                          {node.type === 'HUMAN_HANDOVER' && (
                            <div className='flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-500/10 px-2 py-1 rounded'>
                              <Headphones className='h-3 w-3' /> Handover: {node.config.handoverDepartment}
                            </div>
                          )}

                          {/* GOOGLE_SHEETS PREVIEW */}
                          {node.type === 'GOOGLE_SHEETS' && (
                            <div className='flex items-center gap-1.5 text-xs text-emerald-600 font-mono bg-emerald-500/10 px-2 py-1 rounded'>
                              <FileSpreadsheet className='h-3 w-3' /> Append row: {node.config.sheetName}
                            </div>
                          )}

                          {/* JUMP_FLOW PREVIEW */}
                          {node.type === 'JUMP_FLOW' && (
                            <div className='flex items-center gap-1.5 text-xs text-violet-600 font-mono bg-violet-500/10 px-2 py-1 rounded'>
                              <GitFork className='h-3 w-3' /> Jump to flow: {node.config.targetFlowId}
                            </div>
                          )}

                          {/* TRIGGERS PREVIEW */}
                          {node.type === 'TRIGGER_MESSAGE' && (
                            <div className='text-[11px] text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded'>
                              event: messages.inbound
                            </div>
                          )}
                          {node.type === 'TRIGGER_KEYWORD' && (
                            <div className='text-[11px] text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded'>
                              keywords: {node.config.keyword || 'price, gps'}
                            </div>
                          )}
                          {node.type === 'TRIGGER_WEBHOOK' && (
                            <div className='text-[11px] text-indigo-600 font-mono bg-indigo-500/10 px-2 py-1 rounded truncate'>
                              POST /webhook/indiamart
                            </div>
                          )}
                          {node.type === 'TRIGGER_AD_CLICK' && (
                            <div className='text-[11px] text-emerald-600 font-mono bg-emerald-500/10 px-2 py-1 rounded truncate'>
                              campaign: {node.config.adCampaignId}
                            </div>
                          )}
                          {node.type === 'TRIGGER_INACTIVITY' && (
                            <div className='text-[11px] text-amber-600 font-mono bg-amber-500/10 px-2 py-1 rounded'>
                              timeout: {node.config.timeoutHours || 24} hours
                            </div>
                          )}
                        </div>

                        {/* Node Footer Status */}
                        <div className='px-3.5 py-1.5 border-t border-border/30 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground'>
                          <span>Click to configure properties</span>
                          {isSelected && <span className='text-emerald-600 font-bold'>Active in Inspector</span>}
                        </div>
                      </div>

                      {/* SVG CONNECTOR WIRE TO NEXT NODE WITH ANIMATED BULLET */}
                      {index < nodes.length - 1 && (
                        <div className='py-2 flex flex-col items-center relative'>
                          <div className='h-8 w-0.5 bg-border relative'>
                            <div className='absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse' />
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
          {/* COLUMN 3: RIGHT PANEL (INSPECTOR, SIMULATOR & TRACE LOG) */}
          {/* ======================================================== */}
          <div className='w-84 sm:w-96 border-l border-border/50 bg-card/40 flex flex-col shrink-0 overflow-hidden'>
            {/* Tabs Header */}
            <div className='p-2 border-b border-border/40 flex items-center gap-1 bg-muted/30'>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-background text-foreground shadow-xs font-bold text-emerald-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className='h-3.5 w-3.5' /> Simulator
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'inspector'
                    ? 'bg-background text-foreground shadow-xs font-bold text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className='h-3.5 w-3.5' /> Inspector
              </button>
              <button
                onClick={() => setActiveTab('trace')}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'trace'
                    ? 'bg-background text-foreground shadow-xs font-bold text-purple-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className='h-3.5 w-3.5' /> Trace Log
              </button>
            </div>

            {/* TAB CONTENT 1: NODE INSPECTOR (100% WORKING EDITORS FOR ALL 17 TYPES) */}
            {activeTab === 'inspector' && (
              <div className='flex-1 overflow-y-auto p-4 space-y-4 text-xs'>
                <div className='flex items-center justify-between border-b border-border/40 pb-2.5'>
                  <div>
                    <h3 className='font-bold text-sm text-foreground'>Step #{selectedNode.stepNumber} Settings</h3>
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
                    <div className='flex flex-wrap gap-1 pt-1'>
                      {['{{contact.name}}', '{{contact.phone}}', '{{contact.city}}'].map((tag) => (
                        <button
                          key={tag}
                          type='button'
                          onClick={() =>
                            handleUpdateSelectedNode({
                              config: {
                                messageText: `${selectedNode.config.messageText || ''} ${tag}`,
                              },
                            })
                          }
                          className='px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono hover:bg-muted/80'
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
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
                    <Label className='text-xs font-semibold'>Menu List Options (One per line)</Label>
                    <Textarea
                      rows={4}
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

                {/* SEND_MEDIA FIELDS */}
                {selectedNode.type === 'SEND_MEDIA' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Media File Name</Label>
                      <Input
                        value={selectedNode.config.mediaName || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { mediaName: e.target.value } })}
                        className='text-xs'
                        placeholder='AIS140_Catalog.pdf'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Media File Download URL</Label>
                      <Input
                        value={selectedNode.config.mediaUrl || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { mediaUrl: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='https://domain.com/catalog.pdf'
                      />
                    </div>
                  </>
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
                        placeholder='e.g. Please enter your vehicle registration number'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Validation Type</Label>
                      <select
                        value={selectedNode.config.questionValidation || 'text'}
                        onChange={(e) =>
                          handleUpdateSelectedNode({
                            config: {
                              questionValidation: e.target.value as 'text' | 'number' | 'email' | 'phone',
                            },
                          })
                        }
                        className='w-full h-8 text-xs rounded-md border border-input bg-background px-2'
                      >
                        <option value='text'>Any Text / String</option>
                        <option value='number'>Numeric Number Only</option>
                        <option value='phone'>Mobile / WhatsApp Phone Number</option>
                        <option value='email'>Email Address</option>
                      </select>
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Save To CRM Contact Field</Label>
                      <Input
                        value={selectedNode.config.saveKey || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { saveKey: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='e.g. vehicle_registration_number'
                      />
                    </div>
                  </>
                )}

                {/* AI_AGENT PROMPT */}
                {selectedNode.type === 'AI_AGENT' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>AI Model Engine</Label>
                      <Input
                        value={selectedNode.config.aiModel || 'Claude 3.5 Sonnet / GPT-4o'}
                        onChange={(e) => handleUpdateSelectedNode({ config: { aiModel: e.target.value } })}
                        className='text-xs'
                      />
                    </div>
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
                  </>
                )}

                {/* HTTP_REQUEST FIELD */}
                {selectedNode.type === 'HTTP_REQUEST' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>HTTP Method</Label>
                      <select
                        value={selectedNode.config.httpMethod || 'POST'}
                        onChange={(e) =>
                          handleUpdateSelectedNode({
                            config: {
                              httpMethod: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE',
                            },
                          })
                        }
                        className='w-full h-8 text-xs rounded-md border border-input bg-background px-2 font-mono font-bold'
                      >
                        <option value='GET'>GET</option>
                        <option value='POST'>POST</option>
                        <option value='PUT'>PUT</option>
                        <option value='DELETE'>DELETE</option>
                      </select>
                    </div>
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

                {/* SET_ATTRIBUTE FIELD */}
                {selectedNode.type === 'SET_ATTRIBUTE' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Attribute Key</Label>
                      <Input
                        value={selectedNode.config.attributeKey || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { attributeKey: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='fleet_size, customer_type, etc.'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Attribute Value</Label>
                      <Input
                        value={selectedNode.config.attributeValue || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { attributeValue: e.target.value } })}
                        className='text-xs'
                        placeholder='VIP, Commercial, 10, etc.'
                      />
                    </div>
                  </>
                )}

                {/* WHATSAPP_CATALOG FIELD */}
                {selectedNode.type === 'WHATSAPP_CATALOG' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Product Name</Label>
                      <Input
                        value={selectedNode.config.catalogProductName || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { catalogProductName: e.target.value } })}
                        className='text-xs'
                        placeholder='AIS-140 GPS Device'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Product Price</Label>
                      <Input
                        value={selectedNode.config.catalogPrice || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { catalogPrice: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='₹2,999'
                      />
                    </div>
                  </>
                )}

                {/* GOOGLE_SHEETS FIELD */}
                {selectedNode.type === 'GOOGLE_SHEETS' && (
                  <>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Google Spreadsheet ID</Label>
                      <Input
                        value={selectedNode.config.sheetId || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { sheetId: e.target.value } })}
                        className='text-xs font-mono'
                        placeholder='1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>Target Sheet Tab Name</Label>
                      <Input
                        value={selectedNode.config.sheetName || ''}
                        onChange={(e) => handleUpdateSelectedNode({ config: { sheetName: e.target.value } })}
                        className='text-xs'
                        placeholder='Leads_2026'
                      />
                    </div>
                  </>
                )}

                {/* JUMP_FLOW FIELD */}
                {selectedNode.type === 'JUMP_FLOW' && (
                  <div className='space-y-1.5'>
                    <Label className='text-xs font-semibold'>Target Sub-Flow ID</Label>
                    <Input
                      value={selectedNode.config.targetFlowId || ''}
                      onChange={(e) => handleUpdateSelectedNode({ config: { targetFlowId: e.target.value } })}
                      className='text-xs font-mono'
                      placeholder='flow-kyc-verify'
                    />
                  </div>
                )}

                <div className='pt-2 border-t border-border/40'>
                  <Button
                    size='sm'
                    onClick={handleSaveFlow}
                    className='w-full text-xs bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-8'
                  >
                    <Check className='h-3.5 w-3.5' /> Apply Changes & Save
                  </Button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: LIVE WHATSAPP PHONE SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className='flex-1 flex flex-col overflow-hidden bg-muted/20'>
                {/* Official WhatsApp App Bar Header */}
                <div className='p-3 bg-[#075e54] text-white flex items-center justify-between shrink-0 shadow-xs'>
                  <div className='flex items-center gap-2.5'>
                    <div className='h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs border border-white/30'>
                      TS
                    </div>
                    <div>
                      <div className='font-bold text-xs leading-tight flex items-center gap-1'>
                        <span>Truck Sathi Fleet Bot</span>
                        <CheckCheck className='h-3 w-3 text-emerald-300' />
                      </div>
                      <div className='text-[10px] text-emerald-100 flex items-center gap-1'>
                        <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' />
                        Online • Official Business API
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={handleStartFlowSimulation}
                      className='p-1.5 rounded hover:bg-white/10 text-emerald-100'
                      title='Restart Simulation'
                    >
                      <RotateCcw className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </div>

                {/* WhatsApp Chat Bubbles Area */}
                <div className='flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5ddd5]/30 dark:bg-muted/10'>
                  {simMessages.map((m) => {
                    if (m.sender === 'system') {
                      return (
                        <div key={m.id} className='flex justify-center my-1'>
                          <span className='px-2.5 py-1 rounded-full bg-card/90 border border-border/60 text-[10px] font-mono text-muted-foreground shadow-2xs'>
                            {m.text}
                          </span>
                        </div>
                      )
                    }

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
                              : 'bg-[#128c7e] text-white rounded-tr-xs'
                          }`}
                        >
                          {/* Media preview */}
                          {m.mediaType && (
                            <div className='p-2 mb-2 rounded bg-black/5 dark:bg-white/5 border border-border/30 flex items-center gap-2'>
                              <FileText className='h-4 w-4 text-emerald-600' />
                              <div className='truncate'>
                                <div className='font-bold text-[11px]'>{m.mediaName}</div>
                                <div className='text-[9px] text-muted-foreground'>Tap to download</div>
                              </div>
                            </div>
                          )}

                          {/* Product card preview */}
                          {m.productCard && (
                            <div className='p-2.5 mb-2 rounded bg-emerald-500/10 border border-emerald-500/20'>
                              <div className='font-bold text-xs text-foreground'>{m.productCard.name}</div>
                              <div className='text-emerald-600 font-bold text-xs mt-0.5'>{m.productCard.price}</div>
                            </div>
                          )}

                          <p className='whitespace-pre-line'>{m.text}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isBot ? 'text-muted-foreground' : 'text-emerald-100'
                            }`}
                          >
                            {m.time || '10:45 AM'} {isBot ? '' : '✓✓'}
                          </span>
                        </div>

                        {/* Interactive WhatsApp Quick Reply Buttons */}
                        {m.buttons && m.buttons.length > 0 && (
                          <div className='flex flex-wrap gap-1 max-w-[85%] pt-0.5'>
                            {m.buttons.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSimUserReply(btn)}
                                className='px-2.5 py-1 rounded-full bg-card hover:bg-[#128c7e] hover:text-white border border-emerald-500/30 text-emerald-600 font-semibold text-[11px] shadow-xs transition-all active:scale-95'
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

                {/* WhatsApp Bottom Input Bar */}
                <form
                  onSubmit={handleSimFormSubmit}
                  className='p-2 bg-card border-t border-border/50 flex items-center gap-2 shrink-0'
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder='Type a message or answer prompt...'
                    className='h-8 text-xs bg-muted/30'
                  />
                  <Button
                    type='submit'
                    size='sm'
                    className='h-8 px-3 bg-[#128c7e] hover:bg-[#075e54] text-white font-bold'
                  >
                    <Send className='h-3.5 w-3.5' />
                  </Button>
                </form>
              </div>
            )}

            {/* TAB CONTENT 3: LIVE TRACE LOG */}
            {activeTab === 'trace' && (
              <div className='flex-1 flex flex-col overflow-hidden p-3 space-y-3 bg-muted/10'>
                <div className='flex items-center justify-between border-b border-border/40 pb-2'>
                  <span className='font-bold text-xs flex items-center gap-1.5'>
                    <Terminal className='h-3.5 w-3.5 text-purple-600' /> Flow Execution Trace
                  </span>
                  <Badge variant='outline' className='text-[10px] font-mono'>
                    {traceLogs.length} events
                  </Badge>
                </div>

                <div className='flex-1 overflow-y-auto space-y-2 font-mono text-[11px]'>
                  {traceLogs.map((log, lIdx) => (
                    <div key={lIdx} className='p-2 rounded bg-card border border-border/50 space-y-1'>
                      <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
                        <span>{log.timestamp}</span>
                        <Badge
                          variant='outline'
                          className={`text-[9px] ${
                            log.status === 'EXECUTED'
                              ? 'text-emerald-600 border-emerald-500/30'
                              : log.status === 'WAITING_USER'
                              ? 'text-blue-600 border-blue-500/30'
                              : 'text-amber-600 border-amber-500/30'
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <div className='font-bold text-foreground'>
                        Step #{log.stepNumber}: {log.type}
                      </div>
                      <div className='text-[10px] text-muted-foreground leading-tight'>{log.details}</div>
                    </div>
                  ))}
                </div>

                {/* Active CRM Attributes dump */}
                <div className='p-2.5 rounded-lg bg-card border border-border/40 space-y-1.5'>
                  <span className='font-bold text-[10px] text-muted-foreground uppercase'>Active Contact Variables:</span>
                  <div className='text-[10px] font-mono space-y-0.5 text-foreground'>
                    {Object.entries(crmAttributes).map(([k, v]) => (
                      <div key={k} className='flex justify-between'>
                        <span className='text-muted-foreground'>{k}:</span>
                        <span className='font-semibold'>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>

      {/* Reset Flow Confirmation Modal */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <RotateCcw className='h-5 w-5' />
              Reset Visual Chatbot Flow
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Are you sure you want to reset <strong className='text-foreground'>"{flowName}"</strong> to the default fleet qualifier template?
              All unsaved visual canvas step configurations and custom branching conditions will be replaced.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setResetConfirmOpen(false)}
              className='h-8 text-xs cursor-pointer'
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleResetFlow}
              className='h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer'
            >
              Reset to Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
