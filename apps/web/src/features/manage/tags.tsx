import { useState } from 'react'
import { Tag as TagIcon, Plus, Trash2, Edit2, Search, X } from 'lucide-react'
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

interface TagItem {
  id: string
  name: string
  count: number
  color: string
  createdAt: string
}

const COLOR_PRESETS = [
  { label: 'Orange', value: 'bg-orange-500/15 text-orange-600' },
  { label: 'Emerald', value: 'bg-emerald-500/15 text-emerald-600' },
  { label: 'Blue', value: 'bg-blue-500/15 text-blue-600' },
  { label: 'Rose', value: 'bg-rose-500/15 text-rose-600' },
  { label: 'Purple', value: 'bg-purple-500/15 text-purple-600' },
  { label: 'Sky', value: 'bg-sky-500/15 text-sky-600' },
  { label: 'Amber', value: 'bg-amber-500/15 text-amber-600' },
]

const initialTags: TagItem[] = [
  { id: 't-1', name: 'English GB', count: 2, color: 'bg-blue-500/15 text-blue-600', createdAt: '10/15/2026' },
  { id: 't-2', name: 'FASTAG', count: 8, color: 'bg-emerald-500/15 text-emerald-600', createdAt: '10/16/2026' },
  { id: 't-3', name: 'Fleet Mgmt', count: 14, color: 'bg-purple-500/15 text-purple-600', createdAt: '10/16/2026' },
  { id: 't-4', name: 'GPS', count: 28, color: 'bg-orange-500/15 text-orange-600', createdAt: '10/18/2026' },
  { id: 't-5', name: 'Hinglish IN', count: 11, color: 'bg-sky-500/15 text-sky-600', createdAt: '10/19/2026' },
  { id: 't-6', name: 'INSURANCE', count: 3, color: 'bg-amber-500/15 text-amber-600', createdAt: '10/20/2026' },
  { id: 't-7', name: 'hot-lead', count: 19, color: 'bg-rose-500/15 text-rose-600', createdAt: '10/21/2026' },
]

export function Tags() {
  const [tags, setTags] = useState<TagItem[]>(initialTags)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState(COLOR_PRESETS[0].value)

  const handleOpenAdd = () => {
    setEditingTag(null)
    setTagName('')
    setTagColor(COLOR_PRESETS[0].value)
    setModalOpen(true)
  }

  const handleOpenEdit = (tag: TagItem) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagColor(tag.color)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!tagName.trim()) {
      toast.error('Tag name is required.')
      return
    }

    if (editingTag) {
      setTags((prev) =>
        prev.map((t) => (t.id === editingTag.id ? { ...t, name: tagName.trim(), color: tagColor } : t))
      )
      toast.success(`Tag "${tagName.trim()}" updated!`)
    } else {
      const created: TagItem = {
        id: `t-${Date.now()}`,
        name: tagName.trim(),
        count: 0,
        color: tagColor,
        createdAt: new Date().toLocaleDateString(),
      }
      setTags([created, ...tags])
      toast.success(`Tag "${tagName.trim()}" created!`)
    }

    setModalOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    setTags(tags.filter((t) => t.id !== id))
    toast.info(`Tag "${name}" removed.`)
  }

  const filteredTags = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

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

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Tags Management</h1>
            <p className='text-xs text-muted-foreground'>
              Organize contacts and trigger automated segment campaigns using color-coded tags
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='relative w-48 sm:w-56'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search tags...'
                className='h-8 pl-8 pr-7 text-xs'
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
            <Button
              size='sm'
              onClick={handleOpenAdd}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 text-xs font-semibold'
            >
              <Plus className='h-3.5 w-3.5' /> Add Tag
            </Button>
          </div>
        </div>

        <div className='rounded-xl border border-border/60 bg-card overflow-x-auto shadow-xs'>
          <table className='w-full text-xs'>
            <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/60'>
              <tr className='text-left whitespace-nowrap'>
                <th className='p-3 font-medium'>Tag Name</th>
                <th className='p-3 font-medium'>Tagged Contacts</th>
                <th className='p-3 font-medium'>Created Date</th>
                <th className='p-3 font-medium text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr key={tag.id} className='whitespace-nowrap hover:bg-muted/30 transition-colors'>
                    <td className='p-3 font-semibold'>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${tag.color}`}>
                        {tag.name}
                      </span>
                    </td>
                    <td className='p-3 font-semibold text-foreground font-mono'>{tag.count} contacts</td>
                    <td className='p-3 text-muted-foreground'>{tag.createdAt}</td>
                    <td className='p-3 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(tag)}
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          title='Edit tag'
                        >
                          <Edit2 className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(tag.id, tag.name)}
                          className='h-7 w-7 text-rose-500 hover:text-rose-600'
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
                  <td colSpan={4} className='p-6 text-center text-muted-foreground'>
                    No tags found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add / Edit Tag Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className='sm:max-w-sm'>
            <DialogHeader>
              <DialogTitle className='text-sm font-bold'>
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Color-coded tags help your team filter chats and trigger automated workflows.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-2 text-xs'>
              <div>
                <label className='font-semibold text-foreground block mb-1'>Tag Label</label>
                <Input
                  type='text'
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder='e.g. VIP Transporter Gujarat'
                  className='h-9 text-xs'
                />
              </div>

              <div>
                <label className='font-semibold text-foreground block mb-1'>Color Badge</label>
                <div className='flex flex-wrap gap-2 pt-1'>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type='button'
                      onClick={() => setTagColor(preset.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${preset.value} ${
                        tagColor === preset.value ? 'ring-2 ring-foreground ring-offset-1 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button variant='outline' size='sm' onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleSave}
                className='bg-orange-600 hover:bg-orange-700 text-white font-bold'
              >
                {editingTag ? 'Save Changes' : 'Create Tag'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
