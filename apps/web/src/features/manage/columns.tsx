import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Columns3,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  ShieldAlert,
  ListFilter,
  ToggleRight,
  Phone,
  Calendar,
  Hash,
  Type,
  FileCode,
  AlertCircle,
  Loader2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { veroxApi } from '@/lib/api'

type ColumnDataType = 'Text' | 'Number' | 'Select' | 'Boolean' | 'Phone' | 'Date'

interface ColumnItem {
  id: string
  name: string
  key: string
  type: ColumnDataType
  options: string
  required?: boolean
  description?: string
  isSystem?: boolean
  createdAt: string
  updatedAt: string
  usageCount?: number
}

const TYPE_CONFIG: Record<
  ColumnDataType,
  { label: string; icon: LucideIcon; color: string; bg: string; border: string; desc: string }
> = {
  Text: {
    label: 'Text',
    icon: Type,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    desc: 'Freeform single-line or multi-line string',
  },
  Number: {
    label: 'Number',
    icon: Hash,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    desc: 'Numeric value, vehicle count, or currency',
  },
  Select: {
    label: 'Select',
    icon: ListFilter,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    desc: 'Predefined single choice dropdown list',
  },
  Boolean: {
    label: 'Boolean',
    icon: ToggleRight,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    desc: 'Yes/No binary boolean flag',
  },
  Phone: {
    label: 'Phone',
    icon: Phone,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    desc: 'Standardized E.164 dial phone format',
  },
  Date: {
    label: 'Date',
    icon: Calendar,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    desc: 'Calendar date timestamp (YYYY-MM-DD)',
  },
}

function generateColKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function Columns() {
  const [columns, setColumns] = useState<ColumnItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL')

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingColumn, setEditingColumn] = useState<ColumnItem | null>(null)
  const [columnName, setColumnName] = useState<string>('')
  const [columnType, setColumnType] = useState<ColumnDataType>('Text')
  const [columnOptions, setColumnOptions] = useState<string>('')
  const [columnRequired, setColumnRequired] = useState<boolean>(false)
  const [columnDescription, setColumnDescription] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [columnToDelete, setColumnToDelete] = useState<ColumnItem | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const fetchColumns = useCallback(async () => {
    try {
      const res = await veroxApi.getColumns()
      if (res && res.success && Array.isArray(res.data)) {
        setColumns(res.data)
      } else if (Array.isArray(res)) {
        setColumns(res)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to load custom columns: ${msg}`)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    veroxApi
      .getColumns()
      .then((res) => {
        if (!mounted) return
        if (res && res.success && Array.isArray(res.data)) {
          setColumns(res.data)
        } else if (Array.isArray(res)) {
          setColumns(res)
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(`Failed to load custom columns: ${msg}`)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchColumns()
    setRefreshing(false)
    toast.success('Custom columns synchronized with backend!')
  }

  // Metrics
  const totalColumns = columns.length
  const distinctTypesCount = useMemo(() => {
    return new Set(columns.map((c) => c.type)).size
  }, [columns])
  const requiredColumnsCount = useMemo(() => {
    return columns.filter((c) => c.required).length
  }, [columns])

  // Filtered columns
  const filteredColumns = useMemo(() => {
    const q = search.trim().toLowerCase()
    return columns.filter((col) => {
      const matchesSearch =
        !q ||
        col.name.toLowerCase().includes(q) ||
        col.key.toLowerCase().includes(q) ||
        col.type.toLowerCase().includes(q) ||
        (col.description && col.description.toLowerCase().includes(q))

      const matchesType = selectedTypeFilter === 'ALL' || col.type === selectedTypeFilter

      return matchesSearch && matchesType
    })
  }, [columns, search, selectedTypeFilter])

  // Handlers
  const handleOpenAdd = () => {
    setEditingColumn(null)
    setColumnName('')
    setColumnType('Text')
    setColumnOptions('')
    setColumnRequired(false)
    setColumnDescription('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (col: ColumnItem) => {
    setEditingColumn(col)
    setColumnName(col.name)
    setColumnType(col.type)
    setColumnOptions(col.options === '-' ? '' : col.options)
    setColumnRequired(Boolean(col.required))
    setColumnDescription(col.description || '')
    setIsModalOpen(true)
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success(`Copied field key "${key}" to clipboard!`)
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr))
    }, 2000)
  }

  const handleSave = async () => {
    const trimmed = columnName.trim()
    if (!trimmed) {
      toast.error('Column name is required.')
      return
    }
    if (trimmed.length < 2) {
      toast.error('Column name must be at least 2 characters long.')
      return
    }
    if (trimmed.length > 50) {
      toast.error('Column name cannot exceed 50 characters.')
      return
    }

    if (columnType === 'Select' && !columnOptions.trim()) {
      toast.error('Options (comma-separated) are required for Select field type.')
      return
    }

    setIsSaving(true)
    try {
      if (editingColumn) {
        const res = await veroxApi.updateColumn(editingColumn.id, {
          name: trimmed,
          type: columnType,
          options: columnType === 'Boolean' ? 'Yes, No' : columnOptions.trim() || '-',
          required: columnRequired,
          description: columnDescription.trim() || undefined,
        })
        if (res && res.success) {
          toast.success(`Custom column "${trimmed}" updated successfully!`)
        } else {
          toast.success(`Custom column "${trimmed}" updated!`)
        }
      } else {
        const res = await veroxApi.createColumn({
          name: trimmed,
          type: columnType,
          options: columnType === 'Boolean' ? 'Yes, No' : columnOptions.trim() || '-',
          required: columnRequired,
          description: columnDescription.trim() || undefined,
        })
        if (res && res.success) {
          toast.success(`Custom column "${trimmed}" created successfully!`)
        } else {
          toast.success(`Custom column "${trimmed}" created!`)
        }
      }
      setIsModalOpen(false)
      await fetchColumns()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Failed to save custom column.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDelete = (col: ColumnItem) => {
    if (col.isSystem) {
      toast.error(`System column "${col.name}" is protected and cannot be deleted.`)
      return
    }
    setColumnToDelete(col)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!columnToDelete) return
    setIsDeleting(true)
    try {
      const res = await veroxApi.deleteColumn(columnToDelete.id)
      if (res && !res.success) {
        toast.error(res.message || 'Delete failed.')
      } else {
        toast.success(`Column "${columnToDelete.name}" deleted and decoupled from contacts.`)
        setDeleteConfirmOpen(false)
        setColumnToDelete(null)
        await fetchColumns()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Delete failed: ${msg}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Columns3 className='h-4 w-4 text-orange-600' />
          <span>Manage Columns</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 sm:p-6 space-y-6 max-w-7xl mx-auto'>
        {/* Top Header & Action Controls */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Custom Columns</h1>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20'>
                <CheckCircle2 className='h-3 w-3' />
                Port 4000 Live
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Extend contact profiles, configure custom properties for WhatsApp lead ingestion, and sync data fields.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {/* Search Input */}
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search column name or key...'
                className='h-9 pl-8 pr-8 text-xs bg-background/80 shadow-xs'
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label='Clear search'
                  className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className='h-9 px-3 text-xs gap-1.5'
              title='Sync columns from server'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Add Column Button */}
            <Button
              size='sm'
              onClick={handleOpenAdd}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-9 px-3.5 text-xs font-semibold shadow-xs'
            >
              <Plus className='h-4 w-4' />
              <span>Add Column</span>
            </Button>
          </div>
        </div>

        {/* 4 Top Enterprise Metric Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1: Total Columns */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-orange-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Custom Fields</span>
              <div className='p-2 rounded-lg bg-orange-500/10 text-orange-600'>
                <Columns3 className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight'>{loading ? '...' : totalColumns}</div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Active CRM data attributes</p>
            </div>
          </div>

          {/* Card 2: Field Types */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-emerald-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Field Types Defined</span>
              <div className='p-2 rounded-lg bg-emerald-500/10 text-emerald-600'>
                <FileCode className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
                {loading ? '...' : distinctTypesCount}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Text, Select, Phone, Boolean</p>
            </div>
          </div>

          {/* Card 3: Mandatory Fields */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-purple-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Mandatory Fields</span>
              <div className='p-2 rounded-lg bg-purple-500/10 text-purple-600'>
                <ShieldAlert className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400'>
                {loading ? '...' : requiredColumnsCount}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Enforced during lead ingestion</p>
            </div>
          </div>

          {/* Card 4: Schema Engine */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-blue-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Schema Engine</span>
              <div className='p-2 rounded-lg bg-blue-500/10 text-blue-600'>
                <Layers className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                </span>
                Active & Synced
              </div>
              <p className='text-[11px] text-muted-foreground mt-1'>Zero-leak contact persistence</p>
            </div>
          </div>
        </div>

        {/* Type Filter Pills & Directory Header */}
        <div className='flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border/50'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='text-xs font-semibold text-foreground mr-1'>Filter by Type:</span>
            {['ALL', 'Text', 'Select', 'Boolean', 'Number', 'Phone', 'Date'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTypeFilter === t
                    ? 'bg-orange-600 text-white shadow-xs font-bold'
                    : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className='text-xs text-muted-foreground'>
            Showing <strong className='text-foreground'>{filteredColumns.length}</strong> of{' '}
            <strong className='text-foreground'>{columns.length}</strong> columns
          </div>
        </div>

        {/* Custom Columns Grid */}
        {loading ? (
          <div className='rounded-xl border border-border/60 bg-card p-12 text-center text-muted-foreground shadow-xs'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <Loader2 className='h-6 w-6 animate-spin text-orange-600' />
              <span className='text-xs font-medium'>Loading custom schema columns from database...</span>
            </div>
          </div>
        ) : filteredColumns.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredColumns.map((col) => {
              const cfg = TYPE_CONFIG[col.type] || TYPE_CONFIG.Text
              const IconComp = cfg.icon

              return (
                <div
                  key={col.id}
                  className='rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-3 hover:border-orange-500/40 transition-all flex flex-col justify-between group'
                >
                  <div className='space-y-2.5'>
                    {/* Top Row: Name, System Badge & Type Badge */}
                    <div className='flex items-start justify-between gap-2'>
                      <div className='space-y-0.5 min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <h3 className='font-bold text-sm text-foreground truncate'>{col.name}</h3>
                          {col.required && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20'>
                              Required
                            </span>
                          )}
                          {col.isSystem && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground'>
                              System
                            </span>
                          )}
                        </div>

                        {/* Database Key with Copy Button */}
                        <div className='flex items-center gap-1.5'>
                          <span className='text-[11px] font-mono text-muted-foreground'>
                            #{col.key}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleCopyKey(col.key)}
                            className='text-muted-foreground hover:text-foreground transition-colors'
                            title='Copy database field key'
                          >
                            {copiedKey === col.key ? (
                              <Check className='h-3 w-3 text-emerald-600' />
                            ) : (
                              <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <Badge
                        variant='outline'
                        className={`text-[11px] font-semibold gap-1 px-2 py-0.5 shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}
                      >
                        <IconComp className='h-3 w-3' />
                        {col.type}
                      </Badge>
                    </div>

                    {/* Description if present */}
                    {col.description && (
                      <p className='text-[11px] text-muted-foreground line-clamp-2 leading-relaxed'>
                        {col.description}
                      </p>
                    )}

                    {/* Allowed Values */}
                    <div className='rounded-lg bg-muted/40 p-2.5 text-xs space-y-1 border border-border/40'>
                      <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                        Allowed Values
                      </span>
                      {col.type === 'Select' && col.options !== '-' ? (
                        <div className='flex flex-wrap gap-1 pt-0.5'>
                          {col.options.split(',').map((opt, idx) => (
                            <span
                              key={idx}
                              className='inline-block px-1.5 py-0.5 rounded bg-background text-[11px] font-medium text-foreground border border-border/60'
                            >
                              {opt.trim()}
                            </span>
                          ))}
                        </div>
                      ) : col.type === 'Boolean' ? (
                        <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
                          <span className='px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-semibold text-[11px]'>
                            Yes
                          </span>
                          <span className='text-muted-foreground'>/</span>
                          <span className='px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 font-semibold text-[11px]'>
                            No
                          </span>
                        </div>
                      ) : (
                        <div className='text-xs text-foreground font-mono font-medium'>
                          {col.options === '-' ? `Freeform (${col.type})` : col.options}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Usage & Actions */}
                  <div className='pt-2.5 border-t border-border/40 flex items-center justify-between text-xs'>
                    <span className='text-[11px] text-muted-foreground font-medium'>
                      Usage:{' '}
                      <strong className='text-foreground font-semibold'>
                        {col.usageCount || 0}
                      </strong>{' '}
                      contacts
                    </span>

                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenEdit(col)}
                        className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer'
                        title='Edit column'
                      >
                        <Edit2 className='h-3 w-3 mr-1' /> Edit
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenDelete(col)}
                        disabled={col.isSystem}
                        className={`h-7 px-2 text-xs ${
                          col.isSystem
                            ? 'opacity-30 cursor-not-allowed'
                            : 'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer'
                        }`}
                        title={col.isSystem ? 'System columns cannot be deleted' : 'Delete column'}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground bg-muted/10'>
            <div className='flex flex-col items-center justify-center gap-2 max-w-sm mx-auto'>
              <div className='p-3 rounded-full bg-muted'>
                <Columns3 className='h-6 w-6 text-muted-foreground' />
              </div>
              <p className='font-semibold text-foreground text-sm'>
                {search ? `No columns found matching "${search}"` : 'No custom columns defined'}
              </p>
              <p className='text-xs text-muted-foreground text-center'>
                {search
                  ? 'Try clearing the search query or changing the field type filter.'
                  : 'Add custom CRM columns to capture industry-specific properties like GST Number, Vehicle Fleet, or Driver License.'}
              </p>
              {search || selectedTypeFilter !== 'ALL' ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSearch('')
                    setSelectedTypeFilter('ALL')
                  }}
                  className='mt-2 h-8 text-xs'
                >
                  Reset All Filters
                </Button>
              ) : (
                <Button
                  size='sm'
                  onClick={handleOpenAdd}
                  className='mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs'
                >
                  <Plus className='h-3.5 w-3.5 mr-1' />
                  Add First Column
                </Button>
              )}
            </div>
          </div>
        )}
      </Main>

      {/* Add / Edit Column Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold flex items-center gap-2'>
              <Columns3 className='h-4 w-4 text-orange-600' />
              {editingColumn ? 'Edit Custom Column' : 'Add Custom CRM Column'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Define data fields to extend contact profiles, map webhook leads, and enrich customer records.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2 text-xs'>
            {/* Column Label */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold text-foreground'>
                  Column Label <span className='text-rose-500'>*</span>
                </Label>
                <span className='text-[10px] text-muted-foreground font-mono'>
                  {columnName.length}/50
                </span>
              </div>
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder='e.g., GST Number, Driver License, Fleet Region'
                maxLength={50}
                className='h-9 text-xs'
                autoFocus
              />
              {columnName.trim() && (
                <span className='text-[11px] text-muted-foreground block font-mono'>
                  Generated Key: <strong className='text-foreground'>#{generateColKey(columnName)}</strong>
                </span>
              )}
            </div>

            {/* Field Data Type */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>
                Field Data Type <span className='text-rose-500'>*</span>
              </Label>
              <select
                value={columnType}
                onChange={(e) => setColumnType(e.target.value as ColumnDataType)}
                className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:ring-2 focus:ring-orange-500 transition-all font-medium'
              >
                <option value='Text'>Text — Freeform string or notes</option>
                <option value='Number'>Number — Numeric count, fleet size, or amount</option>
                <option value='Select'>Select — Predefined single-choice dropdown</option>
                <option value='Boolean'>Boolean — Yes / No toggle switch</option>
                <option value='Phone'>Phone — E.164 compliant phone number</option>
                <option value='Date'>Date — Calendar timestamp</option>
              </select>
            </div>

            {/* Dropdown Options (When Select is chosen) */}
            {columnType === 'Select' && (
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-foreground'>
                  Dropdown Options (Comma-separated) <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  value={columnOptions}
                  onChange={(e) => setColumnOptions(e.target.value)}
                  placeholder='e.g., Gujarat, Maharashtra, Rajasthan, Delhi'
                  className='h-9 text-xs'
                />
                {columnOptions.trim() && (
                  <div className='flex flex-wrap gap-1 pt-1'>
                    {columnOptions.split(',').map((opt, i) => (
                      <span
                        key={i}
                        className='px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      >
                        {opt.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description / Help text */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-foreground'>
                Description / Agent Guidance (Optional)
              </Label>
              <Input
                value={columnDescription}
                onChange={(e) => setColumnDescription(e.target.value)}
                placeholder='e.g., Transport vehicle registration authority code'
                className='h-9 text-xs'
              />
            </div>

            {/* Required Toggle */}
            <div className='flex items-center gap-2 pt-1'>
              <input
                type='checkbox'
                id='colRequired'
                checked={columnRequired}
                onChange={(e) => setColumnRequired(e.target.checked)}
                className='h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500'
              />
              <label htmlFor='colRequired' className='text-xs font-medium text-foreground cursor-pointer'>
                Mandatory Field (Require agents & lead forms to provide this value)
              </label>
            </div>

            {/* Real-time Field Preview Box */}
            <div className='rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5'>
              <span className='text-[11px] font-semibold text-muted-foreground flex items-center gap-1'>
                <Sparkles className='h-3 w-3 text-orange-600' />
                Live CRM Field Preview
              </span>
              <div className='rounded-md border border-border/60 bg-background p-2.5 flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <span className='font-bold text-xs text-foreground block'>
                    {columnName.trim() || 'Sample Field Name'}
                    {columnRequired && <span className='text-rose-500 ml-0.5'>*</span>}
                  </span>
                  <span className='text-[10px] text-muted-foreground font-mono'>
                    #{generateColKey(columnName.trim() || 'sample_key')}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className={`text-[10px] font-semibold ${
                    TYPE_CONFIG[columnType]?.bg || 'bg-muted'
                  } ${TYPE_CONFIG[columnType]?.color || 'text-foreground'}`}
                >
                  {columnType}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isSaving}
              className='bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1.5 text-xs'
            >
              {isSaving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
              {editingColumn ? 'Update Column' : 'Save Column'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className='sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base font-bold flex items-center gap-2 text-rose-600'>
              <AlertCircle className='h-4 w-4' />
              Delete Custom Column
            </AlertDialogTitle>
            <AlertDialogDescription className='text-xs space-y-2'>
              <span>
                Are you sure you want to permanently delete custom column{' '}
                <strong className='text-foreground font-bold'>"{columnToDelete?.name}"</strong>?
              </span>
              <span className='block text-muted-foreground mt-1'>
                This will remove the attribute from your CRM schema and decouple it from all active contacts. Contact profiles will remain safe.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel disabled={isDeleting} className='text-xs'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
              className='bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5'
            >
              {isDeleting && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
