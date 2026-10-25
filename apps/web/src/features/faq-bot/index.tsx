import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Play,
  Send,
  Sparkles,
  Copy,
  Check,
  Search,
  X,
  CheckCircle2,
  RefreshCw,
  Zap,
  Users,
  ShieldCheck,
  Headphones,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { veroxApi } from '@/lib/api'

export interface FAQRule {
  id: string
  name?: string
  keywords: string[]
  responseType: 'text' | 'template' | 'handoff' | 'optout'
  replyText: string
  reply?: string
  templateName?: string
  targetAgentName?: string
  category: 'Sales' | 'Operations' | 'Support' | 'Compliance' | 'General'
  active: boolean
  hits: number
  priority?: number
  createdAt?: string
  updatedAt?: string
}

export interface BotStats {
  totalRules: number
  activeRules: number
  disabledRules: number
  totalHits: number
  categoryBreakdown: Record<string, number>
  topRules: Array<{ id: string; name?: string; category: string; hits: number; keywords: string[] }>
}

const SAMPLE_QUICK_TESTS = [
  'What is the price of 10 GPS units?',
  'Fastag recharge kaise kare?',
  'Need help from a human support agent',
  'RTO certificate approval details',
  'Tell me about verox features',
]

const CATEGORIES: Array<{ key: string; label: string; color: string }> = [
  { key: 'all', label: 'All Categories', color: 'bg-muted text-muted-foreground' },
  { key: 'Sales', label: 'Sales & Pricing', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { key: 'Operations', label: 'Operations & FASTAG', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { key: 'Support', label: 'Support & Help', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { key: 'Compliance', label: 'Compliance & RTO', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { key: 'General', label: 'General Info', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
]

export function FAQBot() {
  const [rules, setRules] = useState<FAQRule[]>([])
  const [stats, setStats] = useState<BotStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Modal & Form States
  const [addModal, setAddModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQRule | null>(null)
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [nameInput, setNameInput] = useState('')
  const [categoryInput, setCategoryInput] = useState<'Sales' | 'Operations' | 'Support' | 'Compliance' | 'General'>('Sales')
  const [responseTypeInput, setResponseTypeInput] = useState<'text' | 'template' | 'handoff' | 'optout'>('text')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [targetAgentInput, setTargetAgentInput] = useState('')
  const [priorityInput, setPriorityInput] = useState<number>(5)

  // Simulator State
  const [testQuery, setTestQuery] = useState('')
  const [testResult, setTestResult] = useState<{
    reply: string
    matched?: boolean
    source?: string
    matchedKeyword?: string
    ruleTitle?: string
    responseType?: string
    aiDetails?: any
  } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Fetch Rules & Stats from Backend
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [rulesRes, statsRes] = await Promise.all([
        veroxApi.getBotRules(),
        veroxApi.getBotStats(),
      ])

      if (rulesRes?.data) {
        setRules(rulesRes.data)
      } else if (Array.isArray(rulesRes)) {
        setRules(rulesRes)
      }

      if (statsRes?.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      console.error('Failed to load bot rules:', err)
      toast.error('Failed to fetch FAQ Bot rules from server.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenAdd = () => {
    setEditingFaq(null)
    setNameInput('')
    setKeywordsInput('')
    setReplyInput('')
    setCategoryInput('Sales')
    setResponseTypeInput('text')
    setTargetAgentInput('')
    setPriorityInput(5)
    setAddModal(true)
  }

  const handleOpenEdit = (faq: FAQRule) => {
    setEditingFaq(faq)
    setNameInput(faq.name || '')
    setKeywordsInput(faq.keywords.join(', '))
    setReplyInput(faq.replyText || faq.reply || '')
    setCategoryInput(faq.category || 'Sales')
    setResponseTypeInput(faq.responseType || 'text')
    setTargetAgentInput(faq.targetAgentName || '')
    setPriorityInput(faq.priority || 5)
    setAddModal(true)
  }

  const handleSaveRule = async () => {
    if (!keywordsInput.trim()) {
      toast.error('Please enter at least one keyword.')
      return
    }

    if (!replyInput.trim() && responseTypeInput !== 'handoff') {
      toast.error('Please enter an automated reply message.')
      return
    }

    const kwArray = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    setIsSaving(true)
    try {
      if (editingFaq) {
        const payload = {
          name: nameInput.trim() || `Rule: ${kwArray[0]}`,
          keywords: kwArray,
          replyText: replyInput.trim(),
          reply: replyInput.trim(),
          category: categoryInput,
          responseType: responseTypeInput,
          targetAgentName: responseTypeInput === 'handoff' ? (targetAgentInput.trim() || 'Senior Support Advisor') : undefined,
          priority: Number(priorityInput) || 5,
        }

        const res = await veroxApi.updateBotRule(editingFaq.id, payload)
        if (res?.data) {
          setRules((prev) => prev.map((r) => (r.id === editingFaq.id ? res.data : r)))
        } else {
          setRules((prev) =>
            prev.map((r) =>
              r.id === editingFaq.id ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r
            )
          )
        }
        toast.success('FAQ Rule Updated Successfully!', {
          description: `Updated ${kwArray.length} trigger keywords for ${categoryInput}.`,
        })
      } else {
        const payload = {
          name: nameInput.trim() || `Rule: ${kwArray[0]}`,
          keywords: kwArray,
          replyText: replyInput.trim(),
          reply: replyInput.trim(),
          category: categoryInput,
          responseType: responseTypeInput,
          targetAgentName: responseTypeInput === 'handoff' ? (targetAgentInput.trim() || 'Senior Support Advisor') : undefined,
          priority: Number(priorityInput) || 5,
        }

        const res = await veroxApi.createBotRule(payload)
        if (res?.data) {
          setRules((prev) => [res.data, ...prev])
        } else {
          const fallbackRule: FAQRule = {
            id: `rule-${Date.now()}`,
            ...payload,
            active: true,
            hits: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setRules((prev) => [fallbackRule, ...prev])
        }

        toast.success('New FAQ Rule Created!', {
          description: `Active keywords: ${kwArray.join(', ')}`,
        })
      }

      setAddModal(false)
      // Refresh stats
      veroxApi.getBotStats().then((s) => s?.data && setStats(s.data)).catch(() => {})
    } catch (err: any) {
      console.error('Error saving FAQ rule:', err)
      toast.error(err?.message || 'Failed to save FAQ rule.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await veroxApi.deleteBotRule(id)
      setRules((prev) => prev.filter((r) => r.id !== id))
      toast.success('FAQ Rule Deleted Successfully.')
      setDeleteDialogId(null)
      veroxApi.getBotStats().then((s) => s?.data && setStats(s.data)).catch(() => {})
    } catch (err) {
      console.error('Failed to delete rule:', err)
      toast.error('Failed to delete rule from server.')
    }
  }

  const handleToggleRule = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive
    // Optimistic UI update
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: nextActive } : r)))

    try {
      await veroxApi.toggleBotRule(id, nextActive)
      toast.success(nextActive ? 'Rule Activated' : 'Rule Deactivated', {
        description: nextActive
          ? 'Bot is now auto-responding to these keywords in real time.'
          : 'Bot will bypass these keywords until re-enabled.',
      })
      veroxApi.getBotStats().then((s) => s?.data && setStats(s.data)).catch(() => {})
    } catch (err) {
      console.error('Failed to toggle rule:', err)
      // Revert optimistic update
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: currentActive } : r)))
      toast.error('Failed to update rule status on server.')
    }
  }

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to restore the default enterprise FAQ rules? Custom rules will be reset.')) {
      return
    }

    try {
      const res = await veroxApi.resetBotRules()
      if (res?.data) {
        setRules(res.data)
      }
      toast.success('Default FAQ rules restored successfully.')
      loadData(true)
    } catch (err) {
      console.error('Failed to reset rules:', err)
      toast.error('Failed to reset rules.')
    }
  }

  const handleRunSimulator = async (queryToTest?: string) => {
    const q = (queryToTest !== undefined ? queryToTest : testQuery).trim()
    if (!q) {
      toast.error('Please enter a message to test.')
      return
    }

    if (queryToTest !== undefined) {
      setTestQuery(queryToTest)
    }

    setIsSimulating(true)
    try {
      const res = await veroxApi.testBotQuery(q)

      if (res?.success) {
        setTestResult({
          reply: res.reply,
          matched: res.matched,
          source: res.source,
          matchedKeyword: res.matchedKeyword,
          ruleTitle: res.rule ? `${res.rule.name || res.rule.id} (${res.rule.category})` : undefined,
          responseType: res.responseType,
          aiDetails: res.aiDetails,
        })

        if (res.matched && res.rule) {
          // Increment hit counter in state
          setRules((prev) =>
            prev.map((r) => (r.id === res.rule.id ? { ...r, hits: (r.hits || 0) + 1 } : r))
          )
          // Also update stats totalHits
          setStats((prev) => (prev ? { ...prev, totalHits: prev.totalHits + 1 } : prev))

          toast.success(`Matched Keyword: "${res.matchedKeyword}"!`, {
            description: `Automated reply generated from ${res.rule.category} intent rule.`,
          })
        } else if (res.source === 'ai_rag_fallback') {
          toast.info('Grounded AI RAG Knowledge Assistant Triggered', {
            description: 'No exact keyword matched, so AI Knowledge Base formulated the reply.',
          })
        } else {
          toast.warning('No keyword match found. Escalated to Human Agent Desk.')
        }
      } else {
        toast.error('Simulation returned unexpected response.')
      }
    } catch (err) {
      console.error('Simulation error:', err)
      toast.error('Failed to test query against backend bot engine.')
    } finally {
      setIsSimulating(false)
    }
  }

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Reply text copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered Rules
  const filteredRules = rules.filter((r) => {
    const matchesCat =
      selectedCategory === 'all' ||
      r.category?.toLowerCase() === selectedCategory.toLowerCase()

    const searchLower = search.toLowerCase().trim()
    if (!searchLower) return matchesCat

    const matchesSearch =
      r.keywords.some((kw) => kw.toLowerCase().includes(searchLower)) ||
      (r.replyText && r.replyText.toLowerCase().includes(searchLower)) ||
      (r.reply && r.reply.toLowerCase().includes(searchLower)) ||
      (r.name && r.name.toLowerCase().includes(searchLower)) ||
      (r.category && r.category.toLowerCase().includes(searchLower))

    return matchesCat && matchesSearch
  })

  const totalHitsCount = stats?.totalHits || rules.reduce((acc, r) => acc + (r.hits || 0), 0)
  const activeRulesCount = stats?.activeRules ?? rules.filter((r) => r.active).length

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Bot className='h-4 w-4 text-orange-600' />
          <span>FAQ Bot Auto-Responder</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        {/* Page Heading & Header Actions */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              FAQ Bot
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono font-semibold'>
                NLP KEYWORD ENGINE
              </Badge>
              <Badge className='bg-orange-500/15 text-orange-600 border-0 text-[10px] font-mono'>
                META WABA COMPLIANT
              </Badge>
            </h1>
            <p className='text-xs text-muted-foreground'>
              Instant automated answers triggered when inbound customer WhatsApp messages match configured intent keywords
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => loadData(true)}
              disabled={refreshing}
              className='h-8 text-xs font-medium gap-1.5'
              title='Refresh rules and stats from server'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleResetDefaults}
              className='h-8 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground'
              title='Restore default preset rules'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Reset
            </Button>
            <Button
              size='sm'
              onClick={handleOpenAdd}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 font-semibold shadow-xs h-8 text-xs'
            >
              <Plus className='h-3.5 w-3.5' />
              Add FAQ Rule
            </Button>
          </div>
        </div>

        {/* 4 Top Enterprise Metrics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {/* Metric 1 */}
          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs space-y-2 hover:border-orange-500/30 transition-all'>
            <div className='flex items-center justify-between text-muted-foreground text-xs'>
              <span className='font-medium'>Active FAQ Rules</span>
              <div className='h-7 w-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center'>
                <Bot className='h-4 w-4' />
              </div>
            </div>
            <div className='flex items-baseline justify-between'>
              <div className='text-2xl font-bold tracking-tight text-foreground'>
                {loading ? '...' : `${activeRulesCount} / ${rules.length}`}
              </div>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                Operational
              </Badge>
            </div>
            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
              <Zap className='h-3 w-3 text-emerald-500' />
              <span>24/7 automated intent triage</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs space-y-2 hover:border-blue-500/30 transition-all'>
            <div className='flex items-center justify-between text-muted-foreground text-xs'>
              <span className='font-medium'>Resolved Automatically</span>
              <div className='h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center'>
                <TrendingUp className='h-4 w-4' />
              </div>
            </div>
            <div className='flex items-baseline justify-between'>
              <div className='text-2xl font-bold tracking-tight text-foreground'>
                {loading ? '...' : totalHitsCount.toLocaleString()}
              </div>
              <Badge className='bg-blue-500/15 text-blue-600 border-0 text-[10px] font-semibold'>
                Zero Latency
              </Badge>
            </div>
            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
              <CheckCircle2 className='h-3 w-3 text-blue-500' />
              <span>Instant sub-50ms WhatsApp replies</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs space-y-2 hover:border-purple-500/30 transition-all'>
            <div className='flex items-center justify-between text-muted-foreground text-xs'>
              <span className='font-medium'>NLP Match Engine</span>
              <div className='h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center'>
                <Sparkles className='h-4 w-4' />
              </div>
            </div>
            <div className='flex items-baseline justify-between'>
              <div className='text-lg font-bold tracking-tight text-foreground truncate'>
                Boundary & Intent
              </div>
              <Badge className='bg-purple-500/15 text-purple-600 border-0 text-[10px] font-semibold'>
                RegEx & Fuzzy
              </Badge>
            </div>
            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
              <ShieldCheck className='h-3 w-3 text-purple-500' />
              <span>Zero false positive isolation</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs space-y-2 hover:border-emerald-500/30 transition-all'>
            <div className='flex items-center justify-between text-muted-foreground text-xs'>
              <span className='font-medium'>Fallback Escalation</span>
              <div className='h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
                <Headphones className='h-4 w-4' />
              </div>
            </div>
            <div className='flex items-baseline justify-between'>
              <div className='text-lg font-bold tracking-tight text-foreground truncate'>
                AI RAG + Live Desk
              </div>
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-semibold'>
                Connected
              </Badge>
            </div>
            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
              <Users className='h-3 w-3 text-emerald-500' />
              <span>Auto handoff on unmatched queries</span>
            </div>
          </div>
        </div>

        {/* Live Simulator Widget */}
        <div className='rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3 shadow-xs'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs font-bold text-orange-600'>
              <Play className='h-3.5 w-3.5 fill-orange-600' />
              <span>Interactive Keyword Rule Tester</span>
            </div>
            <span className='text-[10px] text-muted-foreground'>
              Simulate real WhatsApp inbound queries against live backend engine
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleRunSimulator()
            }}
            className='flex gap-2'
          >
            <Input
              placeholder='Type a simulated customer message (e.g. "what is the gps price?")...'
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className='text-xs bg-background h-9'
            />
            <Button
              type='submit'
              size='sm'
              disabled={isSimulating}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shrink-0 font-bold h-9 text-xs'
            >
              {isSimulating ? (
                <>
                  <Sparkles className='h-3.5 w-3.5 animate-spin' /> Evaluating...
                </>
              ) : (
                <>
                  <Send className='h-3.5 w-3.5' /> Test Reply
                </>
              )}
            </Button>
          </form>

          {/* Quick preset chips */}
          <div className='flex items-center gap-1.5 flex-wrap pt-0.5'>
            <span className='text-[11px] text-muted-foreground font-medium'>Try sample query:</span>
            {SAMPLE_QUICK_TESTS.map((sample) => (
              <button
                key={sample}
                type='button'
                onClick={() => handleRunSimulator(sample)}
                className='text-[10px] bg-background hover:bg-orange-500/10 hover:text-orange-600 text-muted-foreground border border-border/60 px-2 py-0.5 rounded-full transition-colors cursor-pointer'
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Simulation Output Card */}
          {testResult && (
            <div className='p-3 bg-card rounded-lg border border-border/60 text-xs leading-relaxed space-y-2 shadow-2xs'>
              <div className='flex items-center justify-between flex-wrap gap-2'>
                <div className='flex items-center gap-2 flex-wrap'>
                  {testResult.matched && (
                    <div className='flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold'>
                      <CheckCircle2 className='h-3.5 w-3.5' />
                      <span>Matched Keyword: "{testResult.matchedKeyword}"</span>
                    </div>
                  )}

                  {testResult.source === 'ai_rag_fallback' && (
                    <div className='flex items-center gap-1.5 text-[11px] text-purple-600 font-bold'>
                      <Sparkles className='h-3.5 w-3.5' />
                      <span>Grounded AI RAG Knowledge Fallback</span>
                    </div>
                  )}

                  {testResult.source === 'unhandled' && (
                    <div className='flex items-center gap-1.5 text-[11px] text-amber-600 font-bold'>
                      <AlertTriangle className='h-3.5 w-3.5' />
                      <span>No Direct Keyword Match</span>
                    </div>
                  )}

                  {testResult.ruleTitle && (
                    <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-0'>
                      {testResult.ruleTitle}
                    </Badge>
                  )}

                  {testResult.responseType && (
                    <Badge variant='outline' className='text-[10px] uppercase font-mono'>
                      Type: {testResult.responseType}
                    </Badge>
                  )}
                </div>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    navigator.clipboard.writeText(testResult.reply)
                    toast.success('Simulation reply copied!')
                  }}
                  className='h-6 text-[10px] px-2 text-muted-foreground'
                >
                  <Copy className='h-3 w-3 mr-1' /> Copy Output
                </Button>
              </div>

              <div className='text-foreground p-2.5 rounded bg-muted/40 border border-border/30 whitespace-pre-wrap font-sans text-xs'>
                <strong className='text-orange-600'>Bot Trigger Output: </strong>
                {testResult.reply}
              </div>
            </div>
          )}
        </div>

        {/* Category Filters & Search Bar */}
        <div className='space-y-3 pt-1'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key
              const count =
                cat.key === 'all'
                  ? rules.length
                  : rules.filter((r) => r.category?.toLowerCase() === cat.key.toLowerCase()).length

              return (
                <button
                  key={cat.key}
                  type='button'
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
            <div>
              <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Configured FAQ Rules & Automations
              </div>
              <div className='text-xs text-muted-foreground font-mono'>
                Showing {filteredRules.length} of {rules.length} Rules
              </div>
            </div>

            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search keywords or reply text...'
                className='h-8 pl-8 pr-7 text-xs bg-background'
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className='absolute right-2 top-2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rules List Cards */}
        <div className='space-y-3'>
          {loading ? (
            <div className='p-12 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl bg-card'>
              <RefreshCw className='h-6 w-6 animate-spin mx-auto text-orange-600' />
              <div className='text-xs font-medium'>Loading FAQ Bot automation rules from server...</div>
            </div>
          ) : filteredRules.length > 0 ? (
            filteredRules.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-xl border bg-card p-4 shadow-xs space-y-3 transition-all ${
                  faq.active
                    ? 'border-border/60 hover:border-orange-500/40'
                    : 'border-border/30 opacity-60 bg-muted/20'
                }`}
              >
                {/* Header row: Categories, Keywords, Stats & Controls */}
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] font-semibold border ${
                          faq.category === 'Sales'
                            ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                            : faq.category === 'Operations'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                            : faq.category === 'Support'
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                            : faq.category === 'Compliance'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {faq.category || 'General'}
                      </Badge>

                      {faq.name && (
                        <span className='text-xs font-bold text-foreground'>{faq.name}</span>
                      )}

                      {faq.responseType && faq.responseType !== 'text' && (
                        <Badge variant='outline' className='text-[9px] font-mono uppercase bg-muted/50'>
                          Action: {faq.responseType}
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <span className='text-[11px] font-semibold text-muted-foreground'>Trigger Keywords:</span>
                      <div className='flex flex-wrap gap-1'>
                        {faq.keywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant='outline'
                            className='text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/30 font-mono font-medium'
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Hit Counter */}
                  <div className='flex items-center gap-1.5 self-end sm:self-auto shrink-0'>
                    <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-mono'>
                      {(faq.hits || 0).toLocaleString()} triggers resolved
                    </Badge>

                    <Button
                      variant={faq.active ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => handleToggleRule(faq.id, faq.active)}
                      className={`h-7 text-[11px] px-2.5 font-semibold ${
                        faq.active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                      }`}
                    >
                      {faq.active ? 'Active' : 'Disabled'}
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopyReply(faq.id, faq.replyText || faq.reply || '')}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
                      title='Copy automated reply'
                    >
                      {copiedId === faq.id ? (
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                      ) : (
                        <Copy className='h-3.5 w-3.5' />
                      )}
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleOpenEdit(faq)}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
                      title='Edit FAQ rule'
                    >
                      <Edit2 className='h-3.5 w-3.5' />
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setDeleteDialogId(faq.id)}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-rose-600'
                      title='Delete FAQ rule'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>

                {/* Automated Reply Box */}
                <div className='rounded-lg bg-muted/30 p-3 text-xs leading-relaxed text-foreground border border-border/40 whitespace-pre-wrap font-sans'>
                  <strong className='text-orange-600'>Automated Reply: </strong>
                  {faq.replyText || faq.reply}
                </div>

                {/* Extra info for Handoff or Optout */}
                {faq.responseType === 'handoff' && (
                  <div className='text-[11px] text-purple-600 flex items-center gap-1.5 font-medium'>
                    <Headphones className='h-3 w-3' />
                    <span>Auto assigns chat to {faq.targetAgentName || 'Senior Support Advisor'} and tags as "Agent Required".</span>
                  </div>
                )}
                {faq.responseType === 'optout' && (
                  <div className='text-[11px] text-emerald-600 flex items-center gap-1.5 font-medium'>
                    <ShieldCheck className='h-3 w-3' />
                    <span>Automatically unsubscribes contact from broadcasts to maintain Meta 100% Quality Rating.</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card space-y-3'>
              <Bot className='h-8 w-8 mx-auto text-muted-foreground/50' />
              <div className='text-sm font-semibold text-foreground'>No FAQ rules found</div>
              <div className='text-xs'>
                {search
                  ? `No rules match your search "${search}". Try clearing search filter.`
                  : 'Get started by creating your first automated keyword response rule.'}
              </div>
              <Button
                size='sm'
                onClick={handleOpenAdd}
                className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold'
              >
                <Plus className='h-3.5 w-3.5 mr-1' /> Create First FAQ Rule
              </Button>
            </div>
          )}
        </div>
      </Main>

      {/* Add / Edit FAQ Dialog */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-orange-600' />
              {editingFaq ? 'Edit FAQ Automation Rule' : 'Create New FAQ Automation Rule'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Configure keywords that instantly trigger automatic WhatsApp answers or agent routing on port 4000.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Rule Label / Name</Label>
                <Input
                  placeholder='e.g. GPS Fleet Pricing'
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className='text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Category</Label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as any)}
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:border-orange-500'
                >
                  <option value='Sales'>Sales & Pricing</option>
                  <option value='Operations'>Operations & FASTAG</option>
                  <option value='Support'>Support & Human Help</option>
                  <option value='Compliance'>Compliance & MoRTH</option>
                  <option value='General'>General Inquiries</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Action / Response Type</Label>
                <select
                  value={responseTypeInput}
                  onChange={(e) => setResponseTypeInput(e.target.value as any)}
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:border-orange-500'
                >
                  <option value='text'>Direct Text Message Reply</option>
                  <option value='handoff'>Escalate / Handoff to Human Agent</option>
                  <option value='optout'>Process Opt-out / Unsubscribe</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Priority Weight (1-10)</Label>
                <Input
                  type='number'
                  min={1}
                  max={10}
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(Number(e.target.value))}
                  className='text-xs'
                />
              </div>
            </div>

            {responseTypeInput === 'handoff' && (
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Target Support Agent / Department</Label>
                <Input
                  placeholder='e.g. Senior Gujarat Logistics Advisor'
                  value={targetAgentInput}
                  onChange={(e) => setTargetAgentInput(e.target.value)}
                  className='text-xs'
                />
              </div>
            )}

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Trigger Keywords (comma separated)</Label>
              <Input
                placeholder='e.g. price, pricing, cost, rate, charges, bhav, discount'
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className='text-xs'
              />
              <span className='text-[10px] text-muted-foreground'>
                Keywords are automatically lowercased and matched using intelligent word boundaries.
              </span>
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-semibold'>Automated Response Message</Label>
                <span className='text-[10px] text-muted-foreground font-mono'>
                  {replyInput.length} chars
                </span>
              </div>
              <Textarea
                rows={4}
                placeholder='Type the exact text reply sent to the customer on WhatsApp...'
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className='text-xs leading-relaxed'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setAddModal(false)}
              disabled={isSaving}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSaveRule}
              disabled={isSaving}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold'
            >
              {isSaving ? (
                <>
                  <RefreshCw className='h-3.5 w-3.5 animate-spin mr-1' /> Saving...
                </>
              ) : editingFaq ? (
                'Update Rule'
              ) : (
                'Save FAQ Rule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-rose-600'>
              <Trash2 className='h-4 w-4' />
              Delete FAQ Rule?
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Are you sure you want to permanently delete this automated response rule? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setDeleteDialogId(null)} className='text-xs'>
              Cancel
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => deleteDialogId && handleDeleteRule(deleteDialogId)}
              className='text-xs font-bold'
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
