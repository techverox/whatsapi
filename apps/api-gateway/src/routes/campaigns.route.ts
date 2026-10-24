import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'
import { campaignDispatcher } from '../services/campaign-dispatcher.service.js'

export const campaignsRouter = Router()

// GET /api/v1/campaigns - List campaigns
campaignsRouter.get('/', (_req: Request, res: Response) => {
  const campaigns = dbService.getCampaigns()
  res.json({
    success: true,
    total: campaigns.length,
    data: campaigns,
  })
})

// POST /api/v1/campaigns - Create/Schedule new broadcast campaign
campaignsRouter.post('/', (req: Request, res: Response) => {
  const { name, templateName, templateLang, totalContacts, scheduledAt } = req.body

  if (!name || !templateName) {
    return res.status(400).json({
      success: false,
      message: 'Campaign name and template name are required.',
    })
  }

  const campaign = dbService.createCampaign({
    name,
    templateName,
    templateLang: templateLang || 'en',
    totalContacts: Number(totalContacts) || 0,
    scheduledAt,
    status: 'scheduled',
  })

  res.status(201).json({
    success: true,
    message: 'Campaign scheduled successfully.',
    data: campaign,
  })
})

// POST /api/v1/campaigns/:id/dispatch - Trigger broadcast dispatch
campaignsRouter.post('/:id/dispatch', async (req: Request, res: Response) => {
  const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  try {
    const outcome = await campaignDispatcher.dispatchCampaign(campaignId)
    res.json({
      success: true,
      message: 'Campaign broadcast dispatched to verified audience.',
      outcome,
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    })
  }
})

// DELETE /api/v1/campaigns/:id - Delete broadcast campaign
campaignsRouter.delete('/:id', (req: Request, res: Response) => {
  const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const deleted = dbService.deleteCampaign(campaignId)
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' })
  }
  res.json({ success: true, message: 'Campaign deleted successfully.' })
})
