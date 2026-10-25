import { Router, Request, Response } from 'express'
import { platformSettingsService } from '../services/settings.service.js'

export const settingsRouter = Router()

/**
 * GET /
 * Get full platform settings
 */
settingsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const all = platformSettingsService.getAll()
    res.json({ success: true, data: all })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch settings' })
  }
})

/**
 * PUT /profile
 * Update profile details
 */
settingsRouter.put('/profile', (req: Request, res: Response) => {
  try {
    const updated = platformSettingsService.updateProfile(req.body)
    res.json({ success: true, data: updated, message: 'Profile updated successfully' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update profile' })
  }
})

/**
 * POST /password
 * Update user password
 */
settingsRouter.post('/password', (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    const result = platformSettingsService.changePassword(currentPassword, newPassword)
    res.json({ success: true, message: result.message })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Password update failed' })
  }
})

/**
 * PUT /organisation
 * Update organisation details
 */
settingsRouter.put('/organisation', (req: Request, res: Response) => {
  try {
    const updated = platformSettingsService.updateOrganisation(req.body)
    res.json({ success: true, data: updated, message: 'Organisation details saved' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update organisation' })
  }
})

/**
 * PUT /waba
 * Save WABA API credentials
 */
settingsRouter.put('/waba', (req: Request, res: Response) => {
  try {
    const updated = platformSettingsService.updateWaba(req.body)
    res.json({ success: true, data: updated, message: 'WABA credentials saved' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to save WABA credentials' })
  }
})

/**
 * POST /waba/verify
 * Test/verify Meta WhatsApp Cloud API connection
 */
settingsRouter.post('/waba/verify', (_req: Request, res: Response) => {
  try {
    const result = platformSettingsService.verifyWabaConnection()
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'WABA verification failed' })
  }
})

/**
 * GET /team
 * Get all team members
 */
settingsRouter.get('/team', (_req: Request, res: Response) => {
  try {
    const members = platformSettingsService.getTeamMembers()
    res.json({ success: true, count: members.length, data: members })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch team members' })
  }
})

/**
 * POST /team
 * Invite new team member
 */
settingsRouter.post('/team', (req: Request, res: Response) => {
  try {
    const { email, phone, role, name } = req.body
    if (!email || !phone) {
      return res.status(400).json({ success: false, error: 'Email and phone are required' })
    }

    const created = platformSettingsService.addTeamMember({ email, phone, role, name })
    res.status(201).json({ success: true, data: created, message: `Invite sent to ${created.email}` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to invite team member' })
  }
})

/**
 * PUT /team/:id
 * Update team member status or role
 */
settingsRouter.put('/team/:id', (req: Request, res: Response) => {
  try {
    const memberId = String(req.params.id)
    const updated = platformSettingsService.updateTeamMember(memberId, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Team member not found' })
    }
    res.json({ success: true, data: updated, message: 'Team member updated' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update member' })
  }
})

/**
 * DELETE /team/:id
 * Remove team member
 */
settingsRouter.delete('/team/:id', (req: Request, res: Response) => {
  try {
    const memberId = String(req.params.id)
    const deleted = platformSettingsService.deleteTeamMember(memberId)
    if (!deleted) {
      return res.status(400).json({ success: false, error: 'Cannot delete current user or member not found' })
    }
    res.json({ success: true, message: 'Team member removed' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to delete member' })
  }
})

/**
 * PUT /billing
 * Update billing plan
 */
settingsRouter.put('/billing', (req: Request, res: Response) => {
  try {
    const { plan } = req.body
    const updated = platformSettingsService.updateBilling(plan)
    res.json({ success: true, data: updated, message: `Switched to ${plan}` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update billing' })
  }
})

/**
 * PUT /appearance
 * Update appearance and alerts
 */
settingsRouter.put('/appearance', (req: Request, res: Response) => {
  try {
    const updated = platformSettingsService.updateAppearance(req.body)
    res.json({ success: true, data: updated, message: 'Appearance preferences updated' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to update appearance' })
  }
})

/**
 * POST /reset
 * Reset settings and team members to default
 */
settingsRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const defaults = platformSettingsService.resetToDefaults()
    res.json({ success: true, data: defaults, message: 'Settings reset to agency defaults' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to reset settings' })
  }
})
