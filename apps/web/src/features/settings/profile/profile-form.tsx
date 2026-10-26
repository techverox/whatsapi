import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.string().email('Please select an email to display.'),
  bio: z.string().max(250).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultProfileValues: ProfileFormValues = {
  username: 'truck_sathi_admin',
  email: 'trucksathiamazon@gmail.com',
  bio: 'Operations Head at Truck Sathi & DV WhatsAPI. Managing 500+ Gujarat commercial fleet AIS-140 GPS tracking devices, FASTAG KYC, and WhatsApp AI.',
  urls: [
    { value: 'https://trucksathi.in' },
    { value: 'https://dvwhatsapi.io' },
  ],
}

export function ProfileForm() {
  const getInitialValues = (): ProfileFormValues => {
    try {
      const saved = localStorage.getItem('verox_user_profile')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Fallback to defaultProfileValues
    }
    return defaultProfileValues
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  const onSubmit = (data: ProfileFormValues) => {
    try {
      localStorage.setItem('verox_user_profile', JSON.stringify(data))
      toast.success('Profile Updated Successfully!', {
        description: `Display name: @${data.username} (${data.email}). Profile preferences saved.`,
      })
    } catch {
      toast.success('Profile updated.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='truck_sathi_admin' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display handle across DV WhatsAPI team chats and audit logs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verified Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a verified business email' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='trucksathiamazon@gmail.com'>
                    trucksathiamazon@gmail.com (Primary Account)
                  </SelectItem>
                  <SelectItem value='support@trucksathi.in'>
                    support@trucksathi.in (Support Operations)
                  </SelectItem>
                  <SelectItem value='admin@dvwhatsapi.com'>
                    admin@dvwhatsapi.com (Enterprise WABA)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Manage business emails and WhatsApp notification routing in your{' '}
                <Link to='/settings/notifications' className='text-orange-600 underline underline-offset-2'>
                  notification settings
                </Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Bio & Role</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Describe your logistics role or agency operations...'
                  className='resize-none leading-relaxed'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief summary displayed to team members in the shared omnichannel inbox.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    Business URLs & Portals
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    Add links to your tracking portals, company website, or client portal.
                  </FormDescription>
                  <div className='flex gap-2 items-center'>
                    <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                      <Input {...field} />
                    </FormControl>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        className='text-xs text-muted-foreground hover:text-red-600 mt-1'
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2 text-xs'
            onClick={() => append({ value: 'https://' })}
          >
            Add URL
          </Button>
        </div>

        <Button
          type='submit'
          className='bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer'
        >
          Update Profile
        </Button>
      </form>
    </Form>
  )
}
