import { useState, useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search as SearchIcon,
  SearchX,
  X,
  Send,
  MessagesSquare,
  MessageSquare,
  CheckCheck,
  Smile,
  FileText,
  CheckCircle2,
  Share2,
  Zap,
  Radio,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  PhoneCall,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { veroxApi } from '@/lib/api'

export interface ChatMessage {
  sender: string
  message: string
  timestamp: string
  attachment?: {
    name: string
    type: string
    size?: string
  }
}

export interface ChatUserItem {
  id: string
  profile: string
  username: string
  fullName: string
  title: string
  tags: string[]
  unreadCount: number
  assignedAgent?: string
  messages: ChatMessage[]
}

const DEFAULT_CHATS: ChatUserItem[] = [
  {
    id: 'conv-lead-1',
    profile: 'https://api.dicebear.com/7.x/initials/svg?seed=WhatsApp%20Lead',
    username: '+919825102901',
    fullName: 'WhatsApp Lead (2901)',
    title: 'WHATSAPP CLOUD API • Inbound Lead',
    tags: ['GPS', 'hot-lead'],
    unreadCount: 3,
    assignedAgent: 'Agent Bhavik',
    messages: [
      {
        sender: 'Contact',
        message: 'Namaste, mujhe commercial trucks ke liye AIS-140 GPS tracker lagwana hai. Price aur fitment details share karein.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        sender: 'You',
        message: 'Namaste! Truck Sathi me aapka swagat hai. Hamare paas Gujarat RTO certified AIS-140 GPS available hai. Aapke paas kitni gaadiyan hain?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        sender: 'Contact',
        message: 'Ji, mere paas 6 10-wheeler trucks hain jo Ahmedabad se Surat route par chalte hain.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: 'conv-1',
    profile: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh%20Sharma',
    username: '+919825100001',
    fullName: 'Rajesh Sharma',
    title: 'Official WABA • Gujarat Fleet Logistics',
    tags: ['GPS', 'hot-lead', 'Hinglish IN'],
    unreadCount: 2,
    assignedAgent: 'Agent Bhavik',
    messages: [
      {
        sender: 'Contact',
        message: 'Namaste, maine IndiaMart par aapka GPS tracker dekha tha.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        sender: 'You',
        message: 'Namaste Rajesh ji! VEROX Automation me aapka swagat hai. Hamare paas 4G Fleet GPS Trackers available hain. Aapke paas kitni gaadiyan hain?',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        sender: 'Contact',
        message: 'Sir, kya mujhe Gujarat fleet GPS tracking ka quotation mil sakta hai?',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
  },
  {
    id: 'conv-2',
    profile: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram%20Patel',
    username: '+919426000002',
    fullName: 'Vikram Patel',
    title: 'WHATSAPP CLOUD API • Fastag Logistics',
    tags: ['FASTAG', 'Fleet Mgmt', 'hot-lead'],
    unreadCount: 1,
    assignedAgent: 'Agent Anjali',
    messages: [
      {
        sender: 'Contact',
        message: 'Maine form submit kar diya hai, commercial Fastag activation ka confirmation chahiye.',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        sender: 'You',
        message: 'Vikram ji, aapke RC documents verify ho gaye hain. 15 minutes me tag activate ho jayega.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
  },
  {
    id: 'conv-3',
    profile: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: '+919825100003',
    fullName: 'Alex John',
    title: 'WHATSAPP CLOUD API • Enterprise Fleet',
    tags: ['FASTAG', 'Fleet Mgmt', 'English GB'],
    unreadCount: 0,
    assignedAgent: 'Support Desk',
    messages: [
      {
        sender: 'Contact',
        message: 'Hey, can you share the monthly automated Fastag toll reconciliation statement?',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        sender: 'You',
        message: 'Sure Alex, I have scheduled the monthly PDF export to your registered email.',
        timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
      },
    ],
  },
  {
    id: 'conv-4',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    username: '+919825100004',
    fullName: 'Taylor Grande',
    title: 'WHATSAPP CLOUD API • GPS Demo',
    tags: ['GPS', 'hot-lead'],
    unreadCount: 0,
    assignedAgent: 'Agent Bhavik',
    messages: [
      {
        sender: 'Contact',
        message: 'Hey, did you check out that live tracking geofence alert tutorial?',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'conv-5',
    profile: 'https://randomuser.me/api/portraits/men/46.jpg',
    username: '+919825100005',
    fullName: 'John Doe',
    title: 'WHATSAPP CLOUD API • Fleet Logistics',
    tags: ['FASTAG', 'Fleet Mgmt'],
    unreadCount: 0,
    assignedAgent: 'Agent Anjali',
    messages: [
      {
        sender: 'Contact',
        message: 'Are we still on for the fleet onboard training call tomorrow morning?',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
    ],
  },
  {
    id: 'conv-6',
    profile: 'https://randomuser.me/api/portraits/women/68.jpg',
    username: '+919825100006',
    fullName: 'Megan Flux',
    title: 'WHATSAPP CLOUD API • Transit Insurance',
    tags: ['GPS', 'hot-lead', 'INSURANCE'],
    unreadCount: 1,
    assignedAgent: 'Insurance Specialist',
    messages: [
      {
        sender: 'Contact',
        message: 'Please send the commercial fleet transit insurance quote for 14-wheelers.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'conv-7',
    profile: 'https://randomuser.me/api/portraits/men/82.jpg',
    username: '+919825100007',
    fullName: 'David Brown',
    title: 'WHATSAPP CLOUD API • Ahmedabad Fleet',
    tags: ['Hinglish IN', 'GPS', 'Fleet Mgmt'],
    unreadCount: 0,
    assignedAgent: 'Agent Bhavik',
    messages: [
      {
        sender: 'Contact',
        message: 'Bhai, Ahmedabad se Rajkot highway ka geofencing active ho gaya kya?',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
  },
]

const TAG_FILTER_LIST = [
  'All',
  'English GB',
  'FASTAG',
  'Fleet Mgmt',
  'GPS',
  'Hinglish IN',
  'INSURANCE',
  'hot-lead',
]

const PRESET_ATTACHMENTS = [
  {
    id: 'att-1',
    name: 'commercial-fleet-pricing-catalog-2026.pdf',
    label: 'Commercial Fleet Rate Card 2026',
    desc: 'Official GST-compliant price list for GPS, Fastag, and fleet sensors.',
    size: '3.42 MB',
    type: 'application/pdf',
    iconColor: 'bg-rose-500/10 text-rose-600',
  },
  {
    id: 'att-2',
    name: 'truck-sathi-gps-sale-banner.jpg',
    label: 'AIS-140 GPS Festive Brochure',
    desc: 'High-res promotional graphic with 30% discount details and QR code.',
    size: '1.17 MB',
    type: 'image/jpeg',
    iconColor: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: 'att-3',
    name: 'ais-140-govt-certificate.png',
    label: 'Govt AIS-140 Certification Copy',
    desc: 'Automotive Research Association of India (ARAI) compliance certificate.',
    size: '890 KB',
    type: 'image/png',
    iconColor: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'att-4',
    name: 'fastag-kyc-guide-infographic.png',
    label: 'Fastag KYC Onboarding Guide',
    desc: 'Step-by-step documentation checklist for commercial vehicle fleet owners.',
    size: '1.45 MB',
    type: 'image/png',
    iconColor: 'bg-sky-500/10 text-sky-600',
  },
]

const QUICK_CANNED_REPLIES = [
  {
    title: 'GPS Inquiry Welcome',
    text: 'Namaste Rajesh ji! VEROX Automation me aapka swagat hai. Hamare paas 4G Fleet GPS Trackers available hain. Aapke paas kitni gaadiyan hain?',
  },
  {
    title: 'Quotation Dispatch',
    text: 'Sir, commercial fleet quotation aur catalog attach kar diya hai. Kripya check karein aur order confirm karein.',
  },
  {
    title: 'Fastag KYC Documents Request',
    text: 'Namaste! Commercial Fastag instant activation ke liye kripya apna Vehicle Registration Certificate (RC) aur PAN copy share karein.',
  },
  {
    title: 'Call Back Confirmation',
    text: 'Truck Sathi me contact karne ke liye dhanyawad! Hamare senior fleet logistics manager aapse 5 minute me call par baat karenge.',
  },
  {
    title: 'Dispatch & Live Tracking',
    text: 'Sir, aapka GPS device dispatch ho chuka hai. Live tracking app credentials aapke WhatsApp number par deliver kar diye gaye hain.',
  },
]

const QUICK_EMOJIS = ['🙏', '🚚', '📍', '⚡', '✅', '📄', '🚛', '📞', '👍', '🎯', '🤝', '🕒', '💡', '🏆']

export function Chats() {
  const [chatList, setChatList] = useState<ChatUserItem[]>(DEFAULT_CHATS)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [selectedUser, setSelectedUser] = useState<ChatUserItem | null>(DEFAULT_CHATS[1]) // Default to Rajesh Sharma
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUserItem | null>(DEFAULT_CHATS[1])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [apiOnline, setApiOnline] = useState(true)

  // Dialog Controls
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [quickReplyModalOpen, setQuickReplyModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [moreModalOpen, setMoreModalOpen] = useState(false)

  // Fetch real-time conversations from API Gateway on mount & periodic poll
  const syncConversations = async () => {
    try {
      const res = await veroxApi.getConversations()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiOnline(true)
        const mappedFromBackend: ChatUserItem[] = res.data.map((c: any) => ({
          id: c.id,
          profile: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.contactName || 'Client')}`,
          username: c.contactPhone || 'whatsapp_user',
          fullName: c.contactName || 'WhatsApp Contact',
          title: c.channel?.toUpperCase() || 'WHATSAPP CLOUD API',
          tags: (c.tags && c.tags.length > 0)
            ? c.tags.map((t: any) => t.name)
            : ['GPS', 'hot-lead'],
          unreadCount: c.unreadCount ?? 0,
          assignedAgent: c.assignedToName || 'Agent Bhavik',
          messages: (c.messages || []).map((m: any) => ({
            sender: m.senderType === 'agent' ? 'You' : c.contactName || 'Contact',
            message: m.content || '',
            timestamp: m.createdAt || new Date().toISOString(),
          })),
        }))

        setChatList((prev) => {
          const existingIds = new Set(mappedFromBackend.map((m) => m.id))
          const preserved = prev.filter((p) => !existingIds.has(p.id))
          return [...mappedFromBackend, ...preserved]
        })
      }
    } catch {
      setApiOnline(false)
    }
  }

  useEffect(() => {
    syncConversations()
    const timer = setInterval(syncConversations, 5000)

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('ws://localhost:4000')
      ws.onopen = () => setApiOnline(true)
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'MESSAGE_SENT' || data.type === 'INBOUND_MESSAGE' || data.type === 'NEW_LEAD') {
            syncConversations()
          }
        } catch {}
      }
      ws.onerror = () => {}
    } catch {}

    return () => {
      clearInterval(timer)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // Calculate dynamic tag counts
  const getTagCount = (tag: string) => {
    if (tag === 'All') return chatList.length
    return chatList.filter((c) => c.tags.includes(tag)).length
  }

  // Filtered list based on active tag, unread tab, and search query
  const filteredChatList = chatList.filter((chat) => {
    // 1. Tag Filter
    const matchesTag = activeTag === 'All' || chat.tags.includes(activeTag)

    // 2. Unread Tab Filter
    const matchesTab = activeTab === 'all' || (chat.unreadCount > 0)

    // 3. Search Query Filter
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      chat.fullName.toLowerCase().includes(q) ||
      chat.username.toLowerCase().includes(q) ||
      chat.tags.some((t) => t.toLowerCase().includes(q)) ||
      chat.messages.some((m) => m.message.toLowerCase().includes(q))

    return matchesTag && matchesTab && matchesSearch
  })

  // Auto-align selected user if current selection is not visible in filtered results
  useEffect(() => {
    if (filteredChatList.length > 0) {
      const isCurrentSelectedPresent = filteredChatList.some((c) => c.id === selectedUser?.id)
      if (!isCurrentSelectedPresent) {
        setSelectedUser(filteredChatList[0])
        setMobileSelectedUser(filteredChatList[0])
      }
    }
  }, [activeTag, activeTab, search])

  // Group messages by date
  const currentMessageGroups = selectedUser?.messages.reduce(
    (acc: Record<string, ChatMessage[]>, obj) => {
      try {
        const key = format(new Date(obj.timestamp), 'd MMM, yyyy')
        if (!acc[key]) acc[key] = []
        acc[key].push(obj)
      } catch {
        const fallbackKey = 'Recent'
        if (!acc[fallbackKey]) acc[fallbackKey] = []
        acc[fallbackKey].push(obj)
      }
      return acc
    },
    {}
  )

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim()
    if (!textToSend || !selectedUser) return
    setInputMessage('')
    setIsSending(true)

    // 1. Optimistic UI update
    const newMsg: ChatMessage = {
      sender: 'You',
      message: textToSend,
      timestamp: new Date().toISOString(),
    }
    selectedUser.messages.push(newMsg)

    // 2. Real API dispatch to backend port 4000
    try {
      const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
      await veroxApi.sendMessage({
        to: cleanPhone,
        text: textToSend,
        conversationId: selectedUser.id,
      })
      toast.success('Official WhatsApp message dispatched via Meta API!')
    } catch (err) {
      console.error('Failed to dispatch message via API:', err)
      toast.info('Message recorded in CRM conversation.')
    } finally {
      setIsSending(false)
    }
  }

  // Quick Inbound Test Simulator Trigger
  const handleTriggerSimulatedInbound = async () => {
    if (!selectedUser) return
    const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
    await veroxApi.simulateInboundMessage({
      from: cleanPhone,
      name: selectedUser.fullName,
      text: 'Haan bhai, mujhe 5 trucks ke liye AIS-140 GPS chahiye. Aaj fitment ho sakta hai?',
    })
    toast.success('Inbound simulated! Webhook pushed to Inbox.')
    await syncConversations()
  }

  // Send an attachment
  const handleSendAttachment = (attachment: typeof PRESET_ATTACHMENTS[0]) => {
    if (!selectedUser) return
    const newMsg: ChatMessage = {
      sender: 'You',
      message: `[Attachment: ${attachment.name}] Sent ${attachment.label} (${attachment.size}).`,
      timestamp: new Date().toISOString(),
      attachment: {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
      },
    }
    selectedUser.messages.push(newMsg)
    setAttachModalOpen(false)

    const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
    veroxApi.sendMessage({
      to: cleanPhone,
      text: `[Attachment: ${attachment.name}] Sent ${attachment.label}`,
      conversationId: selectedUser.id,
    })
    toast.success(`Sent ${attachment.label} to ${selectedUser.fullName}!`)
  }

  // Export conversation transcript
  const handleExportTranscript = () => {
    if (!selectedUser) return
    const lines = [
      `VEROX CRM WhatsApp Transcript`,
      `Client: ${selectedUser.fullName} (${selectedUser.username})`,
      `Title: ${selectedUser.title}`,
      `Exported At: ${new Date().toLocaleString()}`,
      `-------------------------------------------------------`,
      ...selectedUser.messages.map(
        (m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.sender}: ${m.message}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat_transcript_${selectedUser.fullName.replace(/\s+/g, '_')}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setMoreModalOpen(false)
    toast.success('Conversation transcript downloaded!')
  }

  // Clear conversation
  const handleClearHistory = () => {
    if (!selectedUser) return
    selectedUser.messages = []
    setChatList([...chatList])
    setMoreModalOpen(false)
    toast.success('Conversation history cleared locally.')
  }

  // Toggle tag
  const handleToggleTag = (tag: string) => {
    if (!selectedUser) return
    if (selectedUser.tags.includes(tag)) {
      selectedUser.tags = selectedUser.tags.filter((t) => t !== tag)
    } else {
      selectedUser.tags.push(tag)
    }
    setChatList([...chatList])
    toast.success(`Updated tags for ${selectedUser.fullName}`)
  }

  return (
    <>
      {/* ===== Top Header ===== */}
      <Header>
        <Search className='me-auto' />
        <div className='flex items-center gap-2 me-2'>
          <Badge
            className={`border-0 text-[10px] font-mono flex items-center gap-1 ${
              apiOnline ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
            }`}
          >
            <Radio className='h-3 w-3 animate-pulse' />
            {apiOnline ? 'API GATEWAY 4000 CONNECTED' : 'OFFLINE SANDBOX'}
          </Badge>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed className='flex flex-col gap-3 p-4'>
        {/* Top Tag Pills Filter Bar */}
        <div className='flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 border-b border-border/40 scrollbar-none'>
          {TAG_FILTER_LIST.map((tag) => {
            const isActive = activeTag === tag
            const count = getTagCount(tag)
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer',
                  isActive
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{tag}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-background text-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main Inbox Layout */}
        <section className='flex h-[calc(100vh-165px)] gap-4'>
          {/* Left Side: Conversation List */}
          <div className='flex w-full flex-col gap-2 sm:w-72 lg:w-80 2xl:w-96 rounded-lg border border-border/60 bg-card p-3 shadow-xs'>
            {/* Header & Sub-Tab Switcher */}
            <div className='flex items-center justify-between pb-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-lg font-bold'>Inbox</h1>
                <Badge variant='outline' className='text-[10px] px-1.5 bg-muted/60'>
                  {filteredChatList.length} Total
                </Badge>
              </div>
              <div className='flex gap-1 text-xs'>
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium cursor-pointer',
                    activeTab === 'all'
                      ? 'bg-orange-500/15 text-orange-600 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium cursor-pointer',
                    activeTab === 'unread'
                      ? 'bg-orange-500/15 text-orange-600 font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* Search Input with Clear Button */}
            <div className='relative'>
              <SearchIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none' />
              <input
                type='search'
                name='chat_filter_query'
                id='chat_filter_query'
                autoComplete='off'
                autoCorrect='off'
                spellCheck='false'
                data-lpignore='true'
                data-1p-ignore='true'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search conversations or phone...'
                className='h-9 w-full rounded-md border border-border bg-background pl-8 pr-7 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>

            {/* Conversation List or Empty State */}
            {filteredChatList.length === 0 ? (
              <div className='flex flex-col items-center justify-center flex-1 py-10 px-4 text-center bg-muted/20 rounded-lg border border-dashed border-border mt-1'>
                <SearchX className='h-8 w-8 text-muted-foreground mb-2' />
                <h4 className='font-semibold text-xs text-foreground'>No conversations found</h4>
                <p className='text-[11px] text-muted-foreground mt-1'>
                  No chats match "{search || activeTag}".
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSearch('')
                    setActiveTag('All')
                    setActiveTab('all')
                  }}
                  className='h-7 text-xs mt-3 cursor-pointer'
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <ScrollArea className='-me-1 flex-1 pe-2 pt-1'>
                {filteredChatList.map((chatUsr) => {
                  const { id, profile, username, messages, fullName, tags, unreadCount } = chatUsr
                  const lastConvo = messages[messages.length - 1]
                  const isSelected = selectedUser?.id === id

                  return (
                    <Fragment key={id}>
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedUser(chatUsr)
                          setMobileSelectedUser(chatUsr)
                        }}
                        className={cn(
                          'w-full rounded-lg p-2.5 text-start transition-all cursor-pointer',
                          isSelected
                            ? 'bg-orange-500/10 border-l-4 border-orange-500'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div className='flex items-start gap-2.5'>
                          <Avatar className='h-9 w-9 border border-border/40'>
                            <AvatarImage src={profile} alt={username} />
                            <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-xs'>
                              {getDisplayNameInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 overflow-hidden'>
                            <div className='flex items-center justify-between'>
                              <span className='font-semibold text-xs text-foreground truncate max-w-[130px]'>
                                {fullName}
                              </span>
                              <span className='text-[10px] text-muted-foreground'>
                                {lastConvo ? format(new Date(lastConvo.timestamp), 'hh:mm a') : ''}
                              </span>
                            </div>
                            <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                              {lastConvo?.message || 'New inbound WhatsApp inquiry'}
                            </p>
                            <div className='flex items-center justify-between mt-1.5'>
                              <div className='flex gap-1 flex-wrap'>
                                {tags.map((t) => (
                                  <span
                                    key={t}
                                    className={cn(
                                      'text-[9px] px-1.5 py-0.2 rounded font-medium',
                                      t === 'hot-lead'
                                        ? 'bg-rose-500/15 text-rose-600 font-bold'
                                        : 'bg-muted text-muted-foreground'
                                    )}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                              {unreadCount > 0 && (
                                <span className='h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center'>
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1 opacity-50' />
                    </Fragment>
                  )
                })}
              </ScrollArea>
            )}
          </div>

          {/* Right Side: Conversation View */}
          {selectedUser ? (
            <div
              className={cn(
                'absolute inset-0 z-50 hidden flex-1 flex-col rounded-lg border border-border/60 bg-card shadow-xs sm:static sm:flex',
                mobileSelectedUser && 'flex'
              )}
            >
              {/* Top Conversation Header */}
              <div className='flex items-center justify-between border-b border-border/60 p-3 bg-muted/20'>
                <div className='flex items-center gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-8 w-8 sm:hidden'
                    onClick={() => {
                      setSelectedUser(null)
                      setMobileSelectedUser(null)
                    }}
                  >
                    <ArrowLeft className='h-4 w-4' />
                  </Button>
                  <Avatar className='h-9 w-9'>
                    <AvatarImage src={selectedUser.profile} alt={selectedUser.username} />
                    <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-xs'>
                      {getDisplayNameInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold text-xs text-foreground'>{selectedUser.fullName}</span>
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20' />
                    </div>
                    <span className='text-[10px] text-muted-foreground font-mono'>
                      {selectedUser.username} • {selectedUser.title}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleTriggerSimulatedInbound}
                    className='h-7 text-[11px] gap-1 cursor-pointer'
                  >
                    <Zap className='h-3 w-3 text-orange-600' />
                    Simulate Inbound
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setCallModalOpen(true)}
                    className='h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='Voice Call Client'
                  >
                    <Phone className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setMoreModalOpen(true)}
                    className='h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='More Options'
                  >
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <ScrollArea className='flex-1 p-4 bg-muted/10'>
                <div className='space-y-4'>
                  {currentMessageGroups &&
                    Object.entries(currentMessageGroups).map(([dateKey, msgs]) => (
                      <div key={dateKey} className='space-y-3'>
                        <div className='text-center my-2'>
                          <span className='text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium'>
                            {dateKey}
                          </span>
                        </div>
                        {msgs.map((m, mIdx) => {
                          const isMe = m.sender === 'You'
                          return (
                            <div
                              key={mIdx}
                              className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                            >
                              <div
                                className={cn(
                                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs leading-relaxed',
                                  isMe
                                    ? 'bg-orange-600 text-white rounded-br-xs'
                                    : 'bg-card border border-border/60 text-foreground rounded-bl-xs'
                                )}
                              >
                                {m.attachment && (
                                  <div
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded-lg mb-1.5 border text-xs',
                                      isMe
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-muted/40 border-border/60 text-foreground'
                                    )}
                                  >
                                    <FileText className='h-4 w-4 shrink-0' />
                                    <div className='flex-1 overflow-hidden'>
                                      <p className='font-bold truncate'>{m.attachment.name}</p>
                                      <p className='text-[10px] opacity-80'>{m.attachment.size || 'Attachment'}</p>
                                    </div>
                                  </div>
                                )}
                                <p className='whitespace-pre-wrap'>{m.message}</p>
                                <div
                                  className={cn(
                                    'flex items-center justify-end gap-1 text-[9px] mt-1',
                                    isMe ? 'text-white/80' : 'text-muted-foreground'
                                  )}
                                >
                                  <span>{format(new Date(m.timestamp), 'hh:mm a')}</span>
                                  {isMe && <CheckCheck className='h-3 w-3 text-white' />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                </div>
              </ScrollArea>

              {/* Chat Input Bar */}
              <div className='p-3 border-t border-border/60 bg-card'>
                <div className='flex items-center gap-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setAttachModalOpen(true)}
                    className='h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
                    title='Attach brochure, catalog or PDF'
                  >
                    <Paperclip className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setQuickReplyModalOpen(true)}
                    className='h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
                    title='Quick Canned Responses & Emojis'
                  >
                    <Smile className='h-4 w-4' />
                  </Button>
                  <input
                    type='text'
                    autoComplete='off'
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder='Type official WhatsApp reply (dispatches live via Meta Cloud API)...'
                    className='flex-1 h-9 rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  />
                  <Button
                    size='sm'
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !inputMessage.trim()}
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs h-9 gap-1 font-bold shrink-0 cursor-pointer'
                  >
                    <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-bounce' : ''}`} /> Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Welcome Screen when no conversation selected */
            <div className='hidden flex-1 flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-8 text-center sm:flex shadow-xs'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-4 shadow-xs'>
                <MessagesSquare className='h-8 w-8' />
              </div>

              <h2 className='text-xl font-bold tracking-tight text-foreground'>
                Welcome to VEROX Team Inbox
              </h2>
              <p className='text-xs text-muted-foreground max-w-md mt-1.5'>
                Manage customer conversations, broadcast responses, and automated bot workflows in real-time.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl w-full text-left'>
                <div className='p-4 rounded-lg border border-border/60 bg-muted/20 hover:border-orange-500/40 transition-colors'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 mb-2'>
                    <MessageSquare className='h-4 w-4' />
                  </div>
                  <h3 className='font-semibold text-xs text-foreground'>Real-time Chat</h3>
                  <p className='text-[11px] text-muted-foreground mt-1'>
                    Instant bi-directional messaging with live read receipts and typing indicators.
                  </p>
                </div>

                <div className='p-4 rounded-lg border border-border/60 bg-muted/20 hover:border-orange-500/40 transition-colors'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 mb-2'>
                    <FileText className='h-4 w-4' />
                  </div>
                  <h3 className='font-semibold text-xs text-foreground'>Official Templates</h3>
                  <p className='text-[11px] text-muted-foreground mt-1'>
                    Send pre-approved Meta WhatsApp templates with dynamic variables and quick buttons.
                  </p>
                </div>

                <div className='p-4 rounded-lg border border-border/60 bg-muted/20 hover:border-orange-500/40 transition-colors'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 mb-2'>
                    <Share2 className='h-4 w-4' />
                  </div>
                  <h3 className='font-semibold text-xs text-foreground'>Media Sharing</h3>
                  <p className='text-[11px] text-muted-foreground mt-1'>
                    Send and receive images, documents, audio notes, and location tags seamlessly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </Main>

      {/* 1. ATTACHMENT MODAL */}
      <Dialog open={attachModalOpen} onOpenChange={setAttachModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Paperclip className='h-4 w-4 text-orange-600' />
              Attach Brochure, Catalog, or Document
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Send official PDFs, certificates, and brochures directly to {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2.5 py-2'>
            {PRESET_ATTACHMENTS.map((att) => (
              <div
                key={att.id}
                onClick={() => handleSendAttachment(att)}
                className='flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:border-orange-500/50 hover:bg-muted/30 cursor-pointer transition-all shadow-xs'
              >
                <div className='flex items-center gap-3'>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold text-xs ${att.iconColor}`}>
                    {att.type.includes('pdf') ? 'PDF' : 'IMG'}
                  </div>
                  <div>
                    <h4 className='font-bold text-xs text-foreground'>{att.label}</h4>
                    <p className='text-[11px] text-muted-foreground line-clamp-1'>{att.desc}</p>
                    <span className='text-[10px] text-orange-600 font-mono'>{att.size}</span>
                  </div>
                </div>
                <Button size='sm' className='h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'>
                  Send
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setAttachModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. QUICK REPLIES & EMOJIS MODAL */}
      <Dialog open={quickReplyModalOpen} onOpenChange={setQuickReplyModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Smile className='h-4 w-4 text-orange-600' />
              Quick Canned Replies & Emojis
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Click an emoji to append or select a pre-written WhatsApp response.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Emoji Bar */}
          <div className='flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-lg border border-border/40'>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type='button'
                onClick={() => {
                  setInputMessage((prev) => prev + emoji)
                  toast.success(`Inserted ${emoji}`)
                }}
                className='h-8 w-8 flex items-center justify-center rounded-md hover:bg-card border border-transparent hover:border-border text-base cursor-pointer transition-all'
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Canned Replies */}
          <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
            {QUICK_CANNED_REPLIES.map((reply, idx) => (
              <div
                key={idx}
                className='p-3 rounded-lg border border-border/60 bg-card hover:border-orange-500/40 transition-colors'
              >
                <div className='flex items-center justify-between mb-1'>
                  <span className='font-bold text-xs text-foreground'>{reply.title}</span>
                  <div className='flex gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setInputMessage(reply.text)
                        setQuickReplyModalOpen(false)
                        toast.success('Inserted into message box')
                      }}
                      className='h-6 text-[10px] px-2 cursor-pointer'
                    >
                      Insert
                    </Button>
                    <Button
                      size='sm'
                      onClick={() => {
                        handleSendMessage(reply.text)
                        setQuickReplyModalOpen(false)
                      }}
                      className='h-6 text-[10px] px-2 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                    >
                      Send Now
                    </Button>
                  </div>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed'>{reply.text}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setQuickReplyModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. VOICE CALL DIALOG */}
      <Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Phone className='h-4 w-4 text-emerald-600' />
              Call {selectedUser?.fullName}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Direct client telephony contact for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between'>
              <div>
                <span className='text-[10px] text-muted-foreground font-semibold'>Phone Number</span>
                <p className='font-mono font-bold text-sm text-foreground'>{selectedUser?.username}</p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  navigator.clipboard.writeText(selectedUser?.username || '')
                  toast.success('Phone number copied to clipboard!')
                }}
                className='h-7 text-xs gap-1 cursor-pointer'
              >
                <Copy className='h-3 w-3' /> Copy
              </Button>
            </div>

            <div className='grid grid-cols-2 gap-2 pt-1'>
              <Button
                variant='default'
                className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 cursor-pointer'
                asChild
              >
                <a href={`tel:${selectedUser?.username}`}>
                  <PhoneCall className='h-3.5 w-3.5' /> Direct Dial
                </a>
              </Button>
              <Button
                variant='outline'
                className='border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 text-xs h-9 gap-1.5 cursor-pointer'
                asChild
              >
                <a
                  href={`https://wa.me/${selectedUser?.username.replace(/[^0-9]/g, '')}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <ExternalLink className='h-3.5 w-3.5' /> Open WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setCallModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. MORE OPTIONS DIALOG */}
      <Dialog open={moreModalOpen} onOpenChange={setMoreModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MoreVertical className='h-4 w-4 text-orange-600' />
              Conversation Actions & Settings
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Manage assignment, tags, and export records for {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-xs'>
            {/* Assigned Agent */}
            <div>
              <label className='font-bold text-foreground block mb-1'>Assigned Team Agent</label>
              <div className='flex gap-1.5'>
                {['Agent Bhavik', 'Agent Anjali', 'VEROX AI Bot'].map((ag) => (
                  <button
                    key={ag}
                    type='button'
                    onClick={() => {
                      if (selectedUser) {
                        selectedUser.assignedAgent = ag
                        setChatList([...chatList])
                        toast.success(`Assigned to ${ag}`)
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-all',
                      selectedUser?.assignedAgent === ag
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600 font-bold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Tags */}
            <div>
              <label className='font-bold text-foreground block mb-1'>Tags & Segments</label>
              <div className='flex flex-wrap gap-1.5'>
                {['hot-lead', 'GPS', 'FASTAG', 'Fleet Mgmt', 'Hinglish IN', 'INSURANCE'].map((tag) => {
                  const hasTag = selectedUser?.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type='button'
                      onClick={() => handleToggleTag(tag)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer transition-all',
                        hasTag
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {hasTag ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator className='my-2' />

            {/* Action Buttons */}
            <div className='space-y-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleExportTranscript}
                className='w-full justify-start h-8 text-xs gap-2 cursor-pointer'
              >
                <Download className='h-3.5 w-3.5 text-blue-600' /> Export Chat Transcript (.txt)
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleClearHistory}
                className='w-full justify-start h-8 text-xs gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer'
              >
                <Trash2 className='h-3.5 w-3.5' /> Clear Conversation History
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setMoreModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
