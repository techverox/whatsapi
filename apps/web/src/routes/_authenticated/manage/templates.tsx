import { createFileRoute } from '@tanstack/react-router'
import { WhatsappTemplates } from '@/features/manage/templates'

export const Route = createFileRoute('/_authenticated/manage/templates')({
  component: WhatsappTemplates,
})
