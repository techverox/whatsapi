import React, { useState, useEffect, useCallback } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Task } from '../data/schema'
import { tasks as defaultTasks } from '../data/tasks'
import { toast } from 'sonner'
import { veroxApi } from '@/lib/api'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

export type TasksContextType = {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  tasks: Task[]
  loading: boolean
  isRefreshing: boolean
  fetchTasks: (silent?: boolean) => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  bulkDeleteTasks: (ids: string[]) => Promise<void>
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>
  bulkUpdatePriority: (ids: string[], priority: string) => Promise<void>
  importTasks: (newTasks: Array<Partial<Task>>) => Promise<void>
  resetTasks: () => Promise<void>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('verox_tasks_data_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_err) {
      // Storage read fallback
    }
    return defaultTasks
  })

  // Synchronize with API Gateway on mount
  const fetchTasks = useCallback(async (silent = false) => {
    try {
      setIsRefreshing(true)
      const res: any = await veroxApi.getEnterpriseTasks()
      const data = res?.data || (Array.isArray(res) ? res : null)
      if (data && Array.isArray(data)) {
        setTasks(data)
        try {
          localStorage.setItem('verox_tasks_data_v2', JSON.stringify(data))
        } catch (_e) {}
      }
      if (!silent) {
        toast.success('Task pipeline synced with server.')
      }
    } catch (err: any) {
      console.warn('API tasks sync fallback to local storage:', err?.message || err)
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(true)
  }, [fetchTasks])

  // Save to localStorage as resilient offline cache
  useEffect(() => {
    try {
      localStorage.setItem('verox_tasks_data_v2', JSON.stringify(tasks))
    } catch (_err) {
      // Storage write fallback
    }
  }, [tasks])

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    // Optimistic ID creation
    const tempId = `TASK-${Math.floor(100 + Math.random() * 900)}`
    const optimistic: Task = { id: tempId, ...newTask }
    setTasks((prev) => [optimistic, ...prev])

    try {
      const res: any = await veroxApi.createEnterpriseTask(newTask)
      const created = res?.data || optimistic
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)))
      toast.success('Task created successfully!', {
        description: `Task ${created.id}: "${created.title}" added to pipeline.`,
      })
    } catch (err: any) {
      toast.error('Failed to save task to backend', {
        description: err?.message || 'Check network connection',
      })
    }
  }

  const updateTask = async (updated: Task) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

    try {
      await veroxApi.updateEnterpriseTask(updated.id, updated)
      toast.success('Task updated successfully!', {
        description: `Task ${updated.id} changes saved.`,
      })
    } catch (err: any) {
      toast.error('Failed to sync update with server')
    }
  }

  const deleteTask = async (id: string) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id))

    try {
      await veroxApi.deleteEnterpriseTask(id)
      toast.info('Task deleted', {
        description: `Task ${id} has been removed.`,
      })
    } catch (err: any) {
      fetchTasks(true)
      toast.error('Failed to delete task from server')
    }
  }

  const bulkDeleteTasks = async (ids: string[]) => {
    const idSet = new Set(ids)
    setTasks((prev) => prev.filter((t) => !idSet.has(t.id)))

    try {
      await veroxApi.bulkDeleteEnterpriseTasks(ids)
      toast.info(`Deleted ${ids.length} ${ids.length > 1 ? 'tasks' : 'task'}`)
    } catch (err: any) {
      fetchTasks(true)
      toast.error('Failed to bulk delete tasks on server')
    }
  }

  const bulkUpdateStatus = async (ids: string[], status: string) => {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) => (idSet.has(t.id) ? { ...t, status } : t))
    )

    try {
      await veroxApi.bulkUpdateEnterpriseTaskStatus(ids, status)
      toast.success(`Updated status to "${status}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`)
    } catch (err: any) {
      fetchTasks(true)
      toast.error('Failed to update task statuses on server')
    }
  }

  const bulkUpdatePriority = async (ids: string[], priority: string) => {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) => (idSet.has(t.id) ? { ...t, priority } : t))
    )

    try {
      await veroxApi.bulkUpdateEnterpriseTaskPriority(ids, priority)
      toast.success(`Updated priority to "${priority}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`)
    } catch (err: any) {
      fetchTasks(true)
      toast.error('Failed to update task priorities on server')
    }
  }

  const importTasks = async (newTasks: Array<Partial<Task>>) => {
    try {
      const res: any = await veroxApi.importEnterpriseTasks(newTasks)
      const imported = res?.data
      if (Array.isArray(imported)) {
        setTasks((prev) => [...imported, ...prev])
      } else {
        await fetchTasks(true)
      }
      toast.success(`Successfully imported ${newTasks.length} tasks!`)
    } catch (err: any) {
      // Local fallback
      const createdList: Task[] = newTasks.map((item) => ({
        id: item.id || `TASK-${Math.floor(100 + Math.random() * 900)}`,
        title: item.title || 'Imported Task',
        status: item.status || 'todo',
        label: item.label || 'feature',
        priority: item.priority || 'medium',
      }))
      setTasks((prev) => [...createdList, ...prev])
      toast.info(`Imported ${createdList.length} tasks locally.`)
    }
  }

  const resetTasks = async () => {
    try {
      await veroxApi.resetEnterpriseTasks()
      await fetchTasks(true)
      toast.success('Task pipeline reset to agency defaults!')
    } catch (err: any) {
      setTasks(defaultTasks)
      toast.info('Local tasks reset to default.')
    }
  }

  return (
    <TasksContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        tasks,
        loading,
        isRefreshing,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        bulkDeleteTasks,
        bulkUpdateStatus,
        bulkUpdatePriority,
        importTasks,
        resetTasks,
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
