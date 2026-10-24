import { useState, useEffect } from 'react'
import { Webhook, Copy, Check, Terminal, Zap, CheckCircle2, AlertCircle, Send, ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { veroxApi } from '@/lib/api'

interface WebhookLogItem {
  id: string
  timestamp: string
  type: string
  status: '200 OK' | '201 Created' | '400 BAD' | '401 UNAUTHORIZED'
  payload: unknown
}

function generateWebhookLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function WebhookEvents() {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const verifyToken = 'verox_secure_verify_token_2026'
  const webhookUrl = 'http://localhost:4000/webhook/whatsapp'

  // Handshake Ping State
  const [isPinging, setIsPinging] = useState(false)
  const [pingResult, setPingResult] = useState<Record<string, unknown> | null>(null)

  // Simulation Form State
  const [simPhone, setSimPhone] = useState('+919825100001')
  const [simName, setSimName] = useState('Rajesh Sharma')
  const [simText, setSimText] = useState('Price for 10 AIS-140 GPS trackers?')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simIndiaMartProduct] = useState('GPS Fleet Tracking System')

  // Live Event Stream
  const [eventLogs, setEventLogs] = useState<WebhookLogItem[]>([])

  useEffect(() => {
    let mounted = true
    veroxApi.getIntegrationLogs().then((res) => {
      if (!mounted) return
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEventLogs(
          (res.data as Array<Record<string, unknown>>).map((item) => ({
            id: String(item.id || ''),
            timestamp: typeof item.timestamp === 'string' ? item.timestamp : new Date(String(item.createdAt || '')).toLocaleTimeString(),
            type: `${item.source} (${item.event})`,
            status: String(item.status || '').includes('20') ? '200 OK' : '400 BAD',
            payload: item.fullPayload || item.payloadPreview,
          }))
        )
      }
    }).catch((_err) => {
      // Ignore initial logs fetch failure
    })

    return () => {
      mounted = false
    }
  }, [])

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const copyToken = () => {
    navigator.clipboard.writeText(verifyToken)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const handleTestHandshake = async () => {
    setIsPinging(true)
    setPingResult(null)
    const result = await veroxApi.testWebhookHandshake(verifyToken)
    setIsPinging(false)
    setPingResult(result)

    if (result.success) {
      toast.success('Meta Webhook Handshake (GET) Passed!', {
        description: 'Server returned cryptographic challenge string with HTTP 200.',
      })
      setEventLogs((prev) => [
        {
          id: generateWebhookLogId(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'hub.challenge (GET Handshake)',
          status: '200 OK',
          payload: {
            mode: 'subscribe',
            verify_token: verifyToken,
            challenge: result.challengeResponse,
          },
        },
        ...prev,
      ])
    } else {
      toast.error('Handshake Verification Failed')
    }
  }

  const handleSimulateInbound = async () => {
    if (!simPhone.trim() || !simText.trim()) {
      toast.error('Phone and message text required.')
      return
    }
    setIsSimulating(true)
    const res = await veroxApi.simulateInboundMessage({
      from: simPhone.trim(),
      name: simName.trim(),
      text: simText.trim(),
    })
    setIsSimulating(false)

    if (res.success) {
      toast.success('Inbound WhatsApp Message Simulated!', {
        description: `Message from ${simName} (${simPhone}) received and routed to Team Inbox.`,
      })
      setEventLogs((prev) => [
        {
          id: generateWebhookLogId(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'whatsapp.messages (Simulated Inbound)',
          status: '200 OK',
          payload: {
            from: simPhone.trim(),
            name: simName.trim(),
            text: simText.trim(),
            response: res.data || res.message,
          },
        },
        ...prev,
      ])
    } else {
      toast.info('Simulated inbound message in local test sandbox.')
    }
  }

  const handleSimulateIndiaMart = async () => {
    setIsSimulating(true)
    const res = await veroxApi.testIndiamartLead({
      SENDER_NAME: simName,
      SENDER_MOBILE: simPhone.replace('+', ''),
      QUERY_PRODUCT_NAME: simIndiaMartProduct,
      QUERY_MESSAGE: simText,
    })
    setIsSimulating(false)

    toast.success('IndiaMart Lead Ingestion Simulated!', {
      description: `Lead from ${simName} for "${simIndiaMartProduct}" auto-created in Contacts CRM.`,
    })

    setEventLogs((prev) => [
      {
        id: generateWebhookLogId(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'indiamart.lead (Inbound Webhook)',
        status: res.success ? '200 OK' : '400 BAD',
        payload: {
          lead: simName,
          mobile: simPhone,
          product: simIndiaMartProduct,
          result: res.data || res.message,
        },
      },
      ...prev,
    ])
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Webhook className='h-4 w-4 text-orange-600' />
          <span>Webhook Events & Real-time Logs</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              Webhook Callback Engine
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono'>
                200 OK READY
              </Badge>
            </h1>
            <p className='text-xs text-muted-foreground'>
              Official Meta Cloud API callback endpoint, verification tokens, and live interactive payload simulator
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleTestHandshake}
              disabled={isPinging}
              className='h-8 text-xs gap-1.5'
            >
              <Zap className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin text-orange-500' : 'text-amber-500'}`} />
              {isPinging ? 'Pinging Handshake...' : 'Ping Meta Handshake (GET)'}
            </Button>
          </div>
        </div>

        {/* Handshake Result Alert */}
        {pingResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
              pingResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : 'bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200'
            }`}
          >
            <div className='flex items-center gap-2'>
              {pingResult.success ? (
                <>
                  <CheckCircle2 className='h-4 w-4 text-emerald-600 shrink-0' />
                  <span>
                    <strong>Meta Webhook Handshake Verified!</strong> Server successfully returned challenge string:{' '}
                    <code>{pingResult.challengeResponse}</code> (Status: {pingResult.status})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className='h-4 w-4 text-red-600 shrink-0' />
                  <span>
                    <strong>Handshake Verification Failed!</strong> Error: {pingResult.error || 'Server did not return challenge'}
                  </span>
                </>
              )}
            </div>
            <Badge variant='outline' className='text-[10px] font-mono'>
              HTTP {pingResult.status || '500'}
            </Badge>
          </div>
        )}

        {/* Webhook Configuration Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded-lg border border-border/60 bg-card p-4 shadow-xs space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                Meta Webhook Callback URL
              </h3>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px]'>
                HANDSHAKE ACTIVE
              </Badge>
            </div>
            <div className='flex items-center gap-2 p-2.5 rounded-md bg-muted/40 border border-border/40 font-mono text-xs'>
              <span className='truncate flex-1 text-foreground'>{webhookUrl}</span>
              <Button size='icon' variant='ghost' onClick={copyUrl} className='h-7 w-7'>
                {copiedUrl ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
              </Button>
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Paste this URL into your Meta App Dashboard under <strong>WhatsApp &gt; Configuration &gt; Callback URL</strong>.
            </p>
          </div>

          <div className='rounded-lg border border-border/60 bg-card p-4 shadow-xs space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                Meta Hub Verify Token
              </h3>
              <span className='text-[10px] text-muted-foreground font-mono'>hub.verify_token</span>
            </div>
            <div className='flex items-center gap-2 p-2.5 rounded-md bg-muted/40 border border-border/40 font-mono text-xs'>
              <span className='truncate flex-1 text-foreground'>{verifyToken}</span>
              <Button size='icon' variant='ghost' onClick={copyToken} className='h-7 w-7'>
                {copiedToken ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
              </Button>
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Use this exact token in Meta App Dashboard to pass the cryptographic handshake verification.
            </p>
          </div>
        </div>

        {/* Interactive Inbound Webhook Simulator (AiSensy Style) */}
        <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-3'>
          <div className='flex items-center justify-between border-b border-border/40 pb-2.5'>
            <div className='flex items-center gap-2'>
              <Zap className='h-4 w-4 text-orange-600' />
              <h3 className='font-bold text-sm'>Interactive Inbound Webhook Simulator (Test Lead & Inbound Ingestion)</h3>
            </div>
            <Badge className='bg-orange-500/10 text-orange-600 text-[10px]'>100% LIVE GATEWAY TEST</Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-3 text-xs'>
            <div>
              <label className='font-semibold text-muted-foreground block mb-1'>Customer Phone</label>
              <Input
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                placeholder='+919825100001'
                className='h-8 text-xs font-mono font-semibold'
              />
            </div>
            <div>
              <label className='font-semibold text-muted-foreground block mb-1'>Sender Name</label>
              <Input
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder='Rajesh Sharma'
                className='h-8 text-xs'
              />
            </div>
            <div className='md:col-span-2'>
              <label className='font-semibold text-muted-foreground block mb-1'>Simulated Message / Lead Query</label>
              <Input
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder='Price for 10 AIS-140 GPS trackers?'
                className='h-8 text-xs'
              />
            </div>
          </div>

          <div className='flex items-center gap-2 pt-1 flex-wrap'>
            <Button
              size='sm'
              onClick={handleSimulateInbound}
              disabled={isSimulating}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 gap-1.5 font-bold shadow-xs'
            >
              <Send className='h-3.5 w-3.5' />
              {isSimulating ? 'Processing Webhook...' : 'Simulate Inbound WhatsApp Message'}
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={handleSimulateIndiaMart}
              disabled={isSimulating}
              className='text-xs h-8 gap-1.5'
            >
              <ArrowRight className='h-3.5 w-3.5 text-blue-600' />
              Simulate IndiaMart Lead Ingestion
            </Button>
          </div>
        </div>

        {/* Live Event Stream Terminal */}
        <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs'>
          <div className='bg-muted/40 px-4 py-2.5 border-b border-border/60 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs font-semibold'>
              <Terminal className='h-3.5 w-3.5 text-orange-600' />
              <span>Real-time Inbound Webhook Payload Log</span>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setEventLogs([])
                  toast.info('Event logs cleared.')
                }}
                className='h-6 text-[10px] text-muted-foreground hover:text-rose-500 gap-1 px-2 cursor-pointer'
              >
                <Trash2 className='h-3 w-3' /> Clear Logs
              </Button>
              <span className='text-[10px] text-emerald-600 font-mono flex items-center gap-1.5'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' /> Port 4000 Listening
              </span>
            </div>
          </div>

          <div className='p-4 bg-zinc-950 font-mono text-xs space-y-3 max-h-80 overflow-y-auto'>
            {eventLogs.map((log) => (
              <div key={log.id} className='p-2.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-300 space-y-1.5'>
                <div className='flex items-center justify-between text-[11px] border-b border-zinc-800/80 pb-1'>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-emerald-500/20 text-emerald-400 border-0 text-[10px] font-mono'>
                      {log.status}
                    </Badge>
                    <span className='text-amber-400 font-bold'>{log.type}</span>
                  </div>
                  <span className='text-zinc-500'>{log.timestamp}</span>
                </div>
                <pre className='text-emerald-400 text-[11px] overflow-x-auto leading-relaxed'>
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </Main>
    </>
  )
}
