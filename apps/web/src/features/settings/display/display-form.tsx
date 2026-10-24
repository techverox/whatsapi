import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const items = [
  {
    id: 'dashboard',
    label: 'Dashboard & Operations Analytics',
  },
  {
    id: 'chats',
    label: 'WhatsApp Live Multi-Agent Inbox',
  },
  {
    id: 'broadcasts',
    label: 'Broadcast Campaigns & Fastag Promotions',
  },
  {
    id: 'flows',
    label: 'Visual Workflow Automation Builder',
  },
  {
    id: 'tasks',
    label: 'Fleet Tasks Pipeline (Kanban & Table)',
  },
  {
    id: 'projects',
    label: 'Project Milestones & GPS Deployment Planner',
  },
  {
    id: 'ai_assistant',
    label: 'AI Knowledge Grounding & RAG Assistant',
  },
] as const

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one module.',
  }),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

const defaultDisplayValues: DisplayFormValues = {
  items: ['dashboard', 'chats', 'broadcasts', 'flows', 'tasks', 'projects', 'ai_assistant'],
}

export function DisplayForm() {
  const getInitialValues = (): DisplayFormValues => {
    try {
      const saved = localStorage.getItem('verox_display_settings')
      if (saved) return JSON.parse(saved)
    } catch {}
    return defaultDisplayValues
  }

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: getInitialValues(),
  })

  function onSubmit(data: DisplayFormValues) {
    try {
      localStorage.setItem('verox_display_settings', JSON.stringify(data))
      toast.success('Sidebar Configuration Saved!', {
        description: `${data.items.length} primary navigation modules active in your workspace.`,
      })
    } catch {
      toast.success('Display configuration updated.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='items'
          render={() => (
            <FormItem>
              <div className='mb-4'>
                <FormLabel className='text-base'>Active Sidebar Navigation Modules</FormLabel>
                <FormDescription>
                  Configure which modules appear on your main left-hand sidebar navigation.
                </FormDescription>
              </div>
              <div className='space-y-3 rounded-lg border p-4'>
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name='items'
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className='flex flex-row items-center space-x-3 space-y-0'
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className='font-normal cursor-pointer text-sm'>
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs'>
          Update Display
        </Button>
      </form>
    </Form>
  )
}

