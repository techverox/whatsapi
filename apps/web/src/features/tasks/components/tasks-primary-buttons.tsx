import { Download, Plus, RotateCcw, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen, resetTasks, fetchTasks, isRefreshing } = useTasks()

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      <Button
        id='btn-task-reset'
        variant='outline'
        size='sm'
        className='gap-1.5 h-9 cursor-pointer'
        onClick={() => resetTasks()}
        disabled={isRefreshing}
        title='Reset tasks to agency defaults'
      >
        <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className='hidden sm:inline'>Reset Defaults</span>
      </Button>

      <Button
        id='btn-task-sync'
        variant='outline'
        size='sm'
        className='gap-1.5 h-9 cursor-pointer'
        onClick={() => fetchTasks(false)}
        disabled={isRefreshing}
        title='Sync tasks with server'
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className='hidden sm:inline'>Sync</span>
      </Button>

      <Button
        id='btn-task-import'
        variant='outline'
        size='sm'
        className='gap-1.5 h-9 cursor-pointer'
        onClick={() => setOpen('import')}
      >
        <Download className='h-3.5 w-3.5' /> <span>Import Tasks</span>
      </Button>

      <Button
        id='btn-task-new'
        size='sm'
        className='gap-1.5 h-9 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-semibold shadow-xs'
        onClick={() => setOpen('create')}
      >
        <Plus className='h-3.5 w-3.5' /> <span>New Task</span>
      </Button>
    </div>
  )
}
