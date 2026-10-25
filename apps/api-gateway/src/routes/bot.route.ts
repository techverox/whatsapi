import { Router, Request, Response } from 'express'
import { botService } from '../services/bot.service.js'

export const botRouter = Router()

// GET /api/v1/bot/stats - Get enterprise operational stats for FAQ bot
botRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = botService.getStats()
  res.json({
    success: true,
    data: stats,
  })
})

// GET /api/v1/bot/rules - List all visual keyword rules with optional category and search filters
botRouter.get('/rules', (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const activeOnly = req.query.activeOnly === 'true'

  const rules = botService.getRules({ category, search, activeOnly })
  res.json({
    success: true,
    total: rules.length,
    data: rules,
  })
})

// GET /api/v1/bot/rules/:id - Get a specific rule by ID
botRouter.get('/rules/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const rule = botService.getRuleById(id)

  if (!rule) {
    return res.status(404).json({
      success: false,
      message: `Bot rule with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    data: rule,
  })
})

// POST /api/v1/bot/rules - Add a new automated rule
botRouter.post('/rules', (req: Request, res: Response) => {
  const { name, keywords, responseType, replyText, reply, targetAgentName, templateName, category, priority } = req.body

  if (!keywords || (!Array.isArray(keywords) && typeof keywords !== 'string')) {
    return res.status(400).json({
      success: false,
      message: 'keywords must be an array of strings or comma-separated string.',
    })
  }

  const normalizedKeywords = Array.isArray(keywords)
    ? keywords.map(String)
    : keywords.split(',').map((k: string) => k.trim())

  if (normalizedKeywords.filter(Boolean).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one trigger keyword is required.',
    })
  }

  const finalReply = replyText || reply || ''
  if (!finalReply && responseType !== 'handoff') {
    return res.status(400).json({
      success: false,
      message: 'replyText (automated reply) is required.',
    })
  }

  const rule = botService.addRule({
    name,
    keywords: normalizedKeywords,
    responseType: responseType || 'text',
    replyText: finalReply,
    reply: finalReply,
    targetAgentName,
    templateName,
    category: category || 'General',
    priority: typeof priority === 'number' ? priority : 5,
  })

  res.status(201).json({
    success: true,
    message: 'Bot automation rule created successfully.',
    data: rule,
  })
})

// PUT /api/v1/bot/rules/:id - Update an existing automated rule
botRouter.put('/rules/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const updates = req.body

  if (updates.keywords) {
    if (!Array.isArray(updates.keywords) && typeof updates.keywords !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'keywords must be an array of strings or comma-separated string.',
      })
    }
    updates.keywords = Array.isArray(updates.keywords)
      ? updates.keywords.map(String)
      : updates.keywords.split(',').map((k: string) => k.trim())
  }

  const updatedRule = botService.updateRule(id, updates)
  if (!updatedRule) {
    return res.status(404).json({
      success: false,
      message: `Bot rule with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: 'Bot rule updated successfully.',
    data: updatedRule,
  })
})

// POST /api/v1/bot/rules/:id/toggle - Toggle rule active state
botRouter.post('/rules/:id/toggle', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const explicitActive = typeof req.body.active === 'boolean' ? req.body.active : undefined

  const updatedRule = botService.toggleRule(id, explicitActive)
  if (!updatedRule) {
    return res.status(404).json({
      success: false,
      message: `Bot rule with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: `Rule ${updatedRule.active ? 'enabled' : 'disabled'} successfully.`,
    data: updatedRule,
  })
})

// DELETE /api/v1/bot/rules/:id - Delete a rule
botRouter.delete('/rules/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const deleted = botService.deleteRule(id)

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Bot rule with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: 'Bot rule deleted successfully.',
    data: { id },
  })
})

// POST /api/v1/bot/test - Live simulation tester
botRouter.post('/test', async (req: Request, res: Response) => {
  const query = req.body.query || req.body.message || ''

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Query text is required for simulation.',
    })
  }

  const result = await botService.simulateTest(query)
  res.json({
    success: true,
    query,
    ...result,
  })
})

// POST /api/v1/bot/reset - Reset rules to default preset
botRouter.post('/reset', (_req: Request, res: Response) => {
  const rules = botService.resetDefaults()
  res.json({
    success: true,
    message: 'Bot rules reset to default enterprise preset.',
    total: rules.length,
    data: rules,
  })
})
