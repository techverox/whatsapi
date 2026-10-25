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
  currency?: string
  tags?: string[]
  assignedTeam?: string
  createdAt?: string
  updatedAt?: string
}

export interface TaskItem {
  id: string
  projectId?: string
  title: string
  project: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Todo' | 'In Progress' | 'Done'
  dueDate: string
  estimatedHours?: number
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

const defaultProjects: ProjectItem[] = [
  {
    id: 'p-1',
    name: 'Truck Sathi GPS Automation',
    client: 'Truck Sathi Logistics',
    status: 'In Progress',
    startDate: '10/15/2026',
    dueDate: '10/30/2026',
    priority: 'High',
    description: 'Automated Gujarat fleet onboarding, AIS-140 GPS activation, and daily WhatsApp mileage alerts.',
    budget: '₹4,50,000',
    currency: 'INR',
    tags: ['Gujarat Fleet', 'AIS-140', 'GPS'],
    assignedTeam: 'Ahmedabad Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    budget: '₹2,20,000',
    currency: 'INR',
    tags: ['WhatsApp Bot', 'Lead Gen'],
    assignedTeam: 'AI Engineering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    budget: '₹1,50,000',
    currency: 'INR',
    tags: ['Marketing', 'Festive Offer'],
    assignedTeam: 'Growth Desk',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultTasks: TaskItem[] = [
  {
    id: 't-1',
    projectId: 'p-1',
    title: 'Verify AIS-140 GPS Webhook Challenge on Meta',
    project: 'Truck Sathi GPS Automation',
    assignee: 'Antigravity Engineer',
    priority: 'High',
    status: 'Done',
    dueDate: '10/24/2026',
    completedAt: '10/24/2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    projectId: 'p-2',
    title: 'Configure IndiaMart Lead Ingestion Webhook',
    project: 'Gujarat Lead Qualifier Bot',
    assignee: 'Backend Core',
    priority: 'High',
    status: 'Done',
    dueDate: '10/24/2026',
    completedAt: '10/24/2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    projectId: 'p-3',
    title: 'Deploy WhatsApp Cloud Template festive_gps_offer_v2',
    project: 'Diwali Festive Broadcast Campaign',
    assignee: 'Marketing Ops',
    priority: 'Medium',
    status: 'Done',
    dueDate: '10/23/2026',
    completedAt: '10/23/2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    projectId: 'p-1',
    title: 'Implement Vector Knowledge Base Chunking',
    project: 'Truck Sathi GPS Automation',
    assignee: 'AI Team',
    priority: 'High',
    status: 'In Progress',
    dueDate: '10/25/2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-5',
    projectId: 'p-1',
    title: 'Test FASTAG Low Balance SMS Fallback',
    project: 'Truck Sathi GPS Automation',
    assignee: 'QA Lead',
    priority: 'Medium',
    status: 'Todo',
    dueDate: '10/28/2026',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function generateProjectId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function generateTaskId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export class ProjectsService {
  private projects: ProjectItem[] = JSON.parse(JSON.stringify(defaultProjects))
  private tasks: TaskItem[] = JSON.parse(JSON.stringify(defaultTasks))

  public onEvent?: (type: string, payload: any) => void

  // -------------------------------------------------------------
  // PROJECTS CRUD
  // -------------------------------------------------------------
  public getAllProjects(filter?: { status?: string; search?: string }): ProjectItem[] {
    let result = [...this.projects]
    if (filter?.status && filter.status !== 'All') {
      result = result.filter((p) => p.status.toLowerCase() === filter.status?.toLowerCase())
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }
    return result
  }

  public getProjectById(id: string): ProjectItem | undefined {
    return this.projects.find((p) => p.id === id)
  }

  public createProject(data: Partial<ProjectItem>): ProjectItem {
    const id = data.id || generateProjectId()
    const now = new Date().toLocaleDateString('en-US')
    const newProject: ProjectItem = {
      id,
      name: data.name?.trim() || 'Untitled Project',
      client: data.client?.trim() || 'Internal Agency',
      status: data.status || 'In Progress',
      startDate: data.startDate || now,
      dueDate: data.dueDate || '11/15/2026',
      priority: data.priority || 'High',
      description: data.description?.trim() || 'Client WhatsApp marketing and bot automation sprint.',
      budget: data.budget || '₹1,00,000',
      currency: data.currency || 'INR',
      tags: data.tags || ['WhatsApp'],
      assignedTeam: data.assignedTeam || 'Operations Desk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.projects.unshift(newProject)
    this.emit('PROJECT_CREATED', newProject)
    return newProject
  }

  public updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | undefined {
    const index = this.projects.findIndex((p) => p.id === id)
    if (index === -1) return undefined

    const existing = this.projects[index]
    const oldName = existing.name

    const updated: ProjectItem = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    }

    this.projects[index] = updated

    // If project name changed, update linked tasks
    if (updates.name && updates.name !== oldName) {
      this.tasks.forEach((t) => {
        if (t.projectId === id || t.project === oldName) {
          t.project = updates.name!
        }
      })
    }

    this.emit('PROJECT_UPDATED', updated)
    return updated
  }

  public deleteProject(id: string): boolean {
    const initialLen = this.projects.length
    const project = this.getProjectById(id)
    if (!project) return false

    this.projects = this.projects.filter((p) => p.id !== id)
    // Cascade delete linked tasks
    this.tasks = this.tasks.filter((t) => t.projectId !== id && t.project !== project.name)

    const deleted = this.projects.length < initialLen
    if (deleted) {
      this.emit('PROJECT_DELETED', { id, name: project.name })
    }
    return deleted
  }

  // -------------------------------------------------------------
  // TASKS CRUD
  // -------------------------------------------------------------
  public getAllTasks(filter?: { projectId?: string; status?: string; search?: string }): TaskItem[] {
    let result = [...this.tasks]
    if (filter?.projectId) {
      const proj = this.getProjectById(filter.projectId)
      result = result.filter((t) => t.projectId === filter.projectId || (proj && t.project === proj.name))
    }
    if (filter?.status && filter.status !== 'All') {
      result = result.filter((t) => t.status.toLowerCase() === filter.status?.toLowerCase())
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      )
    }
    return result
  }

  public getTaskById(id: string): TaskItem | undefined {
    return this.tasks.find((t) => t.id === id)
  }

  public createTask(data: Partial<TaskItem>): TaskItem {
    const id = data.id || generateTaskId()
    let projectName = data.project || 'General Sprints'
    let projectId = data.projectId

    if (projectId) {
      const linked = this.getProjectById(projectId)
      if (linked) projectName = linked.name
    } else {
      const linked = this.projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase())
      if (linked) projectId = linked.id
    }

    const newTask: TaskItem = {
      id,
      projectId,
      title: data.title?.trim() || 'Untitled Sprint Task',
      project: projectName,
      assignee: data.assignee || 'Antigravity Engineer',
      priority: data.priority || 'Medium',
      status: data.status || 'Todo',
      dueDate: data.dueDate || '11/01/2026',
      estimatedHours: data.estimatedHours || 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.tasks.push(newTask)
    this.emit('TASK_CREATED', newTask)
    return newTask
  }

  public updateTask(id: string, updates: Partial<TaskItem>): TaskItem | undefined {
    const index = this.tasks.findIndex((t) => t.id === id)
    if (index === -1) return undefined

    const existing = this.tasks[index]
    const updated: TaskItem = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    }

    if (updates.status === 'Done' && existing.status !== 'Done') {
      updated.completedAt = new Date().toLocaleDateString('en-US')
    } else if (updates.status && updates.status !== 'Done') {
      updated.completedAt = undefined
    }

    this.tasks[index] = updated
    this.emit('TASK_UPDATED', updated)
    return updated
  }

  public toggleTaskStatus(id: string): TaskItem | undefined {
    const task = this.getTaskById(id)
    if (!task) return undefined

    const nextStatus = task.status === 'Done' ? 'In Progress' : 'Done'
    return this.updateTask(id, { status: nextStatus })
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.tasks.length
    this.tasks = this.tasks.filter((t) => t.id !== id)
    const deleted = this.tasks.length < initialLen
    if (deleted) {
      this.emit('TASK_DELETED', { id })
    }
    return deleted
  }

  // -------------------------------------------------------------
  // STATS & TELEMETRY
  // -------------------------------------------------------------
  public getStats() {
    const totalProjects = this.projects.length
    const inProgress = this.projects.filter((p) => p.status === 'In Progress').length
    const completed = this.projects.filter((p) => p.status === 'Completed').length
    const planning = this.projects.filter((p) => p.status === 'Planning').length

    const totalTasks = this.tasks.length
    const doneTasks = this.tasks.filter((t) => t.status === 'Done').length
    const activeTasks = totalTasks - doneTasks
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return {
      totalProjects,
      inProgressSprints: inProgress,
      completedProjects: completed,
      planningProjects: planning,
      totalTasks,
      doneTasks,
      activeTasks,
      completionRate: `${completionRate}%`,
      teamVelocity: '4.8 tasks/day',
    }
  }

  public resetToDefaults() {
    this.projects = JSON.parse(JSON.stringify(defaultProjects))
    this.tasks = JSON.parse(JSON.stringify(defaultTasks))
    this.emit('PROJECTS_RESET', { projects: this.projects, tasks: this.tasks })
    return {
      projects: this.projects,
      tasks: this.tasks,
    }
  }

  private emit(type: string, payload: any) {
    if (this.onEvent) {
      try {
        this.onEvent(type, payload)
      } catch (_e) {}
    }
  }
}

export const projectsService = new ProjectsService()
