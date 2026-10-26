import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/date-picker'

const languages = [
  { label: 'English (India)', value: 'en' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gu' },
  { label: 'Hindi (हिन्दी)', value: 'hi' },
  { label: 'Marathi (મરાઠી)', value: 'mr' },
] as const

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not be longer than 50 characters.'),
  dob: z.date().optional(),
  language: z.string().min(1, 'Please select a language.'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const defaultAccountValues: AccountFormValues = {
  name: 'Truck Sathi Fleet Administrator',
  language: 'en',
  dob: new Date('1992-08-15'),
}

export function AccountForm() {
  const getInitialValues = (): AccountFormValues => {
    try {
      const saved = localStorage.getItem('verox_account_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.dob) parsed.dob = new Date(parsed.dob)
        return parsed
      }
    } catch (_err) {
      // Fallback to defaultAccountValues
    }
    return defaultAccountValues
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: getInitialValues(),
  })

  function onSubmit(data: AccountFormValues) {
    try {
      localStorage.setItem('verox_account_settings', JSON.stringify(data))
      const langLabel = languages.find(l => l.value === data.language)?.label || data.language
      toast.success('Account Settings Updated!', {
        description: `Name updated to "${data.name}". Dashboard language set to ${langLabel}.`,
      })
    } catch {
      toast.success('Account settings saved.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Display Name</FormLabel>
              <FormControl>
                <Input placeholder='Truck Sathi Fleet Administrator' {...field} />
              </FormControl>
              <FormDescription>
                This name appears on official broadcast dispatch receipts, GST invoices, and system audit logs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='dob'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of Birth</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              <FormDescription>
                Required for DV WhatsAPI Multi-Factor Authentication (MFA) account recovery.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='language'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Platform Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-64 justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : 'Select language'}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-64 p-0'>
                  <Command>
                    <CommandInput placeholder='Search language...' />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue('language', language.value)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4 me-2',
                                language.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select your preferred language for the WhatsApp CRM console and automated alert templates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs'>
          Update Account
        </Button>
      </form>
    </Form>
  )
}
