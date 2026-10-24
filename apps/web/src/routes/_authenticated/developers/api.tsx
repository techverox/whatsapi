import { createFileRoute } from '@tanstack/react-router'
import { DevelopersApi } from '@/features/developers/api'

export const Route = createFileRoute('/_authenticated/developers/api')({
  component: DevelopersApi,
})
