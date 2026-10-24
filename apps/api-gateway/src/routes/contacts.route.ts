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

// PATCH /api/v1/contacts/:id - Update contact
contactsRouter.patch('/:id', (req: Request, res: Response) => {
  const contactId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const updated = dbService.updateContact(contactId, req.body)
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Contact not found.' })
  }
  res.json({ success: true, message: 'Contact updated successfully.', data: updated })
})

// DELETE /api/v1/contacts/:id - Delete contact
contactsRouter.delete('/:id', (req: Request, res: Response) => {
  const contactId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const success = dbService.deleteContact(contactId)
  if (!success) {
    return res.status(404).json({ success: false, message: 'Contact not found.' })
  }
  res.json({ success: true, message: 'Contact deleted successfully.' })
})

// POST /api/v1/contacts/bulk-delete - Delete multiple contacts
contactsRouter.post('/bulk-delete', (req: Request, res: Response) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty contact IDs array.' })
  }
  const deletedCount = dbService.bulkDeleteContacts(ids)
  res.json({ success: true, message: `Deleted ${deletedCount} contact(s).`, deletedCount })
})

