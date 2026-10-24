import { createFileRoute } from '@tanstack/react-router'
import { FAQBot } from '@/features/faq-bot'

export const Route = createFileRoute('/_authenticated/faq-bot/')({
  component: FAQBot,
})
