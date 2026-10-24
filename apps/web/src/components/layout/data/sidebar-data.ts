import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Megaphone,
  Boxes,
  SlidersHorizontal,
  Image,
  Bot,
  MessageCircleCode,
  Sparkles,
  Workflow,
  FolderKanban,
  CheckSquare,
  Settings,
  BookOpen,
  Code2,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'truck sathi',
    email: 'trucksathiamazon@gmail.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Whatsapi',
      logo: MessageCircleCode,
      plan: 'Enterprise Cloud Edition',
    },
    {
      name: 'Truck Sathi Fleet',
      logo: Boxes,
      plan: 'Gujarat & Multi-State',
    },
  ],
  navGroups: [
    {
      title: 'Main Navigation',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Inbox',
          url: '/chats',
          badge: '12',
          icon: MessagesSquare,
        },
        {
          title: 'Contacts',
          url: '/users',
          badge: '66',
          icon: Users,
        },
        {
          title: 'Campaigns',
          url: '/campaigns',
          icon: Megaphone,
        },
        {
          title: 'Integrations',
          url: '/apps',
          badge: '27+',
          icon: Boxes,
        },
        {
          title: 'Manage',
          icon: SlidersHorizontal,
          items: [
            {
              title: 'Whatsapp Templates',
              url: '/manage/templates',
            },
            {
              title: 'Whatsapp Forms',
              url: '/manage/forms',
            },
            {
              title: 'Tags',
              url: '/manage/tags',
            },
            {
              title: 'Columns',
              url: '/manage/columns',
            },
            {
              title: 'Opts Management',
              url: '/manage/opts',
            },
            {
              title: 'Webhook Events',
              url: '/manage/webhooks',
            },
          ],
        },
        {
          title: 'Gallery',
          url: '/gallery',
          icon: Image,
        },
        {
          title: 'FAQ Bot',
          url: '/faq-bot',
          icon: Bot,
        },
        {
          title: 'Chatbot',
          url: '/chatbot',
          icon: MessageCircleCode,
        },
        {
          title: 'Ai assistant',
          url: '/ai-assistant',
          icon: Sparkles,
        },
        {
          title: 'Flows',
          url: '/flows',
          icon: Workflow,
        },
        {
          title: 'Projects',
          url: '/projects',
          icon: FolderKanban,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: CheckSquare,
        },
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
        {
          title: 'Knowledge Base',
          url: '/help-center',
          icon: BookOpen,
        },
        {
          title: 'Developers',
          icon: Code2,
          items: [
            {
              title: 'Whatsapp API',
              url: '/developers/api',
            },
            {
              title: 'Whatsapp API Docs',
              url: '/developers/docs',
            },
          ],
        },
      ],
    },
  ],
}
