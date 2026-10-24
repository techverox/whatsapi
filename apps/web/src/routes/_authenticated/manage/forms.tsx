import { createFileRoute } from '@tanstack/react-router'
import { WhatsappForms } from '@/features/manage/forms'

export const Route = createFileRoute('/_authenticated/manage/forms')({
  component: WhatsappForms,
})
