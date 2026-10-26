import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTasks } from './tasks-provider'

const formSchema = z.object({
  file: z.any().optional(),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const { importTasks } = useTasks()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    const fileList = form.getValues('file')

    if (fileList && fileList[0]) {
      const file = fileList[0]
      const text = await file.text()
      const lines = text.split('\n').filter((l: string) => l.trim().length > 0)
      const imported: { title: string; status: string; label: string; priority: string }[] = []

      // If CSV has header, skip it
      const startIdx = lines[0].toLowerCase().includes('title') ? 1 : 0
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p: string) => p.replace(/^"|"$/g, '').trim())
        if (parts[0]) {
          imported.push({
            title: parts[1] || parts[0],
            status: parts[2] || 'todo',
            label: parts[3] || 'feature',
            priority: parts[4] || 'medium',
          })
        }
      }

      if (imported.length > 0) {
        await importTasks(imported)
      } else {
        await handleImportSample()
      }
    } else {
      await handleImportSample()
    }

    onOpenChange(false)
  }

  const handleImportSample = async () => {
    const samples = [
      {
        title: 'Provision 120 AIS-140 GPS trackers for Surat Freight Corridor',
        status: 'todo',
        label: 'feature',
        priority: 'high',
      },
      {
        title: 'Audit FASTAG Instant KYC Webhook for Saurashtra Fleet Hub',
        status: 'in progress',
        label: 'feature',
        priority: 'medium',
      },
      {
        title: 'Deploy Gujarat Festive Outreach template gujarat_diwali_fleet_v3',
        status: 'done',
        label: 'documentation',
        priority: 'high',
      },
    ]
    await importTasks(samples)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) form.reset()
      }}
    >
      <DialogContent className='gap-3 sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle id='import-dialog-title'>Import Tasks</DialogTitle>
          <DialogDescription className='text-xs'>
            Import tasks quickly from a CSV file or load Gujarat Fleet Automation templates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel className='text-xs font-semibold'>CSV File</FormLabel>
                  <FormControl>
                    <Input
                      id='input-import-file'
                      type='file'
                      accept='text/csv'
                      {...fileRef}
                      className='h-9 text-xs'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='p-3 bg-muted/40 rounded-lg border border-border/50 text-xs flex items-center justify-between'>
              <div className='space-y-0.5'>
                <p className='font-semibold'>Need sample tasks?</p>
                <p className='text-muted-foreground text-[11px]'>Load 3 pre-built Gujarat transport pipeline tasks.</p>
              </div>
              <Button
                id='btn-import-sample'
                type='button'
                variant='outline'
                size='sm'
                onClick={handleImportSample}
                className='text-xs h-7 gap-1 cursor-pointer shrink-0 border-orange-500/40 hover:bg-orange-500/10'
              >
                <Sparkles className='h-3 w-3 text-orange-600' />
                <span>Load Sample</span>
              </Button>
            </div>
          </form>
        </Form>

        <DialogFooter className='gap-2 pt-2'>
          <DialogClose asChild>
            <Button id='btn-cancel-import' variant='outline' size='sm' className='text-xs'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            id='btn-submit-import'
            type='submit'
            form='task-import-form'
            size='sm'
            className='bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs'
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
