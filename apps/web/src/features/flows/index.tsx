import { useState } from 'react'
import {
  Workflow,
  Plus,
  CheckCircle2,
  Zap,
  Trash2,
  FileText,
  Play,
  Search,
  ArrowRight,
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

interface FlowNode {
  id: string
  step: number
  type: 'Trigger' | 'Condition' | 'Action' | 'CRM'
  title: string
  detail: string
}

interface FlowLog {
  id: string
  time: string
  phone: string
  status: string
  duration: string
}

interface FlowItem {
  id: string
  name: string
  trigger: string
  steps: number
  runs: number
  active: boolean
  lastRun: string
  nodes: FlowNode[]
  logs: FlowLog[]
}

const defaultFlows: FlowItem[] = [
  {
    id: 'flow-1',
    name: 'IndiaMart 24/7 Lead Auto-Responder',
    trigger: 'IndiaMart Lead Push API',
    steps: 4,
    runs: 1420,
    active: true,
    lastRun: '5 mins ago',
    nodes: [
      { id: 'n-1', step: 1, type: 'Trigger', title: 'Catch Inbound IndiaMart Lead Webhook', detail: 'Endpoint: /webhook/indiamart' },
      { id: 'n-2', step: 2, type: 'Condition', title: 'Filter User Region & Opt-in', detail: 'contact.state == "Gujarat" && optIn == true' },
      { id: 'n-3', step: 3, type: 'Action', title: 'Dispatch Welcome Catalog WhatsApp Message', detail: 'Template: commercial_fleet_intro (Hindi/Gujarati)' },
      { id: 'n-4', step: 4, type: 'CRM', title: 'Sync to CRM & Assign Tag', detail: 'Tag: #hot-lead | Assignee: Truck Sathi Admin' },
    ],
    logs: [
      { id: 'l-1', time: '2 mins ago', phone: '+91 98250 12345', status: 'Success (4/4 nodes)', duration: '142ms' },
      { id: 'l-2', time: '14 mins ago', phone: '+91 98251 00001', status: 'Success (4/4 nodes)', duration: '168ms' },
      { id: 'l-3', time: '38 mins ago', phone: '+91 94260 00002', status: 'Success (4/4 nodes)', duration: '135ms' },
    ],
  },
  {
    id: 'flow-2',
    name: 'Gujarat Fleet Festive Broadcast Funnel',
    trigger: 'Scheduled Campaign Scheduler',
    steps: 4,
    runs: 14500,
    active: true,
    lastRun: '1 hour ago',
    nodes: [
      { id: 'n-1', step: 1, type: 'Trigger', title: 'Scheduled Campaign Trigger', detail: 'Cron: Daily 10:00 AM' },
      { id: 'n-2', step: 2, type: 'Condition', title: 'Vehicle Type Filter', detail: 'contact.vehicleCount >= 3' },
      { id: 'n-3', step: 3, type: 'Action', title: 'Send Festive AIS-140 GPS Offer', detail: 'Template: gujarat_diwali_fleet_offer' },
      { id: 'n-4', step: 4, type: 'CRM', title: 'Update Broadcast Delivery Tag', detail: 'Tag: #broadcast-delivered' },
    ],
    logs: [
      { id: 'l-1', time: '1 hour ago', phone: '+91 99090 00003', status: 'Success (4/4 nodes)', duration: '150ms' },
      { id: 'l-2', time: '2 hours ago', phone: '+91 98980 11223', status: 'Success (4/4 nodes)', duration: '162ms' },
    ],
  },
  {
    id: 'flow-3',
    name: 'Fastag KYC Document Verification',
    trigger: 'Interactive WhatsApp Form Submission',
    steps: 4,
    runs: 890,
    active: true,
    lastRun: '32 mins ago',
    nodes: [
      { id: 'n-1', step: 1, type: 'Trigger', title: 'WhatsApp Flow Form Submission', detail: 'Flow: fastag_kyc_flow_v2' },
      { id: 'n-2', step: 2, type: 'Condition', title: 'Validate RC & Chassis Number', detail: 'rcNumber.length == 10 && panValid == true' },
      { id: 'n-3', step: 3, type: 'Action', title: 'Issue Instant Tag & Send Barcode PDF', detail: 'Template: fastag_issuance_confirmation' },
      { id: 'n-4', step: 4, type: 'CRM', title: 'Assign Verified KYC Status', detail: 'Tag: #kyc-verified-fastag' },
    ],
    logs: [
      { id: 'l-1', time: '32 mins ago', phone: '+91 97270 44556', status: 'Success (4/4 nodes)', duration: '185ms' },
      { id: 'l-2', time: '1 hour ago', phone: '+91 96010 77889', status: 'Success (4/4 nodes)', duration: '190ms' },
    ],
  },
  {
    id: 'flow-4',
    name: 'Google Sheets Lead Append & SMS Fallback',
    trigger: 'New Inbound WhatsApp Contact',
    steps: 3,
    runs: 412,
    active: false,
    lastRun: 'Yesterday',
    nodes: [
      { id: 'n-1', step: 1, type: 'Trigger', title: 'New Customer Inbound Message', detail: 'Event: messages.inbound' },
      { id: 'n-2', step: 2, type: 'Action', title: 'Append Row to Google Sheets', detail: 'Sheet: Truck Sathi Inbound Leads 2026' },
      { id: 'n-3', step: 3, type: 'CRM', title: 'Auto-Assign to First Available Agent', detail: 'Round Robin: Ahmedabad Fleet Team' },
    ],
    logs: [
      { id: 'l-1', time: 'Yesterday', phone: '+91 98240 99887', status: 'Success (3/3 nodes)', duration: '112ms' },
    ],
  },
]

export function Flows() {
  const [flows, setFlows] = useState<FlowItem[]>(defaultFlows)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused'>('All')
  const [simulatingId, setSimulatingId] = useState<string | null>(null)

  // Dialog States
  const [createModal, setCreateModal] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const [newFlowTrigger, setNewFlowTrigger] = useState('IndiaMart Lead Push API')
  const [selectedFlowForEdit, setSelectedFlowForEdit] = useState<FlowItem | null>(null)
  const [selectedFlowForLogs, setSelectedFlowForLogs] = useState<FlowItem | null>(null)

  const filteredFlows = flows.filter((f) => {
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && f.active) ||
      (statusFilter === 'Paused' && !f.active)
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.trigger.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const toggleFlow = (id: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newActive = !f.active
          toast(newActive ? 'Flow Activated' : 'Flow Paused', {
            description: `"${f.name}" is now ${newActive ? 'listening for events' : 'paused'}.`,
          })
          return { ...f, active: newActive }
        }
        return f
      })
    )
  }

  const handleSimulateFlow = (flow: FlowItem) => {
    setSimulatingId(flow.id)
    toast.info(`Executing Flow: "${flow.name}"...`, {
      description: `Testing 4-node pipeline with sample Gujarat fleet lead.`,
    })

    setTimeout(() => {
      const randomPhone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`
      const newLog: FlowLog = {
        id: `log-${Date.now()}`,
        time: 'Just now',
        phone: randomPhone,
        status: `Success (${flow.steps}/${flow.steps} nodes)`,
        duration: `${Math.floor(110 + Math.random() * 45)}ms`,
      }

      setFlows((prev) =>
        prev.map((f) => {
          if (f.id === flow.id) {
            return {
              ...f,
              runs: f.runs + 1,
              lastRun: 'Just now',
              logs: [newLog, ...f.logs],
            }
          }
          return f
        })
      )

      if (selectedFlowForLogs && selectedFlowForLogs.id === flow.id) {
        setSelectedFlowForLogs((prev) =>
          prev ? { ...prev, runs: prev.runs + 1, logs: [newLog, ...prev.logs] } : null
        )
      }

      setSimulatingId(null)
      toast.success(`Flow Executed Successfully!`, {
        description: `Lead ${randomPhone} processed through ${flow.steps} nodes in ${newLog.duration}. Welcome WhatsApp message sent!`,
      })
    }, 900)
  }

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) {
      toast.error('Please enter a Flow Name')
      return
    }

    const newFlow: FlowItem = {
      id: `flow-${Date.now()}`,
      name: newFlowName.trim(),
      trigger: newFlowTrigger,
      steps: 4,
      runs: 0,
      active: true,
      lastRun: 'Just created',
      nodes: [
        { id: 'n-1', step: 1, type: 'Trigger', title: newFlowTrigger, detail: 'Auto-listening on gateway webhook' },
        { id: 'n-2', step: 2, type: 'Condition', title: 'Region & Qualification Filter', detail: 'state == "Gujarat"' },
        { id: 'n-3', step: 3, type: 'Action', title: 'Send Automated WhatsApp Response', detail: 'Template: welcome_lead_offer' },
        { id: 'n-4', step: 4, type: 'CRM', title: 'CRM Tagging & Agent Handoff', detail: 'Tag: #new-lead' },
      ],
      logs: [],
    }

    setFlows((prev) => [newFlow, ...prev])
    setCreateModal(false)
    setNewFlowName('')
    toast.success('Visual Flow created and deployed successfully!', {
      description: `Active trigger listener bound to ${newFlowTrigger}.`,
    })
  }

  const handleDeleteFlow = (id: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== id))
    setSelectedFlowForEdit(null)
    toast.info('Flow removed from execution pipeline.')
  }

  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'Trigger':
        return 'bg-emerald-500/15 text-emerald-600'
      case 'Condition':
        return 'bg-amber-500/15 text-amber-600'
      case 'Action':
        return 'bg-blue-500/15 text-blue-600'
      case 'CRM':
        return 'bg-purple-500/15 text-purple-600'
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Workflow className='h-4 w-4 text-orange-600' />
          <span>Automation Flows Engine</span>
          <Badge className='bg-orange-500/10 text-orange-600 border-0 text-[10px] hidden sm:inline-flex'>
            Webhook & Trigger Automations
          </Badge>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4'>
        {/* Top Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Visual Flows</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                {flows.filter((f) => f.active).length} Active Pipelines
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Multi-step automation pipelines connecting triggers, filters, webhooks, WhatsApp messages, and CRM actions
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => setCreateModal(true)}
            className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 cursor-pointer font-semibold shadow-xs h-9'
          >
            <Plus className='h-3.5 w-3.5' /> Create Flow
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40'>
          <div className='flex items-center gap-1.5'>
            {(['All', 'Active', 'Paused'] as const).map((tab) => (
              <button
                key={tab}
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
                    ? flows.length
                    : tab === 'Active'
                    ? flows.filter((f) => f.active).length
                    : flows.filter((f) => !f.active).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              placeholder='Search flows or triggers...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <th className='p-3 font-medium'>Trigger Source</th>
                <th className='p-3 font-medium'>Steps</th>
                <th className='p-3 font-medium'>Total Executions</th>
                <th className='p-3 font-medium'>Last Run</th>
                <th className='p-3 font-medium'>Status</th>
                <th className='p-3 font-medium text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={7} className='p-8 text-center text-muted-foreground'>
                    No flows found matching your search.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => (
                  <tr key={flow.id} className='whitespace-nowrap hover:bg-muted/30 transition-colors'>
                    <td className='p-3 font-semibold text-orange-600 flex items-center gap-2'>
                      <Workflow className='h-3.5 w-3.5 text-muted-foreground' />
                      {flow.name}
                    </td>
                    <td className='p-3 text-foreground font-medium'>{flow.trigger}</td>
                    <td className='p-3 text-muted-foreground'>{flow.steps} nodes</td>
                    <td className='p-3 font-semibold text-emerald-600 font-mono'>
                      {flow.runs.toLocaleString()} runs
                    </td>
                    <td className='p-3 text-muted-foreground'>{flow.lastRun}</td>
                    <td className='p-3'>
                      <button
                        onClick={() => toggleFlow(flow.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                          flow.active
                            ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {flow.active ? '● Active' : '○ Paused'}
                      </button>
                    </td>
                    <td className='p-3 text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={simulatingId === flow.id}
                          onClick={() => handleSimulateFlow(flow)}
                          className='h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 gap-1 cursor-pointer font-semibold'
                        >
                          <Play className={`h-3 w-3 fill-emerald-600 ${simulatingId === flow.id ? 'animate-spin' : ''}`} />
                          {simulatingId === flow.id ? 'Running...' : 'Test Run'}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedFlowForEdit(flow)}
                          className='h-7 px-2 text-xs text-orange-600 cursor-pointer hover:bg-orange-500/10'
                        >
                          Edit Canvas
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedFlowForLogs(flow)}
                          className='h-7 px-2 text-xs cursor-pointer'
                        >
                          Logs ({flow.logs.length})
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
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Workflow className='h-4 w-4 text-orange-600' />
              Create Automation Flow
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Define a new visual event-driven flow triggered from lead sources or inbound messages.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Flow Name</Label>
              <Input
                type='text'
                placeholder='e.g. WhatsApp Fastag Renewal Pipeline'
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                className='h-8 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Trigger Event</Label>
              <select
                value={newFlowTrigger}
                onChange={(e) => setNewFlowTrigger(e.target.value)}
                className='h-8 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden'
              >
                <option value='IndiaMart Lead Push API'>IndiaMart Lead Push API</option>
                <option value='Facebook Lead Ads Webhook'>Facebook Lead Ads Webhook</option>
                <option value='New Inbound WhatsApp Contact'>New Inbound WhatsApp Contact</option>
                <option value='Scheduled Campaign Scheduler'>Scheduled Campaign Scheduler</option>
                <option value='Interactive WhatsApp Form Submission'>Interactive WhatsApp Form Submission</option>
                <option value='Google Sheets Row Trigger'>Google Sheets Row Trigger</option>
              </select>
            </div>

            <div className='rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs space-y-1'>
              <span className='font-semibold text-foreground flex items-center gap-1.5'>
                <Zap className='h-3.5 w-3.5 text-emerald-500' /> Default Pipeline Stages:
              </span>
              <p className='text-muted-foreground text-[11px] leading-relaxed'>
                Trigger → Deduplication Check → Save Contact to CRM → Dispatch Welcome WhatsApp Template
              </p>
            </div>
          </div>

          <DialogFooter className='flex items-center justify-between pt-2 border-t border-border/50'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setCreateModal(false)}
              className='h-8 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleCreateFlow}
              className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold'
            >
              Deploy Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT FLOW CANVAS MODAL */}
      <Dialog open={!!selectedFlowForEdit} onOpenChange={(open) => !open && setSelectedFlowForEdit(null)}>
        {selectedFlowForEdit && (
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle className='flex items-center gap-2'>
                  <Workflow className='h-4 w-4 text-orange-600' />
                  {selectedFlowForEdit.name}
                </DialogTitle>
                <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px]'>
                  {selectedFlowForEdit.active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <DialogDescription className='text-xs'>
                Trigger: <span className='font-semibold text-foreground'>{selectedFlowForEdit.trigger}</span>
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2'>
              <div className='rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3'>
                {selectedFlowForEdit.nodes.map((node, i) => (
                  <div key={node.id}>
                    <div className='p-3 rounded-lg border border-border/60 bg-card flex items-start justify-between gap-3 shadow-2xs'>
                      <div className='flex items-start gap-2.5'>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${getNodeColor(node.type)}`}>
                          {node.step}. {node.type}
                        </span>
                        <div>
                          <div className='font-semibold text-xs text-foreground'>{node.title}</div>
                          <div className='text-[11px] text-muted-foreground font-mono mt-0.5'>{node.detail}</div>
                        </div>
                      </div>
                    </div>
                    {i < selectedFlowForEdit.nodes.length - 1 && (
                      <div className='flex justify-center my-1'>
                        <ArrowRight className='h-3.5 w-3.5 text-muted-foreground/60 rotate-90' />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className='flex items-center justify-between pt-2 border-t border-border/50'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handleDeleteFlow(selectedFlowForEdit.id)}
                className='h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1'
              >
                <Trash2 className='h-3.5 w-3.5' /> Delete Flow
              </Button>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => handleSimulateFlow(selectedFlowForEdit)}
                  className='h-8 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold'
                >
                  <Play className='h-3 w-3 fill-emerald-600' /> Test Run
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => {
                    toast.success('Flow Canvas changes saved successfully!')
                    setSelectedFlowForEdit(null)
                  }}
                  className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold'
                >
                  Save Canvas
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* FLOW RUN LOGS MODAL */}
      <Dialog open={!!selectedFlowForLogs} onOpenChange={(open) => !open && setSelectedFlowForLogs(null)}>
        {selectedFlowForLogs && (
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle className='flex items-center gap-2 text-sm'>
                  <FileText className='h-4 w-4 text-orange-600' />
                  Execution History: {selectedFlowForLogs.name}
                </DialogTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleSimulateFlow(selectedFlowForLogs)}
                  className='h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 font-semibold'
                >
                  <Play className='h-3 w-3 fill-emerald-600' /> Trigger Test
                </Button>
              </div>
              <DialogDescription className='text-xs'>
                Total Executions: {selectedFlowForLogs.runs.toLocaleString()} runs recorded
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-2 max-h-72 overflow-y-auto py-2 text-xs'>
              {selectedFlowForLogs.logs.length === 0 ? (
                <div className='p-6 text-center text-muted-foreground'>
                  No execution logs recorded yet. Click 'Trigger Test' above to simulate a run!
                </div>
              ) : (
                selectedFlowForLogs.logs.map((log) => (
                  <div key={log.id} className='rounded-lg border border-border/50 bg-muted/20 p-2.5 flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <div className='font-semibold text-foreground flex items-center gap-1.5'>
                        <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                        {log.phone}
                      </div>
                      <div className='text-[10px] text-muted-foreground font-mono'>{log.status} • {log.duration}</div>
                    </div>
                    <Badge variant='outline' className='text-[10px]'>{log.time}</Badge>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className='pt-2 border-t border-border/50 flex items-center justify-between'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  setFlows((prev) =>
                    prev.map((f) => (f.id === selectedFlowForLogs.id ? { ...f, logs: [] } : f))
                  )
                  setSelectedFlowForLogs((prev) => (prev ? { ...prev, logs: [] } : null))
                  toast.info('Execution history cleared.')
                }}
                className='h-8 text-xs text-muted-foreground hover:text-red-600'
              >
                Clear History
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={() => setSelectedFlowForLogs(null)}
                className='h-8 text-xs'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
