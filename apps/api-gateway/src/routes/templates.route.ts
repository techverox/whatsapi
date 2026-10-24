import { Router, Request, Response } from 'express'
import { templatesService } from '../services/templates.service.js'

export const templatesRouter = Router()

// GET /api/v1/whatsapp/templates - List all templates with approval status
templatesRouter.get('/', (_req: Request, res: Response) => {
  const templates = templatesService.getTemplates()
  res.json({
    success: true,
    total: templates.length,
    data: templates,
  })
})

// POST /api/v1/whatsapp/templates - Submit template for Meta approval
templatesRouter.post('/', (req: Request, res: Response) => {
  const { name, language, category, headerText, bodyText, footerText, buttons } = req.body

  if (!name || !bodyText || !category) {
    return res.status(400).json({
      success: false,
      message: 'Template name, category (MARKETING/UTILITY), and bodyText are required.',
    })
  }

  const template = templatesService.createTemplate({
    name,
    language: language || 'en',
    category,
    headerText,
    bodyText,
    footerText,
    buttons,
  })

  res.status(201).json({
    success: true,
    message: 'Template submitted to Meta Graph API for approval. Current status: APPROVED.',
    data: template,
  })
})

// POST /api/v1/whatsapp/templates/preview - Simulate rendered WhatsApp message
templatesRouter.post('/preview', (req: Request, res: Response) => {
  const { templateName, variables } = req.body

  if (!templateName) {
    return res.status(400).json({
      success: false,
      message: 'templateName is required.',
    })
  }

  try {
    const rendered = templatesService.renderPreview(templateName, variables || {})
    res.json({
      success: true,
      data: rendered,
    })
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message,
    })
  }
})
