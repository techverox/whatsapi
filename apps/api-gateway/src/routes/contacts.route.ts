import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'

export const contactsRouter = Router()

// GET /api/v1/contacts - List contacts with filter & search
contactsRouter.get('/', (req: Request, res: Response) => {
  const { search, tag } = req.query
  const contacts = dbService.getContacts(search as string, tag as string)
  res.json({
    success: true,
    total: contacts.length,
    data: contacts,
  })
})

// POST /api/v1/contacts - Create a new contact
contactsRouter.post('/', (req: Request, res: Response) => {
  const { name, phone, email, source, tags, assignedToName } = req.body

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone number are required fields.',
    })
  }

  const contact = dbService.createContact({
    name,
    phone,
    email,
    source,
    tags,
    assignedToName,
  })

  res.status(201).json({
    success: true,
    message: 'Contact created successfully.',
    data: contact,
  })
})
