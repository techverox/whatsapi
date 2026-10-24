import { createFileRoute } from '@tanstack/react-router'
import { Tags } from '@/features/manage/tags'

export const Route = createFileRoute('/_authenticated/manage/tags')({
  component: Tags,
})
