import { createFileRoute } from '@tanstack/react-router'
import { WebhookEvents } from '@/features/manage/webhooks'

export const Route = createFileRoute('/_authenticated/manage/webhooks')({
  component: WebhookEvents,
})
