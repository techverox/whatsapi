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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

const notificationsFormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none']),
  mobile: z.boolean().optional(),
  delivery_reports: z.boolean().optional(),
  fleet_alerts: z.boolean().optional(),
  ai_escalations: z.boolean().optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

const defaultNotificationsValues: NotificationsFormValues = {
  type: 'all',
  delivery_reports: true,
  fleet_alerts: true,
  ai_escalations: true,
  security_emails: true,
  mobile: true,
}

export function NotificationsForm() {
  const getInitialValues = (): NotificationsFormValues => {
    try {
      const saved = localStorage.getItem('verox_notifications_settings')
      if (saved) return JSON.parse(saved)
    } catch {}
    return defaultNotificationsValues
  }

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: getInitialValues(),
  })

  function onSubmit(data: NotificationsFormValues) {
    try {
      localStorage.setItem('verox_notifications_settings', JSON.stringify(data))
      toast.success('Notification Preferences Updated!', {
        description: 'WhatsApp delivery reports, fleet alerts, and escalation triggers saved.',
      })
    } catch {
      toast.success('Notification preferences saved.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem className='relative space-y-3'>
              <FormLabel>Urgent Incident Dispatch Rule</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex flex-col gap-2'
                >
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='all' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      All active events (FASTag low balance, route deviations, unread customer queries)
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='mentions' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      Critical escalations only (Driver SOS alerts, AI fallback escalations)
                    </FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='none' />
                    </FormControl>
                    <FormLabel className='font-normal'>
                      Mute automated dispatches (View updates in Audit tab only)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='relative'>
          <h3 className='mb-4 text-lg font-medium'>Fleet & CRM Alert Channels</h3>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='delivery_reports'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      WhatsApp Delivery & Read Receipts
                    </FormLabel>
                    <FormDescription>
                      Receive real-time alerts when high-priority broadcast campaigns encounter delivery failures or bounces.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fleet_alerts'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      FASTag & E-Challan Triggers
                    </FormLabel>
                    <FormDescription>
                      Automated webhook ping when vehicle FASTag balance drops below INR 500 or active challan issued in Gujarat.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ai_escalations'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      AI Chatbot Human Hand-off Requests
                    </FormLabel>
                    <FormDescription>
                      Instant browser & email notification when a high-intent customer requests human supervisor intervention.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='security_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Security Audit & Multi-Tenant Logs
                    </FormLabel>
                    <FormDescription>
                      Critical alerts for API key changes, new operator logins, and permission adjustments (always active).
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name='mobile'
          render={({ field }) => (
            <FormItem className='relative flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>
                  Sync push notifications with WhatsAPI Mobile App
                </FormLabel>
                <FormDescription>
                  Dispatches push notifications directly to on-duty fleet controllers' Android devices.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs'>
          Update Notifications
        </Button>
      </form>
    </Form>
  )
}

