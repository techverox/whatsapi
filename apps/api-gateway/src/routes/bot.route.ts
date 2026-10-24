import { Router, Request, Response } from 'express'
import { botService } from '../services/bot.service.js'

export const botRouter = Router()

// GET /api/v1/bot/rules - List all visual keyword rules
botRouter.get('/rules', (_req: Request, res: Response) => {
  const rules = botService.getRules()
  res.json({
    success: true,
    total: rules.length,
    data: rules,
  })
})

// POST /api/v1/bot/rules - Add a new automated rule
botRouter.post('/rules', (req: Request, res: Response) => {
  const { keywords, responseType, replyText, targetAgentName } = req.body

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'keywords must be a non-empty array of strings.',
    })
  }

  const rule = {
    id: `rule-${Date.now()}`,
    keywords,
    responseType: responseType || 'text',
    replyText,
    targetAgentName,
  }

  botService.addRule(rule)

  res.status(201).json({
    success: true,
    message: 'Bot automation rule added successfully.',
    data: rule,
  })
})
