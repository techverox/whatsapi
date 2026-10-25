import { Router, Request, Response } from 'express'
import { enterpriseTasksService, EnterpriseTask } from '../services/tasks.service.js'

export const enterpriseTasksRouter = Router()

/**
 * GET /stats
 * Pipeline metrics & task status distributions
 */
enterpriseTasksRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = enterpriseTasksService.getStats()
    res.json({ success: true, data: stats })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch task metrics' })
  }
})

/**
 * POST /reset
 * Reset task pipeline to default agency records
 */
enterpriseTasksRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const result = enterpriseTasksService.resetToDefaults()
    res.json({ success: true, message: 'Tasks reset to defaults', count: result.count })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to reset tasks' })
  }
})

/**
 * POST /bulk-delete
 * Delete multiple tasks by ID array
 */
enterpriseTasksRouter.post('/bulk-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'ids must be a non-empty array of task IDs' })
    }

    const result = enterpriseTasksService.bulkDelete(ids)
    res.json({ success: true, count: result.count, message: `Deleted ${result.count} tasks` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to bulk delete tasks' })
  }
})

/**
 * POST /bulk-status
 * Update status for multiple tasks
 */
enterpriseTasksRouter.post('/bulk-status', (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'ids must be a non-empty array of task IDs' })
    }
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' })
    }

    const result = enterpriseTasksService.bulkUpdateStatus(ids, status as EnterpriseTask['status'])
    res.json({ success: true, count: result.count, message: `Updated status for ${result.count} tasks` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update task statuses' })
  }
})

/**
 * POST /bulk-priority
 * Update priority for multiple tasks
 */
enterpriseTasksRouter.post('/bulk-priority', (req: Request, res: Response) => {
  try {
    const { ids, priority } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'ids must be a non-empty array of task IDs' })
    }
    if (!priority) {
      return res.status(400).json({ success: false, error: 'priority is required' })
    }

    const result = enterpriseTasksService.bulkUpdatePriority(ids, priority as EnterpriseTask['priority'])
    res.json({ success: true, count: result.count, message: `Updated priority for ${result.count} tasks` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update task priorities' })
  }
})

/**
 * POST /import
 * Bulk import tasks
 */
enterpriseTasksRouter.post('/import', (req: Request, res: Response) => {
  try {
    const { tasks } = req.body
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, error: 'tasks must be a non-empty array' })
    }

    const result = enterpriseTasksService.importTasks(tasks)
    res.status(201).json({ success: true, count: result.imported, data: result.tasks, message: `Successfully imported ${result.imported} tasks` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to import tasks' })
  }
})

/**
 * GET /
 * Get all tasks with optional search, status, priority, and label filters
 */
enterpriseTasksRouter.get('/', (req: Request, res: Response) => {
  try {
    const { search, status, priority, label, stateId } = req.query
    const tasks = enterpriseTasksService.getAll({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
      label: typeof label === 'string' ? label : undefined,
      stateId: typeof stateId === 'string' ? stateId : undefined,
    })

    res.json({ success: true, count: tasks.length, data: tasks })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch tasks' })
  }
})

/**
 * GET /:id
 * Get single task by ID
 */
enterpriseTasksRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.id)
    const task = enterpriseTasksService.getById(taskId)
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    res.json({ success: true, data: task })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch task' })
  }
})

/**
 * POST /
 * Create a new task
 */
enterpriseTasksRouter.post('/', (req: Request, res: Response) => {
  try {
    const { title, status, label, priority, assignee, stateId, projectId } = req.body
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' })
    }

    const task = enterpriseTasksService.create({
      title,
      status,
      label,
      priority,
      assignee,
      stateId,
      projectId,
    })

    res.status(201).json({ success: true, data: task, message: 'Task created successfully' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to create task' })
  }
})

/**
 * PUT /:id
 * Update an existing task
 */
enterpriseTasksRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.id)
    const updated = enterpriseTasksService.update(taskId, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    res.json({ success: true, data: updated, message: 'Task updated successfully' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update task' })
  }
})

/**
 * DELETE /:id
 * Delete a single task
 */
enterpriseTasksRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const taskId = String(req.params.id)
    const deleted = enterpriseTasksService.delete(taskId)
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to delete task' })
  }
})
