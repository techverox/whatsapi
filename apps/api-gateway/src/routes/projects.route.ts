import { Router, Request, Response } from 'express'
import { projectsService } from '../services/projects.service.js'

export const projectsRouter = Router()

// GET /api/v1/projects/stats - Telemetry and sprint progress metrics
projectsRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = projectsService.getStats()
    res.json({ success: true, data: stats })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================================
// TASKS ENDPOINTS (Mounted before /:id to prevent route clash)
// ============================================================================
// GET /api/v1/projects/tasks - List all tasks with optional filters
projectsRouter.get('/tasks', (req: Request, res: Response) => {
  try {
    const { projectId, status, search } = req.query
    const tasks = projectsService.getAllTasks({
      projectId: projectId as string,
      status: status as string,
      search: search as string,
    })
    res.json({ success: true, count: tasks.length, data: tasks })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/v1/projects/tasks - Create task
projectsRouter.post('/tasks', (req: Request, res: Response) => {
  try {
    const { title, project, projectId, assignee, priority, status, dueDate } = req.body
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' })
    }

    const task = projectsService.createTask({
      title: title.trim(),
      project,
      projectId,
      assignee,
      priority,
      status,
      dueDate,
    })

    res.status(201).json({
      success: true,
      message: `Task "${task.title}" created successfully.`,
      data: task,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/v1/projects/tasks/:id - Update task
projectsRouter.put('/tasks/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = projectsService.updateTask(id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Task ${id} not found` })
    }
    res.json({ success: true, message: `Task updated successfully.`, data: updated })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/v1/projects/tasks/:id/toggle - Toggle task status
projectsRouter.patch('/tasks/:id/toggle', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = projectsService.toggleTaskStatus(id)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Task ${id} not found` })
    }
    res.json({
      success: true,
      message: `Task marked as ${updated.status}.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/v1/projects/tasks/:id - Delete task
projectsRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const deleted = projectsService.deleteTask(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Task ${id} not found` })
    }
    res.json({ success: true, message: `Task deleted successfully.` })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================================
// PROJECTS ENDPOINTS
// ============================================================================
// GET /api/v1/projects - List all projects
projectsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { status, search } = req.query
    const projects = projectsService.getAllProjects({
      status: status as string,
      search: search as string,
    })
    res.json({ success: true, count: projects.length, data: projects })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/v1/projects/:id - Get project by ID
projectsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const project = projectsService.getProjectById(id)
    if (!project) {
      return res.status(404).json({ success: false, message: `Project ${id} not found` })
    }
    res.json({ success: true, data: project })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/v1/projects - Create new project
projectsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, client, status, startDate, dueDate, priority, description, budget } = req.body
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required.' })
    }
    if (!client || typeof client !== 'string' || !client.trim()) {
      return res.status(400).json({ success: false, message: 'Client name is required.' })
    }

    const project = projectsService.createProject({
      name: name.trim(),
      client: client.trim(),
      status,
      startDate,
      dueDate,
      priority,
      description,
      budget,
    })

    res.status(201).json({
      success: true,
      message: `Project "${project.name}" created successfully.`,
      data: project,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/v1/projects/:id - Update project
projectsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = projectsService.updateProject(id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Project ${id} not found` })
    }
    res.json({
      success: true,
      message: `Project "${updated.name}" updated successfully.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/v1/projects/:id - Delete project
projectsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const deleted = projectsService.deleteProject(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Project ${id} not found` })
    }
    res.json({ success: true, message: `Project and linked tasks deleted successfully.` })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/v1/projects/reset - Reset to seed defaults
projectsRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const result = projectsService.resetToDefaults()
    res.json({
      success: true,
      message: 'Projects and sprint tasks reset to default templates.',
      data: result,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})
