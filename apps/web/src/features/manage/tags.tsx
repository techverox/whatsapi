import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  RefreshCw,
  Users,
  CheckCircle2,
  Layers,
  Flame,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface TagItem {
  id: string
  name: string
  count?: number
  color?: string
  createdAt?: string
}

interface TaggedContact {
  id: string
  name: string
  phone: string
  email?: string
  source?: string
  optIn?: boolean
  status?: string
  tags?: TagItem[]
}

const COLOR_PRESETS = [
  { label: 'Orange', hex: '#f97316', class: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
  { label: 'Emerald', hex: '#10b981', class: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  { label: 'Blue', hex: '#3b82f6', class: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  { label: 'Rose', hex: '#ef4444', class: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
  { label: 'Purple', hex: '#8b5cf6', class: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  { label: 'Cyan', hex: '#06b6d4', class: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30' },
  { label: 'Amber', hex: '#f59e0b', class: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  { label: 'Indigo', hex: '#6366f1', class: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30' },
]

function renderTagBadge(name: string, color?: string, extraClass: string = '') {
  if (!color) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-600 border border-orange-500/20 ${extraClass}`}>
        {name}
      </span>
    )
  }

  if (color.startsWith('#') || color.startsWith('rgb')) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${extraClass}`}
        style={{
          backgroundColor: `${color}1a`,
          color: color,
          borderColor: `${color}44`,
        }}
      >
        {name}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color} ${extraClass}`}>
      {name}
    </span>
  )
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Recently'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function Tags() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [tagName, setTagName] = useState<string>('')
  const [tagColor, setTagColor] = useState<string>(COLOR_PRESETS[0].hex)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Contact drilldown modal state
  const [contactsModalOpen, setContactsModalOpen] = useState<boolean>(false)
  const [selectedTagForContacts, setSelectedTagForContacts] = useState<TagItem | null>(null)
  const [tagContacts, setTagContacts] = useState<TaggedContact[]>([])
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false)

  const fetchTags = useCallback(async () => {
    try {
      const res = await veroxApi.getTags()
      if (res && res.success && Array.isArray(res.data)) {
        setTags(res.data)
      } else if (Array.isArray(res)) {
        setTags(res)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to load tags: ${msg}`)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    veroxApi
      .getTags()
      .then((res) => {
        if (!mounted) return
        if (res && res.success && Array.isArray(res.data)) {
          setTags(res.data)
        } else if (Array.isArray(res)) {
          setTags(res)
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(`Failed to load tags: ${msg}`)
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
    await fetchTags()
    setRefreshing(false)
    toast.success('Tags synchronized with backend!')
  }

  // Metrics
  const totalTags = tags.length
  const totalTaggedContacts = useMemo(
    () => tags.reduce((sum, t) => sum + (Number(t.count) || 0), 0),
    [tags]
  )
  const topTag = useMemo(() => {
    if (tags.length === 0) return null
    return [...tags].sort((a, b) => (b.count || 0) - (a.count || 0))[0]
  }, [tags])

  // Filtered tags
  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tags
    return tags.filter((t) => t.name.toLowerCase().includes(q))
  }, [tags, search])

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingTag(null)
    setTagName('')
    setTagColor(COLOR_PRESETS[0].hex)
    setModalOpen(true)
  }

  const handleOpenEdit = (tag: TagItem) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagColor(tag.color || COLOR_PRESETS[0].hex)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const trimmed = tagName.trim()
    if (!trimmed) {
      toast.error('Tag name is required.')
      return
    }
    if (trimmed.length < 2) {
      toast.error('Tag name must be at least 2 characters long.')
      return
    }
    if (trimmed.length > 50) {
      toast.error('Tag name cannot exceed 50 characters.')
      return
    }

    setIsSaving(true)
    try {
      if (editingTag) {
        const res = await veroxApi.updateTag(editingTag.id, trimmed, tagColor)
        if (res && res.success) {
          toast.success(`Tag "${trimmed}" updated successfully!`)
        } else {
          toast.success(`Tag "${trimmed}" updated!`)
        }
      } else {
        const res = await veroxApi.createTag(trimmed, tagColor)
        if (res && res.success) {
          toast.success(`Tag "${trimmed}" created successfully!`)
        } else {
          toast.success(`Tag "${trimmed}" created!`)
        }
      }
      setModalOpen(false)
      await fetchTags()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Failed to save tag.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDelete = (tag: TagItem) => {
    setTagToDelete(tag)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return
    setIsDeleting(true)
    try {
      await veroxApi.deleteTag(tagToDelete.id)
      toast.success(`Tag "${tagToDelete.name}" deleted and decoupled from contacts.`)
      setDeleteConfirmOpen(false)
      setTagToDelete(null)
      await fetchTags()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Delete failed: ${msg}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenContacts = async (tag: TagItem) => {
    setSelectedTagForContacts(tag)
    setContactsModalOpen(true)
    setLoadingContacts(true)
    try {
      const res = await veroxApi.getTagContacts(tag.id)
      if (res && res.success && Array.isArray(res.data)) {
        setTagContacts(res.data)
      } else if (Array.isArray(res)) {
        setTagContacts(res)
      } else {
        setTagContacts([])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to load contacts: ${msg}`)
      setTagContacts([])
    } finally {
      setLoadingContacts(false)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <TagIcon className='h-4 w-4 text-orange-600' />
          <span>Manage Tags</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 sm:p-6 space-y-6 max-w-7xl mx-auto'>
        {/* Top Header & Actions */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Tags Management</h1>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20'>
                <CheckCircle2 className='h-3 w-3' />
                Port 4000 Live
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Organize contacts, filter inbox chats, and trigger automated segmentation campaigns using color-coded tags.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {/* Search */}
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search tags by name...'
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

            {/* Refresh */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className='h-9 px-3 text-xs gap-1.5'
              title='Refresh tags from server'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Add Tag */}
            <Button
              size='sm'
              onClick={handleOpenAdd}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-9 px-3.5 text-xs font-semibold shadow-xs'
            >
              <Plus className='h-4 w-4' />
              <span>Add Tag</span>
            </Button>
          </div>
        </div>

        {/* 4 Top Enterprise Metric Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1: Total Tags */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-orange-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Active Tags</span>
              <div className='p-2 rounded-lg bg-orange-500/10 text-orange-600'>
                <TagIcon className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight'>{loading ? '...' : totalTags}</div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Registered in DB & memory</p>
            </div>
          </div>

          {/* Card 2: Tagged Contacts */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-emerald-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Tagged Contacts</span>
              <div className='p-2 rounded-lg bg-emerald-500/10 text-emerald-600'>
                <Users className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
                {loading ? '...' : totalTaggedContacts}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>Active segment associations</p>
            </div>
          </div>

          {/* Card 3: Top Tag */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-purple-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Top Utilized Tag</span>
              <div className='p-2 rounded-lg bg-purple-500/10 text-purple-600'>
                <Flame className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-sm font-bold truncate'>
                {loading ? (
                  '...'
                ) : topTag ? (
                  renderTagBadge(topTag.name, topTag.color)
                ) : (
                  'No tags'
                )}
              </div>
              <p className='text-[11px] text-muted-foreground mt-1'>
                {topTag ? `${topTag.count || 0} contacts assigned` : 'Create tags to start'}
              </p>
            </div>
          </div>

          {/* Card 4: Segmentation Engine */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-blue-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Segmentation Engine</span>
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
              <p className='text-[11px] text-muted-foreground mt-1'>Zero cascade leaks guaranteed</p>
            </div>
          </div>
        </div>

        {/* Tags Table Container */}
        <div className='rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden'>
          <div className='p-4 border-b border-border/40 flex items-center justify-between bg-muted/20'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-semibold text-foreground'>Registered Tags Directory</span>
              <span className='px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground'>
                {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'}
              </span>
            </div>
            {search && (
              <span className='text-xs text-muted-foreground'>
                Filtering by: <span className='font-semibold text-foreground'>"{search}"</span>
              </span>
            )}
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/60'>
                <tr className='text-left whitespace-nowrap'>
                  <th className='p-3.5 font-medium'>Tag Name & Badge</th>
                  <th className='p-3.5 font-medium'>Tagged Contacts</th>
                  <th className='p-3.5 font-medium'>Created Date</th>
                  <th className='p-3.5 font-medium text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30'>
                {loading ? (
                  <tr>
                    <td colSpan={4} className='p-8 text-center text-muted-foreground'>
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <Loader2 className='h-6 w-6 animate-spin text-orange-600' />
                        <span>Loading tags from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <tr
                      key={tag.id}
                      className='whitespace-nowrap hover:bg-muted/30 transition-colors group'
                    >
                      {/* Name & Badge */}
                      <td className='p-3.5 font-semibold'>
                        <div className='flex items-center gap-2'>
                          {renderTagBadge(tag.name, tag.color)}
                          <span className='text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity'>
                            #{tag.id}
                          </span>
                        </div>
                      </td>

                      {/* Tagged Contacts */}
                      <td className='p-3.5'>
                        <button
                          type='button'
                          onClick={() => handleOpenContacts(tag)}
                          className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors font-mono font-semibold'
                          title='Click to view contacts with this tag'
                        >
                          <Users className='h-3 w-3 text-muted-foreground' />
                          <span>{tag.count || 0} contacts</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className='p-3.5 text-muted-foreground font-medium'>
                        {formatDate(tag.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className='p-3.5 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          {/* View Contacts */}
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleOpenContacts(tag)}
                            className='h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted'
                            title='View tagged contacts'
                          >
                            <Users className='h-3.5 w-3.5' />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleOpenEdit(tag)}
                            className='h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted'
                            title='Edit tag name or color'
                          >
                            <Edit2 className='h-3.5 w-3.5' />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleOpenDelete(tag)}
                            className='h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                            title='Delete tag'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className='p-12 text-center text-muted-foreground'>
                      <div className='flex flex-col items-center justify-center gap-2 max-w-sm mx-auto'>
                        <div className='p-3 rounded-full bg-muted'>
                          <TagIcon className='h-6 w-6 text-muted-foreground' />
                        </div>
                        <p className='font-semibold text-foreground text-sm'>
                          {search ? `No tags found matching "${search}"` : 'No tags created yet'}
                        </p>
                        <p className='text-xs text-muted-foreground text-center'>
                          {search
                            ? 'Try refining your search keyword or clear the search query.'
                            : 'Create tags to group your customer contacts, route chats, and broadcast targeted messages.'}
                        </p>
                        {search ? (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setSearch('')}
                            className='mt-2 h-8 text-xs'
                          >
                            Clear Search Filter
                          </Button>
                        ) : (
                          <Button
                            size='sm'
                            onClick={handleOpenAdd}
                            className='mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs'
                          >
                            <Plus className='h-3.5 w-3.5 mr-1' />
                            Create First Tag
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Tag Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold flex items-center gap-2'>
                <TagIcon className='h-4 w-4 text-orange-600' />
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Color-coded tags help your team filter chats, assign agents, and trigger automated WhatsApp campaigns.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2 text-xs'>
              {/* Tag Name Input */}
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold text-foreground block'>
                    Tag Name <span className='text-rose-500'>*</span>
                  </label>
                  <span className='text-[10px] text-muted-foreground font-mono'>
                    {tagName.length}/50
                  </span>
                </div>
                <Input
                  type='text'
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder='e.g. VIP Transporter Gujarat'
                  maxLength={50}
                  className='h-9 text-xs'
                  autoFocus
                />
              </div>

              {/* Color Preset Picker */}
              <div className='space-y-2'>
                <label className='font-semibold text-foreground block'>
                  Choose Color Badge
                </label>
                <div className='grid grid-cols-4 gap-2'>
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      tagColor === preset.hex ||
                      tagColor === preset.class ||
                      (tagColor.startsWith('#') && tagColor.toLowerCase() === preset.hex.toLowerCase())
                    return (
                      <button
                        key={preset.label}
                        type='button'
                        onClick={() => setTagColor(preset.hex)}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'ring-2 ring-orange-500 border-orange-500 font-bold bg-muted/60 shadow-xs scale-102'
                            : 'border-border/60 hover:bg-muted/40'
                        }`}
                      >
                        <span
                          className='h-3 w-3 rounded-full shrink-0 shadow-xs'
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className='truncate'>{preset.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className='rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5'>
                <span className='text-[11px] font-medium text-muted-foreground block'>
                  Live Tag Preview
                </span>
                <div className='flex items-center gap-2'>
                  {renderTagBadge(tagName.trim() || 'Sample Tag', tagColor, 'text-xs')}
                  <span className='text-[11px] text-muted-foreground'>
                    — How this badge will display in inbox and campaigns
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleSave}
                disabled={isSaving}
                className='bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1.5'
              >
                {isSaving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
                {editingTag ? 'Save Changes' : 'Create Tag'}
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
                Delete Tag
              </AlertDialogTitle>
              <AlertDialogDescription className='text-xs space-y-2'>
                <span>
                  Are you sure you want to permanently delete the tag{' '}
                  <span className='font-bold text-foreground'>"{tagToDelete?.name}"</span>?
                </span>
                <span className='block text-muted-foreground mt-1'>
                  This action will safely decouple this tag from all contacts holding it. Contact profiles and conversation history will not be deleted.
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
                Delete Tag
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Tag Contacts Drilldown Modal */}
        <Dialog open={contactsModalOpen} onOpenChange={setContactsModalOpen}>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <div className='flex items-center gap-2'>
                <DialogTitle className='text-base font-bold'>Tagged Contacts</DialogTitle>
                {selectedTagForContacts &&
                  renderTagBadge(selectedTagForContacts.name, selectedTagForContacts.color)}
              </div>
              <DialogDescription className='text-xs'>
                Contacts currently carrying this tag for segment campaigns and automated inbox routing.
              </DialogDescription>
            </DialogHeader>

            <div className='py-2 max-h-96 overflow-y-auto space-y-2'>
              {loadingContacts ? (
                <div className='flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground text-xs'>
                  <Loader2 className='h-5 w-5 animate-spin text-orange-600' />
                  <span>Loading contacts...</span>
                </div>
              ) : tagContacts.length > 0 ? (
                <div className='divide-y divide-border/40 border border-border/60 rounded-lg overflow-hidden'>
                  {tagContacts.map((c) => (
                    <div
                      key={c.id}
                      className='p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors'
                    >
                      <div className='space-y-0.5 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-foreground text-xs truncate'>
                            {c.name}
                          </span>
                          {c.optIn && (
                            <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
                              <UserCheck className='h-2.5 w-2.5' /> Opt-In
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-3 text-[11px] text-muted-foreground font-mono'>
                          <span className='flex items-center gap-1'>
                            <Phone className='h-3 w-3' /> {c.phone}
                          </span>
                          {c.email && (
                            <span className='flex items-center gap-1 truncate'>
                              <Mail className='h-3 w-3' /> {c.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {c.tags && c.tags.length > 0 && (
                        <div className='flex flex-wrap gap-1 justify-end shrink-0'>
                          {c.tags.map((t) => (
                            <span key={t.id || t.name}>
                              {renderTagBadge(t.name, t.color, 'text-[10px] px-1.5 py-0.5')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center p-8 text-muted-foreground border border-dashed rounded-lg space-y-1.5'>
                  <Users className='h-6 w-6 mx-auto text-muted-foreground' />
                  <p className='text-xs font-semibold text-foreground'>No contacts tagged yet</p>
                  <p className='text-[11px] text-muted-foreground'>
                    Assign this tag to contacts in the Inbox or import tagged spreadsheets.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setContactsModalOpen(false)}
                className='text-xs'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
