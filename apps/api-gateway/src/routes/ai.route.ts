import { Router, Request, Response } from 'express'
import { aiAssistantService } from '../services/ai-assistant.service.js'

export const aiRouter = Router()

// GET /api/v1/ai/stats - Operational stats for AI Assistant
aiRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = aiAssistantService.getStats()
  res.json({
    success: true,
    data: stats,
  })
})

// GET /api/v1/ai/config - Get current LLM model & prompt personality config
aiRouter.get('/config', (_req: Request, res: Response) => {
  const config = aiAssistantService.getConfig()
  res.json({
    success: true,
    data: config,
  })
})

// POST /api/v1/ai/config - Save/update LLM model & prompt personality config
aiRouter.post('/config', (req: Request, res: Response) => {
  const { model, temperature, prompt, autoReply, confidenceThreshold } = req.body

  const updatedConfig = aiAssistantService.updateConfig({
    model,
    temperature,
    prompt,
    autoReply: typeof autoReply === 'boolean' ? autoReply : undefined,
    confidenceThreshold,
  })

  res.json({
    success: true,
    message: 'AI Model & Personality configuration saved successfully.',
    data: updatedConfig,
  })
})

// GET /api/v1/ai/knowledge - List knowledge base documents
aiRouter.get('/knowledge', (_req: Request, res: Response) => {
  const docs = aiAssistantService.getKnowledgeDocs()
  res.json({
    success: true,
    total: docs.length,
    data: docs,
  })
})

// GET /api/v1/ai/knowledge/:id - Get specific knowledge document
aiRouter.get('/knowledge/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const doc = aiAssistantService.getKnowledgeDocById(id)

  if (!doc) {
    return res.status(404).json({
      success: false,
      message: `Knowledge document with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    data: doc,
  })
})

// POST /api/v1/ai/knowledge - Add a new knowledge document (PDF catalog, FAQ)
aiRouter.post('/knowledge', (req: Request, res: Response) => {
  const { title, category, content } = req.body

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Document title and content are required.',
    })
  }

  const doc = aiAssistantService.addKnowledgeDoc({
    title,
    category: category || 'General Knowledge',
    content,
  })

  res.status(201).json({
    success: true,
    message: 'Document added to AI Knowledge Base and indexed for RAG retrieval.',
    data: doc,
  })
})

// PUT /api/v1/ai/knowledge/:id - Update knowledge document
aiRouter.put('/knowledge/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const updates = req.body

  const updatedDoc = aiAssistantService.updateKnowledgeDoc(id, updates)
  if (!updatedDoc) {
    return res.status(404).json({
      success: false,
      message: `Knowledge document with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: 'Knowledge document updated and re-indexed.',
    data: updatedDoc,
  })
})

// DELETE /api/v1/ai/knowledge/:id - Delete knowledge document
aiRouter.delete('/knowledge/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const deleted = aiAssistantService.deleteKnowledgeDoc(id)

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Knowledge document with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: 'Knowledge document removed from vector store.',
    data: { id },
  })
})

// POST /api/v1/ai/ask - Query the grounded AI assistant
aiRouter.post('/ask', async (req: Request, res: Response) => {
  const query = req.body.query || req.body.question

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter cannot be empty.',
    })
  }

  const response = await aiAssistantService.answerQuery(query.trim())
  res.json({
    success: true,
    query,
    ...response,
    data: response,
  })
})

// POST /api/v1/ai/reset - Reset AI knowledge and configuration to defaults
aiRouter.post('/reset', (_req: Request, res: Response) => {
  const result = aiAssistantService.resetDefaults()
  res.json({
    success: true,
    message: 'AI Assistant and Knowledge Base reset to default enterprise preset.',
    data: result,
  })
})
