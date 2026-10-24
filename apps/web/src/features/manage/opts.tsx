import { useState } from 'react'
import { Sliders, X, Save, ShieldAlert, CheckCircle2, RotateCcw, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

const DEFAULT_OPT_OUT = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'ROKO', 'BAND KARO']
const DEFAULT_OPT_IN = ['START', 'JOIN', 'CHALU', 'YES', 'SUBSCRIBE', 'HAAN']

export function OptsManagement() {
  const [optOutKeywords, setOptOutKeywords] = useState<string[]>(DEFAULT_OPT_OUT)
  const [optInKeywords, setOptInKeywords] = useState<string[]>(DEFAULT_OPT_IN)
  const [newOptOut, setNewOptOut] = useState('')
  const [newOptIn, setNewOptIn] = useState('')
  const [saved, setSaved] = useState(false)

  const handleAddOptOut = () => {
    const clean = newOptOut.trim().toUpperCase()
    if (!clean) return
    if (optOutKeywords.includes(clean)) {
      toast.info(`"${clean}" is already in Opt-Out keywords.`)
      return
    }
    setOptOutKeywords([...optOutKeywords, clean])
    setNewOptOut('')
    toast.success(`Added Opt-Out keyword: "${clean}"`)
  }

  const handleAddOptIn = () => {
    const clean = newOptIn.trim().toUpperCase()
    if (!clean) return
    if (optInKeywords.includes(clean)) {
      toast.info(`"${clean}" is already in Opt-In keywords.`)
      return
    }
    setOptInKeywords([...optInKeywords, clean])
    setNewOptIn('')
    toast.success(`Added Opt-In keyword: "${clean}"`)
  }

  const handleRemoveOptOut = (kw: string) => {
    setOptOutKeywords(optOutKeywords.filter((k) => k !== kw))
    toast.info(`Removed "${kw}" from Opt-Out list.`)
  }

  const handleRemoveOptIn = (kw: string) => {
    setOptInKeywords(optInKeywords.filter((k) => k !== kw))
    toast.info(`Removed "${kw}" from Opt-In list.`)
  }

  const handleSave = () => {
    setSaved(true)
    toast.success('Opts Compliance Settings Saved!', {
      description: 'Webhook listener updated. Broadcast campaigns will honor subscriber preferences.',
    })
    setTimeout(() => setSaved(false), 2500)
  }

  const handleResetDefaults = () => {
    setOptOutKeywords(DEFAULT_OPT_OUT)
    setOptInKeywords(DEFAULT_OPT_IN)
    toast.success('Reset to official Meta & TRAI regulatory compliance defaults!')
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

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Opts Management</h1>
            <p className='text-xs text-muted-foreground'>
              Automate WhatsApp compliance by managing global Opt-In and Opt-Out subscriber keywords
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleResetDefaults}
              className='h-8 text-xs gap-1.5'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Reset Defaults
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 text-xs font-semibold'
            >
              <Save className='h-3.5 w-3.5' />
              {saved ? 'Saved Successfully!' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Card 1: Opt-Out Keywords */}
          <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4'>
            <div className='flex items-center gap-2 border-b border-border/40 pb-3'>
              <ShieldAlert className='h-5 w-5 text-rose-500' />
              <div>
                <h3 className='font-bold text-sm text-foreground flex items-center gap-2'>
                  Opt-Out Keywords
                  <span className='text-xs text-muted-foreground font-normal'>
                    ({optOutKeywords.length} active)
                  </span>
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Inbound messages containing these words immediately pause marketing broadcasts
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 min-h-24 content-start'>
              {optOutKeywords.map((kw) => (
                <span
                  key={kw}
                  className='inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-500/20'
                >
                  {kw}
                  <button
                    onClick={() => handleRemoveOptOut(kw)}
                    className='hover:text-rose-800 cursor-pointer'
                    title='Remove keyword'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>

            <div className='flex gap-2 pt-2 border-t border-border/40'>
              <Input
                type='text'
                value={newOptOut}
                onChange={(e) => setNewOptOut(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOptOut()}
                placeholder='Add keyword (e.g. STOP, ROKO)...'
                className='h-9 text-xs'
              />
              <Button size='sm' onClick={handleAddOptOut} variant='outline' className='h-9 text-xs gap-1'>
                <Plus className='h-3 w-3' /> Add
              </Button>
            </div>
          </div>

          {/* Card 2: Opt-In Keywords */}
          <div className='rounded-xl border border-border/60 bg-card p-5 shadow-xs space-y-4'>
            <div className='flex items-center gap-2 border-b border-border/40 pb-3'>
              <CheckCircle2 className='h-5 w-5 text-emerald-500' />
              <div>
                <h3 className='font-bold text-sm text-foreground flex items-center gap-2'>
                  Opt-In Keywords
                  <span className='text-xs text-muted-foreground font-normal'>
                    ({optInKeywords.length} active)
                  </span>
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Inbound messages containing these words mark the contact as Opted-In (Yes)
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 min-h-24 content-start'>
              {optInKeywords.map((kw) => (
                <span
                  key={kw}
                  className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20'
                >
                  {kw}
                  <button
                    onClick={() => handleRemoveOptIn(kw)}
                    className='hover:text-emerald-800 cursor-pointer'
                    title='Remove keyword'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>

            <div className='flex gap-2 pt-2 border-t border-border/40'>
              <Input
                type='text'
                value={newOptIn}
                onChange={(e) => setNewOptIn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOptIn()}
                placeholder='Add keyword (e.g. START, CHALU)...'
                className='h-9 text-xs'
              />
              <Button size='sm' onClick={handleAddOptIn} variant='outline' className='h-9 text-xs gap-1'>
                <Plus className='h-3 w-3' /> Add
              </Button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
