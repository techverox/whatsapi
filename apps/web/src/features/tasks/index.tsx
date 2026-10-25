import { Badge } from '@/components/ui/badge'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider, useTasks } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

function TasksContent() {
  const { tasks } = useTasks()

  const inProgressCount = tasks.filter((t) => t.status === 'in progress').length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const urgentCount = tasks.filter((t) => t.priority === 'high' || t.priority === 'critical').length

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
              <div className='flex items-center gap-1.5 flex-wrap'>
                <Badge variant='outline' className='text-[10px] gap-1 font-mono'>
                  <ListTodo className='h-3 w-3 text-orange-600' />
                  <span>{tasks.length} Total</span>
                </Badge>
                <Badge className='bg-sky-500/15 text-sky-600 border-0 text-[10px] gap-1 font-medium'>
                  <Clock className='h-3 w-3' />
                  <span>{inProgressCount} Active</span>
                </Badge>
                <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] gap-1 font-medium'>
                  <CheckCircle2 className='h-3 w-3' />
                  <span>{doneCount} Done</span>
                </Badge>
                <Badge className='bg-rose-500/15 text-rose-600 border-0 text-[10px] gap-1 font-medium'>
                  <Flame className='h-3 w-3' />
                  <span>{urgentCount} Urgent</span>
                </Badge>
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Enterprise task pipeline for WhatsApp automation, Gujarat fleet ops & team milestones
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable data={tasks} />
      </Main>

      <TasksDialogs />
    </>
  )
}

export function Tasks() {
  return (
    <TasksProvider>
      <TasksContent />
    </TasksProvider>
  )
}
