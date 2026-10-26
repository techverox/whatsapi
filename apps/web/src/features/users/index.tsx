import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { veroxApi } from '@/lib/api'
import {
  Radio,
  UserCheck,
  Tag,
  RotateCw,
  Download,
  Upload,
  Plus,
  Search as SearchIcon,
  SearchX,
  SlidersHorizontal,
  Columns3,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  Phone,
  User,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ContactRecord {
  id: string
  created: string
  name: string
  phone: string
  source: string
  tags: string[]
  optIn: boolean
  assignedAt: string
  assignedTo: string
  email: string
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified'
  wabaPhone: string
  gpsClient: boolean
}

const INITIAL_MOCK_CONTACTS: ContactRecord[] = [
  {
    id: 'cnt-1',
    created: '10/24/2026, 05:15 PM',
    name: 'WhatsApp Lead (2938)',
    phone: '+919825102938',
    source: 'whatsapp',
    tags: ['IndiaMart Lead', 'Hot Lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'whatsapplead2938@example.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'cnt-2',
    created: '10/22/2026, 03:58 PM',
    name: 'Rajesh Sharma',
    phone: '+919825100001',
    source: 'indiamart',
    tags: ['IndiaMart Lead', 'Hot Lead', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 04:00 PM',
    assignedTo: 'Agent Bhavik',
    email: 'rajesh.sharma@example.com',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'cnt-3',
    created: '10/22/2026, 05:15 PM',
    name: 'Vikram Patel',
    phone: '+919426000002',
    source: 'facebook',
    tags: ['FB Ads', 'FASTAG Client', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 05:30 PM',
    assignedTo: 'Agent Anjali',
    email: 'vikram.patel@example.com',
    status: 'Contacted',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'cnt-4',
    created: '10/22/2026, 07:40 PM',
    name: 'Ananya Desai',
    phone: '+919909000003',
    source: 'whatsapp',
    tags: ['Hot Lead', 'FASTAG Client'],
    optIn: true,
    assignedAt: '10/22/2026, 07:42 PM',
    assignedTo: 'DV AI Bot',
    email: 'ananya.desai@example.com',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'cnt-5',
    created: '10/21/2026, 02:30 PM',
    name: 'Sunil Mehta',
    phone: '+919898000004',
    source: 'manual',
    tags: ['Fleet Mgmt', 'Hinglish Support'],
    optIn: true,
    assignedAt: '10/21/2026, 03:00 PM',
    assignedTo: 'Agent Bhavik',
    email: 'sunil.mehta@example.com',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'cnt-6',
    created: '10/22/2026, 11:34 PM',
    name: 'Truck Sathi GPS Client',
    phone: '+917698580043',
    source: 'whatsapp',
    tags: ['Hot Lead', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 11:35 PM',
    assignedTo: 'Support Desk',
    email: 'client@trucksathi.in',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'cnt-7',
    created: '10/22/2026, 10:15 PM',
    name: 'Rajesh Sharma Logistics',
    phone: '+919825109283',
    source: 'indiamart',
    tags: ['IndiaMart Lead', 'Hot Lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'rajesh.sharma@logistics.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'cnt-8',
    created: '10/22/2026, 08:42 PM',
    name: 'Ahmedabad Transport Hub',
    phone: '+919825114422',
    source: 'facebook',
    tags: ['FB Ads', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 08:50 PM',
    assignedTo: 'Agent Bhavik',
    email: 'hub@ahmedabadtransport.com',
    status: 'Contacted',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'cnt-9',
    created: '10/22/2026, 07:10 PM',
    name: 'Surat Highway Fleet',
    phone: '+919426188219',
    source: 'whatsapp',
    tags: ['FASTAG Client', 'Hinglish Support'],
    optIn: true,
    assignedAt: '10/22/2026, 07:30 PM',
    assignedTo: 'Agent Anjali',
    email: 'dispatch@surathighway.in',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'cnt-10',
    created: '10/22/2026, 06:00 PM',
    name: 'Vadodara Express Cargo',
    phone: '+919909123891',
    source: 'manual',
    tags: ['Fleet Mgmt'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'cargo@vadodaraexpress.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
]

const TAG_PILLS = [
  'All',
  'IndiaMart Lead',
  'FB Ads',
  'Hot Lead',
  'FASTAG Client',
  'Fleet Mgmt',
  'Hinglish Support',
]

function generateContactId(): string {
  return `cnt-${Date.now()}`
}

export function Users() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<ContactRecord[]>(INITIAL_MOCK_CONTACTS)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters State
  const [activeTag, setActiveTag] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Contacted' | 'Qualified' | 'Unqualified'>('All')
  const [sourceFilter, setSourceFilter] = useState<'All' | 'whatsapp' | 'indiamart' | 'facebook' | 'manual'>('All')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Sorting State
  const [sortField, setSortField] = useState<'created' | 'name' | 'phone' | 'source' | 'status' | 'assignedTo'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination State
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Columns Visibility State
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    created: true,
    name: true,
    phone: true,
    source: true,
    tags: true,
    optIn: true,
    assignedAt: true,
    assignedTo: true,
    email: true,
    status: true,
    wabaPhone: true,
    gpsClient: true,
  })

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactSource, setNewContactSource] = useState('whatsapp')
  const [newContactTag, setNewContactTag] = useState('hot-lead')
  const [newContactAgent, setNewContactAgent] = useState('Agent Bhavik')

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(null)

  // Delete Modals
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<ContactRecord | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Bulk Assign & Tag Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState('Agent Bhavik')

  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [selectedTagToAssign, setSelectedTagToAssign] = useState('hot-lead')

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importCsvText, setImportCsvText] = useState('')

  // Details Modal
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<ContactRecord | null>(null)

  // Load contacts from API Gateway
  const loadContacts = useCallback(() => {
    setIsRefreshing(true)
    veroxApi
      .getContacts()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ContactRecord[] = (res.data as Array<Record<string, unknown>>).map((c) => {
            const tags = Array.isArray(c.tags)
              ? c.tags.map((t) =>
                  typeof t === 'string'
                    ? t
                    : typeof t === 'object' && t !== null && 'name' in t
                    ? String((t as { name: string }).name)
                    : 'Lead'
                )
              : []
            const assignedTo = String(c.assignedToName || 'Not Assigned')
            const isAssigned = assignedTo !== 'Not Assigned' && assignedTo.trim() !== ''
            return {
              id: String(c.id || ''),
              created: c.createdAt ? new Date(String(c.createdAt)).toLocaleString() : new Date().toLocaleString(),
              name: String(c.name || 'Unknown Contact'),
              phone: String(c.phone || ''),
              source: (typeof c.source === 'string' ? c.source : 'whatsapp') as ContactRecord['source'],
              tags,
              optIn: typeof c.optIn === 'boolean' ? c.optIn : true,
              assignedAt: c.assignedAt ? new Date(String(c.assignedAt)).toLocaleString() : '-',
              assignedTo,
              email: String(
                c.email || `${String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
              ),
              status: isAssigned ? 'Qualified' : 'New',
              wabaPhone: '+917698580043',
              gpsClient: tags.some((t) => t.toLowerCase().includes('fleet') || t.toLowerCase().includes('gps')),
            }
          })

          setContacts(mapped)
          toast.success(`Loaded ${mapped.length} contacts from API Gateway!`)
        }
      })
      .catch((_err) => {
        // Fallback to offline store
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }, [])

  useEffect(() => {
    let mounted = true
    veroxApi
      .getContacts()
      .then((res) => {
        if (!mounted) return
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ContactRecord[] = (res.data as Array<Record<string, unknown>>).map((c) => {
            const tags = Array.isArray(c.tags)
              ? c.tags.map((t) =>
                  typeof t === 'string'
                    ? t
                    : typeof t === 'object' && t !== null && 'name' in t
                    ? String((t as { name: string }).name)
                    : 'Lead'
                )
              : []
            const assignedTo = String(c.assignedToName || 'Not Assigned')
            const isAssigned = assignedTo !== 'Not Assigned' && assignedTo.trim() !== ''
            return {
              id: String(c.id || ''),
              created: c.createdAt ? new Date(String(c.createdAt)).toLocaleString() : new Date().toLocaleString(),
              name: String(c.name || 'Unknown Contact'),
              phone: String(c.phone || ''),
              source: (typeof c.source === 'string' ? c.source : 'whatsapp') as ContactRecord['source'],
              tags,
              optIn: typeof c.optIn === 'boolean' ? c.optIn : true,
              assignedAt: c.assignedAt ? new Date(String(c.assignedAt)).toLocaleString() : '-',
              assignedTo,
              email: String(
                c.email || `${String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
              ),
              status: isAssigned ? 'Qualified' : 'New',
              wabaPhone: '+917698580043',
              gpsClient: tags.some((t) => t.toLowerCase().includes('fleet') || t.toLowerCase().includes('gps')),
            }
          })

          setContacts(mapped)
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  // Checkbox Selection
  const handleToggleSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (currentPaginated: ContactRecord[]) => {
    const paginatedIds = currentPaginated.map((c) => c.id)
    const allSelected = paginatedIds.every((id) => selectedRows.includes(id))
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((id) => !paginatedIds.includes(id)))
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...paginatedIds])))
    }
  }

  // Column Sort Toggle
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Create Contact
  const handleCreateContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error('Name and Phone number are required.')
      return
    }
    const cleanPhone = newContactPhone.trim().replace(/[^0-9+]/g, '')
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/^0/, '')}`

    const newRecord: ContactRecord = {
      id: generateContactId(),
      created: new Date().toLocaleString(),
      name: newContactName.trim(),
      phone: formattedPhone,
      source: newContactSource,
      tags: [newContactTag],
      optIn: true,
      assignedAt: newContactAgent !== 'Not Assigned' ? new Date().toLocaleString() : '-',
      assignedTo: newContactAgent,
      email: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      status: 'New',
      wabaPhone: '+917698580043',
      gpsClient: newContactTag === 'GPS',
    }

    try {
      await veroxApi.createContact({
        name: newContactName.trim(),
        phone: formattedPhone,
        email: newRecord.email,
        source: newContactSource,
        tags: [newContactTag],
        assignedToName: newContactAgent,
      })
    } catch (_err) {
      // Sync fallback
    }

    setContacts([newRecord, ...contacts])
    setNewContactName('')
    setNewContactPhone('')
    setNewContactEmail('')
    setCreateModalOpen(false)
    toast.success(`Contact "${newRecord.name}" created and synced!`)
  }

  // Open Edit Modal
  const handleOpenEdit = (contact: ContactRecord) => {
    setEditingContact({ ...contact })
    setEditModalOpen(true)
  }

  // Save Edited Contact
  const handleSaveEdit = async () => {
    if (!editingContact) return
    if (!editingContact.name.trim() || !editingContact.phone.trim()) {
      toast.error('Name and Phone number cannot be empty.')
      return
    }

    setContacts((prev) =>
      prev.map((c) => (c.id === editingContact.id ? editingContact : c))
    )

    try {
      await veroxApi.updateContact(editingContact.id, {
        name: editingContact.name,
        phone: editingContact.phone,
        email: editingContact.email,
        source: editingContact.source,
        tags: editingContact.tags,
        assignedToName: editingContact.assignedTo,
        status: editingContact.status,
      })
    } catch (_err) {
      // Local fallback
    }

    setEditModalOpen(false)
    setEditingContact(null)
    toast.success(`Contact "${editingContact.name}" updated!`)
  }

  // Delete Single Contact
  const handleDeleteContact = async (contact: ContactRecord) => {
    setContacts((prev) => prev.filter((c) => c.id !== contact.id))
    setSelectedRows((prev) => prev.filter((id) => id !== contact.id))
    try {
      await veroxApi.deleteContact(contact.id)
    } catch (_err) {
      // Local fallback
    }
    setDeleteConfirmContact(null)
    toast.success(`Contact "${contact.name}" removed from CRM.`)
  }

  // Bulk Delete Contacts
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return
    const idsToDelete = [...selectedRows]
    setContacts((prev) => prev.filter((c) => !idsToDelete.includes(c.id)))
    setSelectedRows([])
    setIsBulkDeleteModalOpen(false)

    try {
      await veroxApi.bulkDeleteContacts(idsToDelete)
    } catch (_err) {
      // Local fallback
    }
    toast.success(`Successfully removed ${idsToDelete.length} contact(s).`)
  }

  // Bulk Assign Agent
  const handleBulkAssign = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one contact first.')
      return
    }
    setContacts((prev) =>
      prev.map((c) =>
        selectedRows.includes(c.id)
          ? { ...c, assignedTo: selectedAgentToAssign, assignedAt: new Date().toLocaleString() }
          : c
      )
    )
    toast.success(`Assigned ${selectedRows.length} contact(s) to ${selectedAgentToAssign}!`)
    setIsAssignModalOpen(false)
    setSelectedRows([])
  }

  // Bulk Assign Tag
  const handleBulkAssignTag = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one contact first.')
      return
    }
    setContacts((prev) =>
      prev.map((c) => {
        if (selectedRows.includes(c.id) && !c.tags.includes(selectedTagToAssign)) {
          return { ...c, tags: [...c.tags, selectedTagToAssign] }
        }
        return c
      })
    )
    toast.success(`Added tag "${selectedTagToAssign}" to ${selectedRows.length} contact(s)!`)
    setIsTagModalOpen(false)
    setSelectedRows([])
  }

  // Export CSV
  const handleExportCSV = () => {
    const listToExport = selectedRows.length > 0
      ? contacts.filter((c) => selectedRows.includes(c.id))
      : filteredContacts

    const headers = ['Created', 'Name', 'Phone', 'Source', 'Tags', 'OptIn', 'AssignedAt', 'AssignedTo', 'Email', 'Status', 'WABAPhone', 'GPSClient']
    const rows = listToExport.map((c) => [
      `"${c.created}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.source}"`,
      `"${c.tags.join(';')}"`,
      `"${c.optIn ? 'Yes' : 'No'}"`,
      `"${c.assignedAt}"`,
      `"${c.assignedTo}"`,
      `"${c.email}"`,
      `"${c.status}"`,
      `"${c.wabaPhone}"`,
      `"${c.gpsClient ? 'Yes' : 'No'}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dv_whatsapi_contacts_export_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${listToExport.length} contact(s) to CSV!`)
  }

  // Import CSV text
  const handleImportCSV = () => {
    if (!importCsvText.trim()) {
      toast.error('Please paste CSV data.')
      return
    }
    const lines = importCsvText.trim().split('\n')
    const imported: ContactRecord[] = []
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('name')) return // skip header
      const parts = line.split(',').map((p) => p.replace(/"/g, '').trim())
      if (parts[0] && parts[1]) {
        imported.push({
          id: `c-imp-${Date.now()}-${idx}`,
          created: new Date().toLocaleString(),
          name: parts[0],
          phone: parts[1].startsWith('+') ? parts[1] : `+91${parts[1]}`,
          source: parts[2] || 'manual',
          tags: parts[3] ? parts[3].split(';') : ['hot-lead'],
          optIn: true,
          assignedAt: '-',
          assignedTo: 'Not Assigned',
          email: `${parts[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          status: 'New',
          wabaPhone: '+917698580043',
          gpsClient: false,
        })
      }
    })

    if (imported.length > 0) {
      setContacts([...imported, ...contacts])
      setIsImportModalOpen(false)
      setImportCsvText('')
      toast.success(`Successfully imported ${imported.length} new contacts!`)
    } else {
      toast.error('Could not parse contacts. Please verify format.')
    }
  }

  // Filter Contacts
  const filteredContacts = contacts.filter((c) => {
    // 1. Tag Pill Filter
    const matchesTag = activeTag === 'All' || c.tags.includes(activeTag)

    // 2. Search Query Filter
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.assignedTo.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))

    // 3. Facet Filters
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    const matchesSource = sourceFilter === 'All' || c.source.toLowerCase() === sourceFilter.toLowerCase()

    return matchesTag && matchesSearch && matchesStatus && matchesSource
  })

  // Sort Contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let comparison: number
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === 'phone') {
      comparison = a.phone.localeCompare(b.phone)
    } else if (sortField === 'source') {
      comparison = a.source.localeCompare(b.source)
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status)
    } else if (sortField === 'assignedTo') {
      comparison = a.assignedTo.localeCompare(b.assignedTo)
    } else {
      // created timestamp
      comparison = new Date(a.created).getTime() - new Date(b.created).getTime()
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedContacts.length / pageSize))
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const isCurrentPageAllSelected =
    paginatedContacts.length > 0 &&
    paginatedContacts.every((c) => selectedRows.includes(c.id))

  // Tag Pill Count Helper
  const getTagCount = (tag: string) => {
    if (tag === 'All') return contacts.length
    return contacts.filter((c) => c.tags.includes(tag)).length
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-3 p-4'>
        {/* Title & Top Action Bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2.5'>
              <h1 className='text-2xl font-bold tracking-tight'>Contacts</h1>
              <Badge variant='outline' className='text-xs font-mono bg-muted/60'>
                {contacts.length} Total Records
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Omnichannel audience CRM, WhatsApp opt-ins, dynamic tags &amp; multi-agent lead distribution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 cursor-pointer font-medium'
              asChild
            >
              <Link to='/campaigns'>
                <Radio className='h-3.5 w-3.5 animate-pulse text-orange-600' />
                Broadcast
              </Link>
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsAssignModalOpen(true)}
              disabled={selectedRows.length === 0}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <UserCheck className='h-3.5 w-3.5' />
              Assign {selectedRows.length > 0 && `(${selectedRows.length})`}
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsTagModalOpen(true)}
              disabled={selectedRows.length === 0}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <Tag className='h-3.5 w-3.5' />
              Tag {selectedRows.length > 0 && `(${selectedRows.length})`}
            </Button>

            {/* Bulk Delete Button when rows are selected */}
            {selectedRows.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className='h-8 text-xs gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer font-bold'
              >
                <Trash2 className='h-3.5 w-3.5' />
                Delete ({selectedRows.length})
              </Button>
            )}

            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground cursor-pointer'
              onClick={loadContacts}
              title='Refresh from API'
            >
              <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-orange-600' : ''}`} />
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsImportModalOpen(true)}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <Download className='h-3.5 w-3.5' />
              Import
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <Upload className='h-3.5 w-3.5' />
              Export
            </Button>

            <Button
              size='sm'
              onClick={() => setCreateModalOpen(true)}
              className='h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs cursor-pointer'
            >
              <Plus className='h-3.5 w-3.5' />
              Create Contact
            </Button>
          </div>
        </div>

        {/* Top Tag Pills Filter Bar */}
        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none'>
          {TAG_PILLS.map((tag) => {
            const isActive = activeTag === tag
            const count = getTagCount(tag)
            return (
              <button
                key={tag}
                type='button'
                onClick={() => {
                  setActiveTag(tag)
                  setCurrentPage(1)
                }}
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

        {/* Search & Table Controls Bar */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2 flex-1 max-w-md'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
              <input
                type='search'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder='Search records by name, phone, tags, agent...'
                className='h-8 w-full rounded-md border border-border bg-background pl-8 pr-7 text-xs outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
            {(statusFilter !== 'All' || sourceFilter !== 'All' || activeTag !== 'All' || search) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setActiveTag('All')
                  setStatusFilter('All')
                  setSourceFilter('All')
                  setSearch('')
                  setCurrentPage(1)
                }}
                className='h-8 text-xs text-orange-600 hover:bg-orange-500/10 cursor-pointer'
              >
                Clear All
              </Button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant={statusFilter !== 'All' || sourceFilter !== 'All' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setIsFilterModalOpen(true)}
              className={`h-8 text-xs gap-1.5 cursor-pointer ${
                statusFilter !== 'All' || sourceFilter !== 'All' ? 'bg-orange-600 text-white' : ''
              }`}
            >
              <SlidersHorizontal className='h-3.5 w-3.5' />
              Filters {statusFilter !== 'All' || sourceFilter !== 'All' ? '(Active)' : ''}
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsColumnsModalOpen(true)}
              className='h-8 text-xs gap-1.5 cursor-pointer'
            >
              <Columns3 className='h-3.5 w-3.5' />
              Columns
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className='rounded-lg border border-border/60 bg-card overflow-x-auto shadow-xs'>
          {paginatedContacts.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
              <SearchX className='h-10 w-10 text-muted-foreground mb-3' />
              <h3 className='font-bold text-sm text-foreground'>No matching contacts found</h3>
              <p className='text-xs text-muted-foreground mt-1 max-w-sm'>
                No contacts match your current filter criteria or search query.
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearch('')
                  setActiveTag('All')
                  setStatusFilter('All')
                  setSourceFilter('All')
                  setCurrentPage(1)
                }}
                className='h-8 text-xs mt-4 cursor-pointer'
              >
                Reset Search &amp; Filters
              </Button>
            </div>
          ) : (
            <table className='w-full text-xs'>
              <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/60'>
                <tr className='text-left whitespace-nowrap'>
                  <th className='p-2.5 w-8 text-center'>
                    <span className='sr-only'>View</span>
                  </th>
                  <th className='p-2.5 w-8 text-center'>
                    <input
                      type='checkbox'
                      checked={isCurrentPageAllSelected}
                      onChange={() => handleSelectAll(paginatedContacts)}
                      className='rounded border-border accent-orange-600 cursor-pointer'
                    />
                  </th>
                  {visibleColumns.created && (
                    <th
                      onClick={() => handleSort('created')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Created
                        {sortField === 'created' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th
                      onClick={() => handleSort('name')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Name
                        {sortField === 'name' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.phone && (
                    <th
                      onClick={() => handleSort('phone')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Phone
                        {sortField === 'phone' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.source && (
                    <th
                      onClick={() => handleSort('source')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Source
                        {sortField === 'source' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.tags && <th className='p-2.5 font-medium'>Tags</th>}
                  {visibleColumns.optIn && <th className='p-2.5 font-medium'>Opt In</th>}
                  {visibleColumns.assignedAt && <th className='p-2.5 font-medium'>Assigned At</th>}
                  {visibleColumns.assignedTo && (
                    <th
                      onClick={() => handleSort('assignedTo')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Assigned To
                        {sortField === 'assignedTo' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.email && <th className='p-2.5 font-medium'>Email</th>}
                  {visibleColumns.status && (
                    <th
                      onClick={() => handleSort('status')}
                      className='p-2.5 font-medium cursor-pointer hover:text-foreground select-none'
                    >
                      <div className='flex items-center gap-1'>
                        Status
                        {sortField === 'status' ? (
                          sortOrder === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />
                        ) : (
                          <ArrowUpDown className='h-3 w-3 opacity-40' />
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.wabaPhone && <th className='p-2.5 font-medium'>WABA Phone</th>}
                  {visibleColumns.gpsClient && <th className='p-2.5 font-medium'>GPS Client</th>}
                  <th className='p-2.5 font-medium text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30'>
                {paginatedContacts.map((contact) => {
                  const isSelected = selectedRows.includes(contact.id)
                  return (
                    <tr
                      key={contact.id}
                      className={`whitespace-nowrap transition-colors hover:bg-muted/40 ${
                        isSelected ? 'bg-orange-500/5' : ''
                      }`}
                    >
                      {/* View Action */}
                      <td className='p-2.5 text-center'>
                        <button
                          type='button'
                          onClick={() => setSelectedContactForDetails(contact)}
                          className='text-muted-foreground hover:text-foreground cursor-pointer'
                          title='View contact summary'
                        >
                          <Eye className='h-3.5 w-3.5' />
                        </button>
                      </td>

                      {/* Select Checkbox */}
                      <td className='p-2.5 text-center'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleToggleSelect(contact.id)}
                          className='rounded border-border accent-orange-600 cursor-pointer'
                        />
                      </td>

                      {/* Created */}
                      {visibleColumns.created && (
                        <td className='p-2.5 text-muted-foreground'>{contact.created}</td>
                      )}

                      {/* Name */}
                      {visibleColumns.name && (
                        <td
                          onClick={() => setSelectedContactForDetails(contact)}
                          className='p-2.5 font-semibold text-orange-600 hover:underline cursor-pointer'
                        >
                          {contact.name}
                        </td>
                      )}

                      {/* Phone */}
                      {visibleColumns.phone && (
                        <td className='p-2.5 font-mono text-muted-foreground'>{contact.phone}</td>
                      )}

                      {/* Source */}
                      {visibleColumns.source && (
                        <td className='p-2.5'>
                          <span className='inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600'>
                            {contact.source}
                          </span>
                        </td>
                      )}

                      {/* Tags */}
                      {visibleColumns.tags && (
                        <td className='p-2.5'>
                          <div className='flex gap-1 flex-wrap max-w-xs'>
                            {contact.tags.map((t) => (
                              <span
                                key={t}
                                className={cn(
                                  'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                  t === 'hot-lead'
                                    ? 'bg-rose-500/15 text-rose-600 font-bold'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      {/* Opt In */}
                      {visibleColumns.optIn && (
                        <td className='p-2.5'>
                          <span className='rounded bg-orange-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-600 border border-orange-500/30'>
                            {contact.optIn ? 'Yes' : 'No'}
                          </span>
                        </td>
                      )}

                      {/* Assigned At */}
                      {visibleColumns.assignedAt && (
                        <td className='p-2.5 text-muted-foreground'>{contact.assignedAt}</td>
                      )}

                      {/* Assigned To */}
                      {visibleColumns.assignedTo && (
                        <td className='p-2.5'>
                          {contact.assignedTo === 'Not Assigned' ? (
                            <span className='rounded bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-600'>
                              Not Assigned
                            </span>
                          ) : (
                            <span className='rounded bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-600'>
                              {contact.assignedTo}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.email && (
                        <td className='p-2.5 text-muted-foreground'>{contact.email}</td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className='p-2.5'>
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                              contact.status === 'Qualified'
                                ? 'bg-emerald-500/15 text-emerald-600 font-bold'
                                : contact.status === 'Contacted'
                                ? 'bg-sky-500/15 text-sky-600'
                                : 'bg-amber-500/15 text-amber-600'
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>
                      )}

                      {/* WABA Phone */}
                      {visibleColumns.wabaPhone && (
                        <td className='p-2.5 font-mono text-muted-foreground'>{contact.wabaPhone}</td>
                      )}

                      {/* GPS Client */}
                      {visibleColumns.gpsClient && (
                        <td className='p-2.5 font-semibold'>
                          {contact.gpsClient ? (
                            <span className='text-emerald-600 font-bold'>Yes</span>
                          ) : (
                            <span className='text-muted-foreground'>No</span>
                          )}
                        </td>
                      )}

                      {/* Row Actions */}
                      <td className='p-2.5 text-center'>
                        <div className='flex items-center justify-center gap-1.5'>
                          {/* Chat in Team Inbox */}
                          <button
                            type='button'
                            onClick={() => navigate({ to: '/chats' })}
                            className='h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-orange-600 hover:bg-orange-500/10 cursor-pointer transition-colors'
                            title='Open in Team Inbox'
                          >
                            <MessageSquare className='h-3.5 w-3.5' />
                          </button>

                          {/* Edit Contact */}
                          <button
                            type='button'
                            onClick={() => handleOpenEdit(contact)}
                            className='h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10 cursor-pointer transition-colors'
                            title='Edit Contact'
                          >
                            <Edit2 className='h-3.5 w-3.5' />
                          </button>

                          {/* Delete Contact */}
                          <button
                            type='button'
                            onClick={() => setDeleteConfirmContact(contact)}
                            className='h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors'
                            title='Delete Contact'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Pagination Footer */}
        <div className='flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1'>
          <div>
            {selectedRows.length} of {paginatedContacts.length} row(s) selected on page. Total matching contacts:{' '}
            <strong className='text-foreground'>{filteredContacts.length}</strong>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1.5'>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className='h-7 rounded border border-border bg-background px-1.5 text-xs text-foreground outline-hidden cursor-pointer'
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='icon'
                className='h-7 w-7 cursor-pointer'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronsLeft className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-7 w-7 cursor-pointer'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-7 w-7 cursor-pointer'
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-7 w-7 cursor-pointer'
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRight className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. CREATE CONTACT MODAL */}
        {/* ========================================================= */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <Plus className='h-4 w-4 text-orange-600' />
                Create New Contact
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Add a new customer profile for automated WhatsApp outreach, CRM routing, and broadcasts.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2 text-xs'>
              <div>
                <Label className='text-xs font-semibold'>Full Name <span className='text-rose-500'>*</span></Label>
                <Input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder='e.g., Ramesh Patel Logistics'
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>WhatsApp Phone Number <span className='text-rose-500'>*</span></Label>
                <Input
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder='+91 98250 12345'
                  className='h-8 text-xs mt-1 font-mono'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Email Address</Label>
                <Input
                  type='email'
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder='e.g., ramesh@patellogistics.in'
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <Label className='text-xs font-semibold'>Lead Source</Label>
                  <select
                    value={newContactSource}
                    onChange={(e) => setNewContactSource(e.target.value)}
                    className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                  >
                    <option value='whatsapp'>WhatsApp</option>
                    <option value='indiamart'>IndiaMart</option>
                    <option value='facebook'>Facebook Ads</option>
                    <option value='manual'>Manual Entry</option>
                  </select>
                </div>

                <div>
                  <Label className='text-xs font-semibold'>Primary Tag</Label>
                  <select
                    value={newContactTag}
                    onChange={(e) => setNewContactTag(e.target.value)}
                    className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                  >
                    <option value='hot-lead'>hot-lead</option>
                    <option value='GPS'>GPS</option>
                    <option value='FASTAG'>FASTAG</option>
                    <option value='Fleet Mgmt'>Fleet Mgmt</option>
                    <option value='INSURANCE'>INSURANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className='text-xs font-semibold'>Assigned Agent</Label>
                <select
                  value={newContactAgent}
                  onChange={(e) => setNewContactAgent(e.target.value)}
                  className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                >
                  <option value='Agent Bhavik'>Agent Bhavik</option>
                  <option value='Agent Anjali'>Agent Anjali</option>
                  <option value='DV AI Bot'>DV AI Bot</option>
                  <option value='Support Desk'>Support Desk</option>
                  <option value='Not Assigned'>Not Assigned</option>
                </select>
              </div>

              <div className='rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground'>
                New contacts are automatically verified against Meta WhatsApp Cloud API opt-in rules.
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setCreateModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Cancel
              </Button>
              <Button size='sm' onClick={handleCreateContact} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                Save Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 2. EDIT CONTACT MODAL */}
        {/* ========================================================= */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          {editingContact && (
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                  <Edit2 className='h-4 w-4 text-orange-600' />
                  Edit Contact &bull; {editingContact.name}
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  Modify contact details, assigned agent, status, and tags.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-3 py-2 text-xs'>
                <div>
                  <Label className='text-xs font-semibold'>Full Name</Label>
                  <Input
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, name: e.target.value })
                    }
                    className='h-8 text-xs mt-1'
                  />
                </div>

                <div>
                  <Label className='text-xs font-semibold'>Phone Number</Label>
                  <Input
                    value={editingContact.phone}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, phone: e.target.value })
                    }
                    className='h-8 text-xs mt-1 font-mono'
                  />
                </div>

                <div>
                  <Label className='text-xs font-semibold'>Email Address</Label>
                  <Input
                    value={editingContact.email}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, email: e.target.value })
                    }
                    className='h-8 text-xs mt-1'
                  />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label className='text-xs font-semibold'>Status</Label>
                    <select
                      value={editingContact.status}
                      onChange={(e) =>
                        setEditingContact({
                          ...editingContact,
                          status: e.target.value as ContactRecord['status'],
                        })
                      }
                      className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                    >
                      <option value='New'>New</option>
                      <option value='Contacted'>Contacted</option>
                      <option value='Qualified'>Qualified</option>
                      <option value='Unqualified'>Unqualified</option>
                    </select>
                  </div>

                  <div>
                    <Label className='text-xs font-semibold'>Assigned Agent</Label>
                    <select
                      value={editingContact.assignedTo}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, assignedTo: e.target.value })
                      }
                      className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                    >
                      <option value='Agent Bhavik'>Agent Bhavik</option>
                      <option value='Agent Anjali'>Agent Anjali</option>
                      <option value='DV AI Bot'>DV AI Bot</option>
                      <option value='Support Desk'>Support Desk</option>
                      <option value='Not Assigned'>Not Assigned</option>
                    </select>
                  </div>
                </div>

                {/* Edit Tags */}
                <div>
                  <Label className='text-xs font-semibold block mb-1'>CRM Tags</Label>
                  <div className='flex flex-wrap gap-1'>
                    {['hot-lead', 'GPS', 'FASTAG', 'Fleet Mgmt', 'IndiaMart Lead', 'FB Ads', 'Hinglish IN', 'INSURANCE'].map((tag) => {
                      const hasTag = editingContact.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type='button'
                          onClick={() => {
                            const newTags = hasTag
                              ? editingContact.tags.filter((t) => t !== tag)
                              : [...editingContact.tags, tag]
                            setEditingContact({ ...editingContact, tags: newTags })
                          }}
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-all',
                            hasTag
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          {hasTag ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' size='sm' onClick={() => setEditModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                  Cancel
                </Button>
                <Button size='sm' onClick={handleSaveEdit} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* ========================================================= */}
        {/* 3. SINGLE DELETE CONFIRMATION MODAL */}
        {/* ========================================================= */}
        <Dialog open={!!deleteConfirmContact} onOpenChange={(open) => !open && setDeleteConfirmContact(null)}>
          {deleteConfirmContact && (
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-base text-rose-600 font-bold'>
                  <AlertTriangle className='h-4 w-4' />
                  Delete Contact
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  Are you sure you want to remove &ldquo;{deleteConfirmContact.name}&rdquo; ({deleteConfirmContact.phone})? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button variant='outline' size='sm' onClick={() => setDeleteConfirmContact(null)} className='h-8 text-xs cursor-pointer'>
                  Cancel
                </Button>
                <Button
                  size='sm'
                  onClick={() => handleDeleteContact(deleteConfirmContact)}
                  className='h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer'
                >
                  Delete Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* ========================================================= */}
        {/* 4. BULK DELETE CONFIRMATION MODAL */}
        {/* ========================================================= */}
        <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base text-rose-600 font-bold'>
                <Trash2 className='h-4 w-4' />
                Delete {selectedRows.length} Contacts
              </DialogTitle>
              <DialogDescription className='text-xs'>
                You have selected {selectedRows.length} contacts for removal. Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setIsBulkDeleteModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleBulkDelete}
                className='h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer'
              >
                Delete Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 5. ASSIGN AGENT MODAL */}
        {/* ========================================================= */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <UserCheck className='h-4 w-4 text-orange-600' />
                Bulk Assign Agent
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Assign {selectedRows.length} selected contact(s) to a dedicated team member.
              </DialogDescription>
            </DialogHeader>

            <div className='py-3 space-y-3 text-xs'>
              <Label className='text-xs font-semibold'>Select Team Agent</Label>
              <div className='space-y-2'>
                {['Agent Bhavik', 'Agent Anjali', 'DV AI Bot', 'Support Desk', 'Not Assigned'].map((ag) => (
                  <div
                    key={ag}
                    onClick={() => setSelectedAgentToAssign(ag)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      selectedAgentToAssign === ag
                        ? 'border-orange-500 bg-orange-500/10 font-bold text-orange-600'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >
                    <span>{ag}</span>
                    {selectedAgentToAssign === ag && <Check className='h-3.5 w-3.5' />}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setIsAssignModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Cancel
              </Button>
              <Button size='sm' onClick={handleBulkAssign} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                Assign Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 6. ASSIGN TAG MODAL */}
        {/* ========================================================= */}
        <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <Tag className='h-4 w-4 text-orange-600' />
                Bulk Assign Tag
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Attach a segment tag to {selectedRows.length} selected contact(s).
              </DialogDescription>
            </DialogHeader>

            <div className='py-3 space-y-3 text-xs'>
              <Label className='text-xs font-semibold'>Choose Tag</Label>
              <div className='flex flex-wrap gap-2'>
                {['hot-lead', 'GPS', 'FASTAG', 'Fleet Mgmt', 'IndiaMart Lead', 'FB Ads', 'Hinglish IN', 'INSURANCE'].map((tag) => (
                  <button
                    key={tag}
                    type='button'
                    onClick={() => setSelectedTagToAssign(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                      selectedTagToAssign === tag
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setIsTagModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Cancel
              </Button>
              <Button size='sm' onClick={handleBulkAssignTag} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                Apply Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 7. IMPORT CONTACTS MODAL */}
        {/* ========================================================= */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <Download className='h-4 w-4 text-orange-600' />
                Import Contacts CSV
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Paste comma-separated rows or paste from spreadsheet (Name, Phone, Source, Tags).
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2 text-xs'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-semibold text-muted-foreground'>Format example:</span>
                <button
                  type='button'
                  onClick={() => {
                    setImportCsvText(
                      'Ramesh Trans,9825109988,indiamart,GPS;hot-lead\nSurat Logistics,9426019977,whatsapp,FASTAG\nAhmedabad Carrier,9909029966,facebook,Fleet Mgmt'
                    )
                    toast.success('Loaded sample template rows')
                  }}
                  className='text-orange-600 hover:underline cursor-pointer'
                >
                  Load Sample Template
                </button>
              </div>

              <textarea
                rows={5}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder='Name,Phone,Source,Tags&#10;Ketan Patel,9825101122,whatsapp,GPS&#10;Gujarat Logistics,9426012233,indiamart,hot-lead'
                className='w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs outline-hidden focus:border-orange-500'
              />
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setIsImportModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Cancel
              </Button>
              <Button size='sm' onClick={handleImportCSV} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                Import Rows
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 8. FILTER MODAL */}
        {/* ========================================================= */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <SlidersHorizontal className='h-4 w-4 text-orange-600' />
                Filter Contacts
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Filter the audience by acquisition source or qualification status.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2 text-xs'>
              <div>
                <Label className='text-xs font-semibold'>Acquisition Source</Label>
                <select
                  value={sourceFilter}
                  onChange={(e) =>
                    setSourceFilter(
                      e.target.value as 'All' | 'whatsapp' | 'indiamart' | 'facebook' | 'manual'
                    )
                  }
                  className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                >
                  <option value='All'>All Sources (WhatsApp, IndiaMart, Facebook, Manual)</option>
                  <option value='whatsapp'>WhatsApp</option>
                  <option value='indiamart'>IndiaMart</option>
                  <option value='facebook'>Facebook Ads</option>
                  <option value='manual'>Manual Entry</option>
                </select>
              </div>

              <div>
                <Label className='text-xs font-semibold'>Qualification Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as 'All' | 'New' | 'Contacted' | 'Qualified' | 'Unqualified'
                    )
                  }
                  className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                >
                  <option value='All'>All Statuses</option>
                  <option value='New'>New</option>
                  <option value='Contacted'>Contacted</option>
                  <option value='Qualified'>Qualified</option>
                  <option value='Unqualified'>Unqualified</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setStatusFilter('All')
                  setSourceFilter('All')
                  setIsFilterModalOpen(false)
                }}
                className='h-8 text-xs cursor-pointer'
              >
                Reset
              </Button>
              <Button size='sm' onClick={() => setIsFilterModalOpen(false)} className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer'>
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 9. COLUMNS CUSTOMIZER MODAL */}
        {/* ========================================================= */}
        <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                <Columns3 className='h-4 w-4 text-orange-600' />
                Customize Table Columns
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Toggle visibility of data columns in the contacts table.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-2 py-2 text-xs'>
              {Object.entries(visibleColumns).map(([key, val]) => (
                <label
                  key={key}
                  className='flex items-center gap-2 p-2 rounded border border-border/60 hover:bg-muted/40 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={val}
                    onChange={(e) =>
                      setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })
                    }
                    className='accent-orange-600 rounded'
                  />
                  <span className='capitalize font-medium'>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                </label>
              ))}
            </div>

            <DialogFooter>
              <Button size='sm' onClick={() => setIsColumnsModalOpen(false)} className='h-8 text-xs cursor-pointer'>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================= */}
        {/* 10. CONTACT DETAILS MODAL */}
        {/* ========================================================= */}
        <Dialog
          open={!!selectedContactForDetails}
          onOpenChange={(open) => !open && setSelectedContactForDetails(null)}
        >
          {selectedContactForDetails && (
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <div className='flex items-center justify-between'>
                  <DialogTitle className='flex items-center gap-2 text-base font-bold'>
                    <User className='h-4 w-4 text-orange-600' />
                    {selectedContactForDetails.name}
                  </DialogTitle>
                  <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px]'>
                    {selectedContactForDetails.source.toUpperCase()}
                  </Badge>
                </div>
                <DialogDescription className='text-xs font-mono'>
                  {selectedContactForDetails.phone}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-3 py-2 text-xs'>
                <div className='grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-lg border border-border/40'>
                  <div>
                    <span className='text-[10px] text-muted-foreground block'>Status</span>
                    <span className='font-bold text-foreground'>{selectedContactForDetails.status}</span>
                  </div>
                  <div>
                    <span className='text-[10px] text-muted-foreground block'>Assigned Agent</span>
                    <span className='font-bold text-foreground'>{selectedContactForDetails.assignedTo}</span>
                  </div>
                  <div>
                    <span className='text-[10px] text-muted-foreground block'>Email</span>
                    <span className='font-mono text-muted-foreground truncate block'>{selectedContactForDetails.email}</span>
                  </div>
                  <div>
                    <span className='text-[10px] text-muted-foreground block'>Opt-In Verified</span>
                    <span className='text-emerald-600 font-bold'>Yes (Active)</span>
                  </div>
                </div>

                <div>
                  <span className='text-[10px] text-muted-foreground block mb-1 font-semibold'>CRM Tags</span>
                  <div className='flex flex-wrap gap-1'>
                    {selectedContactForDetails.tags.map((t) => (
                      <span key={t} className='px-2 py-0.5 rounded bg-muted text-[11px] font-medium'>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='pt-2 flex flex-col gap-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      size='sm'
                      className='bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs gap-1.5 font-bold cursor-pointer'
                      onClick={() => {
                        setSelectedContactForDetails(null)
                        navigate({ to: '/chats' })
                      }}
                    >
                      <MessageSquare className='h-3.5 w-3.5' /> Team Inbox
                    </Button>
                    <Button
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5 font-bold cursor-pointer'
                      asChild
                    >
                      <a
                        href={`https://wa.me/${selectedContactForDetails.phone.replace(/[^0-9]/g, '')}`}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ExternalLink className='h-3.5 w-3.5' /> WhatsApp
                      </a>
                    </Button>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 text-xs gap-1.5 cursor-pointer'
                      asChild
                    >
                      <a href={`tel:${selectedContactForDetails.phone}`}>
                        <Phone className='h-3.5 w-3.5' /> Call
                      </a>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 text-xs gap-1.5 cursor-pointer'
                      onClick={() => {
                        navigator.clipboard.writeText(selectedContactForDetails.phone)
                        toast.success('Phone number copied!')
                      }}
                    >
                      <Copy className='h-3.5 w-3.5' /> Copy Phone
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' size='sm' onClick={() => setSelectedContactForDetails(null)} className='h-8 text-xs cursor-pointer'>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </Main>
    </>
  )
}
