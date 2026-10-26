import { useState } from 'react'
import {
  BookOpen,
  Send,
  Copy,
  Check,
  Terminal,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  Radio,
  Server,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Link } from '@tanstack/react-router'

interface EndpointDoc {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  title: string
  category: 'WhatsApp' | 'Contacts' | 'Webhooks' | 'AI & RAG' | 'System'
  description: string
  defaultBody?: string
  curlExample: string
}

function getExecutionTimestamp(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'ep-msg-send',
    method: 'POST',
    path: '/api/messages/send',
    title: 'Send WhatsApp Outbound Message',
    category: 'WhatsApp',
    description: 'Dispatch real-time text or approved Meta template messages to any mobile number with country code.',
    defaultBody: JSON.stringify(
      {
        to: '+919825102938',
        text: 'Hello from DV WhatsAPI! Official Meta WhatsApp Cloud API is active.',
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/api/messages/send" \\
  -H "Content-Type: application/json" \\
  -d '{"to": "+919825102938", "text": "Hello from DV WhatsAPI!"}'`,
  },
  {
    id: 'ep-contacts-list',
    method: 'GET',
    path: '/api/contacts',
    title: 'List All CRM Contacts',
    category: 'Contacts',
    description: 'Retrieve all synchronized WhatsApp leads, assigned agents, tags, and opt-in preferences.',
    curlExample: `curl -X GET "http://localhost:4000/api/contacts" \\
  -H "Content-Type: application/json"`,
  },
  {
    id: 'ep-webhook-indiamart',
    method: 'POST',
    path: '/webhook/indiamart',
    title: 'IndiaMart Inbound Lead Webhook',
    category: 'Webhooks',
    description: 'Instant lead ingestion from IndiaMart buyer push API. Auto-creates contact and dispatches welcome WhatsApp message.',
    defaultBody: JSON.stringify(
      {
        SENDER_NAME: 'Mahesh Shah',
        SENDER_MOBILE: '+919825109988',
        SENDER_EMAIL: 'mahesh.transport@gmail.com',
        QUERY_PRODUCT_NAME: 'Truck Sathi AIS-140 GPS Tracker',
        QUERY_MESSAGE: 'Require 15 commercial GPS units with fitment in Surat',
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/webhook/indiamart" \\
  -H "Content-Type: application/json" \\
  -d '{"SENDER_NAME": "Mahesh Shah", "SENDER_MOBILE": "+919825109988", "QUERY_PRODUCT_NAME": "AIS-140 GPS Tracker"}'`,
  },
  {
    id: 'ep-webhook-facebook',
    method: 'POST',
    path: '/webhook/facebook',
    title: 'Facebook Lead Ads Webhook',
    category: 'Webhooks',
    description: 'Capture instant lead submissions from Meta Facebook Instant Forms and trigger automated onboarding flows.',
    defaultBody: JSON.stringify(
      {
        entry: [
          {
            changes: [
              {
                value: {
                  form_id: 'form_gujarat_fleet_gps_2026',
                  leadgen_id: 'lead_849201948',
                  created_time: Math.floor(Date.now() / 1000),
                },
              },
            ],
          },
        ],
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/webhook/facebook" \\
  -H "Content-Type: application/json" \\
  -d '{"entry": [{"changes": [{"value": {"form_id": "form_123", "leadgen_id": "lead_456"}}]}]}'`,
  },
  {
    id: 'ep-ai-ask',
    method: 'POST',
    path: '/api/v1/ai/ask',
    title: 'Query Grounded AI Assistant (RAG)',
    category: 'AI & RAG',
    description: 'Send a natural language customer query to the RAG vector engine. Returns grounded answers with source citations.',
    defaultBody: JSON.stringify(
      {
        query: 'What is the pricing for Truck Sathi AIS-140 GPS in Gujarat?',
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/api/v1/ai/ask" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What is the pricing for Truck Sathi AIS-140 GPS?"}'`,
  },
  {
    id: 'ep-ai-knowledge',
    method: 'GET',
    path: '/api/v1/ai/knowledge',
    title: 'List AI Knowledge Documents',
    category: 'AI & RAG',
    description: 'Query all indexed enterprise documentation, compliance circulars, and pricing matrices loaded into the vector store.',
    curlExample: `curl -X GET "http://localhost:4000/api/v1/ai/knowledge" \\
  -H "Content-Type: application/json"`,
  },
  {
    id: 'ep-wa-test-conn',
    method: 'POST',
    path: '/api/whatsapp/test-connection',
    title: 'Verify Meta Cloud API Status',
    category: 'WhatsApp',
    description: 'Test live connection to official Meta Cloud API or resilient local sandbox gateway.',
    defaultBody: JSON.stringify({}, null, 2),
    curlExample: `curl -X POST "http://localhost:4000/api/whatsapp/test-connection" \\
  -H "Content-Type: application/json" \\
  -d '{}'`,
  },
  {
    id: 'ep-templates-list',
    method: 'GET',
    path: '/api/templates',
    title: 'List WhatsApp Cloud Templates',
    category: 'WhatsApp',
    description: 'Retrieve all approved WhatsApp Business Cloud templates, language versions, and component structures.',
    curlExample: `curl -X GET "http://localhost:4000/api/templates" \\
  -H "Content-Type: application/json"`,
  },
  {
    id: 'ep-webhook-razorpay',
    method: 'POST',
    path: '/webhook/razorpay',
    title: 'Razorpay Payment & Order Webhook',
    category: 'Webhooks',
    description: 'Real-time payment capture webhook. Automatically activates client subscriptions and dispatches payment receipts.',
    defaultBody: JSON.stringify(
      {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_9988771122',
              amount: 499900,
              currency: 'INR',
              status: 'captured',
              contact: '+919825102938',
              email: 'customer@gujaratlogistics.com',
            },
          },
        },
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/webhook/razorpay" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "payment.captured", "payload": {"payment": {"entity": {"id": "pay_123", "amount": 499900}}}}'`,
  },
  {
    id: 'ep-wa-simulate-inbound',
    method: 'POST',
    path: '/api/whatsapp/simulate-inbound',
    title: 'Simulate Inbound Customer WhatsApp Message',
    category: 'WhatsApp',
    description: 'Developer sandbox tool to simulate an incoming customer WhatsApp text message and trigger automated bot journeys.',
    defaultBody: JSON.stringify(
      {
        from: '+919825102938',
        name: 'Bhavik Patel',
        text: 'Hello, I want to inquire about commercial GPS trackers for my Surat fleet.',
      },
      null,
      2
    ),
    curlExample: `curl -X POST "http://localhost:4000/api/whatsapp/simulate-inbound" \\
  -H "Content-Type: application/json" \\
  -d '{"from": "+919825102938", "name": "Bhavik Patel", "text": "Hello, I need pricing"}'`,
  },
  {
    id: 'ep-sys-health',
    method: 'GET',
    path: '/health',
    title: 'System & Gateway Health Check',
    category: 'System',
    description: 'Reports uptime, database storage engine, Redis queue status, and CRM entity counts.',
    curlExample: `curl -X GET "http://localhost:4000/health"`,
  },
]

export function DevelopersDocs() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>('ep-msg-send')

  // Request Body & Live Execution State
  const [customBodies, setCustomBodies] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    ENDPOINTS.forEach((ep) => {
      if (ep.defaultBody) map[ep.id] = ep.defaultBody
    })
    return map
  })
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [responses, setResponses] = useState<
    Record<string, { status: number; statusText: string; latency: number; data: unknown }>
  >({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyCurl = (ep: EndpointDoc) => {
    let curlText = ep.curlExample
    const customBody = customBodies[ep.id]
    if ((ep.method === 'POST' || ep.method === 'PUT') && customBody) {
      try {
        const compact = JSON.stringify(JSON.parse(customBody))
        curlText = `curl -X ${ep.method} "http://localhost:4000${ep.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${compact.replace(/'/g, "\\'")}'`
      } catch {
        // Fall back to static example
      }
    }
    navigator.clipboard.writeText(curlText)
    setCopiedId(ep.id)
    toast.success('cURL Command Copied!', { description: 'Snippet copied to your clipboard.' })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExecute = async (ep: EndpointDoc) => {
    setExecutingId(ep.id)
    const startTime = getExecutionTimestamp()
    const url = `http://localhost:4000${ep.path}`

    try {
      const options: RequestInit = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      }

      if (ep.method === 'POST' || ep.method === 'PUT') {
        const bodyText = customBodies[ep.id] || ep.defaultBody || '{}'
        try {
          JSON.parse(bodyText)
        } catch (jsonErr: unknown) {
          toast.error('Invalid JSON payload syntax', {
            description: (jsonErr as Error)?.message || 'Check commas, brackets, and quotes.',
          })
          setExecutingId(null)
          return
        }
        options.body = bodyText
      }

      const res = await fetch(url, options)
      const endTime = getExecutionTimestamp()
      const latency = Math.round(endTime - startTime)

      let json: unknown = null
      try {
        json = await res.json()
      } catch {
        json = { raw: await res.text() }
      }

      setResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: res.status,
          statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
          latency,
          data: json,
        },
      }))

      if (res.ok) {
        toast.success(`HTTP ${res.status} ${res.statusText || 'OK'}`, {
          description: `Call to ${ep.path} finished in ${latency}ms.`,
        })
      } else {
        toast.error(`HTTP ${res.status}: Request failed`)
      }
    } catch (err: unknown) {
      const endTime = getExecutionTimestamp()
      const errMsg = err instanceof Error ? err.message : String(err)
      setResponses((prev) => ({
        ...prev,
        [ep.id]: {
          status: 500,
          statusText: 'Network Error',
          latency: Math.round(endTime - startTime),
          data: { error: errMsg, message: 'Could not connect to http://localhost:4000' },
        },
      }))
      toast.error('Network Error: Gateway unreachable on Port 4000')
    } finally {
      setExecutingId(null)
    }
  }

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchCategory = activeCategory === 'All' || ep.category === activeCategory
    const matchSearch =
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-orange-600' />
          <span>Interactive REST API Reference & Webhook Docs</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        {/* Top Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>WhatsApp & REST API Documentation</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-mono'>
                SWAGGER GRADE
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Official endpoints for WhatsApp Cloud API messaging, lead capture webhooks, CRM contacts, and RAG AI
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Link to='/developers/api'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 text-xs gap-1.5 border-orange-500/30 text-orange-600 hover:bg-orange-500/10'
              >
                <Zap className='h-3.5 w-3.5' /> Open Live API Tester
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Connection Info Bar */}
        <div className='p-3 rounded-xl border border-border/60 bg-muted/20 text-xs flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-3 font-mono'>
            <div className='flex items-center gap-1.5'>
              <Server className='h-3.5 w-3.5 text-orange-600' />
              <span className='text-muted-foreground'>Base URL:</span>
              <strong className='text-foreground'>http://localhost:4000</strong>
            </div>
            <span>•</span>
            <div className='flex items-center gap-1.5'>
              <Radio className='h-3.5 w-3.5 text-emerald-600 animate-pulse' />
              <span className='text-muted-foreground'>WebSocket:</span>
              <strong className='text-foreground'>ws://localhost:4000</strong>
            </div>
          </div>
          <div className='flex items-center gap-2 font-mono text-[11px] text-muted-foreground'>
            <Badge variant='outline' className='text-[10px] bg-background'>
              Content-Type: application/json
            </Badge>
            <Badge variant='outline' className='text-[10px] bg-background'>
              Auth: Bearer Token
            </Badge>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40'>
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
            {['All', 'WhatsApp', 'Contacts', 'Webhooks', 'AI & RAG', 'System'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              placeholder='Search endpoint, method, path...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8 pl-8 text-xs bg-background'
            />
          </div>
        </div>

        {/* Endpoints List */}
        <div className='space-y-3.5'>
          {filteredEndpoints.map((ep) => {
            const isExpanded = expandedId === ep.id
            const resp = responses[ep.id]
            const isRunning = executingId === ep.id

            return (
              <div
                key={ep.id}
                className='rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden transition-all'
              >
                {/* Endpoint Header Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                  className='p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors'
                >
                  <div className='flex items-center gap-2.5 flex-wrap'>
                    <Badge
                      className={
                        ep.method === 'POST'
                          ? 'bg-emerald-500/15 text-emerald-600 border-0 font-mono text-[10px] font-bold px-2 py-0.5'
                          : ep.method === 'GET'
                          ? 'bg-blue-500/15 text-blue-600 border-0 font-mono text-[10px] font-bold px-2 py-0.5'
                          : 'bg-amber-500/15 text-amber-600 border-0 font-mono text-[10px] font-bold px-2 py-0.5'
                      }
                    >
                      {ep.method}
                    </Badge>
                    <span className='font-mono text-xs font-bold text-foreground'>{ep.path}</span>
                    <span className='text-xs text-muted-foreground font-medium'>— {ep.title}</span>
                  </div>

                  <div className='flex items-center gap-2 text-xs'>
                    <Badge variant='outline' className='text-[10px] font-mono'>
                      {ep.category}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <ChevronDown className='h-4 w-4 text-muted-foreground' />
                    )}
                  </div>
                </div>

                {/* Expanded Interactive Body */}
                {isExpanded && (
                  <div className='p-4 border-t border-border/40 bg-muted/10 space-y-4'>
                    <p className='text-xs text-muted-foreground leading-relaxed'>{ep.description}</p>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                      {/* Left: Request Configuration */}
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-xs font-semibold'>
                          <span>Request Payload (JSON)</span>
                          <span className='text-[10px] text-muted-foreground font-mono'>
                            {ep.method === 'GET' ? 'No body required' : 'Editable Body'}
                          </span>
                        </div>

                        {ep.method === 'GET' ? (
                          <div className='p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground font-mono'>
                            GET requests execute against active query parameters.
                          </div>
                        ) : (
                          <Textarea
                            rows={6}
                            value={customBodies[ep.id] ?? ep.defaultBody ?? '{}'}
                            onChange={(e) =>
                              setCustomBodies((prev) => ({ ...prev, [ep.id]: e.target.value }))
                            }
                            className='font-mono text-[11px] leading-relaxed bg-background'
                          />
                        )}

                        <div className='flex items-center gap-2 pt-1'>
                          <Button
                            size='sm'
                            onClick={() => handleExecute(ep)}
                            disabled={isRunning}
                            className='bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs h-8 gap-1.5'
                          >
                            <Send className={`h-3 w-3 ${isRunning ? 'animate-bounce' : ''}`} />
                            {isRunning ? 'Sending Request...' : 'Send Request (Live Test)'}
                          </Button>

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleCopyCurl(ep)}
                            className='text-xs h-8 gap-1.5'
                          >
                            {copiedId === ep.id ? (
                              <Check className='h-3 w-3 text-emerald-600' />
                            ) : (
                              <Copy className='h-3 w-3' />
                            )}
                            Copy cURL
                          </Button>
                        </div>
                      </div>

                      {/* Right: Live Response Console */}
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-xs font-semibold'>
                          <span className='flex items-center gap-1.5'>
                            <Terminal className='h-3.5 w-3.5 text-orange-600' /> Live Server Response
                          </span>
                          {resp && (
                            <div className='flex items-center gap-2'>
                              <Badge
                                className={
                                  resp.status >= 200 && resp.status < 300
                                    ? 'bg-emerald-500/15 text-emerald-600 border-0 text-[10px]'
                                    : 'bg-red-500/15 text-red-600 border-0 text-[10px]'
                                }
                              >
                                HTTP {resp.status} {resp.statusText}
                              </Badge>
                              <span className='text-[10px] font-mono text-muted-foreground'>
                                {resp.latency}ms
                              </span>
                            </div>
                          )}
                        </div>

                        <pre className='p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 border border-zinc-800 leading-tight'>
                          {resp
                            ? JSON.stringify(resp.data, null, 2)
                            : '// Click "Send Request (Live Test)" to execute against Port 4000 gateway\n// Real response output will display here in real-time.'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredEndpoints.length === 0 && (
          <div className='p-12 text-center rounded-xl border border-dashed border-border/60 bg-muted/10'>
            <BookOpen className='h-8 w-8 mx-auto text-muted-foreground/60 mb-2' />
            <h4 className='text-sm font-semibold'>No matching API endpoints found</h4>
            <p className='text-xs text-muted-foreground mt-1'>
              Try searching with another method or keyword.
            </p>
          </div>
        )}
      </Main>
    </>
  )
}
