import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'

export const optsRouter = Router()

// 1. GET /api/v1/opts - Get current Opts compliance config & subscriber metrics
optsRouter.get('/', (_req: Request, res: Response) => {
  const config = dbService.getOptsConfig()
  res.json({
    success: true,
    data: config,
  })
})

// 2. PUT /api/v1/opts - Update Opt-In/Opt-Out keywords, auto-replies & messages
optsRouter.put('/', (req: Request, res: Response) => {
  const {
    optOutKeywords,
    optInKeywords,
    autoReplyOnOptOut,
    optOutReplyText,
    autoReplyOnOptIn,
    optInReplyText,
  } = req.body

  if (optOutKeywords !== undefined && !Array.isArray(optOutKeywords)) {
    return res.status(400).json({
      success: false,
      message: 'optOutKeywords must be an array of strings.',
    })
  }

  if (optInKeywords !== undefined && !Array.isArray(optInKeywords)) {
    return res.status(400).json({
      success: false,
      message: 'optInKeywords must be an array of strings.',
    })
  }

  const updated = dbService.updateOptsConfig({
    optOutKeywords,
    optInKeywords,
    autoReplyOnOptOut,
    optOutReplyText,
    autoReplyOnOptIn,
    optInReplyText,
  })

  res.json({
    success: true,
    message: 'Opts compliance configuration saved successfully.',
    data: updated,
  })
})

// 3. POST /api/v1/opts/reset - Reset to Meta & TRAI official defaults
optsRouter.post('/reset', (_req: Request, res: Response) => {
  const resetConfig = dbService.resetOptsConfig()
  res.json({
    success: true,
    message: 'Opts configuration reset to Meta & TRAI regulatory defaults.',
    data: resetConfig,
  })
})

// 4. POST /api/v1/opts/test - Simulate an inbound customer message
optsRouter.post('/test', (req: Request, res: Response) => {
  const { message, phone } = req.body

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message text is required to run compliance simulation.',
    })
  }

  const targetPhone = phone && typeof phone === 'string' ? phone.trim() : '+919825100001'
  const result = dbService.processOptKeyword(targetPhone, message.trim())

  const payload = {
    simulatedMessage: message.trim(),
    targetPhone,
    matched: result.matched,
    actionTaken: result.actionTaken || 'No opt keyword matched. Message routed to live inbox & AI bot.',
    autoReply: result.replyText || null,
  }

  res.json({
    success: true,
    data: payload,
    ...payload,
  })
})
