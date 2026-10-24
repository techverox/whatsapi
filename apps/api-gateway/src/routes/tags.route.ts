import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'

export const tagsRouter = Router()

// GET /api/v1/tags - List tags
tagsRouter.get('/', (_req: Request, res: Response) => {
  const tags = dbService.getTags()
  res.json({
    success: true,
    total: tags.length,
    data: tags,
  })
})
