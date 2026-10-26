import { useState, useMemo, useEffect } from 'react'
import {
  Layers,
  Plus,
  Copy,
  Check,
  Code2,
  Trash2,
  Edit2,
  Smartphone,
  Star,
  CheckCircle2,
  Search,
  SearchX,
  X,
  Download,
  ShieldCheck,
  RefreshCw,
  Sparkles,
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

export interface FlowFormItem {
  id: string
  flowId: string
  title: string
  status: 'PUBLISHED' | 'DRAFT'
  description: string
  responses: number | string
  jsonSchema: Record<string, unknown>
}

function generateFlowId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const initialFlows: FlowFormItem[] = [
  {
    id: 'f-1',
    flowId: '749201',
    title: 'Commercial Fleet GPS Onboarding',
    status: 'PUBLISHED',
    description:
      '3-screen interactive form capturing fleet size, truck vehicle numbers, and preferred installation city in Gujarat.',
    responses: 412,
    jsonSchema: {
      version: '3.1',
      screens: [
        {
          id: 'SCREEN_FLEET_INFO',
          title: 'Fleet Specifications',
          terminal: false,
          layout: {
            type: 'SingleColumnLayout',
            children: [
              { type: 'TextHeading', text: 'Select Commercial Fleet Size' },
              {
                type: 'RadioButtonsGroup',
                name: 'fleet_size',
                required: true,
                data_source: [
                  { id: '1_5', title: '1 - 5 Trucks' },
                  { id: '6_20', title: '6 - 20 Trucks' },
                  { id: '20_plus', title: '20+ Commercial Fleet' },
                ],
              },
            ],
          },
        },
        {
          id: 'SCREEN_LOCATION',
          title: 'Gujarat Fitment Center',
          terminal: true,
          layout: {
            type: 'SingleColumnLayout',
            children: [
              {
                type: 'Dropdown',
                name: 'city',
                label: 'Preferred RTO City',
                required: true,
                data_source: [
                  { id: 'ahmedabad', title: 'Ahmedabad RTO' },
                  { id: 'surat', title: 'Surat Ring Road' },
                  { id: 'vadodara', title: 'Vadodara Hub' },
                  { id: 'rajkot', title: 'Rajkot Highway' },
                ],
              },
              { type: 'Footer', label: 'Submit Onboarding' },
            ],
          },
        },
      ],
    },
  },
  {
    id: 'f-2',
    flowId: '819402',
    title: 'Instant Fastag KYC Verification',
    status: 'PUBLISHED',
    description:
      'Vehicle RC upload, chassis number entry, and instant bank wallet linking inside WhatsApp.',
    responses: 890,
    jsonSchema: {
      version: '3.1',
      screens: [
        {
          id: 'SCREEN_FASTAG_KYC',
          title: 'Vehicle & RC Details',
          terminal: true,
          layout: {
            type: 'SingleColumnLayout',
            children: [
              { type: 'TextInput', name: 'vehicle_number', label: 'Registration (e.g. GJ01AB1234)', required: true },
              { type: 'TextInput', name: 'chassis_number', label: 'Chassis Last 5 Digits', required: true },
              { type: 'Footer', label: 'Verify & Link Fastag' },
            ],
          },
        },
      ],
    },
  },
  {
    id: 'f-3',
    flowId: '938104',
    title: 'Customer CSAT & Driver Feedback',
    status: 'DRAFT',
    description:
      'Post-delivery rating screen with 5-star rating widget and feedback comment box.',
    responses: '-',
    jsonSchema: {
      version: '3.1',
      screens: [
        {
          id: 'SCREEN_RATING',
          title: 'Rate Your Experience',
          terminal: true,
          layout: {
            type: 'SingleColumnLayout',
            children: [
              { type: 'TextSubheading', text: 'How satisfied are you with our fleet tracking app?' },
              { type: 'Rating', name: 'rating', max_rating: 5, required: true },
              { type: 'TextArea', name: 'feedback', label: 'Additional Comments' },
              { type: 'Footer', label: 'Submit Feedback' },
            ],
          },
        },
      ],
    },
  },
]

export function WhatsappForms() {
  const [flows, setFlows] = useState<FlowFormItem[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_interactive_flows')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Fallback
    }
    return initialFlows
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'PUBLISHED' | 'DRAFT'>('All')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Create & Edit State
  const [createModal, setCreateModal] = useState(false)
  const [editingFlow, setEditingFlow] = useState<FlowFormItem | null>(null)
  const [flowTitle, setFlowTitle] = useState('')
  const [flowDesc, setFlowDesc] = useState('')
  const [flowStatus, setFlowStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED')
  const [flowQuestion, setFlowQuestion] = useState('Enter commercial vehicle details')
  const [flowInputType, setFlowInputType] = useState('TextInput')
  const [flowButtonLabel, setFlowButtonLabel] = useState('Submit Application')

  // Preview & Copy State
  const [previewModal, setPreviewModal] = useState<FlowFormItem | null>(null)
  const [formToDelete, setFormToDelete] = useState<FlowFormItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedFlowId, setCopiedFlowId] = useState<string | null>(null)

  // In-Chat Simulator State
  const [simFlowModal, setSimFlowModal] = useState<FlowFormItem | null>(null)
  const [simStep, setSimStep] = useState(1)
  const [simFleetOption, setSimFleetOption] = useState('1_5')
  const [simCity, setSimCity] = useState('ahmedabad')
  const [simVehicleNum, setSimVehicleNum] = useState('GJ01AB9988')
  const [simChassis, setSimChassis] = useState('98421')
  const [simRating, setSimRating] = useState(5)
  const [simFeedbackText, setSimFeedbackText] = useState('GPS installation was fast and smooth!')
  const [simSubmitted, setSimSubmitted] = useState(false)
  const [simPayloadReceipt, setSimPayloadReceipt] = useState<Record<string, unknown> | null>(null)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('whatsapi_interactive_flows', JSON.stringify(flows))
    } catch {
      // Fallback
    }
  }, [flows])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Flow forms synchronized with Meta Cloud Gateway!')
    }, 600)
  }

  const handleOpenCreate = () => {
    setEditingFlow(null)
    setFlowTitle('')
    setFlowDesc('')
    setFlowStatus('PUBLISHED')
    setFlowQuestion('Enter commercial vehicle details')
    setFlowInputType('TextInput')
    setFlowButtonLabel('Submit Application')
    setCreateModal(true)
  }

  const handleOpenEdit = (flow: FlowFormItem) => {
    setEditingFlow(flow)
    setFlowTitle(flow.title)
    setFlowDesc(flow.description)
    setFlowStatus(flow.status)
    setFlowQuestion('Enter commercial vehicle details')
    setFlowInputType('TextInput')
    setFlowButtonLabel('Save Changes')
    setCreateModal(true)
  }

  const handleSave = () => {
    if (!flowTitle.trim()) {
      toast.error('Flow title is required.')
      return
    }

    if (editingFlow) {
      setFlows((prev) =>
        prev.map((f) =>
          f.id === editingFlow.id
            ? {
                ...f,
                title: flowTitle.trim(),
                description: flowDesc.trim() || f.description,
                status: flowStatus,
              }
            : f
        )
      )
      toast.success(`Flow "${flowTitle.trim()}" updated successfully!`)
    } else {
      const newFlowId = `${Math.floor(100000 + Math.random() * 900000)}`
      const created: FlowFormItem = {
        id: generateFlowId(),
        flowId: newFlowId,
        title: flowTitle.trim(),
        status: flowStatus,
        description: flowDesc.trim() || 'Interactive multi-screen WhatsApp form.',
        responses: 0,
        jsonSchema: {
          version: '3.1',
          screens: [
            {
              id: 'SCREEN_START',
              title: flowTitle.trim(),
              terminal: true,
              layout: {
                type: 'SingleColumnLayout',
                children: [
                  { type: 'TextHeading', text: flowQuestion.trim() },
                  { type: flowInputType, name: 'customer_data', label: flowQuestion.trim(), required: true },
                  { type: 'Footer', label: flowButtonLabel.trim() },
                ],
              },
            },
          ],
        },
      }
      setFlows([created, ...flows])
      toast.success(`WhatsApp Flow Form "${created.title}" created & registered!`)
    }

    setCreateModal(false)
  }

  const confirmDeleteForm = (id: string, title: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== id))
    setFormToDelete(null)
    toast.info(`Removed form "${title}".`)
  }

  const handleCopySchema = (schema: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
    setCopied(true)
    toast.success('Meta Flows JSON schema copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSchema = (flow: FlowFormItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(flow.jsonSchema, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${flow.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_flow.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success(`Downloaded ${flow.title} JSON schema!`)
  }

  const handleCopyFlowId = (id: string, flowId: string) => {
    navigator.clipboard.writeText(flowId)
    setCopiedFlowId(id)
    toast.success(`Flow ID ${flowId} copied!`)
    setTimeout(() => setCopiedFlowId(null), 2000)
  }

  // Open Simulator
  const handleOpenSimulator = (flow: FlowFormItem) => {
    setSimFlowModal(flow)
    setSimStep(1)
    setSimSubmitted(false)
    setSimPayloadReceipt(null)
  }

  // Submit Simulator Form
  const handleSimulateSubmit = () => {
    setSimSubmitted(true)
    const receipt = {
      event: 'WHATSAPP_FLOW_DATA_EXCHANGE',
      flow_id: simFlowModal?.flowId,
      flow_title: simFlowModal?.title,
      flow_token: `token_fl_${Math.random().toString(36).slice(2, 9)}`,
      screen: 'TERMINAL_SUCCESS',
      submitted_at: new Date().toISOString(),
      payload:
        simFlowModal?.id === 'f-1'
          ? { fleet_size: simFleetOption, fitment_city: simCity }
          : simFlowModal?.id === 'f-2'
          ? { vehicle_number: simVehicleNum, chassis_5: simChassis }
          : { csat_rating: simRating, comment: simFeedbackText },
      status: '200_OK_PORT_4000',
    }
    setSimPayloadReceipt(receipt)

    if (simFlowModal) {
      setFlows((prev) =>
        prev.map((f) =>
          f.id === simFlowModal.id
            ? { ...f, responses: typeof f.responses === 'number' ? f.responses + 1 : 1 }
            : f
        )
      )
    }
    toast.success('Meta Flow Response Captured & Saved!', {
      description: 'Webhook payload parsed and contact fields updated in CRM.',
    })
  }

  // Filtered Flows
  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.flowId.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' ? true : f.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [flows, searchQuery, statusFilter])

  // Aggregate Metrics
  const totalFlows = flows.length
  const publishedCount = useMemo(() => flows.filter((f) => f.status === 'PUBLISHED').length, [flows])
  const draftCount = useMemo(() => flows.filter((f) => f.status === 'DRAFT').length, [flows])
  const totalResponses = useMemo(() => {
    return flows.reduce((acc, curr) => acc + (typeof curr.responses === 'number' ? curr.responses : 0), 0)
  }, [flows])

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Layers className='h-4 w-4 text-orange-600' />
          <span>Whatsapp Interactive Forms (Flows)</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        {/* Title Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Whatsapp Interactive Forms</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono font-semibold'>
                META FLOWS v3.1
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              Native in-chat WhatsApp multi-screen forms and surveys powered by Meta Flows JSON schema
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </Button>
            <Button
              size='sm'
              onClick={handleOpenCreate}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 cursor-pointer font-semibold shadow-xs h-8 text-xs'
            >
              <Plus className='h-3.5 w-3.5' />
              Create Flow Form
            </Button>
          </div>
        </div>

        {/* 4 Top Enterprise Metric Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          <div className='p-3 rounded-xl border border-border/60 bg-card shadow-2xs'>
            <div className='flex items-center justify-between text-muted-foreground mb-1'>
              <span className='text-xs font-medium'>Interactive Forms</span>
              <Layers className='h-4 w-4 text-orange-600' />
            </div>
            <div className='text-2xl font-bold tracking-tight text-foreground'>
              {totalFlows}
            </div>
            <div className='text-[10px] text-muted-foreground mt-0.5'>
              Multi-screen questionnaires
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-card shadow-2xs'>
            <div className='flex items-center justify-between text-muted-foreground mb-1'>
              <span className='text-xs font-medium'>Published on Meta</span>
              <ShieldCheck className='h-4 w-4 text-emerald-600' />
            </div>
            <div className='text-2xl font-bold tracking-tight text-emerald-600'>
              {publishedCount} Live
            </div>
            <div className='text-[10px] text-muted-foreground mt-0.5'>
              Active for customer chat
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-card shadow-2xs'>
            <div className='flex items-center justify-between text-muted-foreground mb-1'>
              <span className='text-xs font-medium'>Responses Captured</span>
              <Sparkles className='h-4 w-4 text-purple-600' />
            </div>
            <div className='text-2xl font-bold tracking-tight text-purple-600'>
              {totalResponses}+
            </div>
            <div className='text-[10px] text-muted-foreground mt-0.5'>
              Automated CRM sync active
            </div>
          </div>

          <div className='p-3 rounded-xl border border-border/60 bg-card shadow-2xs'>
            <div className='flex items-center justify-between text-muted-foreground mb-1'>
              <span className='text-xs font-medium'>Flows Schema Engine</span>
              <Code2 className='h-4 w-4 text-sky-600' />
            </div>
            <div className='text-2xl font-bold tracking-tight text-sky-600'>
              Port 4000
            </div>
            <div className='text-[10px] text-muted-foreground mt-0.5'>
              Meta Cloud API v21.0
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
          <div className='flex items-center bg-muted/40 p-1 rounded-lg text-xs border border-border/40'>
            {(
              [
                { key: 'All', label: 'All', count: totalFlows },
                { key: 'PUBLISHED', label: 'Published', count: publishedCount },
                { key: 'DRAFT', label: 'Draft', count: draftCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                    statusFilter === tab.key ? 'bg-orange-700/60 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
            <Input
              type='search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search flow forms...'
              className='h-8 pl-8 pr-7 text-xs bg-background'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Forms Cards Grid or Empty State */}
        {filteredFlows.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 px-4 text-center bg-muted/20 mt-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 mb-3'>
              <SearchX className='h-6 w-6' />
            </div>
            <h3 className='font-semibold text-base text-foreground mb-1'>No Interactive Forms Found</h3>
            <p className='text-xs text-muted-foreground max-w-md mb-4'>
              No flow forms match <span className='font-semibold text-foreground break-all'>"{searchQuery}"</span> in {statusFilter} status.
            </p>
            <div className='flex items-center gap-2'>
              {searchQuery && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSearchQuery('')}
                  className='h-8 text-xs cursor-pointer gap-1.5'
                >
                  <X className='h-3.5 w-3.5' />
                  Clear Search Filter
                </Button>
              )}
              {statusFilter !== 'All' && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setStatusFilter('All')}
                  className='h-8 text-xs cursor-pointer'
                >
                  View All Forms
                </Button>
              )}
              <Button
                size='sm'
                onClick={handleOpenCreate}
                className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold gap-1.5'
              >
                <Plus className='h-3.5 w-3.5' />
                Create Flow Form
              </Button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-1'>
            {filteredFlows.map((flow) => {
              const screensCount = (flow.jsonSchema?.screens as unknown[])?.length || 1

              return (
                <div
                  key={flow.id}
                  className='rounded-xl border border-border/60 bg-card p-4 shadow-2xs space-y-3 hover:border-orange-500/50 transition-all flex flex-col justify-between group'
                >
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <Badge
                        className={
                          flow.status === 'PUBLISHED'
                            ? 'bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'
                            : 'bg-amber-500/15 text-amber-600 border-0 text-[10px] font-semibold'
                        }
                      >
                        {flow.status}
                      </Badge>
                      <button
                        type='button'
                        onClick={() => handleCopyFlowId(flow.id, flow.flowId)}
                        className='text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded'
                        title='Click to copy Flow ID'
                      >
                        {copiedFlowId === flow.id ? (
                          <Check className='h-3 w-3 text-emerald-600' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                        Flow ID: {flow.flowId}
                      </button>
                    </div>

                    <h3 className='font-bold text-sm text-foreground flex items-center justify-between'>
                      <span>{flow.title}</span>
                    </h3>

                    <div className='flex items-center gap-1.5 my-1.5'>
                      <span className='text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono'>
                        {screensCount} {screensCount === 1 ? 'Screen' : 'Screens'}
                      </span>
                      <span className='text-[10px] bg-sky-500/10 text-sky-600 px-2 py-0.5 rounded font-mono font-medium'>
                        Meta Flow v3.1
                      </span>
                    </div>

                    <p className='text-xs text-muted-foreground leading-relaxed line-clamp-3'>
                      {flow.description}
                    </p>
                  </div>

                  <div className='pt-3 border-t border-border/40 flex justify-between items-center text-xs'>
                    <span className='text-muted-foreground text-[11px] flex items-center gap-1'>
                      {typeof flow.responses === 'number' && (
                        <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block' />
                      )}
                      Responses: <strong className='text-foreground'>{flow.responses}</strong>
                    </span>

                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenSimulator(flow)}
                        className='h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer gap-1 px-2 font-medium'
                        title='Test in WhatsApp Simulator'
                      >
                        <Smartphone className='h-3 w-3' /> Test
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setPreviewModal(flow)}
                        className='h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 cursor-pointer gap-1 px-2 font-medium'
                        title='Preview Meta Flow JSON'
                      >
                        <Code2 className='h-3 w-3' /> JSON
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenEdit(flow)}
                        className='h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer gap-1 px-2'
                        title='Edit Form'
                      >
                        <Edit2 className='h-3 w-3' /> Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setFormToDelete(flow)}
                        className='h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer'
                        title='Delete Form'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Main>

      {/* Create / Edit Flow Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Layers className='h-4 w-4 text-orange-600' />
              {editingFlow ? 'Edit WhatsApp Flow Form' : 'Create WhatsApp Flow Form'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Build a multi-screen in-chat questionnaire with automated CRM contact updating.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-xs'>
            <div>
              <Label className='text-xs font-semibold'>Flow Title</Label>
              <Input
                value={flowTitle}
                onChange={(e) => setFlowTitle(e.target.value)}
                placeholder='e.g. Gujarat Commercial Fleet KYC Form'
                className='text-xs mt-1'
              />
            </div>

            <div>
              <Label className='text-xs font-semibold'>Description</Label>
              <Textarea
                value={flowDesc}
                onChange={(e) => setFlowDesc(e.target.value)}
                placeholder='Describe the flow purpose and questions...'
                rows={3}
                className='text-xs mt-1'
              />
            </div>

            <div className='grid grid-cols-2 gap-2.5'>
              <div>
                <Label className='text-xs font-semibold'>Status</Label>
                <select
                  value={flowStatus}
                  onChange={(e) => setFlowStatus(e.target.value as FlowFormItem['status'])}
                  className='h-8 w-full rounded-md border border-border bg-background px-2 text-xs mt-1 outline-hidden focus:border-orange-500'
                >
                  <option value='PUBLISHED'>PUBLISHED (Live on WhatsApp)</option>
                  <option value='DRAFT'>DRAFT (Sandbox testing)</option>
                </select>
              </div>
              <div>
                <Label className='text-xs font-semibold'>Primary Input Widget</Label>
                <select
                  value={flowInputType}
                  onChange={(e) => setFlowInputType(e.target.value)}
                  className='h-8 w-full rounded-md border border-border bg-background px-2 text-xs mt-1 outline-hidden focus:border-orange-500'
                >
                  <option value='TextInput'>Single-line Text Input</option>
                  <option value='RadioButtonsGroup'>Radio Selection Group</option>
                  <option value='Dropdown'>Dropdown Selector</option>
                  <option value='Rating'>5-Star Rating Widget</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2.5'>
              <div>
                <Label className='text-xs font-semibold'>Question Prompt</Label>
                <Input
                  value={flowQuestion}
                  onChange={(e) => setFlowQuestion(e.target.value)}
                  placeholder='e.g. Enter vehicle details'
                  className='text-xs mt-1'
                />
              </div>
              <div>
                <Label className='text-xs font-semibold'>Submit Button Label</Label>
                <Input
                  value={flowButtonLabel}
                  onChange={(e) => setFlowButtonLabel(e.target.value)}
                  placeholder='e.g. Submit Onboarding'
                  className='text-xs mt-1'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-2 border-t border-border/40'>
            <Button variant='outline' size='sm' onClick={() => setCreateModal(false)} className='cursor-pointer'>
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              className='bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'
            >
              {editingFlow ? 'Save Changes' : 'Create Flow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview JSON Schema Modal */}
      <Dialog open={!!previewModal} onOpenChange={(open) => !open && setPreviewModal(null)}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-2'>
                <Code2 className='h-4 w-4 text-orange-600' />
                Meta Flows JSON Schema: {previewModal?.title}
              </span>
            </DialogTitle>
            <DialogDescription className='text-xs'>
              This schema is validated against Meta Graph API v21.0 Flow Specification.
            </DialogDescription>
          </DialogHeader>

          <div className='relative rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-zinc-100 max-h-80 overflow-y-auto border border-border/40'>
            <pre>{JSON.stringify(previewModal?.jsonSchema, null, 2)}</pre>
          </div>

          <DialogFooter className='flex items-center justify-between gap-2 pt-2 border-t border-border/40'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => previewModal && handleDownloadSchema(previewModal)}
              className='gap-1.5 text-xs cursor-pointer'
            >
              <Download className='h-3.5 w-3.5' /> Download JSON
            </Button>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => previewModal && handleCopySchema(previewModal.jsonSchema)}
                className='gap-1.5 text-xs cursor-pointer'
              >
                {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
                {copied ? 'Copied!' : 'Copy Schema'}
              </Button>
              <Button size='sm' onClick={() => setPreviewModal(null)} className='bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'>
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* In-Chat Flow Simulator Modal */}
      <Dialog open={!!simFlowModal} onOpenChange={(open) => !open && setSimFlowModal(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-sm'>
              <Smartphone className='h-4 w-4 text-emerald-600' />
              Interactive WhatsApp Flow Simulator
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Live demonstration of in-chat screens for "{simFlowModal?.title}".
            </DialogDescription>
          </DialogHeader>

          <div className='p-4 rounded-xl border border-border/80 bg-zinc-100 dark:bg-zinc-900 space-y-3 text-xs'>
            {/* Simulator Header */}
            <div className='flex items-center justify-between border-b border-border/40 pb-2 text-[11px]'>
              <div className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                <span className='font-bold text-foreground'>Truck Sathi WhatsApp Bot</span>
              </div>
              <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30'>
                FLOW ACTIVE (v3.1)
              </Badge>
            </div>

            {!simSubmitted ? (
              <div className='space-y-3 bg-card p-3.5 rounded-lg border border-border/50 shadow-xs'>
                {simFlowModal?.id === 'f-1' && (
                  <>
                    {simStep === 1 && (
                      <div className='space-y-2.5'>
                        <div className='flex items-center justify-between'>
                          <span className='font-bold text-foreground text-xs'>Select Commercial Fleet Size:</span>
                          <span className='text-[10px] font-mono text-muted-foreground'>Step 1 of 2</span>
                        </div>
                        <div className='space-y-1.5'>
                          {[
                            { id: '1_5', title: '1 - 5 Trucks' },
                            { id: '6_20', title: '6 - 20 Trucks' },
                            { id: '20_plus', title: '20+ Commercial Fleet' },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                simFleetOption === opt.id ? 'border-orange-500 bg-orange-500/10 font-semibold' : 'border-border'
                              }`}
                            >
                              <input
                                type='radio'
                                name='fleet'
                                checked={simFleetOption === opt.id}
                                onChange={() => setSimFleetOption(opt.id)}
                              />
                              <span>{opt.title}</span>
                            </label>
                          ))}
                        </div>
                        <Button
                          size='sm'
                          onClick={() => setSimStep(2)}
                          className='w-full bg-orange-600 hover:bg-orange-700 text-white font-bold mt-2 cursor-pointer'
                        >
                          Next: Gujarat Fitment Center &rarr;
                        </Button>
                      </div>
                    )}

                    {simStep === 2 && (
                      <div className='space-y-2.5'>
                        <div className='flex items-center justify-between'>
                          <span className='font-bold text-foreground text-xs'>Preferred RTO Installation City:</span>
                          <span className='text-[10px] font-mono text-muted-foreground'>Step 2 of 2</span>
                        </div>
                        <select
                          value={simCity}
                          onChange={(e) => setSimCity(e.target.value)}
                          className='h-8 w-full rounded border border-border bg-background px-2 text-xs'
                        >
                          <option value='ahmedabad'>Ahmedabad RTO</option>
                          <option value='surat'>Surat Ring Road</option>
                          <option value='vadodara'>Vadodara Hub</option>
                          <option value='rajkot'>Rajkot Highway</option>
                        </select>
                        <div className='flex gap-2 pt-1'>
                          <Button variant='outline' size='sm' onClick={() => setSimStep(1)} className='cursor-pointer'>
                            Back
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSimulateSubmit}
                            className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer'
                          >
                            Submit Onboarding
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {simFlowModal?.id === 'f-2' && (
                  <div className='space-y-2.5'>
                    <div>
                      <label className='font-semibold text-foreground block mb-1'>Vehicle Registration</label>
                      <Input
                        type='text'
                        value={simVehicleNum}
                        onChange={(e) => setSimVehicleNum(e.target.value)}
                        className='h-8 text-xs font-mono uppercase'
                      />
                    </div>
                    <div>
                      <label className='font-semibold text-foreground block mb-1'>Chassis Last 5 Digits</label>
                      <Input
                        type='text'
                        value={simChassis}
                        onChange={(e) => setSimChassis(e.target.value)}
                        className='h-8 text-xs font-mono'
                      />
                    </div>
                    <Button
                      size='sm'
                      onClick={handleSimulateSubmit}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2 cursor-pointer'
                    >
                      Verify & Link FASTAG
                    </Button>
                  </div>
                )}

                {simFlowModal?.id !== 'f-1' && simFlowModal?.id !== 'f-2' && (
                  <div className='space-y-2.5'>
                    <div className='font-bold text-foreground text-xs'>How satisfied are you with our fleet app?</div>
                    <div className='flex gap-1.5 justify-center py-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type='button'
                          key={star}
                          onClick={() => setSimRating(star)}
                          className='p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer'
                        >
                          <Star className={`h-6 w-6 ${star <= simRating ? 'fill-amber-500' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      rows={2}
                      value={simFeedbackText}
                      onChange={(e) => setSimFeedbackText(e.target.value)}
                      placeholder='Comments...'
                      className='text-xs'
                    />
                    <Button
                      size='sm'
                      onClick={handleSimulateSubmit}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2 cursor-pointer'
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className='p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center space-y-2.5'>
                <CheckCircle2 className='h-8 w-8 text-emerald-600 mx-auto' />
                <div className='font-bold text-sm text-foreground'>Flow Completed Successfully!</div>
                <p className='text-xs text-muted-foreground'>
                  In-chat response captured and webhook dispatched to Port 4000.
                </p>

                {simPayloadReceipt && (
                  <div className='rounded bg-zinc-950 p-2 font-mono text-[10px] text-emerald-400 text-left max-h-36 overflow-y-auto border border-emerald-500/30'>
                    <pre>{JSON.stringify(simPayloadReceipt, null, 2)}</pre>
                  </div>
                )}

                <Button size='sm' variant='outline' onClick={() => setSimSubmitted(false)} className='mt-1 text-xs cursor-pointer'>
                  Test Again
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button size='sm' onClick={() => setSimFlowModal(null)} className='bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'>
              Done Testing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Form Confirmation Modal */}
      <Dialog open={!!formToDelete} onOpenChange={(open) => !open && setFormToDelete(null)}>
        {formToDelete && (
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-red-600'>
                <Trash2 className='h-5 w-5' />
                Delete Interactive Form Flow
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Are you sure you want to delete form <strong className='text-foreground'>"{formToDelete.title}"</strong> (ID: {formToDelete.flowId})?
                WhatsApp conversations currently triggering this interactive form will no longer display it.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setFormToDelete(null)}
                className='h-8 text-xs cursor-pointer'
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => confirmDeleteForm(formToDelete.id, formToDelete.title)}
                className='h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer'
              >
                Delete Form
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
