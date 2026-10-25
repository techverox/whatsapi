import { Router, Request, Response } from 'express'
import { knowledgeBaseService } from '../services/knowledge-base.service.js'

export const knowledgeBaseRouter = Router()

// GET /api/knowledge-base/categories - Get all categories with their articles
knowledgeBaseRouter.get('/categories', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined
    const categories = knowledgeBaseService.getAllCategories(search)
    res.status(200).json({
      success: true,
      data: categories,
      meta: knowledgeBaseService.getStats(),
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/knowledge-base/categories - Create new category
knowledgeBaseRouter.post('/categories', (req: Request, res: Response) => {
  try {
    const { name, iconColor, description } = req.body
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Category name is required.' })
    }
    const cat = knowledgeBaseService.createCategory({ name, iconColor, description })
    res.status(201).json({
      success: true,
      message: `Category '${cat.name}' created successfully.`,
      data: cat,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/knowledge-base/categories/:id - Update category
knowledgeBaseRouter.put('/categories/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = knowledgeBaseService.updateCategory(id, req.body)
    res.status(200).json({
      success: true,
      message: `Category '${updated.name}' updated.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/knowledge-base/categories/:id - Delete category
knowledgeBaseRouter.delete('/categories/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = knowledgeBaseService.deleteCategory(id)
    res.status(200).json({
      success: true,
      message: `Category '${id}' and its ${result.deletedArticlesCount} articles removed.`,
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/knowledge-base/articles - Query articles
knowledgeBaseRouter.get('/articles', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined
    const categoryId = req.query.categoryId as string | undefined
    const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined

    const articles = knowledgeBaseService.getAllArticles({ search, categoryId, featured })
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/knowledge-base/articles/:id - Get article by ID
knowledgeBaseRouter.get('/articles/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const article = knowledgeBaseService.getArticleById(id)
    if (!article) {
      return res.status(404).json({ success: false, message: `Article '${id}' not found.` })
    }
    res.status(200).json({
      success: true,
      data: article,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/knowledge-base/articles - Create article
knowledgeBaseRouter.post('/articles', (req: Request, res: Response) => {
  try {
    const { title, categoryId, content, summary, routeLink, featured, tags } = req.body
    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, categoryId, and documentation content are required.',
      })
    }

    const article = knowledgeBaseService.createArticle({
      title,
      categoryId,
      content,
      summary,
      routeLink,
      featured,
      tags,
    })

    res.status(201).json({
      success: true,
      message: `Article '${article.title}' created and vectorized successfully.`,
      data: article,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/knowledge-base/articles/:id - Update article
knowledgeBaseRouter.put('/articles/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const updated = knowledgeBaseService.updateArticle(id, req.body)
    res.status(200).json({
      success: true,
      message: `Article '${updated.title}' updated successfully.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/knowledge-base/articles/:id - Delete article
knowledgeBaseRouter.delete('/articles/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const result = knowledgeBaseService.deleteArticle(id)
    res.status(200).json({
      success: true,
      message: `Article '${id}' deleted successfully.`,
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /api/knowledge-base/sync-ai - Sync articles with AI Assistant vector store
knowledgeBaseRouter.post('/sync-ai', (_req: Request, res: Response) => {
  try {
    const result = knowledgeBaseService.syncToAI()
    res.status(200).json({
      success: true,
      message: 'Knowledge Base successfully synchronized with AI Assistant vector embeddings.',
      data: result,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/knowledge-base/stats - Statistics
knowledgeBaseRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: knowledgeBaseService.getStats(),
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/knowledge-base/export - Export entire KB
knowledgeBaseRouter.get('/export', (_req: Request, res: Response) => {
  try {
    const payload = knowledgeBaseService.exportKnowledgeBase()
    res.status(200).json({
      success: true,
      data: payload,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/knowledge-base/import - Import KB payload
knowledgeBaseRouter.post('/import', (req: Request, res: Response) => {
  try {
    const result = knowledgeBaseService.importKnowledgeBase(req.body)
    res.status(200).json({
      success: true,
      message: 'Knowledge Base imported successfully.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /api/knowledge-base/reset - Restore factory seed articles
knowledgeBaseRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const categories = knowledgeBaseService.resetToDefaults()
    res.status(200).json({
      success: true,
      message: 'Knowledge Base reset to default documentation articles.',
      data: categories,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})
