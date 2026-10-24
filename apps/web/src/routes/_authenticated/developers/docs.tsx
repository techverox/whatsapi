import { createFileRoute } from '@tanstack/react-router'
import { DevelopersDocs } from '@/features/developers/docs'

export const Route = createFileRoute('/_authenticated/developers/docs')({
  component: DevelopersDocs,
})
