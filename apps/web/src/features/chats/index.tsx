import { useState, useEffect, useCallback, useRef } from 'react'
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
  Plus,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Building2,
  Mail,
  MapPin,
  FileCheck,
  Tag,
  StickyNote,
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
import { NewChat, type ContactOption } from './components/new-chat'

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
  status?: string // 'Hot Lead' | 'Qualified' | 'Proposal' | 'Active Customer' | 'Archived'
  location?: string
  notes?: string
  email?: string
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
    status: 'Hot Lead',
    location: 'Surat, Gujarat',
    email: 'fleetlead2901@gmail.com',
    notes: 'Inquired for 6 10-wheeler trucks AIS-140 GPS fitment. Ahmedabad-Surat route.',
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
    status: 'Proposal Sent',
    location: 'Ahmedabad, Gujarat',
    email: 'rajesh@gujaratlogistics.in',
    notes: 'Quotation sent for 5 GPS trackers. Follow-up on pricing discount.',
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
    status: 'Qualified',
    location: 'Vadodara, Gujarat',
    email: 'vikram.patel@patellogistics.com',
    notes: 'Awaiting RC documents for 12 commercial Fastags.',
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
    status: 'Active Customer',
    location: 'Mumbai, Maharashtra',
    email: 'alex.john@enterprisefleet.co',
    notes: 'Monthly automated Fastag toll reconciliation enabled.',
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
    status: 'Qualified',
    location: 'Rajkot, Gujarat',
    email: 'taylor@grandefleet.in',
    notes: 'Scheduled live tracking geofence alert demo call.',
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
    status: 'Active Customer',
    location: 'Ahmedabad, Gujarat',
    email: 'johndoe@fleetlogistics.in',
    notes: 'Fleet onboarding training scheduled.',
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
    status: 'Hot Lead',
    location: 'Gandhinagar, Gujarat',
    email: 'megan@fluxtransit.com',
    notes: 'Requested commercial fleet transit insurance quote for 14-wheelers.',
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
    status: 'Active Customer',
    location: 'Ahmedabad, Gujarat',
    email: 'david.brown@abdfleet.com',
    notes: 'Geofencing active on Ahmedabad-Rajkot highway.',
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

const OFFICIAL_META_TEMPLATES = [
  {
    id: 'ais140_festive_quote',
    name: 'ais140_festive_quote_v1',
    label: 'AIS-140 GPS Festive Quote',
    category: 'MARKETING',
    language: 'Hindi (IN)',
    text: 'Namaste {{name}} ji! VEROX Automation me aapka swagat hai. Gujarat RTO approved AIS-140 4G GPS tracker par 30% festive discount chal raha hai. Free live tracking software aur 1-year replacement warranty shamil hai. Kripya reply karein quotation dekhne ke liye.',
  },
  {
    id: 'fastag_kyc_verification',
    name: 'fastag_commercial_kyc_v2',
    label: 'Fastag Commercial KYC Verification',
    category: 'UTILITY',
    language: 'English (US)',
    text: 'Dear {{name}}, your commercial fleet Fastag onboarding request is being processed. Please share a clear photo of the Vehicle Registration Certificate (RC) to complete automated RFID tag activation.',
  },
  {
    id: 'installation_service_scheduled',
    name: 'fleet_gps_fitment_scheduled',
    label: 'GPS Installation Appointment',
    category: 'UTILITY',
    language: 'Hindi (IN)',
    text: 'Namaste {{name}} ji! Aapki gaadiyon ke liye AIS-140 GPS fitment appointment schedule ho gaya hai. Hamare certified RTO technician kal subah 10:00 AM aapke depot par visit karenge.',
  },
  {
    id: 'payment_reminder_fleet',
    name: 'fleet_subscription_renewal_v1',
    label: 'Fleet Renewal Reminder',
    category: 'UTILITY',
    language: 'English (US)',
    text: 'Hi {{name}}, your annual fleet tracking SIM & cloud platform subscription for your commercial vehicles expires in 3 days. Please renew to ensure uninterrupted GPS alerts.',
  },
  {
    id: 'welcome_onboard',
    name: 'fleet_sathi_welcome_onboard',
    label: 'Customer Welcome & App Credentials',
    category: 'MARKETING',
    language: 'Hindi (IN)',
    text: 'Welcome to VEROX Fleet Sathi, {{name}}! Aapke live tracking mobile app credentials active hain. Download link aur user guide ke liye is message ka reply karein.',
  },
]

const QUICK_CANNED_REPLIES = [
  {
    title: 'GPS Inquiry Welcome',
    text: 'Namaste! VEROX Automation me aapka swagat hai. Hamare paas 4G Fleet GPS Trackers available hain. Aapke paas kitni gaadiyan hain?',
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
  const [showInspector, setShowInspector] = useState(true)

  // Dialog Controls
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [quickReplyModalOpen, setQuickReplyModalOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [moreModalOpen, setMoreModalOpen] = useState(false)

  // CRM Note Editor State
  const [crmNoteDraft, setCrmNoteDraft] = useState(selectedUser?.notes || '')

  // Ref for auto-scrolling to the bottom of the conversation
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Auto-scroll when messages change or conversation switches
  useEffect(() => {
    scrollToBottom('smooth')
  }, [selectedUser?.messages?.length, selectedUser?.id])

  // Fetch real-time conversations from API Gateway
  const syncConversations = useCallback(async () => {
    try {
      const res = await veroxApi.getConversations()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiOnline(true)
        const mappedFromBackend: ChatUserItem[] = (res.data as Array<Record<string, unknown>>).map((c) => ({
          id: String(c.id || ''),
          profile: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(String(c.contactName || 'Client'))}`,
          username: String(c.contactPhone || 'whatsapp_user'),
          fullName: String(c.contactName || 'WhatsApp Contact'),
          title: String(c.channel || 'WHATSAPP CLOUD API').toUpperCase(),
          tags:
            Array.isArray(c.tags) && c.tags.length > 0
              ? c.tags.map((t: unknown) =>
                  typeof t === 'string'
                    ? t
                    : typeof t === 'object' && t !== null && 'name' in t
                    ? String((t as { name: string }).name)
                    : 'Lead'
                )
              : ['GPS', 'hot-lead'],
          unreadCount: typeof c.unreadCount === 'number' ? c.unreadCount : 0,
          assignedAgent: String(c.assignedToName || 'Agent Bhavik'),
          status: 'Hot Lead',
          location: 'Gujarat, India',
          notes: '',
          messages: Array.isArray(c.messages)
            ? (c.messages as Array<Record<string, unknown>>).map((m) => ({
                sender: m.senderType === 'agent' ? 'You' : String(c.contactName || 'Contact'),
                message: String(m.content || ''),
                timestamp: String(m.createdAt || new Date().toISOString()),
              }))
            : [],
        }))

        setChatList((prev) => {
          const existingIds = new Set(mappedFromBackend.map((m) => m.id))
          const preserved = prev.filter((p) => !existingIds.has(p.id))
          return [...mappedFromBackend, ...preserved]
        })
      }
    } catch (_err) {
      setApiOnline(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const initialTimer = setTimeout(() => {
      if (mounted) syncConversations()
    }, 0)

    const timer = setInterval(() => {
      if (mounted) syncConversations()
    }, 5000)

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('ws://localhost:4000')
      ws.onopen = () => {
        if (mounted) setApiOnline(true)
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'MESSAGE_SENT' || data.type === 'INBOUND_MESSAGE' || data.type === 'NEW_LEAD') {
            if (mounted) syncConversations()
          }
        } catch (_err) {
          // Ignore invalid WS payload
        }
      }
      ws.onerror = () => {
        // Fallback to polling
      }
    } catch (_err) {
      // WebSocket initialization fallback
    }

    return () => {
      mounted = false
      clearTimeout(initialTimer)
      clearInterval(timer)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [syncConversations])

  // Dynamic tag counts
  const getTagCount = (tag: string) => {
    if (tag === 'All') return chatList.length
    return chatList.filter((c) => c.tags.includes(tag)).length
  }

  // Filtered list based on active tag, unread tab, and search query
  const filteredChatList = chatList.filter((chat) => {
    const matchesTag = activeTag === 'All' || chat.tags.includes(activeTag)
    const matchesTab = activeTab === 'all' || chat.unreadCount > 0
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      chat.fullName.toLowerCase().includes(q) ||
      chat.username.toLowerCase().includes(q) ||
      chat.tags.some((t) => t.toLowerCase().includes(q)) ||
      chat.messages.some((m) => m.message.toLowerCase().includes(q))

    return matchesTag && matchesTab && matchesSearch
  })

  // Select a user and mark as read
  const handleSelectUser = (chatUsr: ChatUserItem) => {
    const updatedUser = { ...chatUsr, unreadCount: 0 }
    setSelectedUser(updatedUser)
    setMobileSelectedUser(updatedUser)
    setCrmNoteDraft(chatUsr.notes || '')
    setChatList((prev) =>
      prev.map((c) => (c.id === chatUsr.id ? { ...c, unreadCount: 0 } : c))
    )
  }

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

  // Send outbound message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim()
    if (!textToSend || !selectedUser) return
    setInputMessage('')
    setIsSending(true)

    // 1. Optimistic UI update & bump to top of conversation list
    const newMsg: ChatMessage = {
      sender: 'You',
      message: textToSend,
      timestamp: new Date().toISOString(),
    }
    const updatedUser: ChatUserItem = {
      ...selectedUser,
      unreadCount: 0,
      messages: [...selectedUser.messages, newMsg],
    }
    setSelectedUser(updatedUser)
    setChatList((prev) => [updatedUser, ...prev.filter((c) => c.id !== selectedUser.id)])

    // 2. Real API dispatch to backend port 4000
    try {
      const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
      await veroxApi.sendMessage({
        to: cleanPhone,
        text: textToSend,
        conversationId: selectedUser.id,
      })
      toast.success('Official WhatsApp message dispatched via Meta Cloud API!')
    } catch (_err) {
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
    const updatedUser: ChatUserItem = {
      ...selectedUser,
      messages: [...selectedUser.messages, newMsg],
    }
    setSelectedUser(updatedUser)
    setChatList((prev) => [updatedUser, ...prev.filter((c) => c.id !== selectedUser.id)])
    setAttachModalOpen(false)

    const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
    veroxApi.sendMessage({
      to: cleanPhone,
      text: `[Attachment: ${attachment.name}] Sent ${attachment.label}`,
      conversationId: selectedUser.id,
    })
    toast.success(`Sent ${attachment.label} to ${selectedUser.fullName}!`)
  }

  // Send an official Meta WhatsApp template
  const handleSendTemplate = (template: typeof OFFICIAL_META_TEMPLATES[0]) => {
    if (!selectedUser) return
    const personalizedText = template.text.replace(/\{\{name\}\}/g, selectedUser.fullName)
    const newMsg: ChatMessage = {
      sender: 'You',
      message: `[Meta Template: ${template.name}]\n\n${personalizedText}`,
      timestamp: new Date().toISOString(),
    }
    const updatedUser: ChatUserItem = {
      ...selectedUser,
      messages: [...selectedUser.messages, newMsg],
    }
    setSelectedUser(updatedUser)
    setChatList((prev) => [updatedUser, ...prev.filter((c) => c.id !== selectedUser.id)])
    setTemplateModalOpen(false)

    const cleanPhone = selectedUser.username.replace(/[^0-9]/g, '') || '919825100001'
    veroxApi.sendMessage({
      to: cleanPhone,
      text: personalizedText,
      template: {
        name: template.name,
        language: { code: template.language.includes('Hindi') ? 'hi' : 'en_US' },
      },
      conversationId: selectedUser.id,
    })
    toast.success(`Meta Template "${template.label}" dispatched!`)
  }

  // Start new conversation from NewChat dialog
  const handleStartNewChat = (data: { name: string; phone: string; initialMessage?: string }) => {
    const existing = chatList.find((c) => c.username === data.phone)
    if (existing) {
      handleSelectUser(existing)
      if (data.initialMessage) {
        handleSendMessage(data.initialMessage)
      }
      toast.info(`Opened existing chat with ${existing.fullName}`)
      return
    }

    const newChatId = `conv-${Date.now()}`
    const newChat: ChatUserItem = {
      id: newChatId,
      profile: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      username: data.phone,
      fullName: data.name,
      title: 'WHATSAPP CLOUD API • Direct Lead',
      tags: ['GPS', 'hot-lead'],
      unreadCount: 0,
      assignedAgent: 'Agent Bhavik',
      status: 'Hot Lead',
      location: 'Gujarat, India',
      notes: 'New conversation initiated by agent.',
      messages: data.initialMessage
        ? [
            {
              sender: 'You',
              message: data.initialMessage,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
    }

    setChatList((prev) => [newChat, ...prev])
    setSelectedUser(newChat)
    setMobileSelectedUser(newChat)
    setCrmNoteDraft(newChat.notes || '')

    if (data.initialMessage) {
      const cleanPhone = data.phone.replace(/[^0-9]/g, '')
      veroxApi.sendMessage({
        to: cleanPhone,
        text: data.initialMessage,
        conversationId: newChatId,
      })
    }
    toast.success(`Started new WhatsApp conversation with ${data.name}!`)
  }

  // Export conversation transcript
  const handleExportTranscript = () => {
    if (!selectedUser) return
    const lines = [
      `VEROX CRM WhatsApp Transcript`,
      `Client: ${selectedUser.fullName} (${selectedUser.username})`,
      `Title: ${selectedUser.title}`,
      `Assigned Agent: ${selectedUser.assignedAgent || 'None'}`,
      `Status: ${selectedUser.status || 'Active'}`,
      `Location: ${selectedUser.location || 'Gujarat'}`,
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
    const updatedUser: ChatUserItem = {
      ...selectedUser,
      messages: [],
    }
    setSelectedUser(updatedUser)
    setChatList((prev) => prev.map((c) => (c.id === selectedUser.id ? updatedUser : c)))
    setMoreModalOpen(false)
    toast.success('Conversation history cleared locally.')
  }

  // Toggle tag
  const handleToggleTag = (tag: string) => {
    if (!selectedUser) return
    const updatedTags = selectedUser.tags.includes(tag)
      ? selectedUser.tags.filter((t) => t !== tag)
      : [...selectedUser.tags, tag]
    const updatedUser: ChatUserItem = {
      ...selectedUser,
      tags: updatedTags,
    }
    setSelectedUser(updatedUser)
    setChatList((prev) => prev.map((c) => (c.id === selectedUser.id ? updatedUser : c)))
    toast.success(`Updated tags for ${selectedUser.fullName}`)
  }

  // Update lead status
  const handleUpdateStatus = (status: string) => {
    if (!selectedUser) return
    const updatedUser: ChatUserItem = { ...selectedUser, status }
    setSelectedUser(updatedUser)
    setChatList((prev) => prev.map((c) => (c.id === selectedUser.id ? updatedUser : c)))
    toast.success(`Lead stage set to "${status}"`)
  }

  // Update assigned agent
  const handleUpdateAgent = (agent: string) => {
    if (!selectedUser) return
    const updatedUser: ChatUserItem = { ...selectedUser, assignedAgent: agent }
    setSelectedUser(updatedUser)
    setChatList((prev) => prev.map((c) => (c.id === selectedUser.id ? updatedUser : c)))
    toast.success(`Assigned to ${agent}`)
  }

  // Save CRM Note
  const handleSaveNote = () => {
    if (!selectedUser) return
    const updatedUser: ChatUserItem = { ...selectedUser, notes: crmNoteDraft }
    setSelectedUser(updatedUser)
    setChatList((prev) => prev.map((c) => (c.id === selectedUser.id ? updatedUser : c)))
    toast.success('CRM notes saved successfully!')
  }

  // Build contact options for NewChat dialog
  const contactOptions: ContactOption[] = chatList.map((c) => ({
    id: c.id,
    name: c.fullName,
    phone: c.username,
    tags: c.tags,
    avatar: c.profile,
  }))

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

      {/* Main Container - Pinned Height to Viewport to Prevent Hidden Bottom Input Bar */}
      <Main fixed fluid className='flex flex-col h-[calc(100vh-3.5rem)] p-3 overflow-hidden gap-2.5'>
        {/* Top Tag Pills Filter Bar */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 shrink-0 scrollbar-none'>
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

        {/* 3-Column Inbox Grid Layout */}
        <section className='flex flex-1 min-h-0 gap-3 overflow-hidden'>
          {/* ========================================================= */}
          {/* COLUMN 1: Conversation List */}
          {/* ========================================================= */}
          <div className='flex flex-col w-72 lg:w-80 shrink-0 h-full rounded-xl border border-border/60 bg-card p-3 shadow-xs overflow-hidden'>
            {/* Header, Count & New Chat Button */}
            <div className='flex items-center justify-between pb-2 shrink-0'>
              <div className='flex items-center gap-2'>
                <h1 className='text-base font-bold tracking-tight'>Inbox</h1>
                <Badge variant='outline' className='text-[10px] px-1.5 bg-muted/60'>
                  {filteredChatList.length}
                </Badge>
              </div>

              <div className='flex items-center gap-1.5'>
                {/* All / Unread Switcher */}
                <div className='flex gap-0.5 bg-muted/60 p-0.5 rounded-md text-[11px]'>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      'px-2 py-0.5 rounded font-medium cursor-pointer transition-all',
                      activeTab === 'all'
                        ? 'bg-background text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={cn(
                      'px-2 py-0.5 rounded font-medium cursor-pointer transition-all',
                      activeTab === 'unread'
                        ? 'bg-background text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Unread
                  </button>
                </div>

                {/* + New Chat Button */}
                <Button
                  size='sm'
                  onClick={() => setNewChatModalOpen(true)}
                  className='h-7 px-2 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1 cursor-pointer shrink-0'
                  title='Start New WhatsApp Chat'
                >
                  <Plus className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>New</span>
                </Button>
              </div>
            </div>

            {/* Search Input with Clear Button */}
            <div className='relative mb-2 shrink-0'>
              <SearchIcon className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
              <input
                type='search'
                name='chat_filter_query'
                id='chat_filter_query'
                autoComplete='off'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search contact, phone or tag...'
                className='h-8 w-full rounded-md border border-border bg-background pl-8 pr-7 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>

            {/* Conversation List / Empty State */}
            {filteredChatList.length === 0 ? (
              <div className='flex flex-col items-center justify-center flex-1 py-8 px-4 text-center bg-muted/20 rounded-lg border border-dashed border-border'>
                <SearchX className='h-7 w-7 text-muted-foreground mb-1.5' />
                <h4 className='font-semibold text-xs text-foreground'>No conversations found</h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  No chats match &ldquo;{search || activeTag}&rdquo;.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSearch('')
                    setActiveTag('All')
                    setActiveTab('all')
                  }}
                  className='h-7 text-xs mt-2.5 cursor-pointer'
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <ScrollArea className='flex-1 pe-1'>
                <div className='space-y-1'>
                  {filteredChatList.map((chatUsr) => {
                    const { id, profile, username, messages, fullName, tags, unreadCount } = chatUsr
                    const lastConvo = messages[messages.length - 1]
                    const isSelected = selectedUser?.id === id

                    return (
                      <button
                        key={id}
                        type='button'
                        onClick={() => handleSelectUser(chatUsr)}
                        className={cn(
                          'w-full rounded-lg p-2.5 text-start transition-all cursor-pointer border',
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500/40 shadow-2xs'
                            : 'border-transparent hover:bg-muted/50 hover:border-border/40'
                        )}
                      >
                        <div className='flex items-start gap-2.5'>
                          <Avatar className='h-9 w-9 shrink-0 border border-border/40'>
                            <AvatarImage src={profile} alt={username} />
                            <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-xs'>
                              {getDisplayNameInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 overflow-hidden min-w-0'>
                            <div className='flex items-center justify-between gap-1'>
                              <span className='font-bold text-xs text-foreground truncate'>
                                {fullName}
                              </span>
                              <span className='text-[10px] text-muted-foreground shrink-0'>
                                {lastConvo ? format(new Date(lastConvo.timestamp), 'hh:mm a') : ''}
                              </span>
                            </div>
                            <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                              {lastConvo?.message || 'New inbound WhatsApp inquiry'}
                            </p>
                            <div className='flex items-center justify-between mt-1.5'>
                              <div className='flex gap-1 flex-wrap'>
                                {tags.slice(0, 2).map((t) => (
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
                                <span className='h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0'>
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: Active Conversation Thread */}
          {/* ========================================================= */}
          {selectedUser ? (
            <div
              className={cn(
                'absolute inset-0 z-50 hidden flex-1 flex-col rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden sm:static sm:flex',
                mobileSelectedUser && 'flex'
              )}
            >
              {/* Top Conversation Header */}
              <div className='flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20 shrink-0'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-8 w-8 sm:hidden shrink-0'
                    onClick={() => {
                      setSelectedUser(null)
                      setMobileSelectedUser(null)
                    }}
                  >
                    <ArrowLeft className='h-4 w-4' />
                  </Button>
                  <Avatar className='h-9 w-9 shrink-0 border border-border/40'>
                    <AvatarImage src={selectedUser.profile} alt={selectedUser.username} />
                    <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-xs'>
                      {getDisplayNameInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-bold text-xs text-foreground truncate'>
                        {selectedUser.fullName}
                      </span>
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20 shrink-0' />
                      {selectedUser.status && (
                        <Badge
                          variant='outline'
                          className='text-[9px] px-1 py-0 border-orange-500/40 text-orange-600 bg-orange-500/10'
                        >
                          {selectedUser.status}
                        </Badge>
                      )}
                    </div>
                    <span className='text-[10px] text-muted-foreground font-mono block truncate'>
                      {selectedUser.username} • {selectedUser.assignedAgent || 'Agent Bhavik'}
                    </span>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className='flex items-center gap-1.5 shrink-0'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleTriggerSimulatedInbound}
                    className='h-7 text-[11px] gap-1 cursor-pointer bg-background hover:bg-muted'
                    title='Simulate Inbound WhatsApp Webhook'
                  >
                    <Zap className='h-3 w-3 text-orange-600' />
                    <span className='hidden md:inline'>Simulate Inbound</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setTemplateModalOpen(true)}
                    className='h-7 text-[11px] gap-1 cursor-pointer bg-background hover:bg-muted text-emerald-600'
                    title='Send Official Meta WhatsApp Template'
                  >
                    <FileCheck className='h-3 w-3' />
                    <span className='hidden lg:inline'>Templates</span>
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setCallModalOpen(true)}
                    className='h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='Voice Call Client'
                  >
                    <Phone className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setShowInspector(!showInspector)}
                    className={cn(
                      'h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer hidden xl:flex',
                      showInspector && 'text-orange-600 bg-orange-500/10'
                    )}
                    title={showInspector ? 'Hide CRM Details' : 'Show CRM Details'}
                  >
                    {showInspector ? (
                      <PanelRightClose className='h-3.5 w-3.5' />
                    ) : (
                      <PanelRightOpen className='h-3.5 w-3.5' />
                    )}
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setMoreModalOpen(true)}
                    className='h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='More Options'
                  >
                    <MoreVertical className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>

              {/* Chat Messages Body - Scrollable */}
              <ScrollArea className='flex-1 p-4 bg-muted/10 overflow-y-auto'>
                <div className='space-y-4'>
                  {currentMessageGroups &&
                    Object.entries(currentMessageGroups).map(([dateKey, msgs]) => (
                      <div key={dateKey} className='space-y-3'>
                        <div className='text-center my-2'>
                          <span className='text-[10px] bg-muted/60 text-muted-foreground px-2.5 py-0.5 rounded-full font-medium'>
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
                                  'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed',
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
                                    <div className='flex-1 overflow-hidden min-w-0'>
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
                  {/* Invisible anchor for smooth auto-scroll to latest message */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input Bar - Pinned at the Bottom */}
              <div className='p-3 border-t border-border/60 bg-card shrink-0'>
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
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setTemplateModalOpen(true)}
                    className='h-8 w-8 text-muted-foreground hover:text-emerald-600 shrink-0 cursor-pointer'
                    title='Send Official Meta WhatsApp Template'
                  >
                    <Sparkles className='h-4 w-4' />
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
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs h-9 px-3 gap-1 font-bold shrink-0 cursor-pointer'
                  >
                    <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Welcome Screen when no conversation selected */
            <div className='hidden flex-1 flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-8 text-center sm:flex shadow-xs'>
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

          {/* ========================================================= */}
          {/* COLUMN 3: Contact Details & CRM Inspector (Right Panel) */}
          {/* ========================================================= */}
          {showInspector && selectedUser && (
            <div className='hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 h-full rounded-xl border border-border/60 bg-card p-3 shadow-xs overflow-hidden'>
              <div className='flex items-center justify-between pb-2 border-b border-border/50 shrink-0'>
                <span className='font-bold text-xs text-foreground flex items-center gap-1.5'>
                  <Building2 className='h-3.5 w-3.5 text-orange-600' /> Contact CRM Profile
                </span>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setShowInspector(false)}
                  className='h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer'
                  title='Close Details'
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              </div>

              <ScrollArea className='flex-1 pe-1 pt-2'>
                <div className='space-y-4 text-xs'>
                  {/* Profile Card */}
                  <div className='flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 border border-border/40'>
                    <Avatar className='h-12 w-12 border border-border/60 shadow-xs mb-2'>
                      <AvatarImage src={selectedUser.profile} />
                      <AvatarFallback className='bg-orange-500/15 text-orange-600 font-bold text-sm'>
                        {getDisplayNameInitials(selectedUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-1'>
                      <h3 className='font-bold text-sm text-foreground'>{selectedUser.fullName}</h3>
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20' />
                    </div>
                    <p className='font-mono text-[11px] text-muted-foreground mt-0.5'>{selectedUser.username}</p>

                    <div className='flex items-center gap-1.5 mt-2.5 w-full'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          navigator.clipboard.writeText(selectedUser.username)
                          toast.success('Phone copied!')
                        }}
                        className='flex-1 h-7 text-[10px] gap-1 cursor-pointer'
                      >
                        <Copy className='h-3 w-3' /> Copy
                      </Button>
                      <Button
                        size='sm'
                        className='flex-1 h-7 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        asChild
                      >
                        <a
                          href={`https://wa.me/${selectedUser.username.replace(/[^0-9]/g, '')}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <ExternalLink className='h-3 w-3' /> WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* CRM Status & Stage */}
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                      Lead Stage
                    </label>
                    <div className='grid grid-cols-2 gap-1'>
                      {['Hot Lead', 'Qualified', 'Proposal Sent', 'Active Customer'].map((st) => (
                        <button
                          key={st}
                          type='button'
                          onClick={() => handleUpdateStatus(st)}
                          className={cn(
                            'px-2 py-1 rounded text-[10px] font-medium border text-center cursor-pointer transition-all',
                            selectedUser.status === st
                              ? 'bg-orange-600 text-white border-orange-600 font-bold'
                              : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                      Assigned Agent
                    </label>
                    <div className='grid grid-cols-2 gap-1'>
                      {['Agent Bhavik', 'Agent Anjali', 'VEROX AI Bot', 'Support Desk'].map((ag) => (
                        <button
                          key={ag}
                          type='button'
                          onClick={() => handleUpdateAgent(ag)}
                          className={cn(
                            'px-2 py-1 rounded text-[10px] font-medium border text-center cursor-pointer transition-all',
                            selectedUser.assignedAgent === ag
                              ? 'bg-orange-500/15 border-orange-500 text-orange-600 font-bold'
                              : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {ag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Meta Details */}
                  <div className='space-y-2 p-2.5 rounded-lg bg-muted/20 border border-border/40 text-[11px]'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <MapPin className='h-3.5 w-3.5 text-orange-600 shrink-0' />
                      <span className='truncate'>{selectedUser.location || 'Gujarat, India'}</span>
                    </div>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Mail className='h-3.5 w-3.5 text-orange-600 shrink-0' />
                      <span className='truncate'>{selectedUser.email || 'lead@gujaratfleet.com'}</span>
                    </div>
                  </div>

                  {/* Tags Management */}
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1'>
                      <Tag className='h-3 w-3' /> CRM Tags
                    </label>
                    <div className='flex flex-wrap gap-1'>
                      {['GPS', 'FASTAG', 'Fleet Mgmt', 'hot-lead', 'Hinglish IN', 'INSURANCE'].map((tag) => {
                        const hasTag = selectedUser.tags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type='button'
                            onClick={() => handleToggleTag(tag)}
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-all',
                              hasTag
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {hasTag ? '✓ ' : '+ '}
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Internal CRM Notes */}
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1'>
                      <StickyNote className='h-3 w-3' /> Agent Internal Notes
                    </label>
                    <textarea
                      rows={3}
                      value={crmNoteDraft}
                      onChange={(e) => setCrmNoteDraft(e.target.value)}
                      placeholder='Add follow-up notes, vehicle count, price quotes...'
                      className='w-full p-2 text-[11px] rounded-md border border-border bg-background outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none'
                    />
                    <Button
                      size='sm'
                      onClick={handleSaveNote}
                      className='w-full h-7 text-[10px] bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'
                    >
                      Save CRM Note
                    </Button>
                  </div>

                  {/* Quick Action PDF Brochure Dispatches */}
                  <div className='space-y-1.5 pt-1'>
                    <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                      Quick Catalog Dispatch
                    </label>
                    <div className='space-y-1'>
                      {PRESET_ATTACHMENTS.slice(0, 2).map((att) => (
                        <button
                          key={att.id}
                          type='button'
                          onClick={() => handleSendAttachment(att)}
                          className='w-full flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/20 hover:bg-muted/40 text-left cursor-pointer transition-all'
                        >
                          <div className='flex items-center gap-2 overflow-hidden'>
                            <FileText className='h-3.5 w-3.5 text-orange-600 shrink-0' />
                            <span className='font-medium text-[11px] truncate'>{att.label}</span>
                          </div>
                          <span className='text-[9px] text-orange-600 font-bold shrink-0'>Send</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </section>
      </Main>

      {/* ========================================================= */}
      {/* 1. NEW CHAT DIALOG */}
      {/* ========================================================= */}
      <NewChat
        open={newChatModalOpen}
        onOpenChange={setNewChatModalOpen}
        contacts={contactOptions}
        onStartChat={handleStartNewChat}
      />

      {/* ========================================================= */}
      {/* 2. OFFICIAL META TEMPLATES MODAL */}
      {/* ========================================================= */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              <FileCheck className='h-4 w-4 text-emerald-600' />
              Official Meta WhatsApp Templates
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Send pre-approved WhatsApp templates directly to {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2.5 py-2 max-h-80 overflow-y-auto pr-1'>
            {OFFICIAL_META_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className='p-3 rounded-lg border border-border/60 bg-card hover:border-emerald-500/50 hover:bg-muted/20 transition-all shadow-xs'
              >
                <div className='flex items-center justify-between mb-1.5'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-bold text-xs text-foreground'>{tpl.label}</h4>
                    <Badge variant='outline' className='text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-600 bg-emerald-500/10'>
                      {tpl.category}
                    </Badge>
                  </div>
                  <span className='text-[10px] text-muted-foreground font-mono'>{tpl.language}</span>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/40 p-2 rounded-md border border-border/40'>
                  {tpl.text.replace(/\{\{name\}\}/g, selectedUser?.fullName || 'Client')}
                </p>
                <div className='flex justify-end gap-2 mt-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setInputMessage(tpl.text.replace(/\{\{name\}\}/g, selectedUser?.fullName || 'Client'))
                      setTemplateModalOpen(false)
                      toast.success('Template loaded into message input.')
                    }}
                    className='h-7 text-xs cursor-pointer'
                  >
                    Edit in Box
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => handleSendTemplate(tpl)}
                    className='h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 cursor-pointer'
                  >
                    <Send className='h-3 w-3' /> Send Template
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setTemplateModalOpen(false)} className='h-8 text-xs cursor-pointer'>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. ATTACHMENT MODAL */}
      {/* ========================================================= */}
      <Dialog open={attachModalOpen} onOpenChange={setAttachModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
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
            <Button variant='outline' size='sm' onClick={() => setAttachModalOpen(false)} className='h-8 text-xs cursor-pointer'>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. QUICK REPLIES & EMOJIS MODAL */}
      {/* ========================================================= */}
      <Dialog open={quickReplyModalOpen} onOpenChange={setQuickReplyModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
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
            <Button variant='outline' size='sm' onClick={() => setQuickReplyModalOpen(false)} className='h-8 text-xs cursor-pointer'>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. VOICE CALL DIALOG */}
      {/* ========================================================= */}
      <Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
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
                className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 cursor-pointer font-bold'
                asChild
              >
                <a href={`tel:${selectedUser?.username}`}>
                  <PhoneCall className='h-3.5 w-3.5' /> Direct Dial
                </a>
              </Button>
              <Button
                variant='outline'
                className='border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 text-xs h-9 gap-1.5 cursor-pointer font-bold'
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
            <Button variant='outline' size='sm' onClick={() => setCallModalOpen(false)} className='h-8 text-xs cursor-pointer'>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 6. MORE OPTIONS DIALOG */}
      {/* ========================================================= */}
      <Dialog open={moreModalOpen} onOpenChange={setMoreModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
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
                {['Agent Bhavik', 'Agent Anjali', 'VEROX AI Bot', 'Support Desk'].map((ag) => (
                  <button
                    key={ag}
                    type='button'
                    onClick={() => handleUpdateAgent(ag)}
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
            <Button variant='outline' size='sm' onClick={() => setMoreModalOpen(false)} className='h-8 text-xs cursor-pointer'>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
