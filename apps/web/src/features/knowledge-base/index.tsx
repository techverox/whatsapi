import { useState, useEffect, useCallback } from 'react'
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  ArrowRight,
  FileText,
  Lightbulb,
  Edit3,
  FolderPlus,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Database,
  Cpu,
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
import { Link } from '@tanstack/react-router'
import { veroxApi } from '@/lib/api'

export interface ArticleItem {
  id: string
  title: string
  summary: string
  content: string
  tokens: number
  chunks: number
  readTime: string
  updatedAt: string
  featured?: boolean
  routeLink?: string
  categoryId?: string
  tags?: string[]
}

export interface CategoryGroup {
  id: string
  name: string
  iconColor: string
  description?: string
  displayOrder?: number
  articles: ArticleItem[]
}

export function KnowledgeBase() {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Selected state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('dashboard')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    dashboard: true,
    manage: true,
    integrations: true,
    inbox: false,
    contacts: false,
    campaigns: false,
    'faq-bot': false,
    chatbot: false,
    'ai-assistant': true,
    flows: true,
    developers: false,
    gallery: false,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncingAI, setIsSyncingAI] = useState(false)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false)

  // Form states - Add Article
  const [newTitle, setNewTitle] = useState('')
  const [newCategoryTarget, setNewCategoryTarget] = useState('dashboard')
  const [newContent, setNewContent] = useState('')

  // Form states - Edit Article
  const [editArticleId, setEditArticleId] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editCategoryTarget, setEditCategoryTarget] = useState('dashboard')
  const [editContent, setEditContent] = useState('')

  // Form states - Add Category
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('bg-orange-500')

  // Load from API
  const loadCategories = useCallback(async (query?: string) => {
    try {
      const res = await veroxApi.getKnowledgeBaseCategories(query)
      if (res?.data && Array.isArray(res.data)) {
        setCategories(res.data)
        // Auto-expand categories with articles
        const expandMap: Record<string, boolean> = {}
        res.data.forEach((c: CategoryGroup, idx: number) => {
          expandMap[c.id] = idx < 3 || c.articles.length > 0
        })
        setExpandedCategories((prev) => ({ ...expandMap, ...prev }))
      }
    } catch (_err) {
      // Graceful local cache fallback
      try {
        const saved = localStorage.getItem('whatsapi_kb_categories_v2')
        if (saved) setCategories(JSON.parse(saved))
      } catch (_e) {
        // ignore
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()

    // Realtime WebSocket listener for knowledge base sync
    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('ws://localhost:4000')
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (
            msg.type === 'kb_article_created' ||
            msg.type === 'kb_article_updated' ||
            msg.type === 'kb_article_deleted' ||
            msg.type === 'kb_category_created' ||
            msg.type === 'kb_synced_ai' ||
            msg.type === 'kb_reset_defaults'
          ) {
            loadCategories()
          }
        } catch (_err) {
          // ignore
        }
      }
    } catch (_err) {
      // ignore
    }

    return () => {
      if (ws) ws.close()
    }
  }, [loadCategories])

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))
  }

  // Active Category & Active Article
  const activeCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0]
  const activeArticle =
    selectedArticleId
      ? categories
          .flatMap((c) => c.articles)
          .find((a) => a.id === selectedArticleId) || null
      : null

  // Filtered categories based on search
  const filteredCategories = categories
    .map((cat) => {
      if (!searchQuery.trim()) return cat
      const q = searchQuery.toLowerCase()
      const matchingArticles = cat.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      )
      return {
        ...cat,
        articles: matchingArticles,
      }
    })
    .filter((cat) => cat.articles.length > 0 || !searchQuery.trim())

  const handleSelectArticle = (catId: string, articleId: string) => {
    setSelectedCategoryId(catId)
    setSelectedArticleId(articleId)
  }

  // 1. Sync to AI
  const handleSyncToAI = async () => {
    setIsSyncingAI(true)
    toast.info('Vectorizing Knowledge Base for AI Assistant...', {
      description: 'Generating high-dimensional vector embeddings across all active categories.',
    })

    try {
      const res = await veroxApi.syncKnowledgeBaseToAI()
      const totalArticles = res?.data?.totalArticles || categories.reduce((sum, c) => sum + c.articles.length, 0)
      const totalTokens = res?.data?.totalTokens || categories.reduce(
        (sum, c) => sum + c.articles.reduce((aSum, a) => aSum + a.tokens, 0),
        0
      )
      toast.success('RAG Knowledge Base 100% Synchronized!', {
        description: `${totalArticles} verified articles (${totalTokens.toLocaleString()} tokens) are active and queryable by AI Assistant.`,
      })
    } catch (_err) {
      toast.error('AI Sync request failed. Check API Gateway status.')
    } finally {
      setIsSyncingAI(false)
    }
  }

  // 2. Create Article
  const handleCreateArticle = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter article title and documentation content.')
      return
    }

    try {
      const res = await veroxApi.createKnowledgeArticle({
        title: newTitle.trim(),
        categoryId: newCategoryTarget,
        content: newContent.trim(),
      })

      if (res?.data) {
        const created = res.data
        setSelectedCategoryId(newCategoryTarget)
        setSelectedArticleId(created.id)
        setExpandedCategories((prev) => ({ ...prev, [newCategoryTarget]: true }))
        setNewTitle('')
        setNewContent('')
        setAddModalOpen(false)
        await loadCategories()
        toast.success('Article Created & Vectorized!', {
          description: `"${created.title}" added to ${newCategoryTarget} category and synced with AI store.`,
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create article.')
    }
  }

  // 3. Open Edit Article Modal
  const handleOpenEditArticle = (art: ArticleItem, catId: string) => {
    setEditArticleId(art.id)
    setEditTitle(art.title)
    setEditCategoryTarget(catId)
    setEditContent(art.content)
    setEditModalOpen(true)
  }

  // 4. Update Article
  const handleUpdateArticle = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Article title and content cannot be empty.')
      return
    }

    try {
      const res = await veroxApi.updateKnowledgeArticle(editArticleId, {
        title: editTitle.trim(),
        categoryId: editCategoryTarget,
        content: editContent.trim(),
      })

      if (res?.data) {
        setEditModalOpen(false)
        await loadCategories()
        toast.success('Article Updated & Re-indexed!', {
          description: `"${res.data.title}" has been updated with fresh embeddings.`,
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update article.')
    }
  }

  // 5. Delete Article
  const handleDeleteArticle = async (articleId: string) => {
    try {
      await veroxApi.deleteKnowledgeArticle(articleId)
      setSelectedArticleId(null)
      await loadCategories()
      toast.info('Article removed from Knowledge Base.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete article.')
    }
  }

  // 6. Create New Category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required.')
      return
    }

    try {
      const res = await veroxApi.createKnowledgeCategory({
        name: newCategoryName.trim(),
        iconColor: newCategoryColor,
      })

      if (res?.data) {
        setAddCategoryModalOpen(false)
        setNewCategoryName('')
        await loadCategories()
        toast.success(`Category "${res.data.name}" Created!`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category.')
    }
  }

  // 7. Export Knowledge Base JSON
  const handleExportKB = async () => {
    try {
      const res = await veroxApi.exportKnowledgeBase()
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res?.data || categories, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `whatsapi_kb_export_${Date.now()}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('Knowledge Base exported as JSON!')
    } catch (_err) {
      toast.error('Failed to export Knowledge Base.')
    }
  }

  // 8. Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all knowledge base documentation to default factory seed articles?')) {
      return
    }
    try {
      await veroxApi.resetKnowledgeBase()
      await loadCategories()
      setSelectedArticleId(null)
      toast.success('Knowledge Base restored to factory defaults.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset Knowledge Base.')
    }
  }

  const totalArticlesCount = categories.reduce((acc, c) => acc + c.articles.length, 0)
  const totalTokensCount = categories.reduce(
    (acc, c) => acc + c.articles.reduce((aAcc, a) => aAcc + (a.tokens || 0), 0),
    0
  )

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-orange-600' />
          <span>Knowledge Base</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4'>
        {/* Top Header Row with Actions */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                Knowledge Base
              </h1>
              <Badge variant='outline' className='text-xs font-mono border-orange-500/40 text-orange-600 dark:text-orange-400'>
                {totalArticlesCount} Articles Active
              </Badge>
              <Badge variant='secondary' className='text-[10px] font-mono gap-1 hidden sm:flex'>
                <Cpu className='h-3 w-3 text-emerald-500' />
                {totalTokensCount.toLocaleString()} Tokens Vectorized
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Browse documentation, SOP guidelines, and sync verified facts to your AI Assistant.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0 flex-wrap'>
            <Button
              id='btn-export-kb'
              variant='outline'
              size='sm'
              onClick={handleExportKB}
              className='h-8 text-xs gap-1.5 cursor-pointer font-medium'
              title='Export complete documentation as JSON'
            >
              <Download className='h-3.5 w-3.5' />
              Export
            </Button>
            <Button
              id='btn-reset-kb'
              variant='outline'
              size='sm'
              onClick={handleResetDefaults}
              className='h-8 text-xs gap-1.5 cursor-pointer font-medium text-muted-foreground hover:text-foreground'
              title='Reset to initial factory documentation'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Reset
            </Button>
            <Button
              id='btn-sync-ai'
              variant='outline'
              size='sm'
              disabled={isSyncingAI}
              onClick={handleSyncToAI}
              className='h-8 text-xs gap-1.5 cursor-pointer font-medium border-orange-500/40 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAI ? 'animate-spin text-orange-600' : ''}`} />
              {isSyncingAI ? 'Syncing Embeddings...' : 'Sync to AI Chatbot'}
            </Button>
            <Button
              id='btn-add-category'
              variant='outline'
              size='sm'
              onClick={() => setAddCategoryModalOpen(true)}
              className='h-8 text-xs gap-1.5 cursor-pointer font-medium'
            >
              <FolderPlus className='h-3.5 w-3.5 text-orange-600' />
              + Category
            </Button>
            <Button
              id='btn-add-article'
              size='sm'
              onClick={() => {
                setNewCategoryTarget(selectedCategoryId || categories[0]?.id || 'dashboard')
                setAddModalOpen(true)
              }}
              className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-1.5 cursor-pointer shadow-xs'
            >
              <Plus className='h-3.5 w-3.5' />
              + Add Article
            </Button>
          </div>
        </div>

        {/* 2-Pane Knowledge Base Studio */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[640px] items-start'>
          {/* LEFT SIDEBAR: Browse Categories */}
          <div className='md:col-span-4 lg:col-span-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs flex flex-col space-y-3 sticky top-20'>
            {/* Sidebar Title */}
            <div className='flex items-center justify-between px-1 pt-1'>
              <div className='flex items-center gap-2'>
                <Folder className='h-4 w-4 text-orange-600' />
                <h2 className='text-xs font-bold uppercase tracking-wider text-foreground'>
                  Browse Categories
                </h2>
              </div>
              <span className='text-[10px] font-mono text-muted-foreground'>
                {categories.length} folders
              </span>
            </div>

            {/* Search Input */}
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                id='input-kb-search'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                className='h-8 pl-8 text-xs bg-muted/20 border-border/70 focus:border-orange-500'
              />
            </div>

            {/* Categories Accordion List */}
            <div className='space-y-1 overflow-y-auto max-h-[540px] pr-1'>
              {loading && categories.length === 0 ? (
                <div className='p-6 text-center text-xs text-muted-foreground animate-pulse'>
                  Loading categories...
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className='p-6 text-center text-xs text-muted-foreground'>
                  No matching documentation found.
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isExpanded = expandedCategories[category.id] ?? false
                  const isCatActive = selectedCategoryId === category.id

                  return (
                    <div
                      key={category.id}
                      id={`cat-item-${category.id}`}
                      className='rounded-lg border border-border/30 overflow-hidden bg-muted/5'
                    >
                      {/* Category Header Item */}
                      <button
                        type='button'
                        id={`cat-toggle-${category.id}`}
                        onClick={() => toggleCategoryExpand(category.id)}
                        className={`w-full flex items-center justify-between p-2 text-xs font-medium cursor-pointer transition-colors text-start ${
                          isCatActive
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                            : 'hover:bg-muted/30 text-foreground'
                        }`}
                      >
                        <div className='flex items-center gap-2 truncate'>
                          <span className={`h-2 w-2 rounded-full ${category.iconColor || 'bg-orange-500'} shrink-0`} />
                          <span className='truncate'>{category.name}</span>
                        </div>
                        <div className='flex items-center gap-1.5 shrink-0 text-muted-foreground'>
                          <span className='text-[10px] font-mono'>{category.articles.length}</span>
                          {isExpanded ? (
                            <ChevronDown className='h-3.5 w-3.5' />
                          ) : (
                            <ChevronRight className='h-3.5 w-3.5' />
                          )}
                        </div>
                      </button>

                      {/* Articles under this category */}
                      {isExpanded && (
                        <div className='p-1 space-y-0.5 bg-background border-t border-border/20 text-xs'>
                          {category.articles.length === 0 ? (
                            <div className='p-2 text-[11px] text-muted-foreground italic text-center'>
                              No articles in this folder
                            </div>
                          ) : (
                            category.articles.map((art) => {
                              const isSelected = selectedArticleId === art.id
                              return (
                                <button
                                  key={art.id}
                                  id={`article-item-${art.id}`}
                                  type='button'
                                  onClick={() => handleSelectArticle(category.id, art.id)}
                                  className={`w-full text-start p-2 rounded-md transition-all flex items-start gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'bg-orange-600 text-white font-medium shadow-xs'
                                      : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <FileText className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                                  <div className='truncate flex-1'>
                                    <div className='truncate text-xs'>{art.title}</div>
                                    <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                      {art.readTime}
                                    </div>
                                  </div>
                                </button>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* RIGHT PANE: Article Reader / Welcome Empty State */}
          <div className='md:col-span-8 lg:col-span-9 rounded-xl border border-border/70 bg-card p-6 shadow-xs min-h-[640px] flex flex-col justify-start'>
            {activeArticle ? (
              /* ACTIVE ARTICLE VIEW */
              <div className='space-y-6'>
                {/* Header Breadcrumb & Actions */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4'>
                  <div>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground font-mono'>
                      <span>Knowledge Base</span>
                      <span>&gt;</span>
                      <span className='text-orange-600 font-semibold'>{activeCategory?.name}</span>
                      <span>&gt;</span>
                      <span className='truncate max-w-[200px]'>{activeArticle.title}</span>
                    </div>
                    <h2 className='text-xl font-bold text-foreground mt-2'>
                      {activeArticle.title}
                    </h2>
                    <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap'>
                      <Badge variant='outline' className='text-[10px] border-orange-500/30 text-orange-600'>
                        {activeCategory?.name}
                      </Badge>
                      <span>• Updated {activeArticle.updatedAt}</span>
                      <span>• {activeArticle.readTime}</span>
                      <span>• {activeArticle.chunks} Chunks ({activeArticle.tokens} tokens)</span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0 flex-wrap'>
                    {activeArticle.routeLink && (
                      <Link to={activeArticle.routeLink}>
                        <Button
                          id='btn-open-feature'
                          variant='outline'
                          size='sm'
                          className='h-8 text-xs gap-1.5 text-orange-600 hover:text-orange-700 cursor-pointer'
                        >
                          Open Feature <ExternalLink className='h-3 w-3' />
                        </Button>
                      </Link>
                    )}
                    <Button
                      id='btn-edit-article'
                      variant='outline'
                      size='sm'
                      onClick={() => handleOpenEditArticle(activeArticle, activeCategory?.id || 'dashboard')}
                      className='h-8 px-2.5 text-xs text-foreground hover:bg-muted cursor-pointer gap-1'
                    >
                      <Edit3 className='h-3.5 w-3.5' /> Edit
                    </Button>
                    <Button
                      id='btn-delete-article'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteArticle(activeArticle.id)}
                      className='h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer gap-1'
                    >
                      <Trash2 className='h-3.5 w-3.5' /> Delete
                    </Button>
                  </div>
                </div>

                {/* Article Markdown/Structured Content */}
                <div className='prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4'>
                  <div className='p-3.5 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-800 dark:text-orange-300 flex items-start gap-2.5'>
                    <Lightbulb className='h-4 w-4 shrink-0 text-orange-600 mt-0.5' />
                    <div>
                      <span className='font-bold'>AI Grounded Source: </span>
                      This document is automatically embedded in the AI Assistant vector store. When customers ask questions on WhatsApp, the AI cites these verified facts with zero hallucination.
                    </div>
                  </div>

                  <div className='whitespace-pre-line text-xs font-sans text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-lg border border-border/30'>
                    {activeArticle.content}
                  </div>
                </div>

                {/* Audit & Compliance Footer */}
                <div className='pt-6 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground'>
                  <div className='flex items-center gap-1.5'>
                    <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                    <span>State Scope: <strong>Gujarat (GJ) Commercial Fleet</strong></span>
                  </div>
                  <div className='flex items-center gap-1.5 font-mono text-[10px]'>
                    <Database className='h-3 w-3 text-orange-500' />
                    <span>ID: {activeArticle.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* WELCOME EMPTY STATE */
              <div className='flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto'>
                <div className='h-16 w-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 shadow-xs'>
                  <BookOpen className='h-8 w-8' />
                </div>
                <h2 className='text-xl font-bold text-foreground mb-2'>
                  Welcome to Knowledge Base
                </h2>
                <p className='text-xs text-muted-foreground leading-relaxed mb-6'>
                  Browse through categories and folders to find the information you need.
                </p>

                <div className='space-y-2.5 text-xs text-start w-full bg-muted/20 p-4 rounded-xl border border-border/50'>
                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <span className='h-2 w-2 rounded-full bg-orange-500 shrink-0' />
                    <span>Click on a category to expand folders</span>
                  </div>
                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500 shrink-0' />
                    <span>Click on a folder to view articles</span>
                  </div>
                  <div className='flex items-center gap-2.5 text-muted-foreground'>
                    <span className='h-2 w-2 rounded-full bg-purple-500 shrink-0' />
                    <span>Click an article to read the content</span>
                  </div>
                </div>

                <div className='mt-6 flex items-center gap-3'>
                  <Button
                    id='btn-read-first-article'
                    size='sm'
                    onClick={() => {
                      if (categories[0]?.articles[0]) {
                        handleSelectArticle(categories[0].id, categories[0].articles[0].id)
                      }
                    }}
                    className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer'
                  >
                    Read First Article <ArrowRight className='h-3.5 w-3.5 ml-1' />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CREATE ARTICLE MODAL */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent id='modal-add-article' className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base'>
                <Plus className='h-4 w-4 text-orange-600' />
                Add Knowledge Article
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Write verified guidelines or business SOPs. The text will be chunked into vector embeddings for the AI Assistant.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 py-2 text-xs'>
              <div>
                <Label className='text-xs font-semibold'>Article Title</Label>
                <Input
                  id='input-article-title'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='e.g., Commercial Fleet Fastag Issuance SOP'
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Target Category</Label>
                <select
                  id='select-article-category'
                  value={newCategoryTarget}
                  onChange={(e) => setNewCategoryTarget(e.target.value)}
                  className='h-8 w-full rounded-md border border-border bg-background px-3 text-xs mt-1 outline-hidden'
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className='text-xs font-semibold'>Article Documentation Content</Label>
                <Textarea
                  id='textarea-article-content'
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  placeholder='Write the full instructions, rates, rules, or troubleshooting steps...'
                  className='text-xs mt-1'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setAddModalOpen(false)}
                className='h-8 text-xs cursor-pointer'
              >
                Cancel
              </Button>
              <Button
                id='btn-article-submit'
                size='sm'
                onClick={handleCreateArticle}
                className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer'
              >
                Save & Vectorize
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* EDIT ARTICLE MODAL */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent id='modal-edit-article' className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base'>
                <Edit3 className='h-4 w-4 text-orange-600' />
                Edit Knowledge Article
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Update documentation content, revise guidelines, and re-compute vector embeddings.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 py-2 text-xs'>
              <div>
                <Label className='text-xs font-semibold'>Article Title</Label>
                <Input
                  id='input-edit-article-title'
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Category</Label>
                <select
                  id='select-edit-article-category'
                  value={editCategoryTarget}
                  onChange={(e) => setEditCategoryTarget(e.target.value)}
                  className='h-8 w-full rounded-md border border-border bg-background px-3 text-xs mt-1 outline-hidden'
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className='text-xs font-semibold'>Documentation Content</Label>
                <Textarea
                  id='textarea-edit-article-content'
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className='text-xs mt-1'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setEditModalOpen(false)}
                className='h-8 text-xs cursor-pointer'
              >
                Cancel
              </Button>
              <Button
                id='btn-article-update-submit'
                size='sm'
                onClick={handleUpdateArticle}
                className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer'
              >
                Update & Re-index
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ADD CATEGORY MODAL */}
        <Dialog open={addCategoryModalOpen} onOpenChange={setAddCategoryModalOpen}>
          <DialogContent id='modal-add-category' className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-base'>
                <FolderPlus className='h-4 w-4 text-orange-600' />
                Create Documentation Category
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Group related SOPs, manuals, or training documents into a structured folder.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 py-2 text-xs'>
              <div>
                <Label className='text-xs font-semibold'>Category Name</Label>
                <Input
                  id='input-new-category-name'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder='e.g., Billing & Accounts SOP'
                  className='h-8 text-xs mt-1'
                />
              </div>

              <div>
                <Label className='text-xs font-semibold'>Badge Accent Color</Label>
                <select
                  id='select-new-category-color'
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className='h-8 w-full rounded-md border border-border bg-background px-3 text-xs mt-1 outline-hidden'
                >
                  <option value='bg-orange-500'>Orange (Default)</option>
                  <option value='bg-amber-500'>Amber</option>
                  <option value='bg-blue-500'>Blue</option>
                  <option value='bg-emerald-500'>Emerald</option>
                  <option value='bg-teal-500'>Teal</option>
                  <option value='bg-purple-500'>Purple</option>
                  <option value='bg-rose-500'>Rose</option>
                  <option value='bg-indigo-500'>Indigo</option>
                  <option value='bg-cyan-500'>Cyan</option>
                </select>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setAddCategoryModalOpen(false)}
                className='h-8 text-xs cursor-pointer'
              >
                Cancel
              </Button>
              <Button
                id='btn-category-submit'
                size='sm'
                onClick={handleCreateCategory}
                className='h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer'
              >
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
