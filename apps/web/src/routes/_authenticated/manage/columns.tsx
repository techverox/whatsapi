import { createFileRoute } from '@tanstack/react-router'
import { Columns } from '@/features/manage/columns'

export const Route = createFileRoute('/_authenticated/manage/columns')({
  component: Columns,
})
