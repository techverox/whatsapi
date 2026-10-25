import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { labels } from '../data/data'
import { taskSchema } from '../data/schema'
import { useTasks } from './tasks-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original)
  const { setOpen, setCurrentRow, updateTask } = useTasks()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          id={`btn-task-menu-${task.id}`}
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          id={`menu-item-edit-${task.id}`}
          onClick={() => {
            setCurrentRow(task)
            setOpen('update')
          }}
          className='cursor-pointer'
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            updateTask({
              ...task,
              status: task.status === 'done' ? 'todo' : 'done',
            })
          }}
          className='cursor-pointer'
        >
          {task.status === 'done' ? 'Mark Todo' : 'Mark Done'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='cursor-pointer'>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={task.label}
              onValueChange={(val) => updateTask({ ...task, label: val })}
            >
              {labels.map((label) => (
                <DropdownMenuRadioItem
                  key={label.value}
                  value={label.value}
                  className='cursor-pointer'
                >
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          id={`menu-item-delete-${task.id}`}
          onClick={() => {
            setCurrentRow(task)
            setOpen('delete')
          }}
          className='cursor-pointer text-red-600 focus:text-red-600'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
