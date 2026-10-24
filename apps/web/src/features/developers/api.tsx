import { useState, useEffect } from 'react'
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Terminal,
  Send,
  Zap,
  Server,
  Radio,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { veroxApi, type MetaConnectionResult } from '@/lib/api'

export function DevelopersApi() {
  const [revealed, setRevealed] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)

  // Meta Credentials Form State
  const [accessToken, setAccessToken] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('100654321098765')
  const [wabaId, setWabaId] = useState('200987654321098')
  const [verifyToken, setVerifyToken] = useState('verox_secure_verify_token_2026')
  const [appSecret, setAppSecret] = useState('')

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<MetaConnectionResult | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // Live Test Dispatcher State (AiSensy Style)
  const [testPhone, setTestPhone] = useState('+919825102938')
  const [testMessage, setTestMessage] = useState('Hello from WhatsAPI CRM! Official Meta WhatsApp Cloud API is active.')
  const [messageType, setMessageType] = useState<'text' | 'template'>('text')
  const [isSending, setIsSending] = useState(false)
  const [apiResponse, setApiResponse] = useState<any | null>(null)
  const [apiLatency, setApiLatency] = useState<number | null>(null)

  // Fetch initial config and connection health from backend on mount
  useEffect(() => {
    veroxApi.getWhatsAppConfig().then((res) => {
      if (res.success && res.data) {
        if (res.data.phoneNumberId) setPhoneNumberId(res.data.phoneNumberId)
        if (res.data.wabaId) setWabaId(res.data.wabaId)
        if (res.data.webhookVerifyToken) setVerifyToken(res.data.webhookVerifyToken)
        if (res.data.maskedToken) setAccessToken(res.data.maskedToken)
      }
    })
    // Auto-ping live Meta connection on load to show banner immediately
    veroxApi.testMetaConnection().then((res) => {
      if (res.data) setTestResult(res.data)
    })
  }, [])

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const res = await veroxApi.testMetaConnection({
      accessToken: accessToken.includes('...') ? undefined : accessToken,
      phoneNumberId,
      wabaId,
    })
    setIsTesting(false)
    if (res.data) {
      setTestResult(res.data)
      if (res.data.connected) {
        toast.success('Connection Verified Successfully!', {
          description: res.data.message || 'WhatsApp Cloud API Gateway is active.',
        })
      } else {
        toast.info(res.data.message || 'Sandbox simulated gateway active.')
      }
    }
  }

  const handleSaveCredentials = async () => {
    setSaveStatus('Saving...')
    const res = await veroxApi.updateWhatsAppConfig({
      accessToken: accessToken.includes('...') ? undefined : accessToken,
      phoneNumberId,
      wabaId,
      verifyToken,
      appSecret,
    })
    if (res.success) {
      setSaveStatus('✅ Saved and active!')
      toast.success('Credentials Saved!', {
        description: 'Parameters updated across Port 4000 gateway.',
      })
      const ping = await veroxApi.testMetaConnection()
      if (ping.data) setTestResult(ping.data)
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus('❌ Error saving credentials')
      toast.error('Failed to save credentials.')
    }
  }

  const handleExecuteSend = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a recipient phone number.')
      return
    }
    setIsSending(true)
    setApiResponse(null)
    const startTime = performance.now()

    let payload: any = {
      to: testPhone.trim(),
    }

    if (messageType === 'template') {
      payload.template = {
        name: 'diwali_special_offer_v1',
        language: { code: 'gu' },
      }
    } else {
      payload.text = testMessage.trim()
    }

    const res = await veroxApi.sendMessage(payload)
    const endTime = performance.now()
    const latency = Math.round(endTime - startTime)
    setApiLatency(latency)
    setIsSending(false)
    setApiResponse(res)

    if (res.success) {
      toast.success('WhatsApp API Call Executed Successfully!', {
        description: `Delivered message to ${testPhone.trim()} via Port 4000 gateway (${latency}ms).`,
      })
    } else {
      toast.error('API Error: ' + (res.message || 'Failed to dispatch'))
    }
  }

  const curlSnippet = `curl -X POST "http://localhost:4000/api/messages/send" \\
  -H "Authorization: Bearer ${accessToken || 'VEROX_PERMANENT_META_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${testPhone.replace(/[^0-9]/g, '')}",
    "text": "${testMessage.replace(/"/g, '\\"')}"
  }'`

  const handleCopyToken = () => {
    navigator.clipboard.writeText(accessToken || 'EAAPk...verox_production_system_user_permanent_token_948201')
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Code2 className='h-4 w-4 text-orange-600' />
          <span>WhatsApp Cloud API Access, Live Testing & Tokens</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-5 max-w-7xl mx-auto'>
        {/* Top Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              WhatsApp Cloud API Gateway
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono'>
                PORT 4000 ACTIVE
              </Badge>
            </h1>
            <p className='text-xs text-muted-foreground'>
              Official Meta Cloud API & Local Gateway with 100% Live Interactive Testing (AiSensy Grade)
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleTestConnection}
              disabled={isTesting}
              className='h-8 text-xs gap-1.5'
            >
              <Zap className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-orange-500' : 'text-amber-500'}`} />
              {isTesting ? 'Testing Meta Connection...' : 'Test Meta Connection'}
            </Button>
          </div>
        </div>

        {/* Live Meta Connection Health Banner */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
              testResult.connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div className='space-y-1'>
              <div className='flex items-center gap-2 font-bold text-sm'>
                {testResult.connected ? (
                  <>
                    <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                    Meta Cloud API Verified & Connected (Live Production)
                  </>
                ) : (
                  <>
                    <AlertCircle className='h-4 w-4 text-amber-600' />
                    Local Sandbox Gateway Active (Simulated Meta Transport)
                  </>
                )}
              </div>
              <p className='text-muted-foreground'>{testResult.message}</p>
            </div>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant='outline' className='font-mono text-[10px]'>
                Quality: {testResult.qualityRating}
              </Badge>
              <Badge variant='outline' className='font-mono text-[10px]'>
                Tier: {testResult.messagingLimitTier}
              </Badge>
              {testResult.displayPhoneNumber && (
                <Badge variant='outline' className='font-mono text-[10px] font-bold'>
                  {testResult.displayPhoneNumber}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
          {/* Left Column: API Configuration & Credentials (5 cols) */}
          <div className='lg:col-span-5 space-y-4'>
            {/* Meta System User Token Card */}
            <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 text-emerald-600' />
                  <h3 className='font-bold text-sm'>Meta Permanent Access Token</h3>
                </div>
                <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                  SYSTEM USER
                </Badge>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1.5 p-2 rounded-md bg-muted/40 border border-border/40 font-mono text-xs'>
                  <Input
                    type={revealed ? 'text' : 'password'}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder='EAAPk... Meta System User Permanent Token'
                    className='h-7 border-0 bg-transparent text-xs p-0 focus-visible:ring-0 shadow-none font-mono'
                  />
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setRevealed(!revealed)}
                    className='h-6 w-6 text-muted-foreground'
                  >
                    {revealed ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={handleCopyToken}
                    className='h-6 w-6 text-muted-foreground'
                  >
                    {copiedToken ? <Check className='h-3 w-3 text-emerald-600' /> : <Copy className='h-3 w-3' />}
                  </Button>
                </div>
                <p className='text-[10px] text-muted-foreground'>
                  Requires <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code> scopes.
                </p>
              </div>
            </div>

            {/* IDs & Webhook Token Inputs */}
            <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs space-y-3 text-xs'>
              <h3 className='font-bold text-sm flex items-center gap-2'>
                <Server className='h-4 w-4 text-orange-600' />
                Cloud API Identifiers
              </h3>

              <div className='space-y-2'>
                <div>
                  <label className='font-semibold text-muted-foreground block mb-1'>Phone Number ID</label>
                  <Input
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className='h-8 text-xs font-mono'
                    placeholder='e.g. 100654321098765'
                  />
                </div>

                <div>
                  <label className='font-semibold text-muted-foreground block mb-1'>WhatsApp Business Account ID (WABA ID)</label>
                  <Input
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    className='h-8 text-xs font-mono'
                    placeholder='e.g. 200987654321098'
                  />
                </div>

                <div>
                  <label className='font-semibold text-muted-foreground block mb-1'>Webhook Verify Token (hub.verify_token)</label>
                  <Input
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className='h-8 text-xs font-mono'
                    placeholder='whatsapi_secure_verify_token_2026'
                  />
                </div>

                <div>
                  <label className='font-semibold text-muted-foreground block mb-1'>Meta App Secret (HMAC-SHA256 Signature)</label>
                  <Input
                    type='password'
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    className='h-8 text-xs font-mono'
                    placeholder='Optional for dev, required for strict Meta production'
                  />
                </div>
              </div>

              <div className='pt-2 flex items-center justify-between'>
                <Button
                  size='sm'
                  onClick={handleSaveCredentials}
                  className='bg-orange-600 hover:bg-orange-700 text-white text-xs h-8 gap-1.5'
                >
                  <Save className='h-3.5 w-3.5' /> Save Credentials
                </Button>
                {saveStatus && <span className='text-xs font-medium text-emerald-600'>{saveStatus}</span>}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live API Test Console (AiSensy Style) (7 cols) */}
          <div className='lg:col-span-7 space-y-4'>
            <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4'>
              <div className='flex items-center justify-between border-b border-border/40 pb-3'>
                <div className='flex items-center gap-2'>
                  <Radio className='h-4 w-4 text-orange-600 animate-pulse' />
                  <h3 className='font-bold text-sm'>Live WhatsApp Message Dispatcher (Interactive API Tester)</h3>
                </div>
                <div className='flex items-center gap-1.5'>
                  <button
                    onClick={() => setMessageType('text')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                      messageType === 'text' ? 'bg-orange-600 text-white' : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    Text Message
                  </button>
                  <button
                    onClick={() => setMessageType('template')}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                      messageType === 'template' ? 'bg-orange-600 text-white' : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    Meta Template
                  </button>
                </div>
              </div>

              <div className='space-y-3 text-xs'>
                <div>
                  <label className='font-semibold text-muted-foreground block mb-1 flex items-center gap-1.5'>
                    <Smartphone className='h-3.5 w-3.5' /> Recipient WhatsApp Mobile Number (with country code)
                  </label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder='+919825102938'
                    className='h-8 text-xs font-mono font-semibold'
                  />
                  <span className='text-[10px] text-muted-foreground mt-0.5 block'>
                    Example: Enter your personal phone number to test real WhatsApp delivery!
                  </span>
                </div>

                {messageType === 'text' ? (
                  <div>
                    <label className='font-semibold text-muted-foreground block mb-1'>Message Text</label>
                    <Textarea
                      rows={3}
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className='text-xs font-sans'
                      placeholder='Type test message content...'
                    />
                  </div>
                ) : (
                  <div className='p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-xs'>Selected Template: diwali_special_offer_v1</span>
                      <Badge className='bg-emerald-500/15 text-emerald-600 text-[10px]'>APPROVED</Badge>
                    </div>
                    <p className='text-muted-foreground text-[11px] leading-relaxed'>
                      Header: "શુભ દિવાળી અને નૂતન વર્ષાભિનંદન! 🪔" | Body: "નમસ્તે {"{{1}}"}, આ દિવાળી પર WhatsAPI CRM..."
                    </p>
                  </div>
                )}

                <div className='flex items-center justify-between pt-1'>
                  <Button
                    onClick={handleExecuteSend}
                    disabled={isSending}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-bold shadow-xs'
                  >
                    <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                    {isSending ? 'Dispatching via Port 4000...' : 'Execute API Call (Send WhatsApp)'}
                  </Button>

                  {apiLatency !== null && (
                    <span className='text-[11px] font-mono text-muted-foreground'>
                      Roundtrip Latency: <strong className='text-foreground'>{apiLatency}ms</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Live JSON Response Viewer */}
              {apiResponse && (
                <div className='space-y-1.5 pt-2 border-t border-border/40'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold flex items-center gap-1.5'>
                      <Terminal className='h-3 w-3 text-orange-600' /> Live Server API Response
                    </span>
                    <Badge
                      className={
                        apiResponse.success
                          ? 'bg-emerald-500/15 text-emerald-600 border-0 text-[10px]'
                          : 'bg-red-500/15 text-red-600 border-0 text-[10px]'
                      }
                    >
                      {apiResponse.success ? 'HTTP 200 OK' : 'HTTP ERROR'}
                    </Badge>
                  </div>
                  <pre className='p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-zinc-800 leading-tight'>
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* cURL Snippet Card */}
            <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs'>
              <div className='bg-muted/40 px-4 py-2 border-b border-border/60 flex items-center justify-between'>
                <div className='flex items-center gap-2 text-xs font-semibold'>
                  <Terminal className='h-3.5 w-3.5 text-orange-600' />
                  <span>cURL Command (Direct Gateway HTTP Request)</span>
                </div>
                <Button variant='outline' size='sm' onClick={handleCopyCurl} className='h-6 text-xs gap-1 px-2'>
                  {copiedCurl ? <Check className='h-3 w-3 text-emerald-600' /> : <Copy className='h-3 w-3' />}
                  Copy
                </Button>
              </div>
              <div className='p-3 bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-x-auto leading-relaxed'>
                <pre>{curlSnippet}</pre>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

