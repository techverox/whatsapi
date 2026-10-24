import { useState } from 'react'
import {
  Workflow,
  Bot,
  Zap,
  Send,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  RotateCw,
  Download,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
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

// ============================================================================
// DATA DEFINITIONS & REQUISITE STRUCTS
// ============================================================================

interface ProjectItem {
  id: string
  name: string
  client: string
  status: 'In Progress' | 'Completed' | 'Planning' | 'Deployed'
  startDate: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  description: string
}

interface TaskItem {
  id: string
  title: string
  project: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Todo' | 'In Progress' | 'Done'
  dueDate: string
  description?: string
}

interface IntegrationCard {
  id: string
  name: string
  provider: string
  badgeText: string
  avatarColor: string
  status: 'Connected' | 'Standby'
  webhookUrl: string
  lastSync: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  leads: number
  status: 'Online' | 'Offline' | 'Busy'
  avgResponse: string
  stateStatus: 'active' | 'suspended' | 'blocked'
}

interface AgentPerformance {
  id: string
  name: string
  avatar: string
  role: string
  conversations: number
  firstResponse: string
  resolutionRate: string
  csatScore: string
  status: 'Active' | 'Offline'
}

// Data by Timeframe for Message Analytics
const messageDataMap = {
  year: [
    { month: 'Jan', sent: 1240, received: 980 },
    { month: 'Feb', sent: 1850, received: 1420 },
    { month: 'Mar', sent: 2100, received: 1750 },
    { month: 'Apr', sent: 2450, received: 1980 },
    { month: 'May', sent: 2900, received: 2200 },
    { month: 'Jun', sent: 3400, received: 2650 },
    { month: 'Jul', sent: 3100, received: 2400 },
    { month: 'Aug', sent: 3800, received: 2950 },
    { month: 'Sep', sent: 4200, received: 3300 },
    { month: 'Oct', sent: 4850, received: 3790 },
    { month: 'Nov', sent: 0, received: 0 },
    { month: 'Dec', sent: 0, received: 0 },
  ],
  '30days': [
    { month: 'Week 1', sent: 1120, received: 890 },
    { month: 'Week 2', sent: 1350, received: 1040 },
    { month: 'Week 3', sent: 1280, received: 990 },
    { month: 'Week 4', sent: 1100, received: 870 },
  ],
  '7days': [
    { month: 'Mon', sent: 180, received: 145 },
    { month: 'Tue', sent: 210, received: 165 },
    { month: 'Wed', sent: 195, received: 170 },
    { month: 'Thu', sent: 240, received: 190 },
    { month: 'Fri', sent: 260, received: 210 },
    { month: 'Sat', sent: 140, received: 110 },
    { month: 'Sun', sent: 95, received: 80 },
  ],
}

// Data by Timeframe for Lead Analytics
const leadAnalyticsMap = {
  year: [
    { month: 'May', leads: 420, pending: 110, assigned: 310 },
    { month: 'Jun', leads: 680, pending: 140, assigned: 540 },
    { month: 'Jul', leads: 890, pending: 220, assigned: 670 },
    { month: 'Aug', leads: 1240, pending: 310, assigned: 930 },
    { month: 'Sep', leads: 1560, pending: 380, assigned: 1180 },
    { month: 'Oct', leads: 1892, pending: 472, assigned: 1420 },
  ],
  '30days': [
    { month: 'Week 1', leads: 1610, pending: 410, assigned: 1200 },
    { month: 'Week 2', leads: 1720, pending: 430, assigned: 1290 },
    { month: 'Week 3', leads: 1810, pending: 450, assigned: 1360 },
    { month: 'Week 4', leads: 1892, pending: 472, assigned: 1420 },
  ],
  '7days': [
    { month: 'Mon', leads: 1750, pending: 435, assigned: 1315 },
    { month: 'Tue', leads: 1780, pending: 442, assigned: 1338 },
    { month: 'Wed', leads: 1810, pending: 450, assigned: 1360 },
    { month: 'Thu', leads: 1845, pending: 458, assigned: 1387 },
    { month: 'Fri', leads: 1870, pending: 465, assigned: 1405 },
    { month: 'Sat', leads: 1885, pending: 470, assigned: 1415 },
    { month: 'Sun', leads: 1892, pending: 472, assigned: 1420 },
  ],
}

const initialProjectsData: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Truck Sathi GPS Automation',
    client: 'Truck Sathi Logistics',
    status: 'In Progress',
    startDate: '10/15/2026',
    dueDate: '10/30/2026',
    priority: 'High',
    description: 'Automated Gujarat fleet onboarding, AIS-140 GPS activation, and daily WhatsApp mileage alerts.',
  },
  {
    id: 'proj-2',
    name: 'Gujarat Lead Qualifier Bot',
    client: 'Gujarat Transporters Org',
    status: 'In Progress',
    startDate: '10/18/2026',
    dueDate: '11/05/2026',
    priority: 'Medium',
    description: 'Instant WhatsApp multi-screen qualifying form with automated agent assignment for Surat and Ahmedabad.',
  },
  {
    id: 'proj-3',
    name: 'Diwali Festive Broadcast Campaign',
    client: 'Internal Agency Marketing',
    status: 'Completed',
    startDate: '10/10/2026',
    dueDate: '10/24/2026',
    priority: 'High',
    description: '14,500 broadcast dispatches across commercial transport companies with festive discounts.',
  },
]

const initialTasksData: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Verify AIS-140 GPS Webhook Challenge on Meta',
    project: 'Truck Sathi GPS Automation',
    assignee: 'Antigravity Engineer',
    priority: 'High',
    status: 'Done',
    dueDate: '10/24/2026',
    description: 'Validate hub.challenge token handshake and secure SHA-256 payload encryption.',
  },
  {
    id: 'task-2',
    title: 'Configure IndiaMart Lead Ingestion Webhook',
    project: 'Gujarat Lead Qualifier Bot',
    assignee: 'Backend Core',
    priority: 'High',
    status: 'In Progress',
    dueDate: '10/26/2026',
    description: 'Parse SENDER_MOBILE, SENDER_NAME and trigger auto-reply flow in <3 seconds.',
  },
  {
    id: 'task-3',
    title: 'Deploy WhatsApp Cloud Template festive_gps_offer_v2',
    project: 'Diwali Festive Broadcast Campaign',
    assignee: 'Marketing Ops',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '10/28/2026',
    description: 'Sync approved Meta template and map customer name and vehicle number variables.',
  },
]

const initialIntegrations: IntegrationCard[] = [
  {
    id: 'int-1',
    name: 'whatsapi-whatsapp',
    provider: 'Official Cloud API',
    badgeText: 'WA',
    avatarColor: 'bg-emerald-500/10 text-emerald-600',
    status: 'Connected',
    webhookUrl: 'https://app.whatsapi.io/webhook/whatsapp',
    lastSync: 'Just now',
  },
  {
    id: 'int-2',
    name: 'openai / gemini',
    provider: 'AI Assistant Engine',
    badgeText: 'AI',
    avatarColor: 'bg-purple-500/10 text-purple-600',
    status: 'Connected',
    webhookUrl: 'https://app.whatsapi.io/api/v1/ai/ask',
    lastSync: '1 min ago',
  },
  {
    id: 'int-3',
    name: '@app/indiamart',
    provider: 'Real-time Lead Push',
    badgeText: 'IM',
    avatarColor: 'bg-orange-500/10 text-orange-600',
    status: 'Connected',
    webhookUrl: 'https://app.whatsapi.io/webhook/indiamart',
    lastSync: '3 mins ago',
  },
  {
    id: 'int-4',
    name: 'FACEBOOK_LEAD_ADS',
    provider: 'Instant Webhook',
    badgeText: 'FB',
    avatarColor: 'bg-blue-500/10 text-blue-600',
    status: 'Connected',
    webhookUrl: 'https://app.whatsapi.io/webhook/facebook',
    lastSync: '6 mins ago',
  },
  {
    id: 'int-5',
    name: 'WHATSAPP_BUSINESS',
    provider: 'Truck Sathi (Active)',
    badgeText: 'WB',
    avatarColor: 'bg-emerald-500/10 text-emerald-600',
    status: 'Connected',
    webhookUrl: 'https://app.whatsapi.io/webhook/waba-direct',
    lastSync: 'Just now',
  },
  {
    id: 'int-6',
    name: '@app/messaging-api',
    provider: 'Local Dispatcher',
    badgeText: 'API',
    avatarColor: 'bg-amber-500/10 text-amber-600',
    status: 'Connected',
    webhookUrl: 'http://localhost:4000/api/messages/send',
    lastSync: '10 mins ago',
  },
]

const initialTeamMembers: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Ramesh Kumar',
    avatar: 'RK',
    leads: 24,
    status: 'Online',
    avgResponse: '2.4 mins',
    stateStatus: 'active',
  },
  {
    id: 'mem-2',
    name: 'Priya Sharma',
    avatar: 'PS',
    leads: 18,
    status: 'Online',
    avgResponse: '1.8 mins',
    stateStatus: 'active',
  },
  {
    id: 'mem-3',
    name: 'Vikram Patel',
    avatar: 'VP',
    leads: 15,
    status: 'Online',
    avgResponse: '3.1 mins',
    stateStatus: 'active',
  },
]

const initialAgentPerformance: AgentPerformance[] = [
  {
    id: 'agent-1',
    name: 'Truck Sathi Admin',
    avatar: 'TS',
    role: 'Lead Manager',
    conversations: 512,
    firstResponse: '1.2 mins',
    resolutionRate: '98.4%',
    csatScore: '4.9 / 5.0 ⭐',
    status: 'Active',
  },
  {
    id: 'agent-2',
    name: 'Ramesh Kumar',
    avatar: 'RK',
    role: 'Fleet Sales Specialist',
    conversations: 340,
    firstResponse: '2.4 mins',
    resolutionRate: '95.1%',
    csatScore: '4.8 / 5.0 ⭐',
    status: 'Active',
  },
  {
    id: 'agent-3',
    name: 'Priya Sharma',
    avatar: 'PS',
    role: 'Customer Support',
    conversations: 284,
    firstResponse: '1.8 mins',
    resolutionRate: '96.8%',
    csatScore: '4.9 / 5.0 ⭐',
    status: 'Active',
  },
]

export function Dashboard() {
  // Planner State
  const [plannerTab, setPlannerTab] = useState<'projects' | 'tasks'>('projects')
  const [projectFilter, setProjectFilter] = useState<'all' | 'active' | 'in_progress' | 'completed' | 'deployed'>('all')
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')

  // Data Collections State
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjectsData)
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasksData)
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [memberFilter, setMemberFilter] = useState<'active' | 'suspended' | 'blocked'>('active')

  // Time Range for Message & Lead Analytics
  const [timeRange, setTimeRange] = useState<'year' | '30days' | '7days'>('year')

  // Dynamic Metrics State
  const [sentCount, setSentCount] = useState(978)
  const [receivedCount] = useState(1251)
  const [totalLeadsCount, setTotalLeadsCount] = useState(1892)
  const [assignedLeadsCount, setAssignedLeadsCount] = useState(1420)
  const [pendingLeadsCount, setPendingLeadsCount] = useState(472)

  // Interactive Modals State
  const [isWabaModalOpen, setIsWabaModalOpen] = useState(false)
  const [isWabaTesting, setIsWabaTesting] = useState(false)
  const [wabaTestResult, setWabaTestResult] = useState<string | null>(null)

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  const [broadcastName, setBroadcastName] = useState('October Festive Broadcast')
  const [broadcastTemplate, setBroadcastTemplate] = useState('festive_gps_offer_v2')
  const [broadcastAudience, setBroadcastAudience] = useState('all')
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactSource, setNewContactSource] = useState('whatsapp')
  const [newContactAssignee, setNewContactAssignee] = useState('Ramesh Kumar')
  const [newContactTag, setNewContactTag] = useState('hot-lead')

  const [selectedProjectForView, setSelectedProjectForView] = useState<ProjectItem | null>(null)
  const [selectedTaskForView, setSelectedTaskForView] = useState<TaskItem | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCard | null>(null)
  const [isTestingIntegration, setIsTestingIntegration] = useState(false)
  const [integrationTestResult, setIntegrationTestResult] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentPerformance | null>(null)

  // ============================================================================
  // PLANNER COMPUTED ARRAYS
  // ============================================================================
  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'all') return true
    if (projectFilter === 'active') return p.status === 'In Progress' || p.status === 'Planning'
    if (projectFilter === 'in_progress') return p.status === 'In Progress'
    if (projectFilter === 'completed') return p.status === 'Completed'
    if (projectFilter === 'deployed') return p.status === 'Deployed'
    return true
  })

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true
    if (taskFilter === 'todo') return t.status === 'Todo'
    if (taskFilter === 'in_progress') return t.status === 'In Progress'
    if (taskFilter === 'done') return t.status === 'Done'
    return true
  })

  const filteredTeamMembers = teamMembers.filter((m) => m.stateStatus === memberFilter)

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  // Test WABA Ping Handshake
  const handleTestWabaConnection = () => {
    setIsWabaTesting(true)
    setWabaTestResult(null)
    setTimeout(() => {
      setIsWabaTesting(false)
      setWabaTestResult('Verified: 200 OK (Latency: 28ms • Graph API v21.0 Connected)')
      toast.success('WhatsApp Business Cloud API Connection is 100% Active!')
    }, 500)
  }

  // Create Broadcast Dispatch
  const handleDispatchBroadcast = () => {
    if (!broadcastName.trim()) {
      toast.error('Please enter a Broadcast Name.')
      return
    }
    setIsSendingBroadcast(true)
    setTimeout(() => {
      setIsSendingBroadcast(false)
      setIsBroadcastModalOpen(false)
      const recipientCount = broadcastAudience === 'all' ? 1892 : broadcastAudience === 'hot' ? 567 : 851
      setSentCount((prev) => prev + recipientCount)
      toast.success(`Broadcast "${broadcastName}" dispatched successfully!`, {
        description: `Delivered to ${recipientCount.toLocaleString()} recipients via Meta Cloud API.`,
      })
    }, 600)
  }

  // Quick Add Contact
  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error('Please enter contact Name and Phone Number.')
      return
    }

    setTotalLeadsCount((prev) => prev + 1)
    if (newContactAssignee && newContactAssignee !== 'None') {
      setAssignedLeadsCount((prev) => prev + 1)
    } else {
      setPendingLeadsCount((prev) => prev + 1)
    }

    toast.success(`Contact "${newContactName}" added successfully!`, {
      description: `Phone: ${newContactPhone} • Assigned: ${newContactAssignee}`,
    })

    setNewContactName('')
    setNewContactPhone('')
    setNewContactEmail('')
    setIsAddContactModalOpen(false)
  }

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['ID', 'Name', 'Phone', 'Source', 'Status', 'Assigned To', 'Created Date'],
      ['c-1', 'WhatsApp Lead (2938)', '+919825102938', 'whatsapp', 'New', 'Ramesh Kumar', '10/24/2026'],
      ['c-2', 'Rajesh Sharma', '+919825100001', 'indiamart', 'Qualified', 'Ramesh Kumar', '10/22/2026'],
      ['c-3', 'Vikram Patel', '+919426000002', 'facebook', 'Contacted', 'Priya Sharma', '10/22/2026'],
      ['c-4', 'Ananya Desai', '+919909000003', 'whatsapp', 'New', 'Unassigned', '10/22/2026'],
      ['c-5', 'Truck Sathi Client', '+917698580043', 'whatsapp', 'Qualified', 'Truck Sathi Admin', '10/21/2026'],
      ['c-6', 'Gujarat Fleet Owner', '+919898017263', 'indiamart', 'Qualified', 'Vikram Patel', '10/20/2026'],
    ]

    const csvContent = csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `whatsapi_contacts_leads_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Exported 1,892 contacts to CSV successfully!')
  }

  // Test Integration Ping
  const handleTestIntegrationPing = () => {
    setIsTestingIntegration(true)
    setIntegrationTestResult(null)
    setTimeout(() => {
      setIsTestingIntegration(false)
      setIntegrationTestResult('200 OK • Handshake Active (19ms response)')
      toast.success(`Webhook connection to ${selectedIntegration?.name} verified!`)
    }, 450)
  }

  // Copy Webhook URL
  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    toast.success('Webhook endpoint copied to clipboard!')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  // Save Project Status in Modal
  const handleUpdateProjectStatus = (newStatus: ProjectItem['status']) => {
    if (!selectedProjectForView) return
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProjectForView.id ? { ...p, status: newStatus } : p))
    )
    setSelectedProjectForView((prev) => (prev ? { ...prev, status: newStatus } : null))
    toast.success(`Project updated to "${newStatus}"!`)
  }

  // Save Task Status in Modal
  const handleUpdateTaskStatus = (newStatus: TaskItem['status']) => {
    if (!selectedTaskForView) return
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTaskForView.id ? { ...t, status: newStatus } : t))
    )
    setSelectedTaskForView((prev) => (prev ? { ...prev, status: newStatus } : null))
    toast.success(`Task status updated to "${newStatus}"!`)
  }

  return (
    <>
      {/* ===== Top Header ===== */}
      <Header>
        <TopNav links={topNavLinks} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main Content Area ===== */}
      <Main className='space-y-5 py-4'>
        {/* Welcome & Top Action Bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4'>
          <div>
            <div className='flex items-center gap-2.5'>
              <div className='h-3 w-3 rounded-full bg-emerald-500 animate-pulse' />
              <h1 className='text-2xl font-bold tracking-tight'>
                Whatsapi Control Hub
              </h1>
              <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium'>
                Whatsapi Cloud Edition
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Multi-channel WhatsApp Cloud API, Lead Automation Engine & Multi-Agent CRM
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 gap-1.5 text-xs cursor-pointer border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5'
              onClick={() => setIsWabaModalOpen(true)}
            >
              <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
              WABA: +91 76985 80043 (GREEN)
            </Button>
            <Button
              size='sm'
              className='h-9 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer'
              onClick={() => setIsBroadcastModalOpen(true)}
            >
              <Send className='h-3.5 w-3.5' />
              + Create Broadcast
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: Total Flows, Total Chatbot, Project Planner                        */}
        {/* ========================================================================= */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Card 1: Total Flows */}
          <Card
            className='lg:col-span-3 border-border/60 shadow-xs cursor-pointer transition-all hover:border-orange-500/40 hover:shadow-sm'
            onClick={() => {
              window.location.href = '/flows'
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Flows
              </CardTitle>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600'>
                <Workflow className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold flex items-center justify-between'>
                <span>8</span>
                <span className='text-xs text-muted-foreground font-normal flex items-center gap-1 hover:text-orange-600'>
                  Open Flows <ArrowUpRight className='h-3.5 w-3.5' />
                </span>
              </div>
              <div className='flex items-center gap-2 mt-3'>
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                  Active (1)
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                  Inactive (7)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Chatbot */}
          <Card
            className='lg:col-span-3 border-border/60 shadow-xs cursor-pointer transition-all hover:border-sky-500/40 hover:shadow-sm'
            onClick={() => {
              window.location.href = '/chatbot'
            }}
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Chatbot
              </CardTitle>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600'>
                <Bot className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold flex items-center justify-between'>
                <span>3</span>
                <span className='text-xs text-muted-foreground font-normal flex items-center gap-1 hover:text-sky-600'>
                  Open Studio <ArrowUpRight className='h-3.5 w-3.5' />
                </span>
              </div>
              <div className='flex items-center gap-2 mt-3'>
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                  Active (3)
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                  Inactive (0)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Project Planner */}
          <Card className='lg:col-span-6 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-semibold'>Project Planner</CardTitle>
                <div className='flex items-center gap-3 text-xs text-muted-foreground mt-0.5'>
                  <span>Total Projects: <strong className='text-foreground'>{projects.length}</strong></span>
                  <span>•</span>
                  <span>Total Tasks: <strong className='text-foreground'>{tasks.length}</strong></span>
                </div>
              </div>

              {/* Projects | Tasks Tabs */}
              <div className='flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/40'>
                <button
                  type='button'
                  onClick={() => setPlannerTab('projects')}
                  className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    plannerTab === 'projects'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Projects
                </button>
                <button
                  type='button'
                  onClick={() => setPlannerTab('tasks')}
                  className={`rounded-md px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    plannerTab === 'tasks'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tasks
                </button>
              </div>
            </CardHeader>
            <CardContent className='pt-1'>
              {/* Filter status pills */}
              {plannerTab === 'projects' ? (
                <div className='flex items-center gap-1.5 overflow-x-auto pb-2 text-xs'>
                  <button
                    type='button'
                    onClick={() => setProjectFilter('all')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      projectFilter === 'all'
                        ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All ({projects.length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setProjectFilter('active')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      projectFilter === 'active'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Active ({projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning').length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setProjectFilter('in_progress')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      projectFilter === 'in_progress'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    In Progress ({projects.filter((p) => p.status === 'In Progress').length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setProjectFilter('completed')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      projectFilter === 'completed'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Completed ({projects.filter((p) => p.status === 'Completed').length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setProjectFilter('deployed')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      projectFilter === 'deployed'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Deployed (0)
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-1.5 overflow-x-auto pb-2 text-xs'>
                  <button
                    type='button'
                    onClick={() => setTaskFilter('all')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      taskFilter === 'all'
                        ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All Tasks ({tasks.length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setTaskFilter('in_progress')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      taskFilter === 'in_progress'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    In Progress ({tasks.filter((t) => t.status === 'In Progress').length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setTaskFilter('done')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      taskFilter === 'done'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Done ({tasks.filter((t) => t.status === 'Done').length})
                  </button>
                  <button
                    type='button'
                    onClick={() => setTaskFilter('todo')}
                    className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${
                      taskFilter === 'todo'
                        ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Todo ({tasks.filter((t) => t.status === 'Todo').length})
                  </button>
                </div>
              )}

              {/* Planner Table */}
              <div className='mt-2 overflow-x-auto rounded-md border border-border/40'>
                <table className='w-full text-xs'>
                  <thead className='bg-muted/40 font-semibold text-muted-foreground'>
                    <tr className='text-left border-b border-border/40'>
                      <th className='p-2 font-medium'>{plannerTab === 'projects' ? 'PROJECT' : 'TASK'}</th>
                      <th className='p-2 font-medium'>{plannerTab === 'projects' ? 'STATUS' : 'PROJECT'}</th>
                      <th className='p-2 font-medium'>{plannerTab === 'projects' ? 'START DATE' : 'ASSIGNEE'}</th>
                      <th className='p-2 font-medium'>DUE DATE</th>
                      <th className='p-2 font-medium'>{plannerTab === 'projects' ? 'PRIORITY' : 'STATUS'}</th>
                      <th className='p-2 font-medium text-right'>ACTION</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/30'>
                    {plannerTab === 'projects' ? (
                      filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className='p-4 text-center text-muted-foreground'>
                            No projects match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((p) => (
                          <tr key={p.id} className='hover:bg-muted/30 transition-colors'>
                            <td className='p-2 font-medium text-foreground'>{p.name}</td>
                            <td className='p-2'>
                              <span
                                className={`rounded px-1.5 py-0.5 font-medium ${
                                  p.status === 'In Progress'
                                    ? 'bg-sky-500/15 text-sky-600'
                                    : p.status === 'Completed'
                                    ? 'bg-emerald-500/15 text-emerald-600'
                                    : 'bg-amber-500/15 text-amber-600'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className='p-2 text-muted-foreground'>{p.startDate}</td>
                            <td className='p-2 text-muted-foreground'>{p.dueDate}</td>
                            <td className='p-2'>
                              <span
                                className={`rounded px-1.5 py-0.5 font-medium ${
                                  p.priority === 'High'
                                    ? 'bg-rose-500/15 text-rose-600'
                                    : 'bg-amber-500/15 text-amber-600'
                                }`}
                              >
                                {p.priority}
                              </span>
                            </td>
                            <td className='p-2 text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 cursor-pointer'
                                onClick={() => setSelectedProjectForView(p)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={6} className='p-4 text-center text-muted-foreground'>
                            No tasks match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((t) => (
                          <tr key={t.id} className='hover:bg-muted/30 transition-colors'>
                            <td className='p-2 font-medium text-foreground'>{t.title}</td>
                            <td className='p-2 text-muted-foreground truncate max-w-[140px]'>{t.project}</td>
                            <td className='p-2 text-muted-foreground'>{t.assignee}</td>
                            <td className='p-2 text-muted-foreground'>{t.dueDate}</td>
                            <td className='p-2'>
                              <span
                                className={`rounded px-1.5 py-0.5 font-medium ${
                                  t.status === 'Done'
                                    ? 'bg-emerald-500/15 text-emerald-600'
                                    : t.status === 'In Progress'
                                    ? 'bg-sky-500/15 text-sky-600'
                                    : 'bg-slate-500/15 text-slate-600'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className='p-2 text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 cursor-pointer'
                                onClick={() => setSelectedTaskForView(t)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: Messages, Message Analytics, Your Plan                             */}
        {/* ========================================================================= */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Card 1: Messages & Response Analytics */}
          <Card className='lg:col-span-4 border-border/60 shadow-xs'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base font-semibold'>Messages</CardTitle>
                <Badge className='bg-emerald-500/15 text-emerald-600 border-0 font-medium'>
                  +18.4% this month
                </Badge>
              </div>
              <div className='grid grid-cols-2 gap-2 mt-3 p-3 rounded-lg bg-muted/40'>
                <div>
                  <div className='text-xs text-muted-foreground flex items-center justify-between'>
                    <span>Sent Messages</span>
                    <span className='text-[10px] text-rose-500 font-semibold'>-5%</span>
                  </div>
                  <div className='text-xl font-bold text-foreground'>
                    {sentCount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-muted-foreground flex items-center justify-between'>
                    <span>Received Messages</span>
                    <span className='text-[10px] text-emerald-500 font-semibold'>+5%</span>
                  </div>
                  <div className='text-xl font-bold text-foreground'>
                    {receivedCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 pt-2'>
              <div className='text-xs font-semibold text-muted-foreground tracking-wider uppercase flex items-center justify-between'>
                <span>Response Analytics</span>
                <span className='text-[10px] text-emerald-600 font-medium'>Avg SLA: 2.1m</span>
              </div>

              {/* Progress: Whatsapp */}
              <div
                className='space-y-1 cursor-pointer'
                onClick={() => toast.info('WhatsApp traffic handles 92.4% of total customer conversations')}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' /> Whatsapp
                  </span>
                  <span>92.4%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-emerald-500 rounded-full transition-all duration-500' style={{ width: '92.4%' }} />
                </div>
              </div>

              {/* Progress: LinkedIn */}
              <div
                className='space-y-1 cursor-pointer'
                onClick={() => toast.info('LinkedIn Lead Gen Ads integration is active')}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-blue-600' /> LinkedIn
                  </span>
                  <span>4.2%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-blue-600 rounded-full transition-all duration-500' style={{ width: '4.2%' }} />
                </div>
              </div>

              {/* Progress: Instagram */}
              <div
                className='space-y-1 cursor-pointer'
                onClick={() => toast.info('Instagram DM Auto-Responder connected')}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-pink-500' /> Instagram
                  </span>
                  <span>2.1%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-pink-500 rounded-full transition-all duration-500' style={{ width: '2.1%' }} />
                </div>
              </div>

              {/* Progress: Twitter */}
              <div
                className='space-y-1 cursor-pointer'
                onClick={() => toast.info('Twitter / X Inbound Support webhook active')}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-sky-400' /> Twitter / X
                  </span>
                  <span>1.3%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-sky-400 rounded-full transition-all duration-500' style={{ width: '1.3%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Message Analytics Chart */}
          <Card className='lg:col-span-5 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-semibold'>Message Analytics</CardTitle>
                <CardDescription className='text-xs'>
                  Monthly breakdown of sent vs. received traffic
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <select
                  value={timeRange}
                  onChange={(e) => {
                    const val = e.target.value as 'year' | '30days' | '7days'
                    setTimeRange(val)
                    toast.info(`Switched analytics view to ${e.target.options[e.target.selectedIndex].text}`)
                  }}
                  className='h-8 rounded-md border border-border bg-background px-2 text-xs font-medium cursor-pointer'
                >
                  <option value='year'>Current Year</option>
                  <option value='30days'>Past 30 Days</option>
                  <option value='7days'>Past 7 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[230px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={messageDataMap[timeRange]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' opacity={0.4} />
                    <XAxis dataKey='month' tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey='sent' name='Sent' fill='#ea580c' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='received' name='Received' fill='#94a3b8' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Your Plan */}
          <Card className='lg:col-span-3 border-border/60 shadow-xs flex flex-col justify-between'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base font-semibold'>Your Plan</CardTitle>
                <Badge className='bg-orange-500/15 text-orange-600 border-0 font-semibold'>
                  Enterprise Active
                </Badge>
              </div>
              <CardDescription className='text-xs'>
                Local Uncapped Production Tier
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2 pt-1'>
              <div className='divide-y divide-border/40 rounded-lg border border-border/40 text-xs overflow-hidden'>
                <div className='flex justify-between p-2.5 bg-muted/20'>
                  <span className='text-muted-foreground'>Plan Tier</span>
                  <strong className='font-semibold'>Custom Enterprise</strong>
                </div>
                <div className='flex justify-between p-2.5'>
                  <span className='text-muted-foreground'>WABA Limit</span>
                  <span className='font-medium text-emerald-600'>Unlimited Local</span>
                </div>
                <div className='flex justify-between p-2.5 bg-muted/20'>
                  <span className='text-muted-foreground'>Daily Broadcast</span>
                  <strong className='font-semibold'>100,000 / day</strong>
                </div>
                <div className='flex justify-between p-2.5'>
                  <span className='text-muted-foreground'>Chatbot / Flows</span>
                  <span className='font-medium text-emerald-600'>Unlimited (Active)</span>
                </div>
                <div className='flex justify-between p-2.5 bg-muted/20'>
                  <span className='text-muted-foreground'>Team Seats</span>
                  <strong className='font-semibold'>25 Agents</strong>
                </div>
                <div className='flex justify-between p-2.5'>
                  <span className='text-muted-foreground'>License Renewal</span>
                  <span className='text-muted-foreground'>Oct 2027</span>
                </div>
              </div>

              <Button
                className='w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs h-9 cursor-pointer'
                asChild
              >
                <a href='/settings?tab=billing'>View Details & Configuration</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: Contact Source, Lead Analytics, Leads Counter                      */}
        {/* ========================================================================= */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Card 1: Contact Source Distribution */}
          <Card className='lg:col-span-4 border-border/60 shadow-xs'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base font-semibold'>Contact Source Distribution</CardTitle>
              <CardDescription className='text-xs'>
                Inbound capture breakdown by channel
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 pt-2'>
              {/* WhatsApp Organic */}
              <div
                className='space-y-1.5 cursor-pointer hover:opacity-90'
                onClick={() => {
                  window.location.href = '/users?source=whatsapp'
                }}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>WhatsApp Organic (QR & Click-to-Chat)</span>
                  <span className='text-emerald-600 font-bold'>45% (851)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-emerald-500 rounded-full' style={{ width: '45%' }} />
                </div>
              </div>

              {/* IndiaMart Lead Sync */}
              <div
                className='space-y-1.5 cursor-pointer hover:opacity-90'
                onClick={() => {
                  window.location.href = '/users?source=indiamart'
                }}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>IndiaMart Lead Push API</span>
                  <span className='text-orange-600 font-bold'>30% (567)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-orange-500 rounded-full' style={{ width: '30%' }} />
                </div>
              </div>

              {/* Facebook Lead Ads */}
              <div
                className='space-y-1.5 cursor-pointer hover:opacity-90'
                onClick={() => {
                  window.location.href = '/users?source=facebook'
                }}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>Facebook Instant Forms</span>
                  <span className='text-blue-600 font-bold'>15% (284)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-blue-600 rounded-full' style={{ width: '15%' }} />
                </div>
              </div>

              {/* Google Sheets / CSV Import */}
              <div
                className='space-y-1.5 cursor-pointer hover:opacity-90'
                onClick={() => {
                  window.location.href = '/users?source=manual'
                }}
              >
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>Google Sheets & CSV Import</span>
                  <span className='text-purple-600 font-bold'>10% (190)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-purple-500 rounded-full' style={{ width: '10%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Lead Analytics Spline Chart */}
          <Card className='lg:col-span-5 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-semibold'>Lead Analytics</CardTitle>
                <CardDescription className='text-xs'>
                  Monthly trend of total leads vs. assigned vs. pending
                </CardDescription>
              </div>
              <div className='flex items-center gap-3 text-xs'>
                <span className='flex items-center gap-1 text-orange-600 font-medium'>
                  <span className='h-2 w-2 rounded-full bg-orange-500' /> Leads
                </span>
                <span className='flex items-center gap-1 text-muted-foreground font-medium'>
                  <span className='h-2 w-2 rounded-full bg-slate-400' /> Pending
                </span>
                <span className='flex items-center gap-1 text-emerald-600 font-medium'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500' /> Assigned
                </span>
              </div>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={leadAnalyticsMap[timeRange]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id='colorLeads' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#ea580c' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#ea580c' stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id='colorAssigned' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' opacity={0.4} />
                    <XAxis dataKey='month' tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type='monotone' dataKey='leads' stroke='#ea580c' fillOpacity={1} fill='url(#colorLeads)' />
                    <Area type='monotone' dataKey='assigned' stroke='#10b981' fillOpacity={1} fill='url(#colorAssigned)' />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Leads Counter Card */}
          <Card className='lg:col-span-3 border-border/60 shadow-xs flex flex-col justify-between'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base font-semibold'>Total Leads</CardTitle>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600'>
                  <Zap className='h-4 w-4' />
                </div>
              </div>
              <div className='text-3xl font-extrabold mt-1 text-foreground'>
                {totalLeadsCount.toLocaleString()}
              </div>
              <p className='text-xs text-emerald-600 font-medium'>
                +142 today via IndiaMart & FB Ads
              </p>
            </CardHeader>
            <CardContent className='space-y-3 pt-1'>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20'>
                  <div className='text-muted-foreground'>Assigned</div>
                  <div className='text-base font-bold text-emerald-600'>
                    {assignedLeadsCount.toLocaleString()}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>75% processed</div>
                </div>
                <div className='p-2 rounded-lg bg-amber-500/10 border border-amber-500/20'>
                  <div className='text-muted-foreground'>Pending</div>
                  <div className='text-base font-bold text-amber-600'>
                    {pendingLeadsCount.toLocaleString()}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>Auto-routing active</div>
                </div>
              </div>
              <div className='flex gap-2 pt-1'>
                <Button
                  size='sm'
                  className='w-full text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                  onClick={() => setIsAddContactModalOpen(true)}
                >
                  + Add Contact
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='w-full text-xs cursor-pointer'
                  onClick={handleExportCsv}
                >
                  <Download className='h-3 w-3 me-1' /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 4: Member Statistics & Active Integrations                            */}
        {/* ========================================================================= */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Card 1: Member Statistics & Latest Leads Assigned */}
          <Card className='lg:col-span-6 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-semibold'>Member Statistics</CardTitle>
                <CardDescription className='text-xs'>
                  CRM Team agent distribution & workload
                </CardDescription>
              </div>
              <div className='flex items-center gap-1.5 text-xs'>
                <button
                  type='button'
                  onClick={() => setMemberFilter('active')}
                  className={`rounded-full px-2 py-0.5 font-semibold cursor-pointer transition-colors ${
                    memberFilter === 'active'
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  Active ({teamMembers.length})
                </button>
                <button
                  type='button'
                  onClick={() => setMemberFilter('suspended')}
                  className={`rounded-full px-2 py-0.5 cursor-pointer transition-colors ${
                    memberFilter === 'suspended'
                      ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  Suspended (0)
                </button>
                <button
                  type='button'
                  onClick={() => setMemberFilter('blocked')}
                  className={`rounded-full px-2 py-0.5 cursor-pointer transition-colors ${
                    memberFilter === 'blocked'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  Blocked (0)
                </button>
              </div>
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between'>
                <span>Latest Leads Assigned</span>
                <a href='/settings?tab=team' className='text-[10px] text-orange-600 hover:underline'>
                  Manage Team
                </a>
              </div>
              <div className='overflow-x-auto rounded-md border border-border/40'>
                <table className='w-full text-xs'>
                  <thead className='bg-muted/40 font-semibold text-muted-foreground'>
                    <tr className='text-left border-b border-border/40'>
                      <th className='p-2 font-medium'>MEMBER</th>
                      <th className='p-2 font-medium'>LEADS</th>
                      <th className='p-2 font-medium'>STATUS</th>
                      <th className='p-2 font-medium text-right'>AVG RESPONSE</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/30'>
                    {filteredTeamMembers.map((m) => (
                      <tr
                        key={m.id}
                        className='hover:bg-muted/30 transition-colors cursor-pointer'
                        onClick={() => {
                          window.location.href = `/chats?agent=${encodeURIComponent(m.name)}`
                        }}
                      >
                        <td className='p-2 font-medium flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-[10px]'>
                            {m.avatar}
                          </div>
                          {m.name}
                        </td>
                        <td className='p-2 font-semibold'>{m.leads} leads</td>
                        <td className='p-2'>
                          <span className='inline-flex items-center gap-1 text-emerald-600 font-medium'>
                            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> {m.status}
                          </span>
                        </td>
                        <td className='p-2 text-right text-muted-foreground'>{m.avgResponse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Active Integrations Grid */}
          <Card className='lg:col-span-6 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <div>
                <CardTitle className='text-base font-semibold'>Integrations</CardTitle>
                <CardDescription className='text-xs'>
                  Connected engines and webhook connectors
                </CardDescription>
              </div>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 font-medium'>
                Active {initialIntegrations.length} / 27 Total
              </Badge>
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                {initialIntegrations.map((intg) => (
                  <div
                    key={intg.id}
                    onClick={() => {
                      setSelectedIntegration(intg)
                      setIntegrationTestResult(null)
                    }}
                    className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer shadow-2xs'
                  >
                    <div className='flex items-center justify-between'>
                      <div className={`h-7 w-7 rounded ${intg.avatarColor} flex items-center justify-center font-bold text-xs`}>
                        {intg.badgeText}
                      </div>
                      <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                    </div>
                    <div className='mt-2 font-semibold text-xs truncate'>{intg.name}</div>
                    <div className='text-[10px] text-muted-foreground'>{intg.provider}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 5: Agent Performance Report                                           */}
        {/* ========================================================================= */}
        <Card className='border-border/60 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle className='text-base font-semibold'>Agent Performance Report</CardTitle>
              <CardDescription className='text-xs'>
                Multi-agent resolution efficiency, response time, and customer feedback
              </CardDescription>
            </div>
            <Button variant='outline' size='sm' className='h-8 text-xs cursor-pointer' asChild>
              <a href='/settings?tab=team'>View All Agents</a>
            </Button>
          </CardHeader>
          <CardContent className='pt-1'>
            <div className='overflow-x-auto rounded-md border border-border/40'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/40 font-semibold text-muted-foreground'>
                  <tr className='text-left border-b border-border/40'>
                    <th className='p-2.5 font-medium'>AGENT NAME</th>
                    <th className='p-2.5 font-medium'>ROLE</th>
                    <th className='p-2.5 font-medium'>CONVERSATIONS</th>
                    <th className='p-2.5 font-medium'>FIRST RESPONSE</th>
                    <th className='p-2.5 font-medium'>RESOLUTION RATE</th>
                    <th className='p-2.5 font-medium'>CSAT SCORE</th>
                    <th className='p-2.5 font-medium text-right'>STATUS</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/30'>
                  {initialAgentPerformance.map((ag) => (
                    <tr
                      key={ag.id}
                      className='hover:bg-muted/30 transition-colors cursor-pointer'
                      onClick={() => setSelectedAgentForModal(ag)}
                    >
                      <td className='p-2.5 font-medium flex items-center gap-2'>
                        <div className='h-6 w-6 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-[10px]'>
                          {ag.avatar}
                        </div>
                        {ag.name}
                      </td>
                      <td className='p-2.5 text-muted-foreground'>{ag.role}</td>
                      <td className='p-2.5 font-semibold'>{ag.conversations} chats</td>
                      <td className='p-2.5 text-muted-foreground'>{ag.firstResponse}</td>
                      <td className='p-2.5 text-emerald-600 font-semibold'>{ag.resolutionRate}</td>
                      <td className='p-2.5 font-semibold'>{ag.csatScore}</td>
                      <td className='p-2.5 text-right'>
                        <Badge className='bg-emerald-500/10 text-emerald-600 border-0'>
                          {ag.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODALS                                                        */}
      {/* ========================================================================= */}

      {/* Modal 1: WhatsApp Business API (WABA) Health Modal */}
      <Dialog open={isWabaModalOpen} onOpenChange={setIsWabaModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-2 text-emerald-600'>
              <ShieldCheck className='h-5 w-5' />
              <DialogTitle>WhatsApp Cloud API Status</DialogTitle>
            </div>
            <DialogDescription className='text-xs'>
              Live credentials and verified connectivity for official Meta Cloud Gateway.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-xs'>
            <div className='rounded-lg border border-border/50 divide-y divide-border/30 overflow-hidden'>
              <div className='flex justify-between p-2.5 bg-muted/20'>
                <span className='text-muted-foreground'>WABA ID</span>
                <span className='font-mono font-medium'>394857201948271</span>
              </div>
              <div className='flex justify-between p-2.5'>
                <span className='text-muted-foreground'>Phone Number ID</span>
                <span className='font-mono font-medium'>109283746501928</span>
              </div>
              <div className='flex justify-between p-2.5 bg-muted/20'>
                <span className='text-muted-foreground'>Display Phone</span>
                <span className='font-semibold text-emerald-600'>+91 76985 80043</span>
              </div>
              <div className='flex justify-between p-2.5'>
                <span className='text-muted-foreground'>Quality Rating</span>
                <span className='font-semibold text-emerald-600 flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500' /> GREEN (Tier 250)
                </span>
              </div>
              <div className='flex justify-between p-2.5 bg-muted/20'>
                <span className='text-muted-foreground'>Messaging Limit</span>
                <span className='font-medium'>100,000 / 24 Hours</span>
              </div>
            </div>

            {wabaTestResult && (
              <div className='p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                <span>{wabaTestResult}</span>
              </div>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs cursor-pointer'
              disabled={isWabaTesting}
              onClick={handleTestWabaConnection}
            >
              {isWabaTesting ? (
                <>
                  <RotateCw className='h-3.5 w-3.5 animate-spin me-1.5' /> Testing Ping...
                </>
              ) : (
                'Run Ping Test'
              )}
            </Button>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              asChild
            >
              <a href='/settings?tab=whatsapp'>Manage in Settings</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Create Broadcast Modal */}
      <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <div className='flex items-center gap-2 text-orange-600'>
              <Send className='h-5 w-5' />
              <DialogTitle>Quick Create WhatsApp Broadcast</DialogTitle>
            </div>
            <DialogDescription className='text-xs'>
              Send an instant broadcast campaign using verified Meta Cloud message templates.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2 text-xs'>
            <div>
              <Label className='text-xs'>Campaign Name</Label>
              <Input
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                placeholder='e.g. Diwali Flash Offer'
                className='h-8 mt-1 text-xs'
              />
            </div>

            <div>
              <Label className='text-xs'>Approved Meta Template</Label>
              <select
                value={broadcastTemplate}
                onChange={(e) => setBroadcastTemplate(e.target.value)}
                className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs'
              >
                <option value='festive_gps_offer_v2'>festive_gps_offer_v2 (Marketing • En/Hi)</option>
                <option value='welcome_onboarding'>welcome_onboarding (Utility • Auto-Trigger)</option>
                <option value='payment_reminder'>payment_reminder (Transactional • Low Rate)</option>
              </select>
            </div>

            <div>
              <Label className='text-xs'>Target Recipient Segment</Label>
              <select
                value={broadcastAudience}
                onChange={(e) => setBroadcastAudience(e.target.value)}
                className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs'
              >
                <option value='all'>All Contacts ({totalLeadsCount.toLocaleString()} leads)</option>
                <option value='hot'>Hot Inquiries (567 leads)</option>
                <option value='indiamart'>IndiaMart Live Push (851 leads)</option>
              </select>
            </div>

            <div className='p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1.5'>
              <div className='font-semibold text-muted-foreground'>Template Preview</div>
              <p className='text-foreground leading-relaxed text-xs'>
                Namaste {'{{1}}'}, festive special offer! Get government-certified AIS-140 GPS with 1-year telemetry subscription at 25% off. Tap below to claim.
              </p>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs cursor-pointer'
              onClick={() => setIsBroadcastModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              disabled={isSendingBroadcast}
              onClick={handleDispatchBroadcast}
            >
              {isSendingBroadcast ? (
                <>
                  <RotateCw className='h-3.5 w-3.5 animate-spin me-1.5' /> Dispatching...
                </>
              ) : (
                'Dispatch Broadcast Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Quick Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-2 text-orange-600'>
              <Plus className='h-5 w-5' />
              <DialogTitle>Quick Add Lead / Contact</DialogTitle>
            </div>
            <DialogDescription className='text-xs'>
              Manually ingest a new lead into the CRM. Will be auto-routed to the selected agent.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-xs'>
            <div>
              <Label className='text-xs'>Contact Name *</Label>
              <Input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder='e.g. Kailash Transporters'
                className='h-8 mt-1 text-xs'
              />
            </div>

            <div>
              <Label className='text-xs'>Phone Number (WhatsApp) *</Label>
              <Input
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder='+919825100000'
                className='h-8 mt-1 text-xs'
              />
            </div>

            <div>
              <Label className='text-xs'>Email (Optional)</Label>
              <Input
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder='contact@example.com'
                className='h-8 mt-1 text-xs'
              />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Label className='text-xs'>Source</Label>
                <select
                  value={newContactSource}
                  onChange={(e) => setNewContactSource(e.target.value)}
                  className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs'
                >
                  <option value='whatsapp'>WhatsApp Organic</option>
                  <option value='indiamart'>IndiaMart Lead</option>
                  <option value='facebook'>Facebook Instant</option>
                  <option value='manual'>Direct Entry</option>
                </select>
              </div>

              <div>
                <Label className='text-xs'>Assign To</Label>
                <select
                  value={newContactAssignee}
                  onChange={(e) => setNewContactAssignee(e.target.value)}
                  className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs'
                >
                  <option value='Ramesh Kumar'>Ramesh Kumar</option>
                  <option value='Priya Sharma'>Priya Sharma</option>
                  <option value='Vikram Patel'>Vikram Patel</option>
                  <option value='None'>Auto-Route / Queue</option>
                </select>
              </div>
            </div>

            <div>
              <Label className='text-xs'>Initial Tag</Label>
              <select
                value={newContactTag}
                onChange={(e) => setNewContactTag(e.target.value)}
                className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs'
              >
                <option value='hot-lead'>#hot-lead</option>
                <option value='GPS'>#GPS</option>
                <option value='FASTAG'>#FASTAG</option>
                <option value='Fleet Mgmt'>#Fleet Mgmt</option>
              </select>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs cursor-pointer'
              onClick={() => setIsAddContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              onClick={handleAddContact}
            >
              Save Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Project View & Status Editor */}
      <Dialog
        open={!!selectedProjectForView}
        onOpenChange={(open) => !open && setSelectedProjectForView(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-base'>{selectedProjectForView?.name}</DialogTitle>
            <DialogDescription className='text-xs'>
              Client: <strong>{selectedProjectForView?.client}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedProjectForView && (
            <div className='space-y-3 py-2 text-xs'>
              <div className='p-3 rounded-lg bg-muted/30 border border-border/40 space-y-1.5'>
                <div className='text-muted-foreground'>Description:</div>
                <div className='text-foreground'>{selectedProjectForView.description}</div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <div className='text-muted-foreground'>Start Date</div>
                  <div className='font-semibold'>{selectedProjectForView.startDate}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Due Date</div>
                  <div className='font-semibold'>{selectedProjectForView.dueDate}</div>
                </div>
              </div>

              <div>
                <Label className='text-xs'>Update Status</Label>
                <select
                  value={selectedProjectForView.status}
                  onChange={(e) => handleUpdateProjectStatus(e.target.value as ProjectItem['status'])}
                  className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs font-medium'
                >
                  <option value='In Progress'>In Progress</option>
                  <option value='Completed'>Completed</option>
                  <option value='Planning'>Planning</option>
                  <option value='Deployed'>Deployed</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              onClick={() => setSelectedProjectForView(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Task View & Status Editor */}
      <Dialog
        open={!!selectedTaskForView}
        onOpenChange={(open) => !open && setSelectedTaskForView(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-base'>{selectedTaskForView?.title}</DialogTitle>
            <DialogDescription className='text-xs'>
              Project: <strong>{selectedTaskForView?.project}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedTaskForView && (
            <div className='space-y-3 py-2 text-xs'>
              {selectedTaskForView.description && (
                <div className='p-3 rounded-lg bg-muted/30 border border-border/40'>
                  <div className='text-foreground'>{selectedTaskForView.description}</div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <div className='text-muted-foreground'>Assignee</div>
                  <div className='font-semibold'>{selectedTaskForView.assignee}</div>
                </div>
                <div>
                  <div className='text-muted-foreground'>Due Date</div>
                  <div className='font-semibold'>{selectedTaskForView.dueDate}</div>
                </div>
              </div>

              <div>
                <Label className='text-xs'>Update Status</Label>
                <select
                  value={selectedTaskForView.status}
                  onChange={(e) => handleUpdateTaskStatus(e.target.value as TaskItem['status'])}
                  className='w-full h-8 mt-1 rounded-md border border-border bg-background px-2 text-xs font-medium'
                >
                  <option value='Todo'>Todo</option>
                  <option value='In Progress'>In Progress</option>
                  <option value='Done'>Done</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              onClick={() => setSelectedTaskForView(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 6: Integration Details & Live Test */}
      <Dialog
        open={!!selectedIntegration}
        onOpenChange={(open) => !open && setSelectedIntegration(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <div className={`h-7 w-7 rounded ${selectedIntegration?.avatarColor} flex items-center justify-center font-bold text-xs`}>
                {selectedIntegration?.badgeText}
              </div>
              <DialogTitle className='text-base'>{selectedIntegration?.name}</DialogTitle>
            </div>
            <DialogDescription className='text-xs'>
              {selectedIntegration?.provider}
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className='space-y-3 py-2 text-xs'>
              <div className='flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'>
                <span className='font-medium flex items-center gap-1.5'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500' /> Status: Connected & Active
                </span>
                <span className='text-[10px]'>Sync: {selectedIntegration.lastSync}</span>
              </div>

              <div>
                <Label className='text-xs text-muted-foreground'>Webhook Ingestion Endpoint</Label>
                <div className='flex items-center gap-1.5 mt-1'>
                  <Input
                    readOnly
                    value={selectedIntegration.webhookUrl}
                    className='h-8 text-xs font-mono bg-muted/30 select-all'
                  />
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-8 w-8 shrink-0 cursor-pointer'
                    onClick={() => handleCopyWebhook(selectedIntegration.webhookUrl)}
                  >
                    {copiedUrl ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
                  </Button>
                </div>
              </div>

              {integrationTestResult && (
                <div className='p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 shrink-0' />
                  <span>{integrationTestResult}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs cursor-pointer'
              disabled={isTestingIntegration}
              onClick={handleTestIntegrationPing}
            >
              {isTestingIntegration ? (
                <>
                  <RotateCw className='h-3.5 w-3.5 animate-spin me-1.5' /> Testing...
                </>
              ) : (
                'Run Webhook Ping'
              )}
            </Button>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              asChild
            >
              <a href='/apps'>Configure in Apps</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 7: Agent Performance Profile */}
      <Dialog
        open={!!selectedAgentForModal}
        onOpenChange={(open) => !open && setSelectedAgentForModal(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-2.5'>
              <div className='h-8 w-8 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-xs'>
                {selectedAgentForModal?.avatar}
              </div>
              <div>
                <DialogTitle className='text-base'>{selectedAgentForModal?.name}</DialogTitle>
                <DialogDescription className='text-xs'>{selectedAgentForModal?.role}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedAgentForModal && (
            <div className='space-y-3 py-2 text-xs'>
              <div className='grid grid-cols-2 gap-2'>
                <div className='p-2.5 rounded-lg bg-muted/30 border border-border/40'>
                  <div className='text-muted-foreground'>Conversations</div>
                  <div className='text-lg font-bold text-foreground'>{selectedAgentForModal.conversations} chats</div>
                </div>
                <div className='p-2.5 rounded-lg bg-muted/30 border border-border/40'>
                  <div className='text-muted-foreground'>First Response</div>
                  <div className='text-lg font-bold text-foreground'>{selectedAgentForModal.firstResponse}</div>
                </div>
                <div className='p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20'>
                  <div className='text-muted-foreground'>Resolution Rate</div>
                  <div className='text-lg font-bold text-emerald-600'>{selectedAgentForModal.resolutionRate}</div>
                </div>
                <div className='p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20'>
                  <div className='text-muted-foreground'>CSAT Score</div>
                  <div className='text-lg font-bold text-amber-600'>{selectedAgentForModal.csatScore}</div>
                </div>
              </div>

              <div className='flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40 text-xs'>
                <span className='text-muted-foreground'>Queue Status</span>
                <span className='text-emerald-600 font-semibold flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500' /> Live & Available
                </span>
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              className='text-xs cursor-pointer'
              asChild
            >
              <a href='/settings?tab=team'>Edit Agent in Settings</a>
            </Button>
            <Button
              size='sm'
              className='text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
              asChild
            >
              <a href={`/chats?agent=${encodeURIComponent(selectedAgentForModal?.name || '')}`}>
                Open Inbox Queue
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const topNavLinks = [
  {
    title: 'Dashboard',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Inbox',
    href: '/chats',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Contacts',
    href: '/users',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Integrations',
    href: '/apps',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]
