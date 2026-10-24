import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        className='gap-1.5 h-9 cursor-pointer'
        onClick={() => setOpen('import')}
      >
        <Download className='h-3.5 w-3.5' /> <span>Import Tasks</span>
      </Button>
      <Button
        size='sm'
        className='gap-1.5 h-9 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold shadow-xs'
        onClick={() => setOpen('create')}
      >
        <Plus className='h-3.5 w-3.5' /> <span>New Task</span>
      </Button>
    </div>
  )
}
