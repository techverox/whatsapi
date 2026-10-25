import { PrismaClient } from '@prisma/client'
import {
  initialContacts,
  initialConversations,
  initialCampaigns,
  initialTags,
  initialColumns,
  ContactItem,
  ConversationItem,
  MessageItem,
  CampaignItem,
  TagItem,
  ColumnItem,
  ColumnDataType,
} from '../data/mock-store.js'

class DatabaseService {
  private prisma: PrismaClient | null = null
  private isConnectedToPostgres = false

  // In-memory persistent caches
  public contacts: ContactItem[] = [...initialContacts]
  public conversations: ConversationItem[] = [...initialConversations]
  public campaigns: CampaignItem[] = [...initialCampaigns]
  public tags: TagItem[] = [...initialTags]
  public columns: ColumnItem[] = [...initialColumns]

  constructor() {
    this.initPrisma()
  }

  private async initPrisma() {
    try {
      this.prisma = new PrismaClient()
      await this.prisma.$connect()
      this.isConnectedToPostgres = true
      console.log('✅ PostgreSQL connection established via Prisma.')
    } catch (error) {
      this.isConnectedToPostgres = false
      console.log('ℹ️ Running in resilient Local In-Memory Mode (PostgreSQL standby).')
    }
  }

  public getHealth() {
    return {
      status: 'UP',
      database: this.isConnectedToPostgres ? 'PostgreSQL (Active)' : 'Local Engine (Active)',
      redis: 'Standby / Local Queue Ready',
      stats: {
        contactsCount: this.contacts.length,
        conversationsCount: this.conversations.length,
        campaignsCount: this.campaigns.length,
        tagsCount: this.tags.length,
      },
      timestamp: new Date().toISOString(),
    }
  }

  // --- Contacts ---
  public getContacts(search?: string, tag?: string) {
    let result = this.contacts.filter((c) => c.status === 'active')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      )
    }
    if (tag) {
      result = result.filter((c) => c.tags.some((t) => t.name.toLowerCase() === tag.toLowerCase()))
    }
    return result
  }

  public createContact(data: Partial<ContactItem>): ContactItem {
    const newContact: ContactItem = {
      id: `cnt-${Date.now()}`,
      name: data.name || 'New Lead',
      phone: data.phone || '',
      email: data.email,
      source: data.source || 'whatsapp',
      optIn: data.optIn ?? true,
      tags: data.tags || [],
      assignedToName: data.assignedToName || 'Unassigned',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.contacts.unshift(newContact)
    return newContact
  }

  public updateContact(id: string, data: Partial<ContactItem>): ContactItem | null {
    const contact = this.contacts.find((c) => c.id === id)
    if (!contact) return null
    Object.assign(contact, data, { updatedAt: new Date().toISOString() })
    return contact
  }

  public deleteContact(id: string): boolean {
    const index = this.contacts.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.contacts[index].status = 'deleted'
    return true
  }

  public bulkDeleteContacts(ids: string[]): number {
    let count = 0
    ids.forEach((id) => {
      if (this.deleteContact(id)) count++
    })
    return count
  }

  // --- Conversations & Messages ---
  public getConversations() {
    return this.conversations
  }

  public getConversationById(id: string) {
    return this.conversations.find((c) => c.id === id)
  }

  public addMessage(conversationId: string, message: Partial<MessageItem>): MessageItem {
    const conv = this.getConversationById(conversationId)
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderType: message.senderType || 'agent',
      senderName: message.senderName || 'Agent',
      messageType: message.messageType || 'text',
      content: message.content || '',
      wamid: message.wamid,
      status: message.status || 'sent',
      createdAt: new Date().toISOString(),
    }

    if (conv) {
      conv.messages.push(newMsg)
      conv.lastMessageText = newMsg.content
      conv.lastMessageAt = newMsg.createdAt
    }
    return newMsg
  }

  // --- Campaigns ---
  public getCampaigns() {
    return this.campaigns
  }

  public createCampaign(data: Partial<CampaignItem>): CampaignItem {
    const newCampaign: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name: data.name || 'Untitled Campaign',
      templateName: data.templateName || 'marketing_template_v1',
      templateLang: data.templateLang || 'en',
      totalContacts: data.totalContacts || 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      status: data.status || 'scheduled',
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    this.campaigns.unshift(newCampaign)
    return newCampaign
  }

  public deleteCampaign(id: string): boolean {
    const index = this.campaigns.findIndex((c) => c.id === id)
    if (index === -1) return false
    this.campaigns.splice(index, 1)
    return true
  }

  // --- Tags ---
  public getTags(): (TagItem & { count: number; createdAt: string })[] {
    return this.tags.map((tag) => {
      const contactCount = this.contacts.filter(
        (c) =>
          c.status !== 'deleted' &&
          c.tags.some((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase())
      ).length
      return {
        ...tag,
        count: contactCount,
        createdAt: tag.createdAt || '2026-10-18T10:00:00.000Z',
      }
    })
  }

  public getTagById(id: string): TagItem | undefined {
    return this.tags.find((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase())
  }

  public createTag(data: { name: string; color?: string }): TagItem {
    const cleanName = data.name.trim()
    const existing = this.tags.find((t) => t.name.toLowerCase() === cleanName.toLowerCase())
    if (existing) {
      throw new Error(`Tag with name "${cleanName}" already exists.`)
    }

    const newTag: TagItem = {
      id: `tag-${Date.now()}`,
      name: cleanName,
      color: data.color || 'bg-orange-500/15 text-orange-600',
      createdAt: new Date().toISOString(),
      count: 0,
    }

    this.tags.unshift(newTag)
    return newTag
  }

  public updateTag(id: string, data: { name?: string; color?: string }): TagItem | null {
    const tag = this.tags.find((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase())
    if (!tag) return null

    const oldName = tag.name
    if (data.name && data.name.trim()) {
      tag.name = data.name.trim()
    }
    if (data.color && data.color.trim()) {
      tag.color = data.color.trim()
    }

    // Cascade update to contacts containing this tag
    this.contacts.forEach((contact) => {
      contact.tags = contact.tags.map((t) => {
        if (t.id === tag.id || t.name.toLowerCase() === oldName.toLowerCase()) {
          return { ...t, name: tag.name, color: tag.color }
        }
        return t
      })
    })

    return tag
  }

  public deleteTag(id: string): boolean {
    const index = this.tags.findIndex((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase())
    if (index === -1) return false

    const [deletedTag] = this.tags.splice(index, 1)

    // Cascade decouple: remove tag from all active contacts
    this.contacts.forEach((contact) => {
      contact.tags = contact.tags.filter(
        (t) => t.id !== deletedTag.id && t.name.toLowerCase() !== deletedTag.name.toLowerCase()
      )
    })

    return true
  }

  public getContactsByTag(idOrName: string): ContactItem[] {
    const tag = this.getTagById(idOrName)
    const targetName = tag ? tag.name.toLowerCase() : idOrName.toLowerCase()

    return this.contacts.filter(
      (c) =>
        c.status !== 'deleted' &&
        c.tags.some((t) => t.id === idOrName || t.name.toLowerCase() === targetName)
    )
  }

  // --- Custom Columns ---
  public getColumns(): (ColumnItem & { usageCount: number })[] {
    return this.columns.map((col) => {
      const count = this.contacts.filter((c) => {
        if (c.status === 'deleted') return false
        if (col.key === 'email' && c.email) return true
        if (col.key === 'status' && c.status) return true
        if (col.key === 'waba_phone_number' && c.phone) return true
        if (
          c.customFields &&
          c.customFields[col.key] !== undefined &&
          c.customFields[col.key] !== null &&
          c.customFields[col.key] !== ''
        ) {
          return true
        }
        return false
      }).length

      return {
        ...col,
        usageCount: count,
      }
    })
  }

  public getColumnById(idOrKey: string): ColumnItem | undefined {
    const clean = idOrKey.trim().toLowerCase()
    return this.columns.find(
      (c) =>
        c.id.toLowerCase() === clean ||
        c.key.toLowerCase() === clean ||
        c.name.toLowerCase() === clean
    )
  }

  public createColumn(data: {
    name: string
    type: ColumnDataType
    options?: string
    required?: boolean
    description?: string
  }): ColumnItem {
    const cleanName = data.name.trim()
    const generatedKey = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const existing = this.columns.find(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase() || c.key === generatedKey
    )
    if (existing) {
      throw new Error(`Custom column with name "${cleanName}" or key "${generatedKey}" already exists.`)
    }

    const validTypes: ColumnDataType[] = ['Text', 'Number', 'Select', 'Boolean', 'Phone', 'Date']
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid column type "${data.type}". Allowed types: ${validTypes.join(', ')}`)
    }

    let formattedOptions = data.options ? data.options.trim() : '-'
    if (data.type === 'Boolean') {
      formattedOptions = 'Yes, No'
    } else if (data.type === 'Select' && (!data.options || !data.options.trim())) {
      throw new Error('Options (comma-separated) are required when Field Data Type is Select.')
    }

    const now = new Date().toISOString()
    const newCol: ColumnItem = {
      id: `col-${Date.now()}`,
      name: cleanName,
      key: generatedKey,
      type: data.type,
      options: formattedOptions,
      required: Boolean(data.required),
      description: data.description ? data.description.trim() : undefined,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    }

    this.columns.push(newCol)
    return newCol
  }

  public updateColumn(id: string, data: Partial<ColumnItem>): ColumnItem | null {
    const col = this.columns.find(
      (c) => c.id === id || c.key.toLowerCase() === id.toLowerCase()
    )
    if (!col) return null

    const oldKey = col.key

    if (data.name && data.name.trim()) {
      col.name = data.name.trim()
    }
    if (data.type) {
      const validTypes: ColumnDataType[] = ['Text', 'Number', 'Select', 'Boolean', 'Phone', 'Date']
      if (validTypes.includes(data.type)) {
        col.type = data.type
      }
    }
    if (data.options !== undefined) {
      col.options = col.type === 'Boolean' ? 'Yes, No' : (data.options.trim() || '-')
    }
    if (data.required !== undefined) {
      col.required = Boolean(data.required)
    }
    if (data.description !== undefined) {
      col.description = data.description.trim() || undefined
    }
    col.updatedAt = new Date().toISOString()

    // If key has changed, migrate existing contact customFields
    if (col.key !== oldKey) {
      this.contacts.forEach((contact) => {
        if (contact.customFields && contact.customFields[oldKey] !== undefined) {
          contact.customFields[col.key] = contact.customFields[oldKey]
          delete contact.customFields[oldKey]
        }
      })
    }

    return col
  }

  public deleteColumn(id: string): { success: boolean; message: string } {
    const index = this.columns.findIndex(
      (c) => c.id === id || c.key.toLowerCase() === id.toLowerCase()
    )
    if (index === -1) {
      return { success: false, message: `Column with ID "${id}" not found.` }
    }

    const target = this.columns[index]
    if (target.isSystem) {
      return {
        success: false,
        message: `System column "${target.name}" is protected and cannot be deleted.`,
      }
    }

    const [deleted] = this.columns.splice(index, 1)

    // Decouple from contacts to prevent orphan data
    this.contacts.forEach((contact) => {
      if (contact.customFields && contact.customFields[deleted.key] !== undefined) {
        delete contact.customFields[deleted.key]
      }
    })

    return {
      success: true,
      message: `Column "${deleted.name}" deleted and decoupled from contacts.`,
    }
  }
}

export const dbService = new DatabaseService()
