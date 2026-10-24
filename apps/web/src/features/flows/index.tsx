import { useState, useCallback } from 'react'
import {
  Workflow,
  Plus,
  CheckCircle2,
  Trash2,
  Play,
  Search,
  ArrowRight,
  Copy,
  Check,
  MoreVertical,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Map as MapIcon,
  MessageSquare,
  Filter,
  UserCheck,
  ArrowLeft,
  ChevronRight,
  Globe,
  Settings,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
}

function generateFlowUid(): string {
  return `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
}

function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const initialDefaultNodes: CanvasStepNode[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    type: 'TRIGGER',
    title: 'Text Message Received',
    subtitle: 'Official WhatsApp Inbound Listener',
    configured: true,
    connectionId: 'bizautomation-whatsapp',
    webhookPath: 'https://app.whatsapi.io/api/v2/webhook/flows/69bcebb0e5ee4a263120eecf',
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
]

const initialFlowsData: FlowItem[] = [
  {
    id: 'flow-hot-lead',
    flowUid: '69bcebb0e5ee4a263120eecf',
    name: 'Hot Lead',
    trigger: 'Text Message Received',
    steps: 3,
    runs: 4892,
    active: true,
    lastRun: 'Just now',
    nodes: initialDefaultNodes,
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

function CodeViewerWithLineNumbers({ data }: { data: unknown }) {
  const lines = JSON.stringify(data, null, 2).split('\n')
  return (
    <div className='flex font-mono text-[11px] leading-relaxed select-text py-0.5'>
      <div className='select-none pr-3 text-right text-muted-foreground/35 font-mono min-w-[28px] shrink-0 border-r border-border/30 mr-3'>
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className='text-muted-foreground font-mono overflow-x-auto whitespace-pre'>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  )
}

export function Flows() {
  const [flowsList, setFlowsList] = useState<FlowItem[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_automation_flows_v2')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Use defaults
    }
    return initialFlowsData
  })

  // Studio Mode: Currently active flow (defaults to 'Hot Lead' matching the user's screenshot)
  const [activeFlowId, setActiveFlowId] = useState<string | null>('flow-hot-lead')
  const [selectedNodeId, setSelectedNodeId] = useState<string>('step-1')

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [showMinimap, setShowMinimap] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Execution Debugger / Test Results Panel
  const [activeTestTab, setActiveTestTab] = useState<'input' | 'output' | 'errors'>('output')
  const [isExecutingTest, setIsExecutingTest] = useState<boolean>(false)
  const [executingStepIndex, setExecutingStepIndex] = useState<number | null>(null)
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false)
  const [copiedJson, setCopiedJson] = useState<boolean>(false)

  // Insert Step Dialog
  const [insertModalOpen, setInsertModalOpen] = useState<boolean>(false)
  const [insertAfterStep, setInsertAfterStep] = useState<number>(1)

  // Create Flow Modal
  const [createFlowModal, setCreateFlowModal] = useState<boolean>(false)
  const [newFlowName, setNewFlowName] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Live' | 'Draft'>('All')

  // Current active flow object
  const activeFlow = flowsList.find((f) => f.id === activeFlowId) || flowsList[0]
  const selectedNode = activeFlow?.nodes.find((n) => n.id === selectedNodeId) || activeFlow?.nodes[0]

  // Persist flows
  const persistFlows = useCallback((updated: FlowItem[]) => {
    setFlowsList(updated)
    try {
      localStorage.setItem('whatsapi_automation_flows_v2', JSON.stringify(updated))
    } catch (_err) {
      // Ignore storage error
    }
  }, [])

  // Toggle Live / Draft (Publish / Unpublish)
  const handleTogglePublish = () => {
    if (!activeFlow) return
    const nextStatus = !activeFlow.active
    const updated = flowsList.map((f) => (f.id === activeFlow.id ? { ...f, active: nextStatus } : f))
    persistFlows(updated)
    toast(nextStatus ? 'Flow Published (Live)' : 'Flow Unpublished (Draft)', {
      description: nextStatus
        ? `"${activeFlow.name}" is now live and listening to incoming webhooks.`
        : `"${activeFlow.name}" is paused. Inbound webhooks will be queued.`,
    })
  }

  // Real-time Test Execution Simulator
  const handleRunRealtimeTest = () => {
    if (isExecutingTest) return
    setIsExecutingTest(true)
    setExecutingStepIndex(0)
    toast.info('Triggering live flow test...', {
      description: `Dispatched sample WhatsApp webhook payload to "${activeFlow.name}".`,
    })

    // Step-by-step sequential node animation
    const totalSteps = activeFlow.nodes.length
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep += 1
      if (currentStep < totalSteps) {
        setExecutingStepIndex(currentStep)
      } else {
        clearInterval(interval)
        setIsExecutingTest(false)
        setExecutingStepIndex(null)
        setActiveTestTab('output')

        // Update run counter
        const updated = flowsList.map((f) =>
          f.id === activeFlow.id ? { ...f, runs: f.runs + 1, lastRun: 'Just now' } : f
        )
        persistFlows(updated)

        toast.success('Live Flow Test Completed Successfully (200 OK)!', {
          description: `All ${totalSteps} nodes verified in 142ms. Output payload available below.`,
        })
      }
    }, 450)
  }

  // Copy Webhook URL
  const handleCopyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedWebhook(true)
    toast.success('Webhook URL Copied to Clipboard!', {
      description: 'Paste this URL into Meta Developers or your CRM service.',
    })
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  // Copy Output JSON
  const handleCopyOutputJson = (jsonString: string) => {
    navigator.clipboard.writeText(jsonString)
    setCopiedJson(true)
    toast.success('Test output JSON copied to clipboard!')
    setTimeout(() => setCopiedJson(false), 2000)
  }

  // Insert a new step node into flow
  const handleInsertStepNode = (
    type: CanvasStepNode['type'],
    title: string,
    subtitle: string
  ) => {
    if (!activeFlow) return
    const newNode: CanvasStepNode = {
      id: generateNodeId(),
      stepNumber: insertAfterStep + 1,
      type,
      title,
      subtitle,
      configured: true,
      connectionId: 'bizautomation-whatsapp',
      config: {
        matchText: type === 'TRIGGER' ? 'New event' : undefined,
        conditionRule: type === 'CONDITION' ? 'contact.optIn == true' : undefined,
        assignTag: type === 'CRM' ? 'qualified-lead' : undefined,
        messageText: type === 'ACTION' ? 'Welcome from Whatsapi!' : undefined,
      },
    }

    const updatedNodes: CanvasStepNode[] = []
    let stepCount = 1

    activeFlow.nodes.forEach((node, idx) => {
      updatedNodes.push({ ...node, stepNumber: stepCount })
      stepCount += 1
      if (idx + 1 === insertAfterStep) {
        updatedNodes.push({ ...newNode, stepNumber: stepCount })
        stepCount += 1
      }
    })

    const updated = flowsList.map((f) =>
      f.id === activeFlow.id
        ? { ...f, steps: updatedNodes.length, nodes: updatedNodes }
        : f
    )
    persistFlows(updated)
    setSelectedNodeId(newNode.id)
    setInsertModalOpen(false)
    toast.success(`Inserted "${title}" into flow pipeline!`)
  }

  // Delete a step node
  const handleDeleteNode = (nodeId: string) => {
    if (!activeFlow || activeFlow.nodes.length <= 1) {
      toast.error('A flow must have at least one trigger node.')
      return
    }
    const filtered = activeFlow.nodes.filter((n) => n.id !== nodeId)
    const renumbered = filtered.map((n, i) => ({ ...n, stepNumber: i + 1 }))
    const updated = flowsList.map((f) =>
      f.id === activeFlow.id ? { ...f, steps: renumbered.length, nodes: renumbered } : f
    )
    persistFlows(updated)
    setSelectedNodeId(renumbered[0].id)
    toast.info('Step removed from flow.')
  }

  // Sample Output JSON matching the screenshot
  const outputPayload = {
    senderName: 'Shahrup Sk',
    senderPhoneNumber: '919881145178',
    recipientPhoneNumberId: '942534582278953',
    messageId: 'wamId.HBgNOTE5MDgxMTQ1NTc4FQIAEhggOUNDNDFGMDA',
    messageTimestamp: '1709373911',
    messageType: 'text',
    content: {
      text: 'Hi, I need pricing for 10 commercial fleet AIS-140 GPS trackers.',
    },
    flowMetadata: {
      flowId: activeFlow?.flowUid || '69bcebb0e5ee4a263120eecf',
      flowName: activeFlow?.name || 'Hot Lead',
      status: activeFlow?.active ? 'LIVE' : 'DRAFT',
      stepsExecuted: activeFlow?.nodes.length || 3,
      executionDuration: '142ms',
    },
  }

  const inputPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '942534582278953',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '917698580043',
                phone_number_id: '942534582278953',
              },
              contacts: [{ profile: { name: 'Shahrup Sk' }, wa_id: '919881145178' }],
              messages: [
                {
                  from: '919881145178',
                  id: 'wamId.HBgNOTE5MDgxMTQ1NTc4FQIAEhggOUNDNDFGMDA',
                  timestamp: '1709373911',
                  text: { body: 'Hi, I need pricing for 10 commercial fleet AIS-140 GPS trackers.' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }

  const getNodeIcon = (type: CanvasStepNode['type']) => {
    switch (type) {
      case 'TRIGGER':
        return <MessageSquare className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
      case 'CONDITION':
        return <Filter className='h-5 w-5 text-amber-600 dark:text-amber-400' />
      case 'ACTION':
        return <Globe className='h-5 w-5 text-blue-600 dark:text-blue-400' />
      case 'CRM':
        return <UserCheck className='h-5 w-5 text-orange-600 dark:text-orange-400' />
      case 'AI':
        return <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
      case 'DELAY':
        return <Clock className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
      default:
        return <Workflow className='h-5 w-5 text-foreground' />
    }
  }

  const getNodeBg = (type: CanvasStepNode['type']) => {
    switch (type) {
      case 'TRIGGER':
        return 'bg-emerald-500/10 border-emerald-500/20'
      case 'CONDITION':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'ACTION':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'CRM':
        return 'bg-orange-500/10 border-orange-500/20'
      case 'AI':
        return 'bg-purple-500/10 border-purple-500/20'
      default:
        return 'bg-muted/40 border-border/40'
    }
  }

  // ==========================================
  // VIEW 1: BIZAUTOMATION FLOW CANVAS STUDIO
  // ==========================================
  if (activeFlowId && activeFlow) {
    const liveWebhookUrl = `https://app.whatsapi.io/api/v2/webhook/flows/${activeFlow.flowUid}`

    return (
      <div className={`flex flex-col h-screen overflow-hidden bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Top App Header */}
        <Header fixed>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <button
              onClick={() => setActiveFlowId(null)}
              className='hover:text-foreground font-medium flex items-center gap-1 cursor-pointer'
            >
              <ArrowLeft className='h-3.5 w-3.5' /> Dashboard
            </button>
            <ChevronRight className='h-3.5 w-3.5 opacity-50' />
            <button
              onClick={() => setActiveFlowId(null)}
              className='hover:text-foreground font-medium cursor-pointer'
            >
              Flows
            </button>
            <ChevronRight className='h-3.5 w-3.5 opacity-50' />
            <span className='font-mono text-foreground font-semibold'>{activeFlow.flowUid}</span>
          </div>
          <div className='ms-auto flex items-center gap-2'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        {/* Studio Sub-Header: Flow Title, Status & Publish Actions */}
        <div className='bg-card border-b border-border/60 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <h1 className='text-lg font-bold tracking-tight text-foreground'>{activeFlow.name}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                  activeFlow.active
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeFlow.active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                {activeFlow.active ? 'Live' : 'Draft'}
              </span>
            </div>
            <span className='text-xs text-muted-foreground hidden md:inline'>
              Edit your automation flow and publish when ready
            </span>
          </div>

          <div className='flex items-center gap-2.5'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setActiveFlowId(null)}
              className='h-8 text-xs cursor-pointer'
            >
              Back to Flows
            </Button>
            <Button
              size='sm'
              onClick={handleTogglePublish}
              className={`h-8 px-4 text-xs font-semibold rounded-md shadow-xs cursor-pointer transition-colors ${
                activeFlow.active
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {activeFlow.active ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Main Canvas + Right Sidebars Split View */}
        <div className='flex-1 flex overflow-hidden relative'>
          {/* Central Workflow Graph Canvas */}
          <div className='flex-1 relative overflow-auto bg-muted/10 [background-image:radial-gradient(circle,#d1d5db_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,#374151_1px,transparent_1px)] [background-size:24px_24px]'>
            {/* Top-Right Floating Controls (Minimap, Fit View, Fullscreen) */}
            <div className='absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border/70 rounded-lg p-1 shadow-xs'>
              <Button
                variant={showMinimap ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setShowMinimap(!showMinimap)}
                className='h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium'
              >
                <MapIcon className='h-3.5 w-3.5' /> Minimap
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setZoomLevel(100)}
                className='h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium'
              >
                Fit View
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsFullscreen(!isFullscreen)}
                className='h-7 px-2 text-xs cursor-pointer'
              >
                {isFullscreen ? <Minimize2 className='h-3.5 w-3.5' /> : <Maximize2 className='h-3.5 w-3.5' />}
              </Button>
            </div>

            {/* Bottom-Left Floating Zoom & Lock Controls */}
            <div className='absolute bottom-6 left-6 z-20 flex flex-col gap-1 bg-card/95 backdrop-blur-md border border-border/70 rounded-lg p-1 shadow-md'>
              <button
                type='button'
                onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
                className='p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                title='Zoom In'
              >
                <ZoomIn className='h-4 w-4' />
              </button>
              <button
                type='button'
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className='p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                title='Zoom Out'
              >
                <ZoomOut className='h-4 w-4' />
              </button>
              <div className='h-px bg-border/60 my-0.5' />
              <button
                type='button'
                onClick={() => setIsLocked(!isLocked)}
                className='p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                title={isLocked ? 'Unlock Canvas' : 'Lock Canvas'}
              >
                {isLocked ? <Lock className='h-4 w-4 text-orange-600' /> : <Unlock className='h-4 w-4' />}
              </button>
              <div className='text-[10px] text-center font-mono text-muted-foreground font-semibold pb-0.5'>
                {zoomLevel}%
              </div>
            </div>

            {/* Floating Minimap Picture-in-Picture */}
            {showMinimap && (
              <div className='absolute bottom-6 right-6 z-20 w-48 h-36 bg-card/95 backdrop-blur-md border border-border/80 rounded-lg shadow-lg p-2.5 flex flex-col justify-between'>
                <div className='text-[10px] font-semibold text-muted-foreground flex items-center justify-between'>
                  <span>CANVAS OVERVIEW</span>
                  <Badge variant='outline' className='text-[9px] h-4 px-1'>
                    {activeFlow.nodes.length} Nodes
                  </Badge>
                </div>
                <div className='flex-1 flex flex-col items-center justify-center gap-1.5 my-1 bg-muted/30 rounded border border-border/40 p-1'>
                  {activeFlow.nodes.map((n) => (
                    <div
                      key={n.id}
                      className={`h-2.5 w-16 rounded-xs ${n.id === selectedNodeId ? 'bg-orange-500 ring-1 ring-orange-400' : 'bg-muted-foreground/40'}`}
                    />
                  ))}
                </div>
                <span className='text-[9px] text-muted-foreground/80 text-center font-mono'>100% In View</span>
              </div>
            )}

            {/* Canvas Nodes Stack (Center Flow Sequence) */}
            <div
              className='min-h-full py-14 px-8 flex flex-col items-center justify-start transition-transform duration-200 origin-top'
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {activeFlow.nodes.map((node, index) => {
                const isSelected = node.id === selectedNodeId
                const isStepExecuting = executingStepIndex === index

                return (
                  <div key={node.id} className='flex flex-col items-center w-full max-w-sm'>
                    {/* Node Card */}
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full rounded-xl border bg-card p-4 transition-all duration-200 cursor-pointer relative shadow-xs ${
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                          : 'border-border/70 hover:border-border hover:shadow-xs'
                      } ${isStepExecuting ? 'ring-4 ring-emerald-500/40 border-emerald-500 animate-pulse' : ''}`}
                    >
                      {/* Top Row: Icon, Title, Status & Three-dots Menu */}
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                          <div className={`p-2.5 rounded-lg border ${getNodeBg(node.type)}`}>
                            {getNodeIcon(node.type)}
                          </div>
                          <div>
                            <div className='font-bold text-sm text-foreground flex items-center gap-1.5'>
                              {node.title}
                            </div>
                            <div className='text-xs text-muted-foreground font-normal line-clamp-1'>
                              {node.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-1'>
                          {node.configured && (
                            <div className='h-5 w-5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center' title='Configured'>
                              <CheckCircle2 className='h-3.5 w-3.5' />
                            </div>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type='button'
                                onClick={(e) => e.stopPropagation()}
                                className='p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer'
                              >
                                <MoreVertical className='h-4 w-4' />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-40 text-xs'>
                              <DropdownMenuItem onClick={() => setSelectedNodeId(node.id)}>
                                <Settings className='h-3.5 w-3.5 me-2' /> Configure Step
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteNode(node.id)}
                                className='text-red-600 focus:text-red-600'
                              >
                                <Trash2 className='h-3.5 w-3.5 me-2' /> Delete Step
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Bottom Status Chip (Configured pill) */}
                      <div className='mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between'>
                        <span className='inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md'>
                          <Settings className='h-3 w-3' /> Configured
                        </span>
                        <span className='text-[10px] text-muted-foreground font-mono'>
                          Step {node.stepNumber} of {activeFlow.nodes.length}
                        </span>
                      </div>
                    </div>

                    {/* Connector Arrow & Circular Plus Button */}
                    {index < activeFlow.nodes.length - 1 && (
                      <div className='relative flex flex-col items-center my-3.5'>
                        {/* Vertical line */}
                        <div className='w-0.5 h-12 bg-orange-500/70' />
                        {/* Arrow Head */}
                        <div className='w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-orange-500/80 -mt-0.5' />

                        {/* Floating Orange + Button */}
                        <button
                          type='button'
                          onClick={() => {
                            setInsertAfterStep(node.stepNumber)
                            setInsertModalOpen(true)
                          }}
                          className='absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md hover:bg-orange-700 hover:scale-110 transition-all cursor-pointer'
                          title='Insert automation step here'
                        >
                          <Plus className='h-3.5 w-3.5 stroke-[3]' />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* End of Flow Terminator / Add Final Step Button */}
              <div className='mt-5 flex flex-col items-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setInsertAfterStep(activeFlow.nodes.length)
                    setInsertModalOpen(true)
                  }}
                  className='h-8 text-xs border-dashed border-border/80 hover:border-orange-500 text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-lg px-4'
                >
                  <Plus className='h-3.5 w-3.5 text-orange-600' /> Add Next Step
                </Button>
              </div>
            </div>
          </div>

          {/* Right Inspector & Node Settings Panel */}
          <div className='w-96 border-l border-border/60 bg-card flex flex-col shrink-0 shadow-sm overflow-hidden'>
            {/* Inspector Header: Node Title */}
            <div className='p-4 border-b border-border/60 flex items-center justify-between bg-muted/20'>
              <div>
                <h3 className='font-bold text-sm text-foreground'>{selectedNode.title}</h3>
                <p className='text-xs text-muted-foreground font-mono mt-0.5'>
                  Type: {selectedNode.type}
                </p>
              </div>
              <Badge variant='outline' className='text-[10px] font-mono'>
                Step {selectedNode.stepNumber}
              </Badge>
            </div>

            {/* Inspector Body: Scrollable Config Form */}
            <div className='flex-1 overflow-y-auto p-4 space-y-5 text-xs'>
              {/* Connection Selector */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                  <Globe className='h-3.5 w-3.5 text-orange-600' /> Connection
                </Label>
                <div className='flex items-center gap-1.5'>
                  <select
                    value={selectedNode.connectionId || 'bizautomation-whatsapp'}
                    onChange={(e) => {
                      const updatedNodes = activeFlow.nodes.map((n) =>
                        n.id === selectedNode.id ? { ...n, connectionId: e.target.value } : n
                      )
                      const updated = flowsList.map((f) =>
                        f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f
                      )
                      persistFlows(updated)
                    }}
                    className='flex-1 h-9 rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:border-orange-500'
                  >
                    <option value='bizautomation-whatsapp'>bizautomation-whatsapp</option>
                    <option value='whatsapi-meta-cloud-api'>whatsapi-meta-cloud-api (Official)</option>
                    <option value='indiamart-webhook-api'>indiamart-webhook-api</option>
                  </select>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 shrink-0 cursor-pointer'
                    onClick={() => toast.info('New connection setup available in Apps & Integrations.')}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-[11px] text-muted-foreground'>
                  Choose the connection to use for this step
                </p>
              </div>

              {/* Webhook URL Section (Matches Screenshot) */}
              <div className='rounded-lg border border-border/60 bg-muted/15 p-3 space-y-2'>
                <div className='font-semibold text-xs text-foreground flex items-center gap-1'>
                  <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' /> Webhook
                </div>
                <div className='relative flex items-center'>
                  <Input
                    readOnly
                    value={liveWebhookUrl}
                    className='h-8 text-[11px] font-mono pr-8 bg-background'
                  />
                  <button
                    type='button'
                    onClick={() => handleCopyWebhookUrl(liveWebhookUrl)}
                    className='absolute right-2 p-1 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='Copy Webhook URL'
                  >
                    {copiedWebhook ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
                  </button>
                </div>
                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  Use this URL to receive data from external services.
                </p>
              </div>

              {/* Dynamic Context Settings by Node Type */}
              {selectedNode.type === 'TRIGGER' && (
                <div className='space-y-3 pt-1'>
                  <Label className='text-xs font-semibold'>Trigger Event Filter</Label>
                  <Input
                    value={selectedNode.config.matchText || ''}
                    placeholder='e.g., * (All messages) or keyword: price'
                    onChange={(e) => {
                      const updatedNodes = activeFlow.nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, matchText: e.target.value } }
                          : n
                      )
                      persistFlows(
                        flowsList.map((f) => (f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f))
                      )
                    }}
                    className='h-8 text-xs'
                  />
                  <div className='rounded bg-muted/30 p-2 text-[11px] text-muted-foreground space-y-1'>
                    <div>• Listens to WhatsApp Cloud API webhook on port 4000</div>
                    <div>• Dispatches instantaneous payload to Step 2</div>
                  </div>
                </div>
              )}

              {selectedNode.type === 'CONDITION' && (
                <div className='space-y-3 pt-1'>
                  <Label className='text-xs font-semibold'>Condition Expression</Label>
                  <Input
                    value={selectedNode.config.conditionRule || ''}
                    placeholder='e.g., message.text contains "price"'
                    onChange={(e) => {
                      const updatedNodes = activeFlow.nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, conditionRule: e.target.value } }
                          : n
                      )
                      persistFlows(
                        flowsList.map((f) => (f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f))
                      )
                    }}
                    className='h-8 text-xs font-mono'
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    Flow will only branch & continue if the condition evaluates to true.
                  </p>
                </div>
              )}

              {selectedNode.type === 'CRM' && (
                <div className='space-y-3 pt-1'>
                  <div>
                    <Label className='text-xs font-semibold'>Assign Contact Tag</Label>
                    <Input
                      value={selectedNode.config.assignTag || 'hot-lead'}
                      onChange={(e) => {
                        const updatedNodes = activeFlow.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, config: { ...n.config, assignTag: e.target.value } }
                            : n
                        )
                        persistFlows(
                          flowsList.map((f) => (f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f))
                        )
                      }}
                      className='h-8 text-xs mt-1'
                    />
                  </div>
                  <div>
                    <Label className='text-xs font-semibold'>Route to Agent</Label>
                    <select
                      value={selectedNode.config.assignAgent || 'Agent Bhavik'}
                      onChange={(e) => {
                        const updatedNodes = activeFlow.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, config: { ...n.config, assignAgent: e.target.value } }
                            : n
                        )
                        persistFlows(
                          flowsList.map((f) => (f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f))
                        )
                      }}
                      className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                    >
                      <option value='Agent Bhavik'>Agent Bhavik (Sales Team)</option>
                      <option value='Vikram Patel'>Vikram Patel (Ahmedabad Fleet)</option>
                      <option value='Round Robin'>Round Robin (First Available Agent)</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedNode.type === 'ACTION' && (
                <div className='space-y-3 pt-1'>
                  <Label className='text-xs font-semibold'>Outbound Message Template</Label>
                  <Input
                    value={selectedNode.config.messageText || ''}
                    placeholder='e.g., commercial_fleet_intro'
                    onChange={(e) => {
                      const updatedNodes = activeFlow.nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, messageText: e.target.value } }
                          : n
                      )
                      persistFlows(
                        flowsList.map((f) => (f.id === activeFlow.id ? { ...f, nodes: updatedNodes } : f))
                      )
                    }}
                    className='h-8 text-xs'
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    Approved Meta WhatsApp Cloud API template will be dispatched immediately.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom-Right Execution Debugger Panel (Exact match to screenshot) */}
            <div className='border-t border-border/70 bg-card flex flex-col h-72 shrink-0'>
              {/* Debugger Header */}
              <div className='px-3.5 py-2 border-b border-border/50 flex items-center justify-between bg-muted/20'>
                <div className='flex items-center gap-2'>
                  <span className='h-2 w-2 rounded-full border border-muted-foreground/60' />
                  <span className='font-bold text-xs text-foreground'>Test Results</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    disabled={isExecutingTest}
                    onClick={handleRunRealtimeTest}
                    className='h-7 px-2.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer gap-1 shadow-xs'
                  >
                    <Play className={`h-3 w-3 fill-white ${isExecutingTest ? 'animate-spin' : ''}`} />
                    {isExecutingTest ? 'Running...' : 'Run Test'}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleCopyOutputJson(JSON.stringify(outputPayload, null, 2))}
                    className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1'
                  >
                    {copiedJson ? <Check className='h-3 w-3 text-emerald-600' /> : <Copy className='h-3 w-3' />}
                    Copy
                  </Button>
                </div>
              </div>

              {/* Debugger Tabs */}
              <div className='flex items-center border-b border-border/40 px-3 bg-muted/10 text-xs'>
                <button
                  type='button'
                  onClick={() => setActiveTestTab('input')}
                  className={`py-1.5 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTestTab === 'input'
                      ? 'border-orange-600 text-orange-600 font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Input
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTestTab('output')}
                  className={`py-1.5 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTestTab === 'output'
                      ? 'border-orange-600 text-orange-600 font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Output
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTestTab('errors')}
                  className={`py-1.5 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTestTab === 'errors'
                      ? 'border-orange-600 text-orange-600 font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Errors
                </button>
              </div>

              {/* Code Viewer with Line Numbers (Matches Screenshot) */}
              <div className='flex-1 p-2.5 overflow-auto font-mono text-[11px] leading-relaxed bg-background/50 select-text'>
                {activeTestTab === 'output' && (
                  <CodeViewerWithLineNumbers data={outputPayload} />
                )}
                {activeTestTab === 'input' && (
                  <CodeViewerWithLineNumbers data={inputPayload} />
                )}
                {activeTestTab === 'errors' && (
                  <div className='p-3 text-emerald-600 dark:text-emerald-400 font-sans text-xs flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4' /> No errors detected. Flow syntax and runtime nodes verified 100% active.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INSERT STEP NODE DIALOG */}
        <Dialog open={insertModalOpen} onOpenChange={setInsertModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Plus className='h-4 w-4 text-orange-600' />
                Insert Automation Step
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Choose a trigger, logic rule, WhatsApp action, or CRM operation to insert into your pipeline.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-2.5 py-3 text-xs'>
              <button
                type='button'
                onClick={() =>
                  handleInsertStepNode('CONDITION', 'Continue if conditions match', 'Evaluate variable or keyword rules')
                }
                className='p-3 rounded-lg border border-border/70 hover:border-orange-500 hover:bg-orange-500/5 text-left flex flex-col gap-1 cursor-pointer transition-all'
              >
                <div className='font-bold text-foreground flex items-center gap-1.5'>
                  <Filter className='h-4 w-4 text-amber-500' /> Condition Filter
                </div>
                <div className='text-[11px] text-muted-foreground'>Branch pipeline based on keyword or opt-in status</div>
              </button>

              <button
                type='button'
                onClick={() =>
                  handleInsertStepNode('CRM', 'Update Contact', 'Assign tags, lead status, or team agent')
                }
                className='p-3 rounded-lg border border-border/70 hover:border-orange-500 hover:bg-orange-500/5 text-left flex flex-col gap-1 cursor-pointer transition-all'
              >
                <div className='font-bold text-foreground flex items-center gap-1.5'>
                  <UserCheck className='h-4 w-4 text-orange-500' /> Update Contact
                </div>
                <div className='text-[11px] text-muted-foreground'>Sync to CRM, add tags, or assign to live agent</div>
              </button>

              <button
                type='button'
                onClick={() =>
                  handleInsertStepNode('ACTION', 'Send WhatsApp Message', 'Dispatch text or approved Meta template')
                }
                className='p-3 rounded-lg border border-border/70 hover:border-orange-500 hover:bg-orange-500/5 text-left flex flex-col gap-1 cursor-pointer transition-all'
              >
                <div className='font-bold text-foreground flex items-center gap-1.5'>
                  <Globe className='h-4 w-4 text-blue-500' /> Send WhatsApp
                </div>
                <div className='text-[11px] text-muted-foreground'>Dispatch interactive message or Meta template</div>
              </button>

              <button
                type='button'
                onClick={() =>
                  handleInsertStepNode('AI', 'Google Gemini AI Reply', 'Generative contextual customer assistance')
                }
                className='p-3 rounded-lg border border-border/70 hover:border-orange-500 hover:bg-orange-500/5 text-left flex flex-col gap-1 cursor-pointer transition-all'
              >
                <div className='font-bold text-foreground flex items-center gap-1.5'>
                  <Sparkles className='h-4 w-4 text-purple-500' /> AI Auto-Reply
                </div>
                <div className='text-[11px] text-muted-foreground'>Answer query grounded in uploaded knowledge base</div>
              </button>
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setInsertModalOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: ALL FLOWS DIRECTORY & OVERVIEW
  // ==========================================
  const filteredFlows = flowsList.filter((f) => {
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Live' && f.active) ||
      (statusFilter === 'Draft' && !f.active)
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.trigger.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Workflow className='h-4 w-4 text-orange-600' />
          <span>Automation Flows Engine</span>
          <Badge className='bg-orange-500/10 text-orange-600 border-0 text-[10px] hidden sm:inline-flex'>
            Visual Webhook Pipelines
          </Badge>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4'>
        {/* Header Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Visual Automation Flows</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                {flowsList.filter((f) => f.active).length} Active Pipelines
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Event-driven automation pipelines connecting WhatsApp webhooks, filters, CRM tags, and Meta Cloud API dispatches
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => setCreateFlowModal(true)}
            className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 cursor-pointer font-semibold shadow-xs h-9'
          >
            <Plus className='h-3.5 w-3.5' /> Create Flow
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40'>
          <div className='flex items-center gap-1.5'>
            {(['All', 'Live', 'Draft'] as const).map((tab) => (
              <button
                key={tab}
                type='button'
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab}{' '}
                <span className='opacity-80 text-[10px]'>
                  (
                  {tab === 'All'
                    ? flowsList.length
                    : tab === 'Live'
                    ? flowsList.filter((f) => f.active).length
                    : flowsList.filter((f) => !f.active).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              placeholder='Search flows or triggers...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8 pl-8 text-xs bg-background'
            />
          </div>
        </div>

        {/* Flows Table */}
        <div className='rounded-xl border border-border/60 bg-card overflow-x-auto shadow-xs'>
          <table className='w-full text-xs'>
            <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/60'>
              <tr className='text-left whitespace-nowrap'>
                <th className='p-3 font-medium'>Flow Name</th>
                <th className='p-3 font-medium'>Trigger</th>
                <th className='p-3 font-medium'>Steps</th>
                <th className='p-3 font-medium'>Executions</th>
                <th className='p-3 font-medium'>Status</th>
                <th className='p-3 font-medium'>Last Run</th>
                <th className='p-3 font-medium text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={7} className='p-8 text-center text-muted-foreground'>
                    No flows found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => (
                  <tr
                    key={flow.id}
                    onClick={() => {
                      setActiveFlowId(flow.id)
                      setSelectedNodeId(flow.nodes[0]?.id || 'step-1')
                    }}
                    className='whitespace-nowrap hover:bg-muted/30 transition-colors cursor-pointer'
                  >
                    <td className='p-3 font-bold text-foreground flex items-center gap-2'>
                      <div className='p-1.5 rounded-md bg-orange-500/10 text-orange-600'>
                        <Workflow className='h-4 w-4' />
                      </div>
                      <div>
                        <div>{flow.name}</div>
                        <div className='text-[10px] text-muted-foreground font-mono font-normal'>
                          {flow.flowUid}
                        </div>
                      </div>
                    </td>
                    <td className='p-3 font-medium text-foreground'>{flow.trigger}</td>
                    <td className='p-3 text-muted-foreground font-mono'>{flow.steps} steps</td>
                    <td className='p-3 font-bold text-emerald-600 font-mono'>
                      {flow.runs.toLocaleString()} runs
                    </td>
                    <td className='p-3'>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          flow.active
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {flow.active ? '● Live' : '○ Draft'}
                      </span>
                    </td>
                    <td className='p-3 text-muted-foreground'>{flow.lastRun}</td>
                    <td className='p-3 text-right' onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button
                          size='sm'
                          onClick={() => {
                            setActiveFlowId(flow.id)
                            setSelectedNodeId(flow.nodes[0]?.id || 'step-1')
                          }}
                          className='h-7 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer gap-1 shadow-xs'
                        >
                          Open Studio <ArrowRight className='h-3 w-3' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Main>

      {/* CREATE FLOW MODAL */}
      <Dialog open={createFlowModal} onOpenChange={setCreateFlowModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Workflow className='h-4 w-4 text-orange-600' />
              Create Automation Flow
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Define a new visual event-driven flow for real-time customer engagement.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2 text-xs'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Flow Name</Label>
              <Input
                type='text'
                placeholder='e.g., Hot Lead Auto-Followup'
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                className='h-8 text-xs'
              />
            </div>

            <div className='rounded-md border border-border/60 bg-muted/20 p-2.5 space-y-1'>
              <div className='font-semibold text-foreground flex items-center gap-1.5'>
                <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' /> Included BizAutomation Architecture:
              </div>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Instant Webhook Ingestion → Smart Condition Filter → CRM Contact Update & Agent Assignment
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setCreateFlowModal(false)}>
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={() => {
                if (!newFlowName.trim()) {
                  toast.error('Please enter a flow name.')
                  return
                }
                const newF: FlowItem = {
                  id: `flow-${Date.now()}`,
                  flowUid: generateFlowUid(),
                  name: newFlowName.trim(),
                  trigger: 'Text Message Received',
                  steps: 3,
                  runs: 0,
                  active: true,
                  lastRun: 'Just now',
                  nodes: [
                    {
                      id: 'step-1',
                      stepNumber: 1,
                      type: 'TRIGGER',
                      title: 'Text Message Received',
                      subtitle: 'Official WhatsApp Inbound Listener',
                      configured: true,
                      connectionId: 'bizautomation-whatsapp',
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
                  ],
                }
                persistFlows([newF, ...flowsList])
                setActiveFlowId(newF.id)
                setSelectedNodeId('step-1')
                setCreateFlowModal(false)
                setNewFlowName('')
                toast.success(`Flow "${newF.name}" created and opened in Flow Studio!`)
              }}
              className='bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer text-xs h-8'
            >
              Open in Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
