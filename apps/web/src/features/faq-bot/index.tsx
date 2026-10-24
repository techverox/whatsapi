import { useState } from 'react'
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

interface FAQRule {
  id: string
  keywords: string[]
  reply: string
  active: boolean
  hits: number
  category?: string
}

const initialFAQs: FAQRule[] = [
  {
    id: 'faq-1',
    keywords: ['price', 'pricing', 'rate', 'cost', 'bhav', 'discount'],
    reply: '🚚 Our Truck Sathi AIS-140 GPS begins at ₹2,999/unit including 1-year government portal subscription, live SIM data, and instant Gujarat fitment.',
    active: true,
    hits: 1420,
    category: 'Sales',
  },
  {
    id: 'faq-2',
    keywords: ['fastag', 'recharge', 'toll', 'balance', 'wallet'],
    reply: '⚡ Instant Commercial Fastag issuance and automatic wallet top-up for 10-wheeler to 14-wheeler trucks. Send your vehicle RC copy to activate.',
    active: true,
    hits: 890,
    category: 'Operations',
  },
  {
    id: 'faq-3',
    keywords: ['support', 'agent', 'help', 'human', 'call', 'officer'],
    reply: '👤 Connecting you to our senior Gujarat fleet logistics advisor. Please hold on while an executive contacts you in 2 minutes.',
    active: true,
    hits: 615,
    category: 'Support',
  },
  {
    id: 'faq-4',
    keywords: ['certificate', 'ais140', 'rto', 'morth', 'pass'],
    reply: '📜 All Truck Sathi GPS units come with MoRTH approved AIS-140 Certificates and SOS panic buttons synced to the Gujarat State Emergency Command Portal.',
    active: true,
    hits: 412,
    category: 'Compliance',
  },
]

const SAMPLE_QUICK_TESTS = [
  'What is the price of 10 GPS units?',
  'Fastag recharge kaise kare?',
  'Need help from a human support agent',
  'RTO certificate approval details',
]

export function FAQBot() {
  const [faqs, setFaqs] = useState<FAQRule[]>(() => {
    try {
      const saved = localStorage.getItem('verox_faq_rules_v1')
      if (saved) return JSON.parse(saved)
    } catch {}
    return initialFAQs
  })
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQRule | null>(null)
  const [keywordsInput, setKeywordsInput] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Sales')

  // Simulator State
  const [testQuery, setTestQuery] = useState('')
  const [testResult, setTestResult] = useState<{ reply: string; matchedKw?: string; ruleTitle?: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isAiAnswering, setIsAiAnswering] = useState(false)

  const saveFaqs = (updated: FAQRule[]) => {
    setFaqs(updated)
    try {
      localStorage.setItem('verox_faq_rules_v1', JSON.stringify(updated))
    } catch {}
  }

  const handleOpenAdd = () => {
    setEditingFaq(null)
    setKeywordsInput('')
    setReplyInput('')
    setCategoryInput('Sales')
    setAddModal(true)
  }

  const handleOpenEdit = (faq: FAQRule) => {
    setEditingFaq(faq)
    setKeywordsInput(faq.keywords.join(', '))
    setReplyInput(faq.reply)
    setCategoryInput(faq.category || 'Sales')
    setAddModal(true)
  }

  const handleSave = () => {
    if (!keywordsInput.trim() || !replyInput.trim()) {
      toast.error('Please enter keywords and a reply.')
      return
    }

    const kwArray = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    if (editingFaq) {
      const updated = faqs.map((f) =>
        f.id === editingFaq.id
          ? { ...f, keywords: kwArray, reply: replyInput.trim(), category: categoryInput }
          : f
      )
      saveFaqs(updated)
      toast.success('FAQ Rule Updated Successfully!')
    } else {
      const newRule: FAQRule = {
        id: `faq-${Date.now()}`,
        keywords: kwArray,
        reply: replyInput.trim(),
        category: categoryInput,
        active: true,
        hits: 0,
      }
      saveFaqs([newRule, ...faqs])
      toast.success('New FAQ Rule Created!', {
        description: `Trigger keywords: ${kwArray.join(', ')}`,
      })
    }

    setAddModal(false)
  }

  const handleDelete = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id)
    saveFaqs(updated)
    toast.info('FAQ Rule Deleted.')
  }

  const handleToggleActive = (id: string) => {
    const updated = faqs.map((f) => {
      if (f.id === id) {
        const next = !f.active
        toast(next ? 'Rule Enabled' : 'Rule Disabled', {
          description: next ? 'Bot is now auto-responding to these keywords.' : 'Bot will ignore these keywords.',
        })
        return { ...f, active: next }
      }
      return f
    })
    saveFaqs(updated)
  }

  const handleRunSimulator = async (queryToTest?: string) => {
    const q = (queryToTest !== undefined ? queryToTest : testQuery).trim().toLowerCase()
    if (!q) {
      toast.error('Please enter a message to test.')
      return
    }
    if (queryToTest !== undefined) {
      setTestQuery(queryToTest)
    }

    let foundKeyword = ''
    const matched = faqs.find((f) => {
      if (!f.active) return false
      const match = f.keywords.find((kw) => q.includes(kw))
      if (match) {
        foundKeyword = match
        return true
      }
      return false
    })

    if (matched) {
      const updated = faqs.map((f) => (f.id === matched.id ? { ...f, hits: f.hits + 1 } : f))
      saveFaqs(updated)
      setTestResult({
        reply: matched.reply,
        matchedKw: foundKeyword,
        ruleTitle: `Rule #${matched.id} (${matched.category})`,
      })
      toast.success(`Matched Keyword: "${foundKeyword}"!`, {
        description: 'Auto-reply triggered and sent to customer.',
      })
    } else {
      // Connect to RAG backend AI query for smart fallback
      setIsAiAnswering(true)
      try {
        const res = await fetch('http://localhost:4000/api/v1/ai/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        })
        if (res.ok) {
          const aiJson = await res.json()
          if (aiJson.answer) {
            setTestResult({
              reply: `🤖 [AI RAG Smart Reply]: ${aiJson.answer}`,
              ruleTitle: 'AI Knowledge Assistant Fallback',
            })
            setIsAiAnswering(false)
            toast.success('Grounded AI Assistant Generated Auto-Reply!')
            return
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
      setIsAiAnswering(false)

      setTestResult({
        reply: '🤖 No keyword rule matched. Inbound message routed to Human Agent Inbox on Port 4000.',
      })
      toast.info('No rule matched. Forwarded to Agent Desk.')
    }
  }

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Reply text copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredFaqs = faqs.filter(
    (f) =>
      f.keywords.some((kw) => kw.toLowerCase().includes(search.toLowerCase())) ||
      f.reply.toLowerCase().includes(search.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(search.toLowerCase()))
  )

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
        {/* Heading */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              FAQ Bot
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono font-semibold'>
                NLP KEYWORD ENGINE
              </Badge>
            </h1>
            <p className='text-xs text-muted-foreground'>
              Instant automated answers triggered when inbound customer messages match intent keywords
            </p>
          </div>
          <Button
            size='sm'
            onClick={handleOpenAdd}
            className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 font-semibold shadow-xs h-8 text-xs'
          >
            <Plus className='h-3.5 w-3.5' />
            Add FAQ Rule
          </Button>
        </div>

        {/* Live Simulator Widget */}
        <div className='rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3 shadow-xs'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-xs font-bold text-orange-600'>
              <Play className='h-3.5 w-3.5 fill-orange-600' />
              <span>Interactive Keyword Rule Tester</span>
            </div>
            <span className='text-[10px] text-muted-foreground'>Simulate real WhatsApp customer queries</span>
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
              disabled={isAiAnswering}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shrink-0 font-bold h-9 text-xs'
            >
              {isAiAnswering ? (
                <>
                  <Sparkles className='h-3.5 w-3.5 animate-spin' /> Generating AI Reply...
                </>
              ) : (
                <>
                  <Send className='h-3.5 w-3.5' /> Test Reply
                </>
              )}
            </Button>
          </form>

          {/* Quick preset chips */}
          <div className='flex items-center gap-1.5 flex-wrap pt-1'>
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

          {testResult && (
            <div className='p-3 bg-card rounded-lg border border-border/60 text-xs leading-relaxed space-y-1 shadow-2xs'>
              {testResult.matchedKw && (
                <div className='flex items-center gap-2 text-[11px] text-emerald-600 font-bold'>
                  <CheckCircle2 className='h-3.5 w-3.5' />
                  <span>Matched Keyword: "{testResult.matchedKw}"</span>
                  <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-0'>
                    {testResult.ruleTitle}
                  </Badge>
                </div>
              )}
              <div className='text-foreground pt-0.5'>
                <span className='font-bold text-orange-600'>Bot Trigger Output: </span>
                {testResult.reply}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar & Rules Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1'>
          <div>
            <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Active FAQ Rules & Automations
            </div>
            <div className='text-xs text-muted-foreground font-mono'>
              {filteredFaqs.length} of {faqs.length} Rules Configured
            </div>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search keywords or reply...'
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

        {/* Rules List */}
        <div className='space-y-3'>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-xl border bg-card p-4 shadow-xs space-y-3 transition-all ${
                  faq.active
                    ? 'border-border/60 hover:border-orange-500/40'
                    : 'border-border/30 opacity-60 bg-muted/20'
                }`}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs font-semibold text-muted-foreground'>Trigger Keywords:</span>
                    <div className='flex flex-wrap gap-1.5'>
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

                  <div className='flex items-center gap-1.5 self-end sm:self-auto'>
                    <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-mono'>
                      {faq.hits.toLocaleString()} triggers resolved
                    </Badge>
                    <Button
                      variant={faq.active ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => handleToggleActive(faq.id)}
                      className={`h-7 text-[11px] px-2.5 font-semibold ${
                        faq.active ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                      }`}
                    >
                      {faq.active ? 'Active' : 'Disabled'}
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopyReply(faq.id, faq.reply)}
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
                      onClick={() => handleDelete(faq.id)}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-rose-600'
                      title='Delete FAQ rule'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>

                <div className='rounded-lg bg-muted/30 p-3 text-xs leading-relaxed text-foreground border border-border/40'>
                  <strong className='text-orange-600'>Automated Reply:</strong> {faq.reply}
                </div>
              </div>
            ))
          ) : (
            <div className='p-8 text-center text-muted-foreground border border-dashed rounded-xl'>
              No FAQ rules found matching "{search}".
            </div>
          )}
        </div>
      </Main>

      {/* Add / Edit FAQ Dialog */}
      <Dialog open={addModal} onOpenChange={setAddModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-orange-600' />
              {editingFaq ? 'Edit FAQ Rule' : 'Create New FAQ Rule'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Define comma-separated keywords and the corresponding instant WhatsApp message response.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Category</Label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden focus:border-orange-500'
              >
                <option value='Sales'>Sales & Pricing</option>
                <option value='Operations'>Fleet & FASTAG Operations</option>
                <option value='Support'>Customer & Technician Support</option>
                <option value='Compliance'>RTO & MoRTH Compliance</option>
              </select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Trigger Keywords (comma separated)</Label>
              <Input
                placeholder='e.g. price, pricing, cost, rate, charges, bhav'
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Automated Response Text</Label>
              <Textarea
                rows={4}
                placeholder='Type the exact text reply sent to the customer...'
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className='text-xs leading-relaxed'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' size='sm' onClick={() => setAddModal(false)} className='text-xs'>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSave} className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold'>
              {editingFaq ? 'Update Rule' : 'Save FAQ Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
