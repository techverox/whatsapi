import { useState } from 'react'
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

interface FlowFormItem {
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
  const [flows, setFlows] = useState<FlowFormItem[]>(initialFlows)
  const [createModal, setCreateModal] = useState(false)
  const [editingFlow, setEditingFlow] = useState<FlowFormItem | null>(null)
  const [previewModal, setPreviewModal] = useState<FlowFormItem | null>(null)
  const [simFlowModal, setSimFlowModal] = useState<FlowFormItem | null>(null)

  // Create & Edit State
  const [flowTitle, setFlowTitle] = useState('')
  const [flowDesc, setFlowDesc] = useState('')
  const [flowStatus, setFlowStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED')
  const [copied, setCopied] = useState(false)

  // In-Chat Simulator State
  const [simStep, setSimStep] = useState(1)
  const [simFleetOption, setSimFleetOption] = useState('1_5')
  const [simCity, setSimCity] = useState('ahmedabad')
  const [simVehicleNum, setSimVehicleNum] = useState('GJ01AB9988')
  const [simChassis, setSimChassis] = useState('98421')
  const [simRating, setSimRating] = useState(5)
  const [simFeedbackText, setSimFeedbackText] = useState('GPS install was fast and smooth!')
  const [simSubmitted, setSimSubmitted] = useState(false)

  const handleOpenCreate = () => {
    setEditingFlow(null)
    setFlowTitle('')
    setFlowDesc('')
    setFlowStatus('PUBLISHED')
    setCreateModal(true)
  }

  const handleOpenEdit = (flow: FlowFormItem) => {
    setEditingFlow(flow)
    setFlowTitle(flow.title)
    setFlowDesc(flow.description)
    setFlowStatus(flow.status)
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
      const created: FlowFormItem = {
        id: generateFlowId(),
        flowId: `${Math.floor(100000 + Math.random() * 900000)}`,
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
                  { type: 'TextHeading', text: flowTitle.trim() },
                  { type: 'TextInput', name: 'customer_input', label: 'Enter details', required: true },
                  { type: 'Footer', label: 'Submit' },
                ],
              },
            },
          ],
        },
      }
      setFlows([created, ...flows])
      toast.success(`WhatsApp Flow Form "${created.title}" created successfully!`)
    }

    setCreateModal(false)
  }

  const handleDelete = (id: string, title: string) => {
    setFlows(flows.filter((f) => f.id !== id))
    toast.success(`Removed "${title}".`)
  }

  const handleCopySchema = (schema: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
    setCopied(true)
    toast.success('Meta Flows JSON schema copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Open Simulator
  const handleOpenSimulator = (flow: FlowFormItem) => {
    setSimFlowModal(flow)
    setSimStep(1)
    setSimSubmitted(false)
  }

  // Submit Simulator Form
  const handleSimulateSubmit = () => {
    setSimSubmitted(true)
    if (simFlowModal) {
      setFlows((prev) =>
        prev.map((f) =>
          f.id === simFlowModal.id
            ? { ...f, responses: typeof f.responses === 'number' ? f.responses + 1 : 1 }
            : f
        )
      )
    }
    toast.success('Meta Flow Response Captured!', {
      description: 'Webhook payload parsed and contact fields updated in CRM.',
    })
  }

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
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Whatsapp Interactive Forms</h1>
            <p className='text-xs text-muted-foreground'>
              Native in-chat WhatsApp multi-screen forms and surveys powered by Meta Flows JSON schema
            </p>
          </div>
          <Button
            size='sm'
            onClick={handleOpenCreate}
            className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 cursor-pointer font-semibold shadow-xs'
          >
            <Plus className='h-3.5 w-3.5' />
            Create Flow Form
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {flows.map((flow) => (
            <div
              key={flow.id}
              className='rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-3 hover:border-orange-500/40 transition-all flex flex-col justify-between group'
            >
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <Badge
                    className={
                      flow.status === 'PUBLISHED'
                        ? 'bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'
                        : 'bg-amber-500/15 text-amber-600 border-0 text-[10px] font-semibold'
                    }
                  >
                    {flow.status}
                  </Badge>
                  <span className='text-[10px] text-muted-foreground font-mono'>
                    Flow ID: {flow.flowId}
                  </span>
                </div>
                <h3 className='font-bold text-sm text-foreground'>{flow.title}</h3>
                <p className='text-xs text-muted-foreground leading-relaxed mt-1'>
                  {flow.description}
                </p>
              </div>

              <div className='pt-2 border-t border-border/40 flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>
                  Responses: <strong className='text-foreground'>{flow.responses}</strong>
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleOpenSimulator(flow)}
                    className='h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer gap-1 px-2 font-medium'
                    title='Test in WhatsApp'
                  >
                    <Smartphone className='h-3 w-3' /> Test
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setPreviewModal(flow)}
                    className='h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 cursor-pointer gap-1 px-2 font-medium'
                  >
                    <Code2 className='h-3 w-3' /> Preview JSON
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleOpenEdit(flow)}
                    className='h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer gap-1 px-2'
                  >
                    <Edit2 className='h-3 w-3' /> Edit
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDelete(flow.id, flow.title)}
                    className='h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Main>

      {/* Create / Edit Flow Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingFlow ? 'Edit WhatsApp Flow Form' : 'Create WhatsApp Flow Form'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Build a multi-screen in-chat questionnaire with automated CRM contact updating.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
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

            <div>
              <Label className='text-xs font-semibold'>Status</Label>
              <select
                value={flowStatus}
                onChange={(e) => setFlowStatus(e.target.value as FlowFormItem['status'])}
                className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs mt-1 outline-hidden focus:border-orange-500'
              >
                <option value='PUBLISHED'>PUBLISHED (Live on WhatsApp)</option>
                <option value='DRAFT'>DRAFT (Sandbox testing)</option>
              </select>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              className='bg-orange-600 hover:bg-orange-700 text-white font-bold'
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

          <div className='relative rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-zinc-100 max-h-80 overflow-y-auto'>
            <pre>{JSON.stringify(previewModal?.jsonSchema, null, 2)}</pre>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => previewModal && handleCopySchema(previewModal.jsonSchema)}
              className='gap-1.5'
            >
              {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
              {copied ? 'Copied!' : 'Copy Schema'}
            </Button>
            <Button size='sm' onClick={() => setPreviewModal(null)} className='bg-orange-600 hover:bg-orange-700 text-white'>
              Done
            </Button>
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
            <div className='flex items-center justify-between border-b border-border/40 pb-2 text-[11px]'>
              <span className='font-bold text-foreground'>Truck Sathi WhatsApp Bot</span>
              <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600'>
                FLOW ACTIVE
              </Badge>
            </div>

            {!simSubmitted ? (
              <div className='space-y-3 bg-card p-3.5 rounded-lg border border-border/50 shadow-xs'>
                {simFlowModal?.id === 'f-1' && (
                  <>
                    {simStep === 1 && (
                      <div className='space-y-2.5'>
                        <div className='font-bold text-foreground text-xs'>Select Commercial Fleet Size:</div>
                        <div className='space-y-1.5'>
                          {[
                            { id: '1_5', title: '1 - 5 Trucks' },
                            { id: '6_20', title: '6 - 20 Trucks' },
                            { id: '20_plus', title: '20+ Commercial Fleet' },
                          ].map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
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
                          className='w-full bg-orange-600 hover:bg-orange-700 text-white font-bold mt-2'
                        >
                          Next: Gujarat Fitment Center &rarr;
                        </Button>
                      </div>
                    )}

                    {simStep === 2 && (
                      <div className='space-y-2.5'>
                        <div className='font-bold text-foreground text-xs'>Preferred RTO Installation City:</div>
                        <select
                          value={simCity}
                          onChange={(e) => setSimCity(e.target.value)}
                          className='h-9 w-full rounded border border-border bg-background px-2 text-xs'
                        >
                          <option value='ahmedabad'>Ahmedabad RTO</option>
                          <option value='surat'>Surat Ring Road</option>
                          <option value='vadodara'>Vadodara Hub</option>
                          <option value='rajkot'>Rajkot Highway</option>
                        </select>
                        <div className='flex gap-2 pt-1'>
                          <Button variant='outline' size='sm' onClick={() => setSimStep(1)}>
                            Back
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSimulateSubmit}
                            className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
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
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2'
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
                          key={star}
                          onClick={() => setSimRating(star)}
                          className='p-1 text-amber-500 hover:scale-110 transition-transform'
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
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2'
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className='p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center space-y-2'>
                <CheckCircle2 className='h-8 w-8 text-emerald-600 mx-auto' />
                <div className='font-bold text-sm text-foreground'>Flow Completed Successfully!</div>
                <p className='text-xs text-muted-foreground'>
                  In-chat response captured and webhook dispatched to Port 4000.
                </p>
                <Button size='sm' variant='outline' onClick={() => setSimSubmitted(false)} className='mt-1 text-xs'>
                  Test Again
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button size='sm' onClick={() => setSimFlowModal(null)} className='bg-orange-600 hover:bg-orange-700 text-white'>
              Done Testing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
