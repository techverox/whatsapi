import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'

export const mediaRouter = Router()

// 1. GET /api/media — List all media assets with optional category & search filter
mediaRouter.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined
    const search = req.query.search as string | undefined
    const items = dbService.getMedia(category, search)
    const stats = dbService.getMediaStats()

    res.json({
      success: true,
      total: items.length,
      data: items,
      stats,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, message: msg })
  }
})

// 2. GET /api/media/stats — Aggregate stats for top enterprise metric cards
mediaRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = dbService.getMediaStats()
    res.json({
      success: true,
      data: stats,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, message: msg })
  }
})

// 3. POST /api/media/sync — Sync assets with Meta Graph API Cloud CDN
mediaRouter.post('/sync', (_req: Request, res: Response) => {
  try {
    const syncResult = dbService.syncMetaMedia()
    res.json({
      success: true,
      message: 'Media assets synchronized with Meta Cloud CDN storage.',
      data: syncResult,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, message: msg })
  }
})

// 4. GET /api/media/:id — Retrieve specific asset details
mediaRouter.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const asset = dbService.getMediaById(id)
  if (!asset) {
    return res.status(404).json({ success: false, message: 'Media asset not found.' })
  }
  res.json({ success: true, data: asset })
})

// 5. POST /api/media — Upload / Register new media asset
mediaRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, size, type, category, customPreviewUrl } = req.body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Asset name is required.',
      })
    }

    const created = dbService.createMedia({
      name: name.trim(),
      size: size || '1.00 MB',
      type: type || 'image/png',
      category,
      customPreviewUrl,
    })

    res.status(201).json({
      success: true,
      message: 'Media asset uploaded and indexed on Meta Cloud API storage.',
      data: created,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, message: msg })
  }
})

// 6. DELETE /api/media/:id — Delete media asset
mediaRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const removed = dbService.deleteMedia(id)
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Media asset not found or already deleted.' })
    }

    res.json({
      success: true,
      message: `Media asset "${removed.name}" deleted successfully.`,
      data: removed,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    res.status(500).json({ success: false, message: msg })
  }
})
