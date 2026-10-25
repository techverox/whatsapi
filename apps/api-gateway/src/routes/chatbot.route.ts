import { Router, Request, Response } from 'express'
import { chatbotService } from '../services/chatbot.service.js'

export const chatbotRouter = Router()

// GET /api/v1/chatbot/stats - Get operational statistics for the active flow
chatbotRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = chatbotService.getStats()
  res.json({
    success: true,
    data: stats,
  })
})

// GET /api/v1/chatbot/flow - Get the active or specified chatbot flow
chatbotRouter.get('/flow', (req: Request, res: Response) => {
  const id = typeof req.query.id === 'string' ? req.query.id : undefined
  const flow = chatbotService.getFlow(id)

  res.json({
    success: true,
    data: flow,
  })
})

// GET /api/v1/chatbot/flows - List all saved chatbot flows
chatbotRouter.get('/flows', (_req: Request, res: Response) => {
  const flows = chatbotService.listFlows()
  res.json({
    success: true,
    total: flows.length,
    data: flows,
  })
})

// POST /api/v1/chatbot/save - Save or update chatbot flow
chatbotRouter.post('/save', (req: Request, res: Response) => {
  const { id, name, isLive, wabaPhone, nodes, description } = req.body

  if (nodes && !Array.isArray(nodes)) {
    return res.status(400).json({
      success: false,
      message: 'nodes must be an array of flow nodes.',
    })
  }

  const updatedFlow = chatbotService.saveFlow({
    id,
    name,
    isLive,
    wabaPhone,
    nodes,
    description,
  })

  res.json({
    success: true,
    message: `Chatbot flow "${updatedFlow.name}" saved successfully (${updatedFlow.nodes.length} nodes).`,
    data: updatedFlow,
  })
})

// POST /api/v1/chatbot/deploy - Deploy flow live to Meta WABA
chatbotRouter.post('/deploy', (req: Request, res: Response) => {
  const { id } = req.body

  try {
    const result = chatbotService.deployFlow(id)
    res.json({
      success: true,
      message: result.message,
      data: result.flow,
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err?.message || 'Failed to deploy chatbot flow.',
    })
  }
})

// POST /api/v1/chatbot/simulate - Server-side simulation step execution
chatbotRouter.post('/simulate', (req: Request, res: Response) => {
  const { nodeIndex, nodeId, userReply } = req.body

  const simResult = chatbotService.simulateStep({
    nodeIndex: typeof nodeIndex === 'number' ? nodeIndex : undefined,
    nodeId: typeof nodeId === 'string' ? nodeId : undefined,
    userReply: typeof userReply === 'string' ? userReply : undefined,
  })

  res.json({
    success: true,
    data: simResult,
  })
})

// POST /api/v1/chatbot/reset - Restore default enterprise preset flow
chatbotRouter.post('/reset', (_req: Request, res: Response) => {
  const defaultFlow = chatbotService.resetDefaults()
  res.json({
    success: true,
    message: 'Chatbot flow restored to default Gujarat Fleet Lead Qualifier preset.',
    data: defaultFlow,
  })
})
