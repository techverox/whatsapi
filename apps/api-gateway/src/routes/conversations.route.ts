import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'
import { whatsAppService } from '../services/whatsapp.service.js'

export const conversationsRouter = Router()

// GET /api/v1/conversations - List conversations
conversationsRouter.get('/', (_req: Request, res: Response) => {
  const conversations = dbService.getConversations()
  res.json({
    success: true,
    total: conversations.length,
    data: conversations,
  })
})

// GET /api/v1/conversations/:id - Get conversation by ID
conversationsRouter.get('/:id', (req: Request, res: Response) => {
  const convId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const conv = dbService.getConversationById(convId)
  if (!conv) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found.',
    })
  }
  res.json({
    success: true,
    data: conv,
  })
})

// POST /api/v1/conversations/:id/messages - Send outbound message
conversationsRouter.post('/:id/messages', async (req: Request, res: Response) => {
  const convId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const { content, senderType, senderName, messageType } = req.body

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Message content cannot be empty.',
    })
  }

  const conv = dbService.getConversationById(convId)
  let wamid = `wamid.HBgM${Date.now()}AGENT`

  if (conv && conv.contactPhone) {
    try {
      const waMsg = await whatsAppService.sendTextMessage(conv.contactPhone, content)
      wamid = waMsg.wamid || wamid
    } catch (err) {
      console.error('Failed to dispatch to WhatsApp Cloud API:', err)
    }
  }

  const message = dbService.addMessage(convId, {
    content,
    senderType: senderType || 'agent',
    senderName: senderName || 'Agent Bhavik',
    messageType: messageType || 'text',
    wamid,
    status: 'sent',
  })

  res.status(201).json({
    success: true,
    message: 'Message dispatched successfully.',
    data: message,
  })
})
