import { useState, useEffect, useCallback } from 'react'
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Sparkles,
  User,
  Trash2,
  Search,
  Check,
  RefreshCw,
  Clock,
  RotateCcw,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { veroxApi } from '@/lib/api'
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

export interface ProjectItem {
  id: string
  name: string
  client: string
  status: 'In Progress' | 'Completed' | 'Planning'
  startDate: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  description?: string
  budget?: string
  category?: string
}

export interface TaskItem {
  id: string
  title: string
  project: string
  projectId?: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Todo' | 'In Progress' | 'Done'
  dueDate: string
}

const fallbackProjects: ProjectItem[] = [
  {
    id: 'p-1',
    name: 'Truck Sathi GPS Automation',
    client: 'Truck Sathi Logistics',
    status: 'In Progress',
    startDate: '10/15/2026',
    dueDate: '10/30/2026',
    priority: 'High',
    description: 'Automated Gujarat fleet onboarding, AIS-140 GPS activation, and daily WhatsApp mileage alerts.',
  },
  {
    id: 'p-2',
    name: 'Gujarat Lead Qualifier Bot',
    client: 'Gujarat Transporters Org',
    status: 'In Progress',
    startDate: '10/18/2026',
    dueDate: '11/05/2026',
    priority: 'Medium',
    description: 'Instant WhatsApp multi-screen qualifying form with automated agent assignment for Surat and Ahmedabad.',
  },
  {
    id: 'p-3',
    name: 'Diwali Festive Broadcast Campaign',
    client: 'Internal Agency Marketing',
    status: 'Completed',
    startDate: '10/10/2026',
    dueDate: '10/24/2026',
    priority: 'High',
    description: '14,500 broadcast dispatches across commercial transport companies with festive discounts.',
  },
]

const fallbackTasks: TaskItem[] = [
  {
    id: 't-1',
    title: 'Verify AIS-140 GPS Webhook Challenge on Meta',
    project: 'Truck Sathi GPS Automation',
    assignee: 'Antigravity Engineer',
    priority: 'High',
    status: 'Done',
    dueDate: '10/24/2026',
  },
  {
    id: 't-2',
    title: 'Configure IndiaMart Lead Ingestion Webhook',
    project: 'Gujarat Lead Qualifier Bot',
    assignee: 'Backend Core',
    priority: 'High',
    status: 'Done',
    dueDate: '10/24/2026',
  },
  {
    id: 't-3',
    title: 'Deploy WhatsApp Cloud Template festive_gps_offer_v2',
    project: 'Diwali Festive Broadcast Campaign',
    assignee: 'Marketing Ops',
    priority: 'Medium',
    status: 'Done',
    dueDate: '10/23/2026',
  },
  {
    id: 't-4',
    title: 'Implement Vector Knowledge Base Chunking',
    project: 'Truck Sathi GPS Automation',
    assignee: 'AI Team',
    priority: 'High',
    status: 'In Progress',
    dueDate: '10/25/2026',
  },
  {
    id: 't-5',
    title: 'Test FASTAG Low Balance SMS Fallback',
    project: 'Truck Sathi GPS Automation',
    assignee: 'QA Lead',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '10/28/2026',
  },
]

export function Projects() {
  const [tab, setTab] = useState<'projects' | 'tasks'>('projects')
  const [projects, setProjects] = useState<ProjectItem[]>(fallbackProjects)
  const [tasks, setTasks] = useState<TaskItem[]>(fallbackTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals State
  const [projectModal, setProjectModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)

  // New Project Form
  const [projName, setProjName] = useState('')
  const [projClient, setProjClient] = useState('')
  const [projPriority, setProjPriority] = useState<'High' | 'Medium' | 'Low'>('High')
  const [projDue, setProjDue] = useState('2026-11-15')
  const [projDesc, setProjDesc] = useState('')
  const [projSubmitting, setProjSubmitting] = useState(false)

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskProject, setTaskProject] = useState(projects[0]?.name || 'Truck Sathi GPS Automation')
  const [taskAssignee, setTaskAssignee] = useState('Antigravity Engineer')
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High')
  const [taskDue, setTaskDue] = useState('2026-11-01')
  const [taskSubmitting, setTaskSubmitting] = useState(false)

  // Inline milestone adder in Project Details modal
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false)

  // Load data from Backend Gateway API
  const loadData = useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true)
      const [projRes, taskRes]: any = await Promise.all([
        veroxApi.getProjects(),
        veroxApi.getProjectTasks(),
      ])

      const fetchedProjects = projRes?.data || (Array.isArray(projRes) ? projRes : null)
      if (fetchedProjects && Array.isArray(fetchedProjects)) {
        setProjects(fetchedProjects)
        if (fetchedProjects.length > 0 && !taskProject) {
          setTaskProject(fetchedProjects[0].name)
        }
      }

      const fetchedTasks = taskRes?.data || (Array.isArray(taskRes) ? taskRes : null)
      if (fetchedTasks && Array.isArray(fetchedTasks)) {
        setTasks(fetchedTasks)
      }

      if (showToast) {
        toast.success('Projects & Tasks synchronized with Gateway API!')
      }
    } catch (err: any) {
      console.warn('Backend API sync notice:', err?.message || err)
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }, [taskProject])

  useEffect(() => {
    loadData(false)
  }, [loadData])

  // Sync selected project with updated project list
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find((p) => p.id === selectedProject.id)
      if (updated) {
        setSelectedProject(updated)
      }
    }
  }, [projects])

  const filteredProjects = projects.filter((p) => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleCreateProject = async () => {
    if (!projName.trim() || !projClient.trim()) {
      toast.error('Please enter Project Name and Client.')
      return
    }

    setProjSubmitting(true)
    try {
      const payload = {
        name: projName.trim(),
        client: projClient.trim(),
        status: 'In Progress' as const,
        startDate: new Date().toLocaleDateString('en-US'),
        dueDate: projDue,
        priority: projPriority,
        description: projDesc.trim() || 'Client WhatsApp marketing and bot automation sprint.',
      }

      const res: any = await veroxApi.createProject(payload)
      const created = res?.data || { ...payload, id: `p-${Date.now()}` }

      setProjects((prev) => [created, ...prev])
      setProjName('')
      setProjClient('')
      setProjDesc('')
      setProjectModal(false)

      toast.success('Project Created Successfully!', {
        description: `"${created.name}" added to agency pipeline.`,
      })
    } catch (err: any) {
      toast.error('Failed to create project', {
        description: err?.message || 'Server error',
      })
    } finally {
      setProjSubmitting(false)
    }
  }

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title.')
      return
    }

    setTaskSubmitting(true)
    try {
      const targetProj = projects.find((p) => p.name === taskProject)
      const payload = {
        title: taskTitle.trim(),
        project: taskProject,
        projectId: targetProj?.id,
        assignee: taskAssignee,
        priority: taskPriority,
        status: 'Todo' as const,
        dueDate: taskDue,
      }

      const res: any = await veroxApi.createProjectTask(payload)
      const created = res?.data || { ...payload, id: `t-${Date.now()}` }

      setTasks((prev) => [created, ...prev])
      setTaskTitle('')
      setTaskModal(false)

      toast.success('Task Added Successfully!', {
        description: `"${created.title}" assigned to ${created.assignee}.`,
      })
    } catch (err: any) {
      toast.error('Failed to create task', {
        description: err?.message || 'Server error',
      })
    } finally {
      setTaskSubmitting(false)
    }
  }

  const handleToggleTaskStatus = async (id: string) => {
    const current = tasks.find((t) => t.id === id)
    if (!current) return
    const nextStatus = current.status === 'Done' ? 'In Progress' : 'Done'

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    )

    try {
      await veroxApi.toggleProjectTask(id)
      toast.success(`Task status updated to "${nextStatus}"`)
    } catch (err: any) {
      // Revert if API failed
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: current.status } : t))
      )
      toast.error('Failed to update task status')
    }
  }

  const handleDeleteTask = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const taskToDelete = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.filter((t) => t.id !== id))

    try {
      await veroxApi.deleteProjectTask(id)
      toast.info(`Task "${taskToDelete?.title || id}" deleted.`)
    } catch (err: any) {
      loadData(false)
      toast.error('Failed to delete task')
    }
  }

  const handleDeleteProject = async (id: string, name: string) => {
    // Optimistic local state update
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id && t.project !== name))
    setSelectedProject(null)

    try {
      await veroxApi.deleteProject(id)
      toast.info(`Project "${name}" and linked tasks removed.`)
    } catch (err: any) {
      loadData(false)
      toast.error('Failed to delete project')
    }
  }

  const handleUpdateProjectStatus = async (status: ProjectItem['status']) => {
    if (!selectedProject) return
    const prevStatus = selectedProject.status
    const updated = { ...selectedProject, status }

    setSelectedProject(updated)
    setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? updated : p)))

    try {
      await veroxApi.updateProject(selectedProject.id, { status })
      toast.success(`Project status updated to ${status}`)
    } catch (err: any) {
      setSelectedProject({ ...selectedProject, status: prevStatus })
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? { ...p, status: prevStatus } : p))
      )
      toast.error('Failed to update project status')
    }
  }

  const handleAddMilestone = async () => {
    if (!selectedProject || !newMilestoneTitle.trim()) return

    setMilestoneSubmitting(true)
    try {
      const payload = {
        title: newMilestoneTitle.trim(),
        project: selectedProject.name,
        projectId: selectedProject.id,
        assignee: 'Antigravity Engineer',
        priority: 'High' as const,
        status: 'Todo' as const,
        dueDate: selectedProject.dueDate,
      }

      const res: any = await veroxApi.createProjectTask(payload)
      const created = res?.data || { ...payload, id: `t-${Date.now()}` }

      setTasks((prev) => [...prev, created])
      setNewMilestoneTitle('')
      toast.success('Milestone Task Added to Project!')
    } catch (err: any) {
      toast.error('Failed to add milestone')
    } finally {
      setMilestoneSubmitting(false)
    }
  }

  const handleResetDefaults = async () => {
    try {
      setIsRefreshing(true)
      await veroxApi.resetProjects()
      await loadData(false)
      toast.success('Reset to Default Agency Sprints & Milestones!')
    } catch (err: any) {
      setProjects(fallbackProjects)
      setTasks(fallbackTasks)
      toast.info('Reset local templates to default')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getProjectStats = (projectName: string) => {
    const projectTasks = tasks.filter((t) => t.project === projectName)
    const completed = projectTasks.filter((t) => t.status === 'Done').length
    const total = projectTasks.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percent }
  }

  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <FolderKanban className='h-4 w-4 text-orange-600' />
          <span>Agency Project & Client Planner</span>
          <Badge className='bg-orange-500/10 text-orange-600 border-0 text-[10px] hidden sm:inline-flex'>
            Sprint Milestones
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
              <h1 className='text-2xl font-bold tracking-tight'>Project Planner</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                {inProgressCount} Sprints In Progress
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Track client WhatsApp automation setups, marketing sprint milestones, and agent tasks
            </p>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              id='btn-reset-projects'
              size='sm'
              variant='outline'
              onClick={handleResetDefaults}
              disabled={isRefreshing}
              className='gap-1.5 text-xs h-9 cursor-pointer border-border/70 hover:bg-muted'
              title='Reset to Agency Defaults'
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className='hidden sm:inline'>Reset Defaults</span>
            </Button>
            <Button
              id='btn-refresh-projects'
              size='sm'
              variant='outline'
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className='gap-1.5 text-xs h-9 cursor-pointer'
              title='Sync with API'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className='hidden sm:inline'>Sync</span>
            </Button>
            <Button
              id='btn-new-task'
              size='sm'
              variant='outline'
              onClick={() => {
                if (projects.length > 0 && !taskProject) {
                  setTaskProject(projects[0].name)
                }
                setTaskModal(true)
              }}
              className='gap-1.5 text-xs h-9 cursor-pointer'
            >
              <Plus className='h-3.5 w-3.5' /> New Task
            </Button>
            <Button
              id='btn-new-project'
              size='sm'
              onClick={() => setProjectModal(true)}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 font-semibold shadow-xs text-xs h-9 cursor-pointer'
            >
              <Plus className='h-3.5 w-3.5' /> New Project
            </Button>
          </div>
        </div>

        {/* Tab & Search Filter Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40'>
          <div className='flex items-center gap-2 flex-wrap'>
            <div className='flex items-center gap-1.5'>
              <button
                id='btn-tab-projects'
                onClick={() => {
                  setTab('projects')
                  setStatusFilter('All')
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tab === 'projects'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                id='btn-tab-tasks'
                onClick={() => {
                  setTab('tasks')
                  setStatusFilter('All')
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  tab === 'tasks'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Tasks ({tasks.length})
              </button>
            </div>

            <div className='h-4 w-px bg-border/60 mx-1 hidden sm:block' />

            <div className='flex items-center gap-1 overflow-x-auto text-[11px]'>
              {(tab === 'projects'
                ? ['All', 'In Progress', 'Completed', 'Planning']
                : ['All', 'Done', 'In Progress', 'Todo']
              ).map((s) => {
                const filterId = `filter-status-${s.toLowerCase().replace(/\s+/g, '-')}`
                return (
                  <button
                    key={s}
                    id={filterId}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      statusFilter === s
                        ? 'bg-foreground/10 text-foreground font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              id='input-search-projects'
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='h-8 pl-8 text-xs bg-background'
            />
          </div>
        </div>

        {/* Content Views */}
        <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs'>
          {tab === 'projects' ? (
            /* Projects Table */
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/40'>
                  <tr className='text-left whitespace-nowrap'>
                    <th className='p-3 font-medium'>Project Name</th>
                    <th className='p-3 font-medium'>Client / Owner</th>
                    <th className='p-3 font-medium'>Milestones Progress</th>
                    <th className='p-3 font-medium'>Status</th>
                    <th className='p-3 font-medium'>Start Date</th>
                    <th className='p-3 font-medium'>Due Date</th>
                    <th className='p-3 font-medium'>Priority</th>
                    <th className='p-3 font-medium text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/30'>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='p-8 text-center text-muted-foreground'>
                        No projects found.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const stats = getProjectStats(p.name)
                      return (
                        <tr key={p.id} className='hover:bg-muted/20 transition-colors'>
                          <td className='p-3 font-bold text-foreground'>
                            <div className='flex items-center gap-2'>
                              <FolderKanban className='h-3.5 w-3.5 text-orange-600 shrink-0' />
                              <span>{p.name}</span>
                            </div>
                          </td>
                          <td className='p-3 text-muted-foreground'>{p.client}</td>
                          <td className='p-3'>
                            <div className='w-36 space-y-1'>
                              <div className='flex justify-between text-[10px] text-muted-foreground font-mono'>
                                <span>{stats.completed}/{stats.total} Tasks</span>
                                <span>{stats.percent}%</span>
                              </div>
                              <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-orange-600 rounded-full transition-all'
                                  style={{ width: `${stats.percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className='p-3'>
                            <Badge
                              className={`border-0 text-[10px] font-semibold ${
                                p.status === 'Completed'
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : p.status === 'Planning'
                                  ? 'bg-purple-500/15 text-purple-600'
                                  : 'bg-sky-500/15 text-sky-600'
                              }`}
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className='p-3 text-muted-foreground font-mono text-[11px]'>{p.startDate}</td>
                          <td className='p-3 text-muted-foreground font-mono text-[11px]'>{p.dueDate}</td>
                          <td className='p-3'>
                            <Badge
                              className={`border-0 text-[10px] ${
                                p.priority === 'High'
                                  ? 'bg-rose-500/15 text-rose-600'
                                  : 'bg-amber-500/15 text-amber-600'
                              }`}
                            >
                              {p.priority}
                            </Badge>
                          </td>
                          <td className='p-3 text-right'>
                            <Button
                              id={`btn-view-project-${p.id}`}
                              variant='ghost'
                              size='sm'
                              onClick={() => setSelectedProject(p)}
                              className='h-7 text-xs text-orange-600 hover:bg-orange-500/10 cursor-pointer font-semibold'
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Tasks Table */
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/40'>
                  <tr className='text-left whitespace-nowrap'>
                    <th className='p-3 font-medium'>Task Title</th>
                    <th className='p-3 font-medium'>Linked Project</th>
                    <th className='p-3 font-medium'>Assignee</th>
                    <th className='p-3 font-medium'>Priority</th>
                    <th className='p-3 font-medium'>Status</th>
                    <th className='p-3 font-medium'>Due Date</th>
                    <th className='p-3 font-medium text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/30'>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='p-8 text-center text-muted-foreground'>
                        No tasks found.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr key={t.id} className='hover:bg-muted/20 transition-colors'>
                        <td className='p-3 font-bold text-foreground'>
                          <div className='flex items-center gap-2'>
                            <button
                              id={`btn-toggle-task-${t.id}`}
                              onClick={() => handleToggleTaskStatus(t.id)}
                              className={`h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                t.status === 'Done'
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-border hover:border-orange-500'
                              }`}
                            >
                              {t.status === 'Done' && <Check className='h-3 w-3' />}
                            </button>
                            <span className={t.status === 'Done' ? 'line-through text-muted-foreground' : ''}>
                              {t.title}
                            </span>
                          </div>
                        </td>
                        <td className='p-3 text-muted-foreground'>{t.project}</td>
                        <td className='p-3 text-foreground'>
                          <div className='flex items-center gap-1.5'>
                            <User className='h-3 w-3 text-muted-foreground' />
                            <span>{t.assignee}</span>
                          </div>
                        </td>
                        <td className='p-3'>
                          <Badge
                            className={`border-0 text-[10px] ${
                              t.priority === 'High'
                                ? 'bg-rose-500/15 text-rose-600'
                                : 'bg-amber-500/15 text-amber-600'
                            }`}
                          >
                            {t.priority}
                          </Badge>
                        </td>
                        <td className='p-3'>
                          <Badge
                            className={`border-0 text-[10px] font-semibold ${
                              t.status === 'Done'
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-sky-500/15 text-sky-600'
                            }`}
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className='p-3 text-muted-foreground font-mono text-[11px]'>{t.dueDate}</td>
                        <td className='p-3 text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              id={`btn-action-task-${t.id}`}
                              variant='ghost'
                              size='sm'
                              onClick={() => handleToggleTaskStatus(t.id)}
                              className='h-7 text-xs text-orange-600 cursor-pointer font-semibold'
                            >
                              {t.status === 'Done' ? 'Reopen' : 'Mark Done'}
                            </Button>
                            <Button
                              id={`btn-delete-task-${t.id}`}
                              variant='ghost'
                              size='icon'
                              onClick={(e) => handleDeleteTask(t.id, e)}
                              className='h-7 w-7 text-muted-foreground hover:text-red-600 cursor-pointer'
                              title='Delete task'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Main>

      {/* PROJECT DETAILS & MILESTONES MODAL */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <div className='flex items-center justify-between gap-2 flex-wrap'>
                <DialogTitle className='flex items-center gap-2'>
                  <FolderKanban className='h-4 w-4 text-orange-600' />
                  <span>{selectedProject.name}</span>
                </DialogTitle>
                <div className='flex items-center gap-2'>
                  <select
                    id='select-project-details-status'
                    value={selectedProject.status}
                    onChange={(e) =>
                      handleUpdateProjectStatus(e.target.value as ProjectItem['status'])
                    }
                    className='rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold shadow-2xs focus-visible:outline-none cursor-pointer'
                  >
                    <option value='In Progress'>In Progress</option>
                    <option value='Completed'>Completed</option>
                    <option value='Planning'>Planning</option>
                  </select>
                </div>
              </div>
              <DialogDescription className='text-xs'>
                Client: <span className='font-semibold text-foreground'>{selectedProject.client}</span> • Target Due: {selectedProject.dueDate}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2 text-xs'>
              {/* Progress Summary */}
              {(() => {
                const stats = getProjectStats(selectedProject.name)
                return (
                  <div className='p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2'>
                    <div className='flex justify-between font-semibold'>
                      <span>Sprint Milestones Progress</span>
                      <span className='text-orange-600 font-mono'>
                        {stats.completed}/{stats.total} Tasks ({stats.percent}%)
                      </span>
                    </div>
                    <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-orange-600 rounded-full transition-all'
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                )
              })()}

              {/* Description */}
              <div>
                <Label className='text-xs font-semibold'>Project Scope & Specifications</Label>
                <p className='text-muted-foreground mt-1 leading-relaxed bg-muted/10 p-2.5 rounded-md border border-border/40'>
                  {selectedProject.description || 'Enterprise WhatsApp automation & CRM integration pipeline.'}
                </p>
              </div>

              {/* Linked Milestones Tasks */}
              <div className='space-y-2'>
                <div className='font-semibold text-foreground flex items-center justify-between'>
                  <span>Milestone Checklist</span>
                  <span className='text-[10px] text-muted-foreground'>Click row or checkbox to toggle status</span>
                </div>
                <div className='space-y-1.5 max-h-48 overflow-y-auto pr-1'>
                  {tasks
                    .filter(
                      (t) =>
                        t.project === selectedProject.name ||
                        (t.projectId && t.projectId === selectedProject.id)
                    )
                    .map((task) => (
                      <div
                        key={task.id}
                        id={`milestone-item-${task.id}`}
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className='p-2 rounded border border-border/50 bg-background hover:bg-muted/30 transition-colors flex items-center justify-between gap-2 cursor-pointer'
                      >
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                              task.status === 'Done'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-border'
                            }`}
                          >
                            {task.status === 'Done' && <Check className='h-3 w-3' />}
                          </div>
                          <span
                            className={
                              task.status === 'Done'
                                ? 'line-through text-muted-foreground'
                                : 'font-medium'
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Badge variant='outline' className='text-[9px] shrink-0'>
                            {task.assignee.split(' ')[0]}
                          </Badge>
                          <button
                            type='button'
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className='text-muted-foreground hover:text-red-600 p-0.5 rounded cursor-pointer'
                            title='Delete milestone task'
                          >
                            <Trash2 className='h-3 w-3' />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Inline Add Milestone */}
                <div className='flex gap-2 pt-1'>
                  <Input
                    id='input-milestone-title'
                    placeholder='Add new milestone task for this project...'
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                    className='h-8 text-xs'
                  />
                  <Button
                    id='btn-add-milestone'
                    size='sm'
                    disabled={milestoneSubmitting || !newMilestoneTitle.trim()}
                    onClick={handleAddMilestone}
                    className='h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0 cursor-pointer font-semibold'
                  >
                    {milestoneSubmitting ? (
                      <Loader2 className='h-3 w-3 animate-spin' />
                    ) : (
                      <Plus className='h-3 w-3' />
                    )}
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className='flex items-center justify-between pt-2 border-t border-border/50'>
              <Button
                id='btn-delete-selected-project'
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
                className='h-8 text-xs text-red-600 hover:bg-red-500/10 gap-1 cursor-pointer'
              >
                <Trash2 className='h-3.5 w-3.5' /> Delete Project
              </Button>
              <div className='flex items-center gap-2'>
                <Button
                  id='btn-close-details'
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedProject(null)}
                  className='h-8 text-xs'
                >
                  Close
                </Button>
                <Button
                  id='btn-save-details'
                  type='button'
                  size='sm'
                  onClick={() => {
                    toast.success('Project details verified!')
                    setSelectedProject(null)
                  }}
                  className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold'
                >
                  Done
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* CREATE NEW PROJECT MODAL */}
      <Dialog open={projectModal} onOpenChange={setProjectModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-orange-600' /> Create New Client Project
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Set up milestone tracking and WhatsApp automation sprint tasks.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Project Title</Label>
              <Input
                id='input-project-name'
                placeholder='e.g. Surat Fleet Omnichannel CRM'
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Client / Business Account</Label>
              <Input
                id='input-project-client'
                placeholder='e.g. Surat Express Logistics'
                value={projClient}
                onChange={(e) => setProjClient(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Scope / Description</Label>
              <Input
                id='input-project-desc'
                placeholder='e.g. Auto-qualification WhatsApp bot with FASTAG KYC verification'
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Priority</Label>
                <select
                  id='select-project-priority'
                  value={projPriority}
                  onChange={(e) => setProjPriority(e.target.value as ProjectItem['priority'])}
                  className='w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-2xs focus-visible:outline-none'
                >
                  <option value='High'>High Priority</option>
                  <option value='Medium'>Medium Priority</option>
                  <option value='Low'>Low Priority</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Target Due Date</Label>
                <Input
                  id='input-project-due'
                  type='date'
                  value={projDue}
                  onChange={(e) => setProjDue(e.target.value)}
                  className='text-xs'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              id='btn-cancel-new-project'
              variant='outline'
              size='sm'
              onClick={() => setProjectModal(false)}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              id='btn-submit-new-project'
              size='sm'
              disabled={projSubmitting}
              onClick={handleCreateProject}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold'
            >
              {projSubmitting ? <Loader2 className='h-3 w-3 animate-spin mr-1.5' /> : null}
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE NEW TASK MODAL */}
      <Dialog open={taskModal} onOpenChange={setTaskModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-orange-600' /> Add Sprint Task
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Assign an actionable milestone to team members under a client project.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Task Title</Label>
              <Input
                id='input-task-title'
                placeholder='e.g. Configure IndiaMart Webhook on Port 4000'
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Link to Project</Label>
              <select
                id='select-task-project'
                value={taskProject}
                onChange={(e) => setTaskProject(e.target.value)}
                className='w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-2xs focus-visible:outline-none'
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Assignee</Label>
                <Input
                  id='input-task-assignee'
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className='text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Priority</Label>
                <select
                  id='select-task-priority'
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskItem['priority'])}
                  className='w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-2xs focus-visible:outline-none'
                >
                  <option value='High'>High</option>
                  <option value='Medium'>Medium</option>
                  <option value='Low'>Low</option>
                </select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Due Date</Label>
              <Input
                id='input-task-due'
                type='date'
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className='text-xs'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              id='btn-cancel-new-task'
              variant='outline'
              size='sm'
              onClick={() => setTaskModal(false)}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              id='btn-submit-new-task'
              size='sm'
              disabled={taskSubmitting}
              onClick={handleCreateTask}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold'
            >
              {taskSubmitting ? <Loader2 className='h-3 w-3 animate-spin mr-1.5' /> : null}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
