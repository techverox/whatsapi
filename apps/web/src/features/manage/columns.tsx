import { useState } from 'react'
import { Columns3, Plus, Trash2, Edit2 } from 'lucide-react'
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

interface ColumnItem {
  id: string
  name: string
  type: 'Text' | 'Number' | 'Select' | 'Boolean' | 'Phone' | 'Date'
  options: string
}

const initialColumns: ColumnItem[] = [
  { id: 'col-1', name: 'Email', type: 'Text', options: '-' },
  { id: 'col-2', name: 'Status', type: 'Select', options: 'New, Contacted, Qualified, Unqualified' },
  { id: 'col-3', name: 'WABA Phone Number', type: 'Phone', options: '-' },
  { id: 'col-4', name: 'GPS Client', type: 'Boolean', options: 'Yes, No' },
  { id: 'col-5', name: 'Fleet Size', type: 'Number', options: '-' },
  { id: 'col-6', name: 'Preferred RTO State', type: 'Select', options: 'Gujarat, Rajasthan, Maharashtra, Delhi' },
]

function generateColId(): string {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function Columns() {
  const [columns, setColumns] = useState<ColumnItem[]>(initialColumns)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<ColumnItem | null>(null)
  const [columnName, setColumnName] = useState('')
  const [columnType, setColumnType] = useState<ColumnItem['type']>('Text')
  const [columnOptions, setColumnOptions] = useState('')

  const handleOpenAdd = () => {
    setEditingColumn(null)
    setColumnName('')
    setColumnType('Text')
    setColumnOptions('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (col: ColumnItem) => {
    setEditingColumn(col)
    setColumnName(col.name)
    setColumnType(col.type)
    setColumnOptions(col.options === '-' ? '' : col.options)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!columnName.trim()) {
      toast.error('Column name is required.')
      return
    }

    if (editingColumn) {
      setColumns((prev) =>
        prev.map((c) =>
          c.id === editingColumn.id
            ? { ...c, name: columnName.trim(), type: columnType, options: columnOptions.trim() || '-' }
            : c
        )
      )
      toast.success(`Updated column "${columnName.trim()}"!`)
    } else {
      const newCol: ColumnItem = {
        id: generateColId(),
        name: columnName.trim(),
        type: columnType,
        options: columnOptions.trim() || '-',
      }
      setColumns((prev) => [...prev, newCol])
      toast.success(`Created custom column "${columnName.trim()}"!`)
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id))
    toast.success(`Column "${name}" removed.`)
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

      <Main className='p-4 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Custom Columns</h1>
            <p className='text-xs text-muted-foreground'>
              Add and configure custom CRM data fields to extend contact profiles and lead ingestion
            </p>
          </div>
          <Button
            size='sm'
            onClick={handleOpenAdd}
            className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 cursor-pointer font-semibold shadow-xs'
          >
            <Plus className='h-3.5 w-3.5' /> Add Column
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {columns.map((col) => (
            <div key={col.id} className='rounded-lg border border-border/60 bg-card p-4 shadow-xs space-y-2 hover:border-orange-500/30 transition-all'>
              <div className='flex items-center justify-between'>
                <h3 className='font-bold text-sm text-foreground'>{col.name}</h3>
                <Badge variant='outline' className='text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/30'>
                  {col.type}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Values: <strong className='text-foreground'>{col.options}</strong>
              </p>
              <div className='pt-2 border-t border-border/40 flex justify-end gap-2 text-xs'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleOpenEdit(col)}
                  className='h-7 text-xs cursor-pointer'
                >
                  <Edit2 className='h-3 w-3 mr-1 text-muted-foreground' /> Edit
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDelete(col.id, col.name)}
                  className='h-7 text-xs text-rose-600 hover:bg-rose-500/10 cursor-pointer'
                >
                  <Trash2 className='h-3 w-3' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Main>

      {/* Add / Edit Column Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{editingColumn ? 'Edit Column' : 'Add Custom CRM Column'}</DialogTitle>
            <DialogDescription className='text-xs'>
              Define a new data property to capture during WhatsApp lead sync and contact updates.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div>
              <Label className='text-xs font-semibold'>Column Name</Label>
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder='e.g., GST Number, Driver License, Fleet Region'
                className='h-8 text-xs mt-1'
              />
            </div>

            <div>
              <Label className='text-xs font-semibold'>Field Data Type</Label>
              <select
                value={columnType}
                onChange={(e) => setColumnType(e.target.value as ColumnItem['type'])}
                className='h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs mt-1 outline-hidden'
              >
                <option value='Text'>Text (Single-line string)</option>
                <option value='Number'>Number (Numeric integer/float)</option>
                <option value='Select'>Select (Dropdown options)</option>
                <option value='Boolean'>Boolean (Yes / No toggle)</option>
                <option value='Phone'>Phone (E.164 phone format)</option>
                <option value='Date'>Date (Calendar timestamp)</option>
              </select>
            </div>

            {columnType === 'Select' && (
              <div>
                <Label className='text-xs font-semibold'>Dropdown Options (Comma separated)</Label>
                <Input
                  value={columnOptions}
                  onChange={(e) => setColumnOptions(e.target.value)}
                  placeholder='e.g., Gujarat, Maharashtra, Rajasthan, Delhi'
                  className='h-8 text-xs mt-1'
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSave} className='bg-orange-600 hover:bg-orange-700 text-white'>
              {editingColumn ? 'Update Column' : 'Save Column'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
