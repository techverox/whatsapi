import { Router, Request, Response } from 'express'
import { dbService } from '../services/db.service.js'
import { ColumnDataType } from '../data/mock-store.js'

export const columnsRouter = Router()

// 1. GET /api/v1/columns - List all columns with usage counts & system flags
columnsRouter.get('/', (_req: Request, res: Response) => {
  const columns = dbService.getColumns()
  res.json({
    success: true,
    total: columns.length,
    data: columns,
  })
})

// 2. POST /api/v1/columns - Create a new custom column with full validation
columnsRouter.post('/', (req: Request, res: Response) => {
  const { name, type, options, required, description } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Column name is required and must be at least 2 characters long.',
    })
  }

  if (name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Column name cannot exceed 50 characters.',
    })
  }

  const validTypes: ColumnDataType[] = ['Text', 'Number', 'Select', 'Boolean', 'Phone', 'Date']
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid column type "${type}". Allowed types: ${validTypes.join(', ')}`,
    })
  }

  if (type === 'Select' && (!options || typeof options !== 'string' || !options.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Options (comma-separated list) are required for "Select" column type.',
    })
  }

  try {
    const created = dbService.createColumn({
      name: name.trim(),
      type,
      options: options ? String(options).trim() : undefined,
      required: Boolean(required),
      description: description ? String(description).trim() : undefined,
    })

    res.status(201).json({
      success: true,
      message: `Custom column "${created.name}" created successfully.`,
      data: created,
    })
  } catch (err: any) {
    res.status(409).json({
      success: false,
      message: err.message,
    })
  }
})

// 3. PUT /api/v1/columns/:id - Update column metadata, options, or requirements
columnsRouter.put('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const { name, type, options, required, description } = req.body

  const existing = dbService.getColumnById(id)
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: `Column with ID "${id}" not found.`,
    })
  }

  if (name && (typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(400).json({
      success: false,
      message: 'Column name must be at least 2 characters long.',
    })
  }

  const updated = dbService.updateColumn(id, {
    name,
    type,
    options,
    required,
    description,
  })

  res.json({
    success: true,
    message: `Column "${updated?.name}" updated successfully.`,
    data: updated,
  })
})

// 4. DELETE /api/v1/columns/:id - Safely delete column & decouple from contacts
columnsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  const result = dbService.deleteColumn(id)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    })
  }

  res.json({
    success: true,
    message: result.message,
  })
})

// 5. GET /api/v1/columns/:id/stats - Column usage details across CRM
columnsRouter.get('/:id/stats', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const column = dbService.getColumnById(id)

  if (!column) {
    return res.status(404).json({
      success: false,
      message: `Column with ID "${id}" not found.`,
    })
  }

  const matchingContacts = dbService.contacts.filter((c) => {
    if (c.status === 'deleted') return false
    if (column.key === 'email' && c.email) return true
    if (column.key === 'status' && c.status) return true
    if (column.key === 'waba_phone_number' && c.phone) return true
    if (
      c.customFields &&
      c.customFields[column.key] !== undefined &&
      c.customFields[column.key] !== null
    ) {
      return true
    }
    return false
  })

  res.json({
    success: true,
    column,
    totalAssignedContacts: matchingContacts.length,
    sampleValues: matchingContacts.slice(0, 5).map((c) => ({
      contactId: c.id,
      contactName: c.name,
      value:
        column.key === 'email'
          ? c.email
          : column.key === 'status'
          ? c.status
          : column.key === 'waba_phone_number'
          ? c.phone
          : c.customFields?.[column.key],
    })),
  })
})
