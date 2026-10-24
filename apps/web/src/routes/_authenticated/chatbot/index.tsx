import { createFileRoute } from '@tanstack/react-router'
import { Chatbot } from '@/features/chatbot'

export const Route = createFileRoute('/_authenticated/chatbot/')({
  component: Chatbot,
})
