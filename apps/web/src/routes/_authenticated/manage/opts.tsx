import { createFileRoute } from '@tanstack/react-router'
import { OptsManagement } from '@/features/manage/opts'

export const Route = createFileRoute('/_authenticated/manage/opts')({
  component: OptsManagement,
})
