import { createFileRoute } from '@tanstack/react-router'
import { Gallery } from '@/features/gallery'

export const Route = createFileRoute('/_authenticated/gallery/')({
  component: Gallery,
})
