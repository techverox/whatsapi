import { useState } from 'react'
import {
  MessageCircleCode,
  Play,
  Save,
  ArrowRight,
  Sliders,
  Send,
  Zap,
  Tag,
  X,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Layers,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface BotNode {
  id: string
  stepNumber: number
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'CRM_SYNC' | 'WEBHOOK'
  title: string
  subtitle: string
  config: {
    event?: string
    conditionRule?: string
    actionMessage?: string
    buttons?: string[]
    tag?: string
    assignee?: string
  }
}

interface SimMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  buttons?: string[]
}

const DEFAULT_NODES: BotNode[] = [
  {
    id: 'node-1',
    stepNumber: 1,
    type: 'TRIGGER',
    title: 'Catch Raw Webhook',
    subtitle: 'event: messages.inbound',
    config: {
      event: 'messages.inbound',
    },
  },
  {
    id: 'node-2',
    stepNumber: 2,
    type: 'CONDITION',
    title: 'Filter User Region',
    subtitle: "contact.state == 'Gujarat'",
    config: {
      conditionRule: "contact.state == 'Gujarat'",
    },
  },
  {
    id: 'node-3',
    stepNumber: 3,
    type: 'ACTION',
    title: 'Send Button Message',
    subtitle: 'Namaste! Select your required service from Truck Sathi:',
    config: {
      actionMessage: 'Namaste! Welcome to Truck Sathi & VEROX Automation. Select your required commercial fleet service:',
      buttons: ['Buy AIS-140 GPS', 'Commercial Fastag', 'Speak to Agent'],
    },
  },
  {
    id: 'node-4',
    stepNumber: 4,
    type: 'CRM_SYNC',
    title: 'Update Tag & Assign',
    subtitle: 'Tag: hot-lead • Assign: Truck Sathi Admin',
    config: {
      tag: 'hot-lead',
      assignee: 'Truck Sathi Admin',
    },
  },
]

const WORKFLOW_PRESETS = [
  {
    id: 'preset-fleet',
    name: 'Gujarat Fleet Lead Funnel',
    nodes: DEFAULT_NODES,
  },
  {
    id: 'preset-fastag',
    name: 'Commercial FASTAG KYC Bot',
    nodes: [
      {
        id: 'node-1',
        stepNumber: 1,
        type: 'TRIGGER' as const,
        title: 'Inbound FASTAG Request',
        subtitle: 'event: keywords.match ("fastag")',
        config: { event: 'keywords.match ("fastag")' },
      },
      {
        id: 'node-2',
        stepNumber: 2,
        type: 'CONDITION' as const,
        title: 'Check Fleet Registration',
        subtitle: 'contact.has_rc_copy == true',
        config: { conditionRule: 'contact.has_rc_copy == true' },
      },
      {
        id: 'node-3',
        stepNumber: 3,
        type: 'ACTION' as const,
        title: 'Instant KYC Form Action',
        subtitle: 'Provide commercial truck class selection:',
        config: {
          actionMessage: '⚡ FASTAG Activation Desk: Select your commercial vehicle axle configuration:',
          buttons: ['2-Axle Truck', '3-Axle Multi-Axle', 'Check Wallet Balance'],
        },
      },
      {
        id: 'node-4',
        stepNumber: 4,
        type: 'CRM_SYNC' as const,
        title: 'Tag FASTAG Lead',
        subtitle: 'Tag: FASTAG • Assign: Operations Team',
        config: { tag: 'FASTAG', assignee: 'Operations Team' },
      },
    ],
  },
  {
    id: 'preset-indiamart',
    name: 'IndiaMart 24/7 Auto-Responder',
    nodes: [
      {
        id: 'node-1',
        stepNumber: 1,
        type: 'TRIGGER' as const,
        title: 'IndiaMart Push Webhook',
        subtitle: 'event: indiamart.lead_push',
        config: { event: 'indiamart.lead_push' },
      },
      {
        id: 'node-2',
        stepNumber: 2,
        type: 'CONDITION' as const,
        title: 'Validate Mobile & Product',
        subtitle: "lead.product.includes('GPS')",
        config: { conditionRule: "lead.product.includes('GPS')" },
      },
      {
        id: 'node-3',
        stepNumber: 3,
        type: 'ACTION' as const,
        title: 'Instant WhatsApp Quotation',
        subtitle: 'Dispatch official rate card & fitment centers:',
        config: {
          actionMessage: 'Namaste! Thank you for inquiring on IndiaMart. Our senior logistics advisor is ready with special commercial rates:',
          buttons: ['Get 30% Festive Discount', 'Book On-site Demo', 'Chat With Executive'],
        },
      },
      {
        id: 'node-4',
        stepNumber: 4,
        type: 'CRM_SYNC' as const,
        title: 'Sync CRM Contact',
        subtitle: 'Tag: hot-lead • Assign: Agent Bhavik',
        config: { tag: 'hot-lead', assignee: 'Agent Bhavik' },
      },
    ],
  },
]

export function Chatbot() {
  const [nodes, setNodes] = useState<BotNode[]>(() => {
    try {
      const saved = localStorage.getItem('verox_chatbot_canvas_v2')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return DEFAULT_NODES
  })

  const [activePreset, setActivePreset] = useState('preset-fleet')
  const [tested, setTested] = useState(false)
  const [showSimModal, setShowSimModal] = useState(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)

  // Node Edit Modal State
  const [editingNode, setEditingNode] = useState<BotNode | null>(null)
  const [nodeTitle, setNodeTitle] = useState('')
  const [nodeType, setNodeType] = useState<BotNode['type']>('TRIGGER')
  const [nodeEvent, setNodeEvent] = useState('messages.inbound')
  const [nodeCondition, setNodeCondition] = useState("contact.state == 'Gujarat'")
  const [nodeActionMessage, setNodeActionMessage] = useState('')
  const [nodeButtonsText, setNodeButtonsText] = useState('')
  const [nodeTag, setNodeTag] = useState('hot-lead')
  const [nodeAssignee, setNodeAssignee] = useState('Truck Sathi Admin')

  // Simulation Chat state
  const [simMessages, setSimMessages] = useState<SimMessage[]>([])
  const [inputMsg, setInputMsg] = useState('')

  // Save to LocalStorage
  const handleSaveCanvas = () => {
    localStorage.setItem('verox_chatbot_canvas_v2', JSON.stringify(nodes))
    toast.success('Chatbot v2 Canvas Saved & Deployed!', {
      description: `Active pipeline with ${nodes.length} nodes updated on Meta WABA: +91 76985 80043.`,
    })
  }

  // Preset Switcher
  const handleSelectPreset = (presetId: string) => {
    const found = WORKFLOW_PRESETS.find((p) => p.id === presetId)
    if (found) {
      setActivePreset(presetId)
      setNodes(found.nodes)
      toast.success(`Workflow Switched to "${found.name}"!`)
    }
  }

  // Reset to Defaults
  const handleResetCanvas = () => {
    setNodes(DEFAULT_NODES)
    setActivePreset('preset-fleet')
    localStorage.removeItem('verox_chatbot_canvas_v2')
    toast.info('Canvas reset to default Gujarat Fleet Lead Funnel.')
  }

  // Open Node Editor
  const handleOpenEditNode = (node: BotNode) => {
    setEditingNode(node)
    setNodeTitle(node.title)
    setNodeType(node.type)
    setNodeEvent(node.config.event || 'messages.inbound')
    setNodeCondition(node.config.conditionRule || "contact.state == 'Gujarat'")
    setNodeActionMessage(node.config.actionMessage || '')
    setNodeButtonsText((node.config.buttons || []).join(', '))
    setNodeTag(node.config.tag || 'hot-lead')
    setNodeAssignee(node.config.assignee || 'Truck Sathi Admin')
  }

  // Save Edited Node
  const handleSaveNodeConfig = () => {
    if (!editingNode) return

    const btnArray = nodeButtonsText
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)

    let sub = ''
    if (nodeType === 'TRIGGER') sub = `event: ${nodeEvent}`
    else if (nodeType === 'CONDITION') sub = nodeCondition
    else if (nodeType === 'ACTION') sub = nodeActionMessage.slice(0, 45) + '...'
    else if (nodeType === 'CRM_SYNC') sub = `Tag: ${nodeTag} • Assign: ${nodeAssignee}`

    const updated: BotNode = {
      ...editingNode,
      title: nodeTitle.trim() || editingNode.title,
      type: nodeType,
      subtitle: sub,
      config: {
        event: nodeEvent,
        conditionRule: nodeCondition,
        actionMessage: nodeActionMessage,
        buttons: btnArray.length > 0 ? btnArray : ['Yes', 'No'],
        tag: nodeTag,
        assignee: nodeAssignee,
      },
    }

    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    setEditingNode(null)
    toast.success(`Node #${updated.stepNumber} "${updated.title}" updated!`)
  }

  // Add New Node
  const handleAddNewNode = () => {
    const nextStep = nodes.length + 1
    const newNode: BotNode = {
      id: `node-${Date.now()}`,
      stepNumber: nextStep,
      type: 'ACTION',
      title: `Step ${nextStep}: Follow-Up Message`,
      subtitle: 'Send follow-up WhatsApp message',
      config: {
        actionMessage: 'Is there anything else our logistics team can help you with?',
        buttons: ['Yes, More Info', 'No, Thanks'],
      },
    }
    setNodes([...nodes, newNode])
    toast.success(`Added new Node #${nextStep} to canvas!`)
  }

  // Delete Node
  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (nodes.length <= 2) {
      toast.error('Canvas must retain at least 2 nodes.')
      return
    }
    const remaining = nodes.filter((n) => n.id !== id)
    // Re-index steps
    const reindexed = remaining.map((n, idx) => ({ ...n, stepNumber: idx + 1 }))
    setNodes(reindexed)
    toast.info('Node removed from pipeline.')
  }

  // Test Simulation Sequence
  const handleTest = () => {
    setTested(true)
    setActiveStep(1)

    // Find Action Node
    const actionNode = nodes.find((n) => n.type === 'ACTION') || nodes[2] || nodes[0]
    const initialText =
      actionNode.config.actionMessage ||
      'Namaste! Welcome to Truck Sathi & VEROX Automation. How can we assist you today?'
    const initialButtons = actionNode.config.buttons || ['Buy AIS-140 GPS', 'Commercial Fastag', 'Speak to Agent']

    setSimMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: initialText,
        buttons: initialButtons,
      },
    ])

    setTimeout(() => setActiveStep(2), 500)
    setTimeout(() => setActiveStep(3), 1000)
    setTimeout(() => {
      setActiveStep(4)
      setTested(false)
      setShowSimModal(true)
    }, 1500)
  }

  const handleSimButtonClick = (btnText: string) => {
    const userMsg: SimMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: btnText,
    }

    let botReplyText = ''
    if (btnText.includes('GPS') || btnText.includes('Discount') || btnText.includes('Axle')) {
      botReplyText =
        '🚚 *AIS-140 GPS Offer:* Our certified GPS device is currently ₹2,999 with 1-year government portal tracking & instant fitment in Gujarat! A sales officer is assigned to you.'
    } else if (btnText.includes('Fastag') || btnText.includes('Wallet')) {
      botReplyText =
        '⚡ *Commercial Fastag:* Instant activation available for 10-wheeler to 14-wheeler trucks. Zero documentation delay.'
    } else {
      botReplyText =
        '👤 *Human Agent Assigned:* Transferring your chat to Truck Sathi Support Desk. An agent will respond in 2 minutes.'
    }

    const botMsg: SimMessage = {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: botReplyText,
      buttons: ['Yes, Continue', 'Connect to Agent'],
    }

    setSimMessages((prev) => [...prev, userMsg, botMsg])
    toast.success(`Chatbot evaluated node response: "${btnText}"`)
  }

  const handleSendSimInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim()) return

    const userText = inputMsg
    setInputMsg('')

    const userMsg: SimMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
    }

    const botMsg: SimMessage = {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: `🤖 Auto-Reply: Thank you for inquiring regarding "${userText}". Our bot pipeline has processed this query and notified our logistics desk!`,
      buttons: ['Buy AIS-140 GPS', 'Commercial Fastag', 'Speak to Agent'],
    }

    setSimMessages((prev) => [...prev, userMsg, botMsg])
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <MessageCircleCode className='h-4 w-4 text-orange-600' />
          <span>Visual Chatbot Builder (Node Canvas)</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto'>
        {/* Top Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='text-2xl font-bold tracking-tight'>Chatbot v2 Canvas</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                Active on WABA: +91 76985 80043
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Drag & drop conversational logic, button responses, and lead tags
            </p>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleAddNewNode}
              className='h-8 text-xs gap-1.5'
            >
              <Plus className='h-3.5 w-3.5' /> Add Node
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleTest}
              disabled={tested}
              className='h-8 text-xs gap-1.5 border-orange-500/40 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 font-bold'
            >
              <Play className={`h-3.5 w-3.5 ${tested ? 'animate-spin' : 'fill-orange-600'}`} />
              {tested ? 'Evaluating Pipeline...' : 'Simulate Bot'}
            </Button>
            <Button
              size='sm'
              onClick={handleSaveCanvas}
              className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5 font-bold shadow-xs'
            >
              <Save className='h-3.5 w-3.5' /> Save Canvas
            </Button>
          </div>
        </div>

        {/* Workflow Presets Toolbar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/40 text-xs'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-semibold text-muted-foreground flex items-center gap-1.5'>
              <Layers className='h-3.5 w-3.5 text-orange-600' /> Workflow Preset:
            </span>
            <div className='flex gap-1.5 flex-wrap'>
              {WORKFLOW_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    activePreset === preset.id
                      ? 'bg-orange-600 text-white font-bold shadow-2xs'
                      : 'bg-background hover:bg-muted text-foreground border border-border/60'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleResetCanvas}
            className='h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1'
          >
            <RotateCcw className='h-3 w-3' /> Reset Canvas
          </Button>
        </div>

        {/* Interactive Visual Node Canvas */}
        <div className='flex-1 rounded-xl border border-border/60 bg-muted/15 p-6 relative overflow-auto shadow-inner flex flex-col lg:flex-row items-center justify-center gap-5'>
          {nodes.map((node, index) => {
            const isTrigger = node.type === 'TRIGGER'
            const isCondition = node.type === 'CONDITION'
            const isAction = node.type === 'ACTION'
            const isCrm = node.type === 'CRM_SYNC'
            const isActive = activeStep === node.stepNumber

            const borderColor = isTrigger
              ? 'border-emerald-500'
              : isCondition
              ? 'border-amber-500'
              : isAction
              ? 'border-orange-500'
              : 'border-sky-500'

            const badgeBg = isTrigger
              ? 'bg-emerald-500/15 text-emerald-600'
              : isCondition
              ? 'bg-amber-500/15 text-amber-600'
              : isAction
              ? 'bg-orange-500/15 text-orange-600'
              : 'bg-sky-500/15 text-sky-600'

            return (
              <div key={node.id} className='flex items-center gap-5 flex-col lg:flex-row'>
                {/* Node Box */}
                <div
                  onClick={() => handleOpenEditNode(node)}
                  className={`w-64 sm:w-72 rounded-xl border-2 bg-card p-4 shadow-md space-y-2.5 cursor-pointer transition-all hover:scale-102 hover:shadow-lg relative group ${
                    isActive
                      ? `${borderColor} scale-105 shadow-xl ring-2 ring-orange-500/30`
                      : `${borderColor}/60 hover:${borderColor}`
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <Badge className={`${badgeBg} border-0 text-[10px] font-bold`}>
                      {node.stepNumber}. {node.type}
                    </Badge>
                    <div className='flex items-center gap-1'>
                      {isTrigger && <Zap className='h-3.5 w-3.5 text-emerald-600' />}
                      {isCondition && <Sliders className='h-3.5 w-3.5 text-amber-600' />}
                      {isAction && <Send className='h-3.5 w-3.5 text-orange-600' />}
                      {isCrm && <Tag className='h-3.5 w-3.5 text-sky-600' />}
                      <span className='opacity-0 group-hover:opacity-100 transition-opacity ml-1'>
                        <Edit2 className='h-3 w-3 text-muted-foreground' />
                      </span>
                    </div>
                  </div>

                  <div className='font-bold text-xs text-foreground truncate'>{node.title}</div>

                  {isTrigger && (
                    <div className='text-[11px] text-muted-foreground font-mono bg-muted/50 p-1.5 rounded truncate'>
                      {node.subtitle}
                    </div>
                  )}

                  {isCondition && (
                    <div className='text-[11px] text-muted-foreground font-mono bg-muted/50 p-1.5 rounded truncate'>
                      {node.subtitle}
                    </div>
                  )}

                  {isAction && (
                    <>
                      <p className='text-[11px] text-muted-foreground leading-relaxed line-clamp-2'>
                        "{node.config.actionMessage || node.subtitle}"
                      </p>
                      <div className='space-y-1 pt-1'>
                        {(node.config.buttons || ['Option 1', 'Option 2']).map((btn, bIdx) => (
                          <div
                            key={bIdx}
                            className='p-1 rounded bg-orange-500/10 text-orange-600 text-[10px] font-semibold text-center truncate'
                          >
                            [🔘 {bIdx + 1}. {btn}]
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {isCrm && (
                    <div className='space-y-1 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded'>
                      <div>
                        • Tag: <strong className='text-orange-600 font-mono'>{node.config.tag || 'hot-lead'}</strong>
                      </div>
                      <div>
                        • Assign: <strong>{node.config.assignee || 'Truck Sathi Admin'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Node footer action tip */}
                  <div className='flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/30'>
                    <span>Click to edit node</span>
                    {nodes.length > 2 && (
                      <button
                        onClick={(e) => handleDeleteNode(node.id, e)}
                        className='text-muted-foreground hover:text-rose-600 p-0.5'
                        title='Delete node'
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    )}
                  </div>
                </div>

                {/* Arrow Connector */}
                {index < nodes.length - 1 && (
                  <ArrowRight className='h-5 w-5 text-muted-foreground/60 hidden lg:block shrink-0' />
                )}
              </div>
            )
          })}
        </div>
      </Main>

      {/* NODE CONFIGURATION DRAWER / MODAL */}
      <Dialog open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-sm font-bold'>
              <Settings className='h-4 w-4 text-orange-600' />
              Configure Pipeline Node #{editingNode?.stepNumber}: {editingNode?.title}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Customize the behavior, trigger conditions, interactive reply buttons, or CRM tags for this node.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2 text-xs'>
            <div>
              <Label className='text-xs font-semibold'>Node Title</Label>
              <Input
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                className='text-xs mt-1'
                placeholder='e.g. Filter User Region'
              />
            </div>

            <div>
              <Label className='text-xs font-semibold'>Node Type</Label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as any)}
                className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs mt-1'
              >
                <option value='TRIGGER'>1. TRIGGER (Catch Inbound Events)</option>
                <option value='CONDITION'>2. CONDITION (Evaluate Logic)</option>
                <option value='ACTION'>3. ACTION (Send WhatsApp Message)</option>
                <option value='CRM_SYNC'>4. CRM_SYNC (Tag & Assign Lead)</option>
              </select>
            </div>

            {nodeType === 'TRIGGER' && (
              <div>
                <Label className='text-xs font-semibold'>Webhook Trigger Event</Label>
                <select
                  value={nodeEvent}
                  onChange={(e) => setNodeEvent(e.target.value)}
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs mt-1'
                >
                  <option value='messages.inbound'>messages.inbound (All Incoming WhatsApp Chats)</option>
                  <option value='indiamart.lead_push'>indiamart.lead_push (Inbound IndiaMart Webhook)</option>
                  <option value='flow.submitted'>flow.submitted (WhatsApp Flow Form Submission)</option>
                  <option value='campaign.responded'>campaign.responded (Broadcast Quick Reply)</option>
                </select>
              </div>
            )}

            {nodeType === 'CONDITION' && (
              <div>
                <Label className='text-xs font-semibold'>Condition Expression</Label>
                <Input
                  value={nodeCondition}
                  onChange={(e) => setNodeCondition(e.target.value)}
                  className='text-xs font-mono mt-1'
                  placeholder="contact.state == 'Gujarat'"
                />
                <span className='text-[10px] text-muted-foreground mt-1 block'>
                  Supported variables: contact.state, contact.tags, contact.fleet_size, contact.optIn
                </span>
              </div>
            )}

            {nodeType === 'ACTION' && (
              <>
                <div>
                  <Label className='text-xs font-semibold'>WhatsApp Bot Message Text</Label>
                  <Textarea
                    rows={3}
                    value={nodeActionMessage}
                    onChange={(e) => setNodeActionMessage(e.target.value)}
                    className='text-xs mt-1 leading-relaxed'
                    placeholder='Type the message sent to the customer...'
                  />
                </div>
                <div>
                  <Label className='text-xs font-semibold'>Interactive Buttons (comma separated)</Label>
                  <Input
                    value={nodeButtonsText}
                    onChange={(e) => setNodeButtonsText(e.target.value)}
                    className='text-xs mt-1'
                    placeholder='Buy AIS-140 GPS, Commercial Fastag, Speak to Agent'
                  />
                </div>
              </>
            )}

            {nodeType === 'CRM_SYNC' && (
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <Label className='text-xs font-semibold'>Apply Tag</Label>
                  <select
                    value={nodeTag}
                    onChange={(e) => setNodeTag(e.target.value)}
                    className='h-9 w-full rounded-md border border-border bg-background px-2 text-xs mt-1'
                  >
                    <option value='hot-lead'>hot-lead</option>
                    <option value='GPS'>GPS</option>
                    <option value='FASTAG'>FASTAG</option>
                    <option value='VIP Transporter'>VIP Transporter</option>
                    <option value='Fleet Mgmt'>Fleet Mgmt</option>
                  </select>
                </div>
                <div>
                  <Label className='text-xs font-semibold'>Assignee</Label>
                  <select
                    value={nodeAssignee}
                    onChange={(e) => setNodeAssignee(e.target.value)}
                    className='h-9 w-full rounded-md border border-border bg-background px-2 text-xs mt-1'
                  >
                    <option value='Truck Sathi Admin'>Truck Sathi Admin</option>
                    <option value='Agent Bhavik'>Agent Bhavik</option>
                    <option value='Operations Team'>Operations Team</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setEditingNode(null)}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSaveNodeConfig} className='bg-orange-600 hover:bg-orange-700 text-white font-bold'>
              Save Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LIVE SIMULATOR MODAL */}
      <Dialog open={showSimModal} onOpenChange={setShowSimModal}>
        <DialogContent className='sm:max-w-md p-0 overflow-hidden'>
          {/* Header styled like WhatsApp chat */}
          <div className='bg-emerald-700 text-white p-3 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs'>
                VB
              </div>
              <div>
                <div className='text-xs font-bold leading-tight'>Truck Sathi Auto-Bot</div>
                <div className='text-[10px] text-emerald-200 flex items-center gap-1'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' /> Online • Verified WABA
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowSimModal(false)}
              className='text-white hover:bg-white/10 h-7 w-7 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Messages Stream */}
          <div className='p-3 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-muted/20 text-xs'>
            {simMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`rounded-lg p-2.5 max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-card border border-border/60 text-foreground rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className='whitespace-pre-line'>{m.text}</p>
                </div>

                {m.buttons && (
                  <div className='flex flex-wrap gap-1.5 mt-2'>
                    {m.buttons.map((b) => (
                      <button
                        key={b}
                        onClick={() => handleSimButtonClick(b)}
                        className='rounded-md border border-emerald-600/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer'
                      >
                        🔘 {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendSimInput} className='p-2.5 border-t border-border flex items-center gap-2 bg-background'>
            <input
              type='text'
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder='Type a customer reply...'
              className='flex-1 h-8 rounded-md border border-border px-3 text-xs outline-hidden focus:border-emerald-600'
            />
            <Button type='submit' size='sm' className='h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1'>
              <Send className='h-3 w-3' /> Send
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
