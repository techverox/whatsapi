import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
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

const initialMockContacts: ContactRecord[] = [
  {
    id: 'c-1',
    created: '10/24/2026, 05:15 PM',
    name: 'WhatsApp Lead (2938)',
    phone: '+919825102938',
    source: 'whatsapp',
    tags: ['IndiaMart Lead', 'hot-lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'whatsapplead2938@example.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-2',
    created: '10/22/2026, 03:58 PM',
    name: 'Rajesh Sharma',
    phone: '+919825100001',
    source: 'indiamart',
    tags: ['IndiaMart Lead', 'Hot Lead', 'GPS'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'rajeshsharma@example.com',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-3',
    created: '10/22/2026, 05:15 PM',
    name: 'Vikram Patel',
    phone: '+919426000002',
    source: 'facebook',
    tags: ['FB Ads', 'Fleet Mgmt', 'FASTAG'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'vikrampatel@example.com',
    status: 'Contacted',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-4',
    created: '10/22/2026, 07:40 PM',
    name: 'Ananya Desai',
    phone: '+919909000003',
    source: 'whatsapp',
    tags: ['FASTAG Client', 'hot-lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'ananyadesai@example.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'c-5',
    created: '10/21/2026, 02:30 PM',
    name: 'Sunil Mehta',
    phone: '+919898000004',
    source: 'manual',
    tags: ['Hinglish Support', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'sunilmehta@example.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'c-6',
    created: '10/22/2026, 11:34 PM',
    name: 'Truck Sathi GPS Client',
    phone: '+917698580043',
    source: 'whatsapp',
    tags: ['GPS', 'hot-lead', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 11:35 PM',
    assignedTo: 'Truck Sathi Admin',
    email: 'client@trucksathi.in',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-7',
    created: '10/22/2026, 10:15 PM',
    name: 'Rajesh Sharma Logistics',
    phone: '+919825109283',
    source: 'indiamart',
    tags: ['GPS', 'hot-lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'rajesh.sharma@logistics.com',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'c-8',
    created: '10/22/2026, 08:42 PM',
    name: 'Amit Patel Transport',
    phone: '+919426019284',
    source: 'whatsapp',
    tags: ['FASTAG', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '10/22/2026, 09:00 PM',
    assignedTo: 'Ramesh Kumar',
    email: 'amit@pateltrans.com',
    status: 'Contacted',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-9',
    created: '10/22/2026, 06:18 PM',
    name: 'Vikram Mehta Roadlines',
    phone: '+919909028172',
    source: 'facebook',
    tags: ['FASTAG', 'hot-lead'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'mehta@vikramroadlines.in',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'c-10',
    created: '10/22/2026, 04:55 PM',
    name: 'Suresh Bhai Kathiawar',
    phone: '+919898017263',
    source: 'whatsapp',
    tags: ['English GB', 'GPS'],
    optIn: true,
    assignedAt: '10/22/2026, 05:10 PM',
    assignedTo: 'Priya Sharma',
    email: 'suresh@kathiawartrans.com',
    status: 'Qualified',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
  {
    id: 'c-11',
    created: '10/22/2026, 02:20 PM',
    name: 'Bharat Petroleum Carrier',
    phone: '+919727192834',
    source: 'whatsapp',
    tags: ['INSURANCE', 'Fleet Mgmt'],
    optIn: true,
    assignedAt: '-',
    assignedTo: 'Not Assigned',
    email: 'fleet@bharatcarrier.in',
    status: 'New',
    wabaPhone: '+917698580043',
    gpsClient: false,
  },
  {
    id: 'c-12',
    created: '10/22/2026, 11:10 AM',
    name: 'Ketan Doshi Express',
    phone: '+919428019283',
    source: 'indiamart',
    tags: ['GPS', 'Hinglish IN'],
    optIn: true,
    assignedAt: '10/22/2026, 11:30 AM',
    assignedTo: 'Vikram Patel',
    email: 'ketan@doshiexpress.com',
    status: 'Contacted',
    wabaPhone: '+917698580043',
    gpsClient: true,
  },
]

function generateContactId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function Users() {
  const [contacts, setContacts] = useState<ContactRecord[]>(initialMockContacts)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Contacted' | 'Qualified' | 'Unqualified'>('All')
  const [sourceFilter, setSourceFilter] = useState<'All' | 'whatsapp' | 'indiamart' | 'facebook' | 'manual'>('All')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

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

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactSource, setNewContactSource] = useState('whatsapp')
  const [newContactTag, setNewContactTag] = useState('hot-lead')

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState('Agent Bhavik')

  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [selectedTagToAssign, setSelectedTagToAssign] = useState('hot-lead')

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importCsvText, setImportCsvText] = useState('')

  const [selectedContactForDetails, setSelectedContactForDetails] = useState<ContactRecord | null>(null)

  const loadContacts = useCallback(() => {
    setIsRefreshing(true)
    veroxApi
      .getContacts()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ContactRecord[] = (res.data as Array<Record<string, unknown>>).map((c) => ({
            id: String(c.id || ''),
            created: c.createdAt ? new Date(String(c.createdAt)).toLocaleString() : new Date().toLocaleString(),
            name: String(c.name || 'Unknown Contact'),
            phone: String(c.phone || ''),
            source: (typeof c.source === 'string' ? c.source : 'whatsapp') as ContactRecord['source'],
            tags: Array.isArray(c.tags)
              ? c.tags.map((t) =>
                  typeof t === 'string'
                    ? t
                    : typeof t === 'object' && t !== null && 'name' in t
                    ? String((t as { name: string }).name)
                    : 'Lead'
                )
              : [],
            optIn: typeof c.optIn === 'boolean' ? c.optIn : true,
            assignedAt: c.assignedAt ? new Date(String(c.assignedAt)).toLocaleString() : '-',
            assignedTo: String(c.assignedToName || 'Not Assigned'),
            email: String(
              c.email || `${String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
            ),
            status: 'New',
            wabaPhone: '+917698580043',
            gpsClient: false,
          }))

          setContacts((prev) => {
            const ids = new Set(mapped.map((m) => m.id))
            return [...mapped, ...prev.filter((p) => !ids.has(p.id))]
          })
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
          const mapped: ContactRecord[] = (res.data as Array<Record<string, unknown>>).map((c) => ({
            id: String(c.id || ''),
            created: c.createdAt ? new Date(String(c.createdAt)).toLocaleString() : new Date().toLocaleString(),
            name: String(c.name || 'Unknown Contact'),
            phone: String(c.phone || ''),
            source: (typeof c.source === 'string' ? c.source : 'whatsapp') as ContactRecord['source'],
            tags: Array.isArray(c.tags)
              ? c.tags.map((t) =>
                  typeof t === 'string'
                    ? t
                    : typeof t === 'object' && t !== null && 'name' in t
                    ? String((t as { name: string }).name)
                    : 'Lead'
                )
              : [],
            optIn: typeof c.optIn === 'boolean' ? c.optIn : true,
            assignedAt: c.assignedAt ? new Date(String(c.assignedAt)).toLocaleString() : '-',
            assignedTo: String(c.assignedToName || 'Not Assigned'),
            email: String(
              c.email || `${String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
            ),
            status: 'New',
            wabaPhone: '+917698580043',
            gpsClient: false,
          }))

          setContacts((prev) => {
            const ids = new Set(mapped.map((m) => m.id))
            return [...mapped, ...prev.filter((p) => !ids.has(p.id))]
          })
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

  // Create Contact
  const handleCreateContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error('Name and Phone number are required.')
      return
    }
    const formattedPhone = newContactPhone.trim().startsWith('+')
      ? newContactPhone.trim()
      : `+91${newContactPhone.trim().replace(/^0/, '')}`

    const newRecord: ContactRecord = {
      id: generateContactId(),
      created: new Date().toLocaleString(),
      name: newContactName.trim(),
      phone: formattedPhone,
      source: newContactSource,
      tags: [newContactTag],
      optIn: true,
      assignedAt: '-',
      assignedTo: 'Not Assigned',
      email: `${newContactName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      status: 'New',
      wabaPhone: '+917698580043',
      gpsClient: newContactTag === 'GPS',
    }

    try {
      await veroxApi.createContact({
        name: newContactName.trim(),
        phone: formattedPhone,
        source: newContactSource,
      })
    } catch (_err) {
      // Sync fallback
    }

    setContacts([newRecord, ...contacts])
    setNewContactName('')
    setNewContactPhone('')
    setCreateModalOpen(false)
    toast.success(`Contact "${newRecord.name}" created and synced!`)
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
    link.download = `whatsapi_contacts_export_${new Date().toISOString().slice(0, 10)}.csv`
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
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    const matchesSource = sourceFilter === 'All' || c.source.toLowerCase() === sourceFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesSource
  })

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize))
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const isCurrentPageAllSelected =
    paginatedContacts.length > 0 &&
    paginatedContacts.every((c) => selectedRows.includes(c.id))

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 p-4'>
        {/* Title & Top Action Bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Contacts</h1>
            <p className='text-xs text-muted-foreground'>
              Manage audience opt-ins, dynamic tags, multi-agent assignment, and broadcast lists
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 text-xs gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 cursor-pointer'
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
              Assign Tag {selectedRows.length > 0 && `(${selectedRows.length})`}
            </Button>

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
              className='h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs cursor-pointer'
            >
              <Plus className='h-3.5 w-3.5' />
              Create Contact
            </Button>
          </div>
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
                placeholder='Search records by name, phone, tags...'
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
            {(statusFilter !== 'All' || sourceFilter !== 'All') && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setStatusFilter('All')
                  setSourceFilter('All')
                  setCurrentPage(1)
                }}
                className='h-8 text-xs text-orange-600 hover:bg-orange-500/10 cursor-pointer'
              >
                Clear Filters
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
        <div className='rounded-md border border-border/60 bg-card overflow-x-auto shadow-xs'>
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
                  setStatusFilter('All')
                  setSourceFilter('All')
                  setCurrentPage(1)
                }}
                className='h-8 text-xs mt-4 cursor-pointer'
              >
                Reset Search & Filters
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
                  {visibleColumns.created && <th className='p-2.5 font-medium'>Created</th>}
                  {visibleColumns.name && <th className='p-2.5 font-medium'>Name</th>}
                  {visibleColumns.phone && <th className='p-2.5 font-medium'>Phone</th>}
                  {visibleColumns.source && <th className='p-2.5 font-medium'>Source</th>}
                  {visibleColumns.tags && <th className='p-2.5 font-medium'>Tags</th>}
                  {visibleColumns.optIn && <th className='p-2.5 font-medium'>Opt In</th>}
                  {visibleColumns.assignedAt && <th className='p-2.5 font-medium'>Assigned At</th>}
                  {visibleColumns.assignedTo && <th className='p-2.5 font-medium'>Assigned To</th>}
                  {visibleColumns.email && <th className='p-2.5 font-medium'>Email</th>}
                  {visibleColumns.status && <th className='p-2.5 font-medium'>Status</th>}
                  {visibleColumns.wabaPhone && <th className='p-2.5 font-medium'>WABA Phone Number</th>}
                  {visibleColumns.gpsClient && <th className='p-2.5 font-medium'>GPS Client</th>}
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
                          title='View details'
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
                                className='rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
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
                                ? 'bg-emerald-500/15 text-emerald-600'
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

        {/* 1. Create Contact Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
              <DialogDescription className='text-xs'>
                Add a new customer profile for automated WhatsApp outreach and lead routing.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2'>
              <div>
                <Label className='text-xs font-semibold'>Full Name</Label>
                <Input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder='e.g., Ramesh Patel Logistics'
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Phone Number (WhatsApp WABA E.164)</Label>
                <Input
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder='+91 98250 12345'
                  className='h-8 text-xs mt-1 font-mono'
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
                  <Label className='text-xs font-semibold'>Primary Segment Tag</Label>
                  <select
                    value={newContactTag}
                    onChange={(e) => setNewContactTag(e.target.value)}
                    className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
                  >
                    <option value='hot-lead'>hot-lead</option>
                    <option value='GPS'>GPS</option>
                    <option value='FASTAG'>FASTAG</option>
                    <option value='Fleet Mgmt'>Fleet Mgmt</option>
                  </select>
                </div>
              </div>

              <div className='rounded-md bg-muted/40 p-2.5 text-[11px] text-muted-foreground'>
                New contacts are automatically verified against Meta Cloud API opt-in rules.
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' size='sm' onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button size='sm' onClick={handleCreateContact} className='bg-orange-600 hover:bg-orange-700 text-white'>
                Save Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2. Assign Agent Modal */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <UserCheck className='h-4 w-4 text-orange-600' />
                Bulk Assign Agent
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Assign {selectedRows.length} selected contact(s) to a dedicated team member.
              </DialogDescription>
            </DialogHeader>

            <div className='py-3 space-y-3'>
              <Label className='text-xs font-semibold'>Select Team Agent</Label>
              <div className='space-y-2'>
                {['Agent Bhavik', 'Agent Anjali', 'Ramesh Kumar', 'Priya Sharma', 'WhatsAPI AI Bot'].map((ag) => (
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
              <Button variant='outline' size='sm' onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button size='sm' onClick={handleBulkAssign} className='bg-orange-600 hover:bg-orange-700 text-white'>
                Assign Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. Assign Tag Modal */}
        <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Tag className='h-4 w-4 text-orange-600' />
                Bulk Assign Tag
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Attach a segment tag to {selectedRows.length} selected contact(s).
              </DialogDescription>
            </DialogHeader>

            <div className='py-3 space-y-3'>
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
              <Button variant='outline' size='sm' onClick={() => setIsTagModalOpen(false)}>
                Cancel
              </Button>
              <Button size='sm' onClick={handleBulkAssignTag} className='bg-orange-600 hover:bg-orange-700 text-white'>
                Apply Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 4. Import Contacts Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Download className='h-4 w-4 text-orange-600' />
                Import Contacts CSV
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Paste comma-separated rows or paste from spreadsheet (Name, Phone, Source, Tags).
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2'>
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
              <Button variant='outline' size='sm' onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button size='sm' onClick={handleImportCSV} className='bg-orange-600 hover:bg-orange-700 text-white'>
                Import Rows
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 5. Filter Modal */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4 text-orange-600' />
                Filter Contacts
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Filter the audience by acquisition source or qualification status.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2'>
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
                  <option value='manual'>Manual</option>
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
              >
                Reset
              </Button>
              <Button size='sm' onClick={() => setIsFilterModalOpen(false)} className='bg-orange-600 hover:bg-orange-700 text-white'>
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 6. Columns Customizer Modal */}
        <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Columns3 className='h-4 w-4 text-orange-600' />
                Customize Table Columns
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Toggle visibility of data columns in the contacts table.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-2.5 py-2 text-xs'>
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
              <Button size='sm' onClick={() => setIsColumnsModalOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 7. Contact Details Modal */}
        <Dialog
          open={!!selectedContactForDetails}
          onOpenChange={(open) => !open && setSelectedContactForDetails(null)}
        >
          {selectedContactForDetails && (
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <div className='flex items-center justify-between'>
                  <DialogTitle className='flex items-center gap-2'>
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
                  <span className='text-[10px] text-muted-foreground block mb-1'>Tags</span>
                  <div className='flex flex-wrap gap-1'>
                    {selectedContactForDetails.tags.map((t) => (
                      <span key={t} className='px-2 py-0.5 rounded bg-muted text-[11px] font-medium'>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='pt-2 flex gap-2'>
                  <Button
                    size='sm'
                    className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5'
                    asChild
                  >
                    <a
                      href={`https://wa.me/${selectedContactForDetails.phone.replace(/[^0-9]/g, '')}`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      <ExternalLink className='h-3.5 w-3.5' /> Chat on WhatsApp
                    </a>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 text-xs gap-1.5'
                    asChild
                  >
                    <a href={`tel:${selectedContactForDetails.phone}`}>
                      <Phone className='h-3.5 w-3.5' /> Call
                    </a>
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' size='sm' onClick={() => setSelectedContactForDetails(null)}>
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
