import { Router, Request, Response } from 'express'
import { flowsService } from '../services/flows.service.js'

export const flowsRouter = Router()

// GET /api/v1/flows/stats - Telemetry and execution metrics
flowsRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = flowsService.getStats()
    res.json({ success: true, data: stats })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/v1/flows - List all automation flows
flowsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { status, search } = req.query
    const flows = flowsService.getAllFlows({
      status: status as string,
      search: search as string,
    })
    res.json({
      success: true,
      count: flows.length,
      data: flows,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/v1/flows/:id - Retrieve single flow by ID or UID
flowsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const flow = flowsService.getFlowById(id)
    if (!flow) {
      return res.status(404).json({ success: false, message: `Flow ${id} not found` })
    }
    res.json({ success: true, data: flow })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/v1/flows - Create new automation flow
flowsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, trigger, nodes, active } = req.body
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Valid flow name is required.' })
    }

    const newFlow = flowsService.createFlow({
      name: name.trim(),
      trigger,
      nodes,
      active,
    })

    res.status(201).json({
      success: true,
      message: `Flow "${newFlow.name}" created successfully.`,
      data: newFlow,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/v1/flows/:id - Update existing flow
flowsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = flowsService.updateFlow(id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Flow ${id} not found` })
    }

    res.json({
      success: true,
      message: `Flow "${updated.name}" updated successfully.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/v1/flows/:id/publish - Toggle Live/Draft state
flowsRouter.patch('/:id/publish', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { active } = req.body
    const updated = flowsService.togglePublish(id, active)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Flow ${id} not found` })
    }

    res.json({
      success: true,
      message: updated.active ? `Flow "${updated.name}" is now Live.` : `Flow "${updated.name}" is paused (Draft).`,
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/v1/flows/:id - Delete a flow
flowsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const deleted = flowsService.deleteFlow(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Flow ${id} not found` })
    }

    res.json({
      success: true,
      message: `Flow deleted successfully.`,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/v1/flows/:id/test - Execute live step-by-step test run
flowsRouter.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const report = await flowsService.executeTest(id, req.body?.inputPayload)
    res.json({
      success: true,
      message: `Flow "${report.flowName}" execution test completed (${report.status}).`,
      data: report,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /api/v1/flows/webhook/:flowUid - Direct webhook callback for a flow
flowsRouter.post('/webhook/:flowUid', async (req: Request, res: Response) => {
  try {
    const flowUid = req.params.flowUid as string
    const report = await flowsService.handleIncomingWebhook(flowUid, req.body)
    res.status(200).json({
      success: true,
      message: 'Inbound flow webhook executed successfully.',
      data: report,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /api/v1/flows/reset - Reset to default seed flows
flowsRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const flows = flowsService.resetToDefaults()
    res.json({
      success: true,
      message: 'Flows reset to enterprise default templates.',
      data: flows,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})
