import { Router, Request, Response } from 'express'
import { aiAssistantService } from '../services/ai-assistant.service.js'

export const aiRouter = Router()

// GET /api/v1/ai/knowledge - List knowledge base documents
aiRouter.get('/knowledge', (_req: Request, res: Response) => {
  const docs = aiAssistantService.getKnowledgeDocs()
  res.json({
    success: true,
    total: docs.length,
    data: docs,
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

// POST /api/v1/ai/ask - Query the grounded AI assistant
aiRouter.post('/ask', async (req: Request, res: Response) => {
  const query = req.body.query || req.body.question

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter cannot be empty.',
    })
  }

  const response = await aiAssistantService.answerQuery(query)
  res.json({
    success: true,
    query,
    ...response,
  })
})
