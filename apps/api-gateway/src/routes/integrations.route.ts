import { Router, Request, Response } from 'express'
import { integrationsService } from '../services/integrations.service.js'

export const integrationsRouter = Router()

// 1. GET /api/v1/integrations - List all 27+ connector statuses
integrationsRouter.get('/', (_req: Request, res: Response) => {
  const connectors = integrationsService.getConnectors()
  res.json({
    success: true,
    total: connectors.length,
    connectors,
    data: connectors,
  })
})

// 2. GET /api/v1/integrations/logs - Webhook Event Logs stream
integrationsRouter.get('/logs', (_req: Request, res: Response) => {
  const logs = integrationsService.getLogs()
  res.json({
    success: true,
    total: logs.length,
    data: logs,
  })
})

// 3. GET /api/v1/integrations/:id - Get specific connector details
integrationsRouter.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const conn = integrationsService.getConnectorById(id)
  if (!conn) {
    return res.status(404).json({ success: false, message: 'Connector not found' })
  }
  res.json({ success: true, data: conn })
})

// 4. POST /api/v1/integrations/:id/config - Update connector credentials & settings
integrationsRouter.post('/:id/config', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  try {
    const updated = integrationsService.updateConnector(id, req.body)
    res.json({
      success: true,
      message: `${updated.name} configuration updated and persisted.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 5. POST /api/v1/integrations/:id/toggle - Connect or Disconnect connector
integrationsRouter.post('/:id/toggle', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  try {
    const { connected } = req.body
    const updated = integrationsService.toggleConnector(id, !!connected)
    res.json({
      success: true,
      message: `${updated.name} is now ${updated.connected ? 'Connected' : 'Disconnected'}.`,
      data: updated,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// 6. POST /api/v1/integrations/:id/test - Real-time handshake & ping test for connector
integrationsRouter.post('/:id/test', async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  try {
    const result = await integrationsService.testConnector(id, req.body)
    res.json({
      success: true,
      message: `Test handshake for '${id}' executed successfully.`,
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// --- Inbound Webhook Handlers ---

// IndiaMart
integrationsRouter.post('/indiamart', async (req: Request, res: Response) => {
  const { SENDER_NAME, SENDER_MOBILE, SENDER_EMAIL, QUERY_PRODUCT_NAME, QUERY_MESSAGE } = req.body
  if (!SENDER_MOBILE) {
    return res.status(400).json({
      success: false,
      message: 'SENDER_MOBILE is required for IndiaMart lead ingestion.',
    })
  }
  try {
    const result = await integrationsService.handleIndiaMartLead({
      SENDER_NAME: SENDER_NAME || 'IndiaMart Lead',
      SENDER_MOBILE,
      SENDER_EMAIL,
      QUERY_PRODUCT_NAME,
      QUERY_MESSAGE,
    })
    res.status(201).json({
      success: true,
      message: 'IndiaMart lead captured, contact saved, and WhatsApp welcome outreach sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Facebook Lead Ads
integrationsRouter.post('/facebook', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleFacebookLead(req.body)
    res.status(201).json({
      success: true,
      message: 'Facebook Lead Ad parsed, contact created, and outreach dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Razorpay
integrationsRouter.post('/razorpay', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleRazorpayPayment(req.body)
    res.status(200).json({
      success: true,
      message: 'Razorpay payment processed and WhatsApp receipt dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Shopify
integrationsRouter.post('/shopify', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleShopifyOrder(req.body)
    res.status(201).json({
      success: true,
      message: 'Shopify order captured and WhatsApp notification dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// WooCommerce
integrationsRouter.post('/woocommerce', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleWooCommerceOrder(req.body)
    res.status(200).json({
      success: true,
      message: 'WooCommerce order captured and WhatsApp alert dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Justdial
integrationsRouter.post('/justdial', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleJustdialLead(req.body)
    res.status(201).json({
      success: true,
      message: 'Justdial lead ingested and catalog link dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// TradeIndia
integrationsRouter.post('/tradeindia', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleTradeIndiaLead(req.body)
    res.status(201).json({
      success: true,
      message: 'TradeIndia lead ingested and WhatsApp greeting sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ExportersIndia
integrationsRouter.post('/exportersindia', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleExportersIndiaLead(req.body)
    res.status(201).json({
      success: true,
      message: 'ExportersIndia lead ingested and quote dispatched.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Calendly
integrationsRouter.post('/calendly', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleCalendlyBooking(req.body)
    res.status(200).json({
      success: true,
      message: 'Calendly demo meeting confirmed and WhatsApp reminder sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Google Sheets
integrationsRouter.post('/sheets', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleGoogleSheetsSync(req.body)
    res.status(200).json({
      success: true,
      message: 'Google Sheets lead synced and WhatsApp outreach sent.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Generic Universal Webhook
integrationsRouter.post('/generic', async (req: Request, res: Response) => {
  try {
    const result = await integrationsService.handleGenericWebhook(req.body.source || 'Custom Inbound', req.body)
    res.status(200).json({
      success: true,
      message: 'Webhook payload received and processed.',
      data: result,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})
