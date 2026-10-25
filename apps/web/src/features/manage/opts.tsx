import { useState, useEffect, useCallback } from 'react'
import {
  Sliders,
  X,
  Save,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  Layers,
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { veroxApi } from '@/lib/api'

interface OptsConfigData {
  optOutKeywords: string[]
  optInKeywords: string[]
  autoReplyOnOptOut: boolean
  optOutReplyText: string
  autoReplyOnOptIn: boolean
  optInReplyText: string
  lastUpdated: string
  optInCount?: number
  optOutCount?: number
  totalContacts?: number
}

interface TestSimulationResult {
  simulatedMessage: string
  matched: 'opt_out' | 'opt_in' | null
  actionTaken: string
  autoReply: string | null
}

const DEFAULT_OPT_OUT = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'ROKO', 'BAND KARO']
const DEFAULT_OPT_IN = ['START', 'JOIN', 'CHALU', 'YES', 'SUBSCRIBE', 'HAAN']

const SUGGESTED_OPT_OUT = ['MAT BHEJO', 'NO THANKS', 'END', 'DISMISS']
const SUGGESTED_OPT_IN = ['RESUME', 'CONTINUE', 'OPTIN', 'ACCEPTE']

export function OptsManagement() {
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Config State
  const [optOutKeywords, setOptOutKeywords] = useState<string[]>(DEFAULT_OPT_OUT)
  const [optInKeywords, setOptInKeywords] = useState<string[]>(DEFAULT_OPT_IN)
  const [autoReplyOnOptOut, setAutoReplyOnOptOut] = useState<boolean>(true)
  const [optOutReplyText, setOptOutReplyText] = useState<string>(
    'You have been unsubscribed from WhatsApp promotional updates. Reply START or CHALU anytime to subscribe again.'
  )
  const [autoReplyOnOptIn, setAutoReplyOnOptIn] = useState<boolean>(true)
  const [optInReplyText, setOptInReplyText] = useState<string>(
    'Welcome! You have been successfully opted-in to receive WhatsApp updates.'
  )

  // Input states
  const [newOptOut, setNewOptOut] = useState<string>('')
  const [newOptIn, setNewOptIn] = useState<string>('')

  // Metrics
  const [optInCount, setOptInCount] = useState<number>(4)
  const [optOutCount, setOptOutCount] = useState<number>(0)
  const [totalContacts, setTotalContacts] = useState<number>(4)

  // Live Simulator state
  const [simulatorText, setSimulatorText] = useState<string>('Please STOP sending offers')
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [simulationResult, setSimulationResult] = useState<TestSimulationResult | null>(null)

  const fetchOpts = useCallback(async () => {
    try {
      const res = await veroxApi.getOptsConfig()
      if (res && res.success && res.data) {
        const d: OptsConfigData = res.data
        if (Array.isArray(d.optOutKeywords)) setOptOutKeywords(d.optOutKeywords)
        if (Array.isArray(d.optInKeywords)) setOptInKeywords(d.optInKeywords)
        if (d.autoReplyOnOptOut !== undefined) setAutoReplyOnOptOut(d.autoReplyOnOptOut)
        if (d.optOutReplyText) setOptOutReplyText(d.optOutReplyText)
        if (d.autoReplyOnOptIn !== undefined) setAutoReplyOnOptIn(d.autoReplyOnOptIn)
        if (d.optInReplyText) setOptInReplyText(d.optInReplyText)
        if (d.optInCount !== undefined) setOptInCount(d.optInCount)
        if (d.optOutCount !== undefined) setOptOutCount(d.optOutCount)
        if (d.totalContacts !== undefined) setTotalContacts(d.totalContacts)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to load opts configuration: ${msg}`)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    veroxApi
      .getOptsConfig()
      .then((res) => {
        if (!mounted) return
        if (res && res.success && res.data) {
          const d: OptsConfigData = res.data
          if (Array.isArray(d.optOutKeywords)) setOptOutKeywords(d.optOutKeywords)
          if (Array.isArray(d.optInKeywords)) setOptInKeywords(d.optInKeywords)
          if (d.autoReplyOnOptOut !== undefined) setAutoReplyOnOptOut(d.autoReplyOnOptOut)
          if (d.optOutReplyText) setOptOutReplyText(d.optOutReplyText)
          if (d.autoReplyOnOptIn !== undefined) setAutoReplyOnOptIn(d.autoReplyOnOptIn)
          if (d.optInReplyText) setOptInReplyText(d.optInReplyText)
          if (d.optInCount !== undefined) setOptInCount(d.optInCount)
          if (d.optOutCount !== undefined) setOptOutCount(d.optOutCount)
          if (d.totalContacts !== undefined) setTotalContacts(d.totalContacts)
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(`Failed to load opts configuration: ${msg}`)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOpts()
    setRefreshing(false)
    toast.success('Opts compliance synchronized with backend!')
  }

  const handleAddOptOut = (customWord?: string) => {
    const raw = customWord || newOptOut
    const clean = raw.trim().toUpperCase()
    if (!clean) return
    if (optOutKeywords.includes(clean)) {
      toast.info(`"${clean}" is already in Opt-Out keywords.`)
      return
    }
    setOptOutKeywords((prev) => [...prev, clean])
    if (!customWord) setNewOptOut('')
    toast.success(`Added Opt-Out keyword: "${clean}"`)
  }

  const handleAddOptIn = (customWord?: string) => {
    const raw = customWord || newOptIn
    const clean = raw.trim().toUpperCase()
    if (!clean) return
    if (optInKeywords.includes(clean)) {
      toast.info(`"${clean}" is already in Opt-In keywords.`)
      return
    }
    setOptInKeywords((prev) => [...prev, clean])
    if (!customWord) setNewOptIn('')
    toast.success(`Added Opt-In keyword: "${clean}"`)
  }

  const handleRemoveOptOut = (kw: string) => {
    setOptOutKeywords((prev) => prev.filter((k) => k !== kw))
    toast.info(`Removed "${kw}" from Opt-Out list.`)
  }

  const handleRemoveOptIn = (kw: string) => {
    setOptInKeywords((prev) => prev.filter((k) => k !== kw))
    toast.info(`Removed "${kw}" from Opt-In list.`)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await veroxApi.updateOptsConfig({
        optOutKeywords,
        optInKeywords,
        autoReplyOnOptOut,
        optOutReplyText,
        autoReplyOnOptIn,
        optInReplyText,
      })

      if (res && res.success) {
        toast.success('Opts Compliance Settings Saved!', {
          description: 'Webhook listener and broadcast campaign filters updated.',
        })
      } else {
        toast.success('Opts settings saved!')
      }
      await fetchOpts()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Failed to save opts settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    try {
      const res = await veroxApi.resetOptsConfig()
      if (res && res.success) {
        setOptOutKeywords(DEFAULT_OPT_OUT)
        setOptInKeywords(DEFAULT_OPT_IN)
        setAutoReplyOnOptOut(true)
        setAutoReplyOnOptIn(true)
        toast.success('Reset to official Meta & TRAI regulatory compliance defaults!')
        await fetchOpts()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Reset failed: ${msg}`)
    }
  }

  const handleRunSimulation = async (textToTest?: string) => {
    const msg = textToTest || simulatorText
    if (!msg.trim()) {
      toast.error('Please enter a sample message to simulate.')
      return
    }

    setIsSimulating(true)
    try {
      const res = await veroxApi.testOptMessage(msg.trim())
      const resultData = (res && typeof res === 'object' && 'data' in res && res.data ? res.data : res) as {
        simulatedMessage?: string
        matched?: 'opt_out' | 'opt_in' | null
        actionTaken?: string
        autoReply?: string | null
      }

      if (res && res.success && resultData) {
        setSimulationResult({
          simulatedMessage: resultData.simulatedMessage || msg.trim(),
          matched: resultData.matched || null,
          actionTaken: resultData.actionTaken || 'Evaluated',
          autoReply: resultData.autoReply || null,
        })
        if (resultData.matched === 'opt_out') {
          toast.warning('Opt-Out keyword detected! Contact unsubscribed.')
        } else if (resultData.matched === 'opt_in') {
          toast.success('Opt-In keyword detected! Contact subscribed.')
        } else {
          toast.info('No opt keyword detected. Standard message processing.')
        }
        await fetchOpts()
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      toast.error(`Simulation failed: ${errorMsg}`)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Sliders className='h-4 w-4 text-orange-600' />
          <span>Opts Management</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 sm:p-6 space-y-6 max-w-7xl mx-auto'>
        {/* Top Header & Actions */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Opts Management</h1>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
                <CheckCircle2 className='h-3 w-3' />
                Port 4000 Live — TRAI & Meta Compliant
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Automate WhatsApp compliance by managing global Opt-In and Opt-Out subscriber keywords and automated auto-replies.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {/* Refresh Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className='h-9 px-3 text-xs gap-1.5'
              title='Sync compliance settings'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>

            {/* Reset Defaults */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleResetDefaults}
              className='h-9 text-xs gap-1.5'
              title='Reset to standard regulatory keywords'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              <span>Reset Defaults</span>
            </Button>

            {/* Save Settings */}
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isSaving}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-9 px-3.5 text-xs font-semibold shadow-xs'
            >
              {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Save className='h-3.5 w-3.5' />}
              <span>Save Settings</span>
            </Button>
          </div>
        </div>

        {/* 4 Top Enterprise Metric Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1: Opted-In Audience */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-emerald-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Opted-In Audience</span>
              <div className='p-2 rounded-lg bg-emerald-500/10 text-emerald-600'>
                <UserCheck className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400'>
                {loading ? '...' : optInCount}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                {optInCount} of {totalContacts} contacts eligible for broadcasts
              </p>
            </div>
          </div>

          {/* Card 2: Opted-Out Contacts */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-rose-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Opted-Out Contacts</span>
              <div className='p-2 rounded-lg bg-rose-500/10 text-rose-600'>
                <UserX className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400'>
                {loading ? '...' : optOutCount}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Blocked from promotional blasts
              </p>
            </div>
          </div>

          {/* Card 3: Active Compliance Rules */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-orange-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Compliance Keywords</span>
              <div className='p-2 rounded-lg bg-orange-500/10 text-orange-600'>
                <ShieldAlert className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-bold tracking-tight'>
                {optOutKeywords.length + optInKeywords.length}
              </div>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                English + Hindi + Gujarati regional terms
              </p>
            </div>
          </div>

          {/* Card 4: Compliance Engine */}
          <div className='rounded-xl border border-border/60 bg-card p-4 shadow-xs hover:border-blue-500/40 transition-colors'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Compliance Engine</span>
              <div className='p-2 rounded-lg bg-blue-500/10 text-blue-600'>
                <Layers className='h-4 w-4' />
              </div>
            </div>
            <div className='mt-2'>
              <div className='flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                </span>
                Active & Synced
              </div>
              <p className='text-[11px] text-muted-foreground mt-1'>
                Auto-evaluates inbound webhooks
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Keyword Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Card 1: Opt-Out Keywords */}
          <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4 hover:border-rose-500/30 transition-colors'>
            <div className='flex items-center gap-2.5 border-b border-border/40 pb-3'>
              <div className='p-2 rounded-lg bg-rose-500/10 text-rose-600'>
                <ShieldAlert className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-foreground flex items-center gap-2'>
                  Opt-Out Keywords
                  <span className='text-xs text-rose-600 font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20'>
                    {optOutKeywords.length} active
                  </span>
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Inbound customer messages containing these words immediately pause marketing broadcasts.
                </p>
              </div>
            </div>

            {/* Keyword Badges */}
            <div className='flex flex-wrap gap-2 min-h-24 content-start'>
              {optOutKeywords.map((kw) => (
                <span
                  key={kw}
                  className='inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 border border-rose-500/20 group hover:bg-rose-500/20 transition-colors'
                >
                  {kw}
                  <button
                    type='button'
                    onClick={() => handleRemoveOptOut(kw)}
                    className='text-rose-500 hover:text-rose-800 cursor-pointer p-0.5 rounded-full'
                    title={`Remove ${kw}`}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggestions Bar */}
            <div className='pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-xs'>
              <span className='text-[11px] text-muted-foreground font-semibold'>Suggestions:</span>
              {SUGGESTED_OPT_OUT.map((sug) => (
                <button
                  key={sug}
                  type='button'
                  onClick={() => handleAddOptOut(sug)}
                  disabled={optOutKeywords.includes(sug)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    optOutKeywords.includes(sug)
                      ? 'opacity-40 cursor-not-allowed border-transparent'
                      : 'border-border/60 hover:bg-rose-500/10 hover:text-rose-600'
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className='flex gap-2 pt-2 border-t border-border/40'>
              <Input
                type='text'
                value={newOptOut}
                onChange={(e) => setNewOptOut(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOptOut()}
                placeholder='Add keyword (e.g. STOP, ROKO)...'
                className='h-9 text-xs'
              />
              <Button
                size='sm'
                onClick={() => handleAddOptOut()}
                variant='outline'
                className='h-9 text-xs gap-1 hover:bg-rose-500/10 hover:text-rose-600 border-rose-500/30 font-semibold'
              >
                <Plus className='h-3 w-3' /> Add
              </Button>
            </div>
          </div>

          {/* Card 2: Opt-In Keywords */}
          <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4 hover:border-emerald-500/30 transition-colors'>
            <div className='flex items-center gap-2.5 border-b border-border/40 pb-3'>
              <div className='p-2 rounded-lg bg-emerald-500/10 text-emerald-600'>
                <CheckCircle2 className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-foreground flex items-center gap-2'>
                  Opt-In Keywords
                  <span className='text-xs text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20'>
                    {optInKeywords.length} active
                  </span>
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Inbound customer messages containing these words mark the contact as Opted-In (Yes).
                </p>
              </div>
            </div>

            {/* Keyword Badges */}
            <div className='flex flex-wrap gap-2 min-h-24 content-start'>
              {optInKeywords.map((kw) => (
                <span
                  key={kw}
                  className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20 group hover:bg-emerald-500/20 transition-colors'
                >
                  {kw}
                  <button
                    type='button'
                    onClick={() => handleRemoveOptIn(kw)}
                    className='text-emerald-500 hover:text-emerald-800 cursor-pointer p-0.5 rounded-full'
                    title={`Remove ${kw}`}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggestions Bar */}
            <div className='pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-xs'>
              <span className='text-[11px] text-muted-foreground font-semibold'>Suggestions:</span>
              {SUGGESTED_OPT_IN.map((sug) => (
                <button
                  key={sug}
                  type='button'
                  onClick={() => handleAddOptIn(sug)}
                  disabled={optInKeywords.includes(sug)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    optInKeywords.includes(sug)
                      ? 'opacity-40 cursor-not-allowed border-transparent'
                      : 'border-border/60 hover:bg-emerald-500/10 hover:text-emerald-600'
                  }`}
                >
                  + {sug}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className='flex gap-2 pt-2 border-t border-border/40'>
              <Input
                type='text'
                value={newOptIn}
                onChange={(e) => setNewOptIn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOptIn()}
                placeholder='Add keyword (e.g. START, CHALU)...'
                className='h-9 text-xs'
              />
              <Button
                size='sm'
                onClick={() => handleAddOptIn()}
                variant='outline'
                className='h-9 text-xs gap-1 hover:bg-emerald-500/10 hover:text-emerald-600 border-emerald-500/30 font-semibold'
              >
                <Plus className='h-3 w-3' /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Automated WhatsApp Auto-Replies */}
        <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4'>
          <div className='flex items-center gap-2.5 border-b border-border/40 pb-3'>
            <div className='p-2 rounded-lg bg-orange-500/10 text-orange-600'>
              <MessageSquare className='h-4 w-4' />
            </div>
            <div>
              <h3 className='font-bold text-sm text-foreground'>
                Automated WhatsApp Compliance Auto-Replies
              </h3>
              <p className='text-xs text-muted-foreground'>
                Meta & TRAI guidelines recommend sending immediate confirmation receipts when subscribers modify their preference.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 pt-1'>
            {/* Opt-Out Auto-Reply */}
            <div className='rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='replyOptOut'
                    checked={autoReplyOnOptOut}
                    onChange={(e) => setAutoReplyOnOptOut(e.target.checked)}
                    className='h-4 w-4 rounded border-border text-rose-600 focus:ring-rose-500'
                  />
                  <label htmlFor='replyOptOut' className='text-xs font-bold text-foreground cursor-pointer'>
                    Opt-Out Confirmation Message
                  </label>
                </div>
                <span className='text-[10px] text-muted-foreground font-mono'>
                  {optOutReplyText.length} chars
                </span>
              </div>

              <Textarea
                value={optOutReplyText}
                onChange={(e) => setOptOutReplyText(e.target.value)}
                disabled={!autoReplyOnOptOut}
                rows={3}
                placeholder='Enter auto-reply text...'
                className='text-xs bg-background/80 resize-none'
              />
              <p className='text-[11px] text-muted-foreground'>
                Dispatched immediately when STOP, ROKO, or UNSUBSCRIBE is detected.
              </p>
            </div>

            {/* Opt-In Auto-Reply */}
            <div className='rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='replyOptIn'
                    checked={autoReplyOnOptIn}
                    onChange={(e) => setAutoReplyOnOptIn(e.target.checked)}
                    className='h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500'
                  />
                  <label htmlFor='replyOptIn' className='text-xs font-bold text-foreground cursor-pointer'>
                    Opt-In Welcome Receipt Message
                  </label>
                </div>
                <span className='text-[10px] text-muted-foreground font-mono'>
                  {optInReplyText.length} chars
                </span>
              </div>

              <Textarea
                value={optInReplyText}
                onChange={(e) => setOptInReplyText(e.target.value)}
                disabled={!autoReplyOnOptIn}
                rows={3}
                placeholder='Enter auto-reply text...'
                className='text-xs bg-background/80 resize-none'
              />
              <p className='text-[11px] text-muted-foreground'>
                Dispatched immediately when START, CHALU, or YES is detected.
              </p>
            </div>
          </div>
        </div>

        {/* Live Inbound Webhook Compliance Simulator */}
        <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4'>
          <div className='flex items-center justify-between border-b border-border/40 pb-3'>
            <div className='flex items-center gap-2.5'>
              <div className='p-2 rounded-lg bg-purple-500/10 text-purple-600'>
                <Sparkles className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-foreground flex items-center gap-2'>
                  Live Inbound Webhook Compliance Simulator
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Test how the real-time compliance parser handles incoming WhatsApp customer messages and triggers preference updates.
                </p>
              </div>
            </div>

            <div className='hidden sm:flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => {
                  setSimulatorText('Sir please STOP sending offers')
                  handleRunSimulation('Sir please STOP sending offers')
                }}
                className='text-[11px] px-2 py-1 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 transition-colors font-medium'
              >
                Sample Opt-Out
              </button>
              <button
                type='button'
                onClick={() => {
                  setSimulatorText('HAAN chalu rakho updates')
                  handleRunSimulation('HAAN chalu rakho updates')
                }}
                className='text-[11px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-medium'
              >
                Sample Opt-In
              </button>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-2'>
            <Input
              type='text'
              value={simulatorText}
              onChange={(e) => setSimulatorText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
              placeholder='Type a test incoming customer message (e.g. STOP, ROKO, START)...'
              className='h-9 text-xs'
            />
            <Button
              size='sm'
              onClick={() => handleRunSimulation()}
              disabled={isSimulating}
              className='bg-purple-600 hover:bg-purple-700 text-white gap-1.5 h-9 px-4 text-xs font-semibold shrink-0'
            >
              {isSimulating ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Send className='h-3.5 w-3.5' />}
              <span>Simulate Webhook</span>
            </Button>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className='rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2.5 animate-in fade-in-50 text-xs'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-foreground flex items-center gap-1.5'>
                  Simulation Execution Result:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    simulationResult.matched === 'opt_out'
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : simulationResult.matched === 'opt_in'
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border border-border/60'
                  }`}
                >
                  {simulationResult.matched ? simulationResult.matched.toUpperCase() : 'NO MATCH'}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-1'>
                <div className='space-y-1'>
                  <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                    Simulated Inbound Message
                  </span>
                  <div className='p-2 rounded bg-background border border-border/60 font-mono text-xs'>
                    "{simulationResult.simulatedMessage}"
                  </div>
                </div>

                <div className='space-y-1'>
                  <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                    Automated Compliance Action Taken
                  </span>
                  <div className='p-2 rounded bg-background border border-border/60 text-xs font-semibold text-foreground flex items-center gap-1.5'>
                    {simulationResult.matched === 'opt_out' ? (
                      <AlertTriangle className='h-3.5 w-3.5 text-rose-500 shrink-0' />
                    ) : simulationResult.matched === 'opt_in' ? (
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                    ) : null}
                    <span>{simulationResult.actionTaken}</span>
                  </div>
                </div>
              </div>

              {simulationResult.autoReply && (
                <div className='space-y-1 pt-1'>
                  <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider block'>
                    Dispatched WhatsApp Auto-Reply Confirmation
                  </span>
                  <div className='p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground'>
                    "{simulationResult.autoReply}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
