import { PrismaClient } from '@prisma/client'
import {
  initialContacts,
  initialConversations,
  initialCampaigns,
  initialTags,
  ContactItem,
  ConversationItem,
  MessageItem,
  CampaignItem,
  TagItem,
} from '../data/mock-store.js'

class DatabaseService {
  private prisma: PrismaClient | null = null
  private isConnectedToPostgres = false

  // In-memory persistent caches
  public contacts: ContactItem[] = [...initialContacts]
  public conversations: ConversationItem[] = [...initialConversations]
  public campaigns: CampaignItem[] = [...initialCampaigns]
  public tags: TagItem[] = [...initialTags]

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
  public getTags() {
    return this.tags
  }
}

export const dbService = new DatabaseService()
