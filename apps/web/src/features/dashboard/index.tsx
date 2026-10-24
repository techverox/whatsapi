import { useState } from 'react'
import {
  Workflow,
  Bot,
  Zap,
  Send,
  ShieldCheck,
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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

const monthlyMessageData = [
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
]

const leadAnalyticsData = [
  { month: 'May', leads: 420, pending: 110, assigned: 310 },
  { month: 'Jun', leads: 680, pending: 140, assigned: 540 },
  { month: 'Jul', leads: 890, pending: 220, assigned: 670 },
  { month: 'Aug', leads: 1240, pending: 310, assigned: 930 },
  { month: 'Sep', leads: 1560, pending: 380, assigned: 1180 },
  { month: 'Oct', leads: 1892, pending: 472, assigned: 1420 },
]

export function Dashboard() {
  const [plannerTab, setPlannerTab] = useState<'projects' | 'tasks'>('projects')
  const [plannerFilter, setPlannerFilter] = useState<'all' | 'in_progress'>('all')

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
            <Button variant='outline' size='sm' className='h-9 gap-1.5 text-xs' asChild>
              <a href='/manage/templates'>
                <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
                WABA: +91 76985 80043 (GREEN)
              </a>
            </Button>
            <Button size='sm' className='h-9 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs' asChild>
              <a href='/campaigns'>
                <Send className='h-3.5 w-3.5' />
                + Create Broadcast
              </a>
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: Total Flows, Total Chatbot, Project Planner                        */}
        {/* ========================================================================= */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Card 1: Total Flows */}
          <Card className='lg:col-span-3 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Flows
              </CardTitle>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600'>
                <Workflow className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>8</div>
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
          <Card className='lg:col-span-3 border-border/60 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Chatbot
              </CardTitle>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600'>
                <Bot className='h-5 w-5' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>3</div>
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
                  <span>Total Projects: <strong className='text-foreground'>2</strong></span>
                  <span>•</span>
                  <span>Total Tasks: <strong className='text-foreground'>1</strong></span>
                </div>
              </div>
              {/* Projects | Tasks Tabs */}
              <div className='flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/40'>
                <button
                  onClick={() => setPlannerTab('projects')}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    plannerTab === 'projects'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setPlannerTab('tasks')}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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
              <div className='flex items-center gap-1.5 overflow-x-auto pb-2 text-xs'>
                <button
                  onClick={() => setPlannerFilter('all')}
                  className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                    plannerFilter === 'all'
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All (2)
                </button>
                <button className='rounded-full px-2.5 py-0.5 bg-muted/60 text-muted-foreground'>
                  Active (0)
                </button>
                <button
                  onClick={() => setPlannerFilter('in_progress')}
                  className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                    plannerFilter === 'in_progress'
                      ? 'bg-orange-500/15 text-orange-600 border border-orange-500/30'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  In Progress (2)
                </button>
                <button className='rounded-full px-2.5 py-0.5 bg-muted/60 text-muted-foreground'>
                  Completed (0)
                </button>
                <button className='rounded-full px-2.5 py-0.5 bg-muted/60 text-muted-foreground'>
                  Deployed (0)
                </button>
              </div>

              {/* Planner Table */}
              <div className='mt-2 overflow-x-auto rounded-md border border-border/40'>
                <table className='w-full text-xs'>
                  <thead className='bg-muted/40 font-semibold text-muted-foreground'>
                    <tr className='text-left border-b border-border/40'>
                      <th className='p-2 font-medium'>PROJECT</th>
                      <th className='p-2 font-medium'>STATUS</th>
                      <th className='p-2 font-medium'>START DATE</th>
                      <th className='p-2 font-medium'>DUE DATE</th>
                      <th className='p-2 font-medium'>PRIORITY</th>
                      <th className='p-2 font-medium text-right'>ACTION</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border/30'>
                    <tr>
                      <td className='p-2 font-medium'>Truck Sathi GPS Automation</td>
                      <td className='p-2'>
                        <span className='rounded bg-sky-500/15 px-1.5 py-0.5 font-medium text-sky-600'>
                          In Progress
                        </span>
                      </td>
                      <td className='p-2 text-muted-foreground'>10/15/2026</td>
                      <td className='p-2 text-muted-foreground'>10/30/2026</td>
                      <td className='p-2'>
                        <span className='rounded bg-rose-500/15 px-1.5 py-0.5 font-medium text-rose-600'>
                          High
                        </span>
                      </td>
                      <td className='p-2 text-right'>
                        <Button variant='ghost' size='sm' className='h-6 px-2 text-xs text-orange-600'>
                          View
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-2 font-medium'>Gujarat Lead Qualifier Bot</td>
                      <td className='p-2'>
                        <span className='rounded bg-sky-500/15 px-1.5 py-0.5 font-medium text-sky-600'>
                          In Progress
                        </span>
                      </td>
                      <td className='p-2 text-muted-foreground'>10/18/2026</td>
                      <td className='p-2 text-muted-foreground'>11/05/2026</td>
                      <td className='p-2'>
                        <span className='rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600'>
                          Medium
                        </span>
                      </td>
                      <td className='p-2 text-right'>
                        <Button variant='ghost' size='sm' className='h-6 px-2 text-xs text-orange-600'>
                          View
                        </Button>
                      </td>
                    </tr>
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
                  <div className='text-xl font-bold text-foreground'>978</div>
                </div>
                <div>
                  <div className='text-xs text-muted-foreground flex items-center justify-between'>
                    <span>Received Messages</span>
                    <span className='text-[10px] text-emerald-500 font-semibold'>+5%</span>
                  </div>
                  <div className='text-xl font-bold text-foreground'>1,251</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 pt-2'>
              <div className='text-xs font-semibold text-muted-foreground tracking-wider uppercase'>
                Response Analytics
              </div>

              {/* Progress: Whatsapp */}
              <div className='space-y-1'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' /> Whatsapp
                  </span>
                  <span>92.4%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-emerald-500 rounded-full' style={{ width: '92.4%' }} />
                </div>
              </div>

              {/* Progress: LinkedIn */}
              <div className='space-y-1'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-blue-600' /> LinkedIn
                  </span>
                  <span>4.2%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-blue-600 rounded-full' style={{ width: '4.2%' }} />
                </div>
              </div>

              {/* Progress: Instagram */}
              <div className='space-y-1'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-pink-500' /> Instagram
                  </span>
                  <span>2.1%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-pink-500 rounded-full' style={{ width: '2.1%' }} />
                </div>
              </div>

              {/* Progress: Twitter */}
              <div className='space-y-1'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='flex items-center gap-1.5'>
                    <span className='h-2 w-2 rounded-full bg-sky-400' /> Twitter / X
                  </span>
                  <span>1.3%</span>
                </div>
                <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-sky-400 rounded-full' style={{ width: '1.3%' }} />
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
                <select className='h-8 rounded-md border border-border bg-background px-2 text-xs font-medium'>
                  <option>Current Year</option>
                  <option>Past 30 Days</option>
                  <option>Past 7 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className='pt-2'>
              <div className='h-[230px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={monthlyMessageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

              <Button className='w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs h-9' asChild>
                <a href='/settings'>View Details & Configuration</a>
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
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>WhatsApp Organic (QR & Click-to-Chat)</span>
                  <span className='text-emerald-600 font-bold'>45% (851)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-emerald-500 rounded-full' style={{ width: '45%' }} />
                </div>
              </div>

              {/* IndiaMart Lead Sync */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>IndiaMart Lead Push API</span>
                  <span className='text-orange-600 font-bold'>30% (567)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-orange-500 rounded-full' style={{ width: '30%' }} />
                </div>
              </div>

              {/* Facebook Lead Ads */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs font-medium'>
                  <span className='text-foreground font-semibold'>Facebook Instant Forms</span>
                  <span className='text-blue-600 font-bold'>15% (284)</span>
                </div>
                <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div className='h-full bg-blue-600 rounded-full' style={{ width: '15%' }} />
                </div>
              </div>

              {/* Google Sheets / CSV Import */}
              <div className='space-y-1.5'>
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
                  <AreaChart data={leadAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <div className='text-3xl font-extrabold mt-1 text-foreground'>1,892</div>
              <p className='text-xs text-emerald-600 font-medium'>
                +142 today via IndiaMart & FB Ads
              </p>
            </CardHeader>
            <CardContent className='space-y-3 pt-1'>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20'>
                  <div className='text-muted-foreground'>Assigned</div>
                  <div className='text-base font-bold text-emerald-600'>1,420</div>
                  <div className='text-[10px] text-muted-foreground'>75% processed</div>
                </div>
                <div className='p-2 rounded-lg bg-amber-500/10 border border-amber-500/20'>
                  <div className='text-muted-foreground'>Pending</div>
                  <div className='text-base font-bold text-amber-600'>472</div>
                  <div className='text-[10px] text-muted-foreground'>Auto-routing active</div>
                </div>
              </div>
              <div className='flex gap-2 pt-1'>
                <Button size='sm' className='w-full text-xs bg-orange-600 hover:bg-orange-700 text-white' asChild>
                  <a href='/users'>+ Add Contact</a>
                </Button>
                <Button size='sm' variant='outline' className='w-full text-xs' asChild>
                  <a href='/users'>Export CSV</a>
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
                <span className='rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-600'>
                  Active (8)
                </span>
                <span className='rounded-full bg-muted px-2 py-0.5 text-muted-foreground'>
                  Suspended (0)
                </span>
                <span className='rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-600'>
                  Blocked (0)
                </span>
              </div>
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='text-xs font-semibold text-muted-foreground mb-2'>
                Latest Leads Assigned
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
                    <tr>
                      <td className='p-2 font-medium flex items-center gap-2'>
                        <div className='h-6 w-6 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-[10px]'>
                          RK
                        </div>
                        Ramesh Kumar
                      </td>
                      <td className='p-2 font-semibold'>24 leads</td>
                      <td className='p-2'>
                        <span className='inline-flex items-center gap-1 text-emerald-600 font-medium'>
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> Online
                        </span>
                      </td>
                      <td className='p-2 text-right text-muted-foreground'>2.4 mins</td>
                    </tr>
                    <tr>
                      <td className='p-2 font-medium flex items-center gap-2'>
                        <div className='h-6 w-6 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-[10px]'>
                          PS
                        </div>
                        Priya Sharma
                      </td>
                      <td className='p-2 font-semibold'>19 leads</td>
                      <td className='p-2'>
                        <span className='inline-flex items-center gap-1 text-emerald-600 font-medium'>
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> Online
                        </span>
                      </td>
                      <td className='p-2 text-right text-muted-foreground'>1.8 mins</td>
                    </tr>
                    <tr>
                      <td className='p-2 font-medium flex items-center gap-2'>
                        <div className='h-6 w-6 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-[10px]'>
                          VP
                        </div>
                        Vikram Patel
                      </td>
                      <td className='p-2 font-semibold'>15 leads</td>
                      <td className='p-2'>
                        <span className='inline-flex items-center gap-1 text-emerald-600 font-medium'>
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> Online
                        </span>
                      </td>
                      <td className='p-2 text-right text-muted-foreground'>3.1 mins</td>
                    </tr>
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
                Active 6 / 27 Total
              </Badge>
            </CardHeader>
            <CardContent className='pt-1'>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs'>
                      WA
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>whatsapi-whatsapp</div>
                  <div className='text-[10px] text-muted-foreground'>Official Cloud API</div>
                </div>

                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs'>
                      AI
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>openai / gemini</div>
                  <div className='text-[10px] text-muted-foreground'>AI Assistant Engine</div>
                </div>

                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs'>
                      IM
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>@app/indiamart</div>
                  <div className='text-[10px] text-muted-foreground'>Real-time Lead Push</div>
                </div>

                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs'>
                      FB
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>FACEBOOK_LEAD_ADS</div>
                  <div className='text-[10px] text-muted-foreground'>Instant Webhook</div>
                </div>

                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs'>
                      WB
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>WHATSAPP_BUSINESS</div>
                  <div className='text-[10px] text-muted-foreground'>Truck Sathi (Active)</div>
                </div>

                <div className='p-2.5 rounded-lg border border-border/50 bg-card hover:border-orange-500/40 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-7 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs'>
                      API
                    </div>
                    <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  </div>
                  <div className='mt-2 font-semibold text-xs truncate'>@app/messaging-api</div>
                  <div className='text-[10px] text-muted-foreground'>Local Dispatcher</div>
                </div>
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
            <Button variant='outline' size='sm' className='h-8 text-xs' asChild>
              <a href='/users'>View All Agents</a>
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
                  <tr>
                    <td className='p-2.5 font-medium flex items-center gap-2'>
                      <div className='h-6 w-6 rounded-full bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-[10px]'>
                        TS
                      </div>
                      Truck Sathi Admin
                    </td>
                    <td className='p-2.5 text-muted-foreground'>Lead Manager</td>
                    <td className='p-2.5 font-semibold'>512 chats</td>
                    <td className='p-2.5 text-muted-foreground'>1.2 mins</td>
                    <td className='p-2.5 text-emerald-600 font-semibold'>98.4%</td>
                    <td className='p-2.5 font-semibold'>4.9 / 5.0 ⭐</td>
                    <td className='p-2.5 text-right'>
                      <Badge className='bg-emerald-500/10 text-emerald-600 border-0'>Active</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className='p-2.5 font-medium flex items-center gap-2'>
                      <div className='h-6 w-6 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-[10px]'>
                        RK
                      </div>
                      Ramesh Kumar
                    </td>
                    <td className='p-2.5 text-muted-foreground'>Fleet Sales Specialist</td>
                    <td className='p-2.5 font-semibold'>340 chats</td>
                    <td className='p-2.5 text-muted-foreground'>2.4 mins</td>
                    <td className='p-2.5 text-emerald-600 font-semibold'>95.1%</td>
                    <td className='p-2.5 font-semibold'>4.8 / 5.0 ⭐</td>
                    <td className='p-2.5 text-right'>
                      <Badge className='bg-emerald-500/10 text-emerald-600 border-0'>Active</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className='p-2.5 font-medium flex items-center gap-2'>
                      <div className='h-6 w-6 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-[10px]'>
                        PS
                      </div>
                      Priya Sharma
                    </td>
                    <td className='p-2.5 text-muted-foreground'>Customer Support</td>
                    <td className='p-2.5 font-semibold'>284 chats</td>
                    <td className='p-2.5 text-muted-foreground'>1.8 mins</td>
                    <td className='p-2.5 text-emerald-600 font-semibold'>96.8%</td>
                    <td className='p-2.5 font-semibold'>4.9 / 5.0 ⭐</td>
                    <td className='p-2.5 text-right'>
                      <Badge className='bg-emerald-500/10 text-emerald-600 border-0'>Active</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Main>
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
