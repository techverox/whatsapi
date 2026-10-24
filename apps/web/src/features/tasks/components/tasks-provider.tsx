import React, { useState, useEffect } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Task } from '../data/schema'
import { tasks as defaultTasks } from '../data/tasks'
import { toast } from 'sonner'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

type TasksContextType = {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  tasks: Task[]
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (task: Task) => void
  deleteTask: (id: string) => void
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('verox_tasks_data_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return defaultTasks
  })

  useEffect(() => {
    try {
      localStorage.setItem('verox_tasks_data_v2', JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  const addTask = (newTask: Omit<Task, 'id'>) => {
    const id = `TASK-${Math.floor(1000 + Math.random() * 9000)}`
    const created: Task = { id, ...newTask }
    setTasks((prev) => [created, ...prev])
    toast.success('Task created successfully!', {
      description: `Task ${created.id}: "${created.title}" added to pipeline.`,
    })
  }

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    toast.success('Task updated successfully!', {
      description: `Task ${updated.id} changes saved.`,
    })
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast.info('Task deleted', {
      description: `Task ${id} has been removed.`,
    })
  }

  return (
    <TasksContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        tasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
