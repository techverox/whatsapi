import { useState } from 'react'
import { Check, MessageSquare, Phone, Plus, Search, User } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDisplayNameInitials } from '@/lib/utils'

export interface ContactOption {
  id: string
  name: string
  phone: string
  tags?: string[]
  avatar?: string
}

interface NewChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: ContactOption[]
  onStartChat: (data: { name: string; phone: string; initialMessage?: string }) => void
}

export function NewChat({ open, onOpenChange, contacts, onStartChat }: NewChatProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'direct'>('contacts')
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null)

  // Direct Number Form
  const [directName, setDirectName] = useState('')
  const [directPhone, setDirectPhone] = useState('')
  const [initialMessage, setInitialMessage] = useState('')

  const filteredContacts = contacts.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    )
  })

  const handleStartFromContact = () => {
    if (!selectedContact) {
      toast.error('Please select a contact to start conversation')
      return
    }
    onStartChat({
      name: selectedContact.name,
      phone: selectedContact.phone,
      initialMessage: initialMessage.trim() || undefined,
    })
    handleClose()
  }

  const handleStartFromDirect = () => {
    const cleanPhone = directPhone.trim().replace(/[^0-9+]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-12 digit phone number with country code')
      return
    }
    const finalName = directName.trim() || `WhatsApp Lead (${cleanPhone.slice(-4)})`
    onStartChat({
      name: finalName,
      phone: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
      initialMessage: initialMessage.trim() || undefined,
    })
    handleClose()
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedContact(null)
    setDirectName('')
    setDirectPhone('')
    setInitialMessage('')
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-bold'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600'>
              <MessageSquare className='h-4 w-4' />
            </div>
            Start New WhatsApp Chat
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Initiate an official WhatsApp Cloud API conversation with an existing or new contact.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className='grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1 text-xs'>
          <button
            type='button'
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className='h-3.5 w-3.5' />
            Existing Contacts ({contacts.length})
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('direct')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Phone className='h-3.5 w-3.5' />
            Direct Number
          </button>
        </div>

        {activeTab === 'contacts' ? (
          <div className='space-y-3 pt-1'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search contact by name, phone or tag...'
                className='h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
            </div>

            {/* Contact List */}
            <div className='max-h-56 overflow-y-auto space-y-1.5 pr-1'>
              {filteredContacts.length === 0 ? (
                <div className='py-6 text-center text-xs text-muted-foreground'>
                  No contacts found matching &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredContacts.map((c) => {
                  const isSelected = selectedContact?.id === c.id
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-border/60 hover:bg-muted/40'
                      }`}
                    >
                      <div className='flex items-center gap-2.5 overflow-hidden'>
                        <Avatar className='h-7 w-7 text-xs'>
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-[10px]'>
                            {getDisplayNameInitials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='overflow-hidden'>
                          <p className='font-semibold text-xs text-foreground truncate'>{c.name}</p>
                          <p className='text-[10px] text-muted-foreground font-mono'>{c.phone}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        {c.tags && c.tags[0] && (
                          <Badge variant='outline' className='text-[9px] px-1 py-0'>
                            {c.tags[0]}
                          </Badge>
                        )}
                        {isSelected && <Check className='h-3.5 w-3.5 text-orange-600' />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Optional Initial Message */}
            <div className='space-y-1 pt-1'>
              <label className='text-[11px] font-semibold text-muted-foreground'>
                Initial Message (Optional)
              </label>
              <input
                type='text'
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder='Namaste! How can we assist you today?'
                className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
            </div>
          </div>
        ) : (
          <div className='space-y-3 pt-1'>
            <div className='space-y-1'>
              <label className='text-[11px] font-semibold text-foreground'>
                WhatsApp Phone Number <span className='text-rose-500'>*</span>
              </label>
              <input
                type='tel'
                value={directPhone}
                onChange={(e) => setDirectPhone(e.target.value)}
                placeholder='+91 98251 00000'
                className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs font-mono outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
              <p className='text-[10px] text-muted-foreground'>
                Include country code (e.g., +91 for India).
              </p>
            </div>

            <div className='space-y-1'>
              <label className='text-[11px] font-semibold text-foreground'>
                Contact Name (Optional)
              </label>
              <input
                type='text'
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder='e.g., Surat Transport Logistics'
                className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[11px] font-semibold text-foreground'>
                Initial Outbound Message
              </label>
              <input
                type='text'
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder='Namaste! VEROX AIS-140 GPS demo quotation...'
                className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
            </div>
          </div>
        )}

        <DialogFooter className='gap-1 sm:gap-0 pt-2'>
          <Button variant='outline' size='sm' onClick={handleClose} className='h-8 text-xs cursor-pointer'>
            Cancel
          </Button>
          <Button
            size='sm'
            onClick={activeTab === 'contacts' ? handleStartFromContact : handleStartFromDirect}
            className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1 cursor-pointer'
          >
            <Plus className='h-3.5 w-3.5' /> Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
