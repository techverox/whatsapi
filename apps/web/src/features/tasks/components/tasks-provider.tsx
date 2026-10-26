import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { tasks as defaultTasks } from '../data/tasks'
import { type Task } from '../data/schema'
import { veroxApi } from '@/lib/api'

type TasksDialogType = 'import' | 'add' | 'edit' | 'delete'

interface TasksContextType {
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

interface Props {
  children: React.ReactNode
}

export function TasksProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Seed tasks from localStorage or defaults
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

  // Synchronize with API Gateway
  const fetchTasks = useCallback(async (silent = false) => {
    try {
      setIsRefreshing(true)
      const res = (await veroxApi.getEnterpriseTasks()) as { data?: Task[] } | Task[]
      const data = res && 'data' in res && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : null)
      if (data && Array.isArray(data)) {
        setTasks(data)
        try {
          localStorage.setItem('verox_tasks_data_v2', JSON.stringify(data))
        } catch {
          // ignore storage error
        }
      }
      if (!silent) {
        toast.success('Task pipeline synced with server.')
      }
    } catch (_err: unknown) {
      // Network fallback handled via local state
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initTasks = async () => {
      try {
        setIsRefreshing(true)
        const res = (await veroxApi.getEnterpriseTasks()) as { data?: Task[] } | Task[]
        if (!isMounted) return
        const data = res && 'data' in res && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : null)
        if (data && Array.isArray(data)) {
          setTasks(data)
          try {
            localStorage.setItem('verox_tasks_data_v2', JSON.stringify(data))
          } catch {
            // ignore
          }
        }
      } catch {
        // Fallback to local storage
      } finally {
        if (isMounted) {
          setIsRefreshing(false)
          setLoading(false)
        }
      }
    }

    void initTasks()

    return () => {
      isMounted = false
    }
  }, [])

  // Save to localStorage as resilient offline cache
  useEffect(() => {
    try {
      localStorage.setItem('verox_tasks_data_v2', JSON.stringify(tasks))
    } catch (_err) {
      // Storage write fallback
    }
  }, [tasks])

  const addTask = useCallback(async (newTask: Omit<Task, 'id'>) => {
    // Optimistic ID creation
    const tempId = `TASK-${Math.floor(100 + Math.random() * 900)}`
    const optimistic: Task = { id: tempId, ...newTask }
    setTasks((prev) => [optimistic, ...prev])

    try {
      const res = (await veroxApi.createEnterpriseTask(newTask)) as { data?: Task } | undefined
      const created = res?.data || optimistic
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)))
      toast.success('Task created successfully!', {
        description: `Task ${created.id}: "${created.title}" added to pipeline.`,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check network connection'
      toast.error('Failed to save task to backend', {
        description: msg,
      })
    }
  }, [])

  const updateTask = useCallback(async (updated: Task) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

    try {
      await veroxApi.updateEnterpriseTask(updated.id, updated as unknown as Record<string, unknown>)
      toast.success('Task updated successfully!', {
        description: `Task ${updated.id} changes saved.`,
      })
    } catch (_err: unknown) {
      toast.error('Failed to sync update with server')
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id))

    try {
      await veroxApi.deleteEnterpriseTask(id)
      toast.info('Task deleted', {
        description: `Task ${id} has been removed.`,
      })
    } catch (_err: unknown) {
      void fetchTasks(true)
      toast.error('Failed to delete task from server')
    }
  }, [fetchTasks])

  const bulkDeleteTasks = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids)
    setTasks((prev) => prev.filter((t) => !idSet.has(t.id)))

    try {
      await veroxApi.bulkDeleteEnterpriseTasks(ids)
      toast.info(`Deleted ${ids.length} ${ids.length > 1 ? 'tasks' : 'task'}`)
    } catch (_err: unknown) {
      void fetchTasks(true)
      toast.error('Failed to bulk delete tasks on server')
    }
  }, [fetchTasks])

  const bulkUpdateStatus = useCallback(async (ids: string[], status: string) => {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) => (idSet.has(t.id) ? { ...t, status } : t))
    )

    try {
      await veroxApi.bulkUpdateEnterpriseTaskStatus(ids, status)
      toast.success(`Updated status to "${status}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`)
    } catch (_err: unknown) {
      void fetchTasks(true)
      toast.error('Failed to update task statuses on server')
    }
  }, [fetchTasks])

  const bulkUpdatePriority = useCallback(async (ids: string[], priority: string) => {
    const idSet = new Set(ids)
    setTasks((prev) =>
      prev.map((t) => (idSet.has(t.id) ? { ...t, priority } : t))
    )

    try {
      await veroxApi.bulkUpdateEnterpriseTaskPriority(ids, priority)
      toast.success(`Updated priority to "${priority}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`)
    } catch (_err: unknown) {
      void fetchTasks(true)
      toast.error('Failed to update task priorities on server')
    }
  }, [fetchTasks])

  const importTasks = useCallback(async (newTasks: Array<Partial<Task>>) => {
    try {
      const res = (await veroxApi.importEnterpriseTasks(newTasks as Record<string, unknown>[])) as { data?: Task[] } | undefined
      const imported = res?.data
      if (Array.isArray(imported)) {
        setTasks((prev) => [...imported, ...prev])
      } else {
        await fetchTasks(true)
      }
      toast.success(`Successfully imported ${newTasks.length} tasks!`)
    } catch (_err: unknown) {
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
  }, [fetchTasks])

  const resetTasks = useCallback(async () => {
    try {
      await veroxApi.resetEnterpriseTasks()
      await fetchTasks(true)
      toast.success('Task pipeline reset to agency defaults!')
    } catch (_err: unknown) {
      setTasks(defaultTasks)
      toast.info('Local tasks reset to default.')
    }
  }, [fetchTasks])

  const contextValue = useMemo(
    () => ({
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
    }),
    [
      open,
      setOpen,
      currentRow,
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
    ]
  )

  return (
    <TasksContext.Provider value={contextValue}>
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

export default TasksProvider
