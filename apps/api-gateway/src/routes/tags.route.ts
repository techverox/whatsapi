import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'

export const tagsRouter = Router()

// 1. GET /api/v1/tags - List tags with dynamic contact counts & audit timestamps
tagsRouter.get('/', (_req: Request, res: Response) => {
  const tags = dbService.getTags()
  res.json({
    success: true,
    total: tags.length,
    data: tags,
  })
})

// 2. POST /api/v1/tags - Create a new tag with validation & conflict detection
tagsRouter.post('/', (req: Request, res: Response) => {
  const { name, color } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Tag name is required and must be at least 2 characters long.',
    })
  }

  if (name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Tag name cannot exceed 50 characters.',
    })
  }

  try {
    const created = dbService.createTag({
      name: name.trim(),
      color: color && typeof color === 'string' ? color.trim() : undefined,
    })
    res.status(201).json({
      success: true,
      message: `Tag "${created.name}" created successfully.`,
      data: created,
    })
  } catch (err: any) {
    res.status(409).json({
      success: false,
      message: err.message,
    })
  }
})

// 3. PUT /api/v1/tags/:id - Update tag name or color with contact cascade
tagsRouter.put('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const { name, color } = req.body

  if (!name && !color) {
    return res.status(400).json({
      success: false,
      message: 'At least name or color is required to update.',
    })
  }

  const updated = dbService.updateTag(id, { name, color })
  if (!updated) {
    return res.status(404).json({
      success: false,
      message: `Tag with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: `Tag "${updated.name}" updated successfully.`,
    data: updated,
  })
})

// 4. DELETE /api/v1/tags/:id - Safely delete tag & decouple from contacts
tagsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  const success = dbService.deleteTag(id)
  if (!success) {
    return res.status(404).json({
      success: false,
      message: `Tag with ID '${id}' not found.`,
    })
  }

  res.json({
    success: true,
    message: `Tag '${id}' removed from system and decoupled from contacts.`,
  })
})

// 5. GET /api/v1/tags/:id/contacts - List all contacts assigned to this tag
tagsRouter.get('/:id/contacts', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const contacts = dbService.getContactsByTag(id)

  res.json({
    success: true,
    tagId: id,
    total: contacts.length,
    data: contacts,
  })
})
