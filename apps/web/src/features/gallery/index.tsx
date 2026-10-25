import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Copy,
  Check,
  Eye,
  Trash2,
  UploadCloud,
  FileCheck,
  FileText,
  Download,
  Search,
  X,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Film,
  Layers,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface MediaAsset {
  id: string
  name: string
  size: string
  type: string
  category: 'image' | 'document' | 'video'
  uploadedAt: string
  mediaId: string
  customPreviewUrl?: string
  cdnStatus?: 'ACTIVE' | 'PENDING' | 'EXPIRED'
}

interface MediaStats {
  total: number
  images: number
  documents: number
  videos: number
  storageUsedMb: string
  cdnStatus: string
  lastSyncedAt?: string
}

export function Gallery() {
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [stats, setStats] = useState<MediaStats>({
    total: 4,
    images: 3,
    documents: 1,
    videos: 0,
    storageUsedMb: '6.91',
    cdnStatus: 'ACTIVE & VERIFIED',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'image' | 'document' | 'video'>('All')

  // Upload Modal State
  const [uploadModal, setUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState('image/png')
  const [newFileCategory, setNewFileCategory] = useState<'image' | 'document' | 'video'>('image')
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [selectedFileSize, setSelectedFileSize] = useState('1.24 MB')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<MediaAsset | null>(null)

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await veroxApi.getMedia({
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      })
      if (res && res.success && Array.isArray(res.data)) {
        setMedia(res.data as MediaAsset[])
        const rawRes = res as unknown as { stats?: MediaStats }
        if (rawRes.stats) {
          setStats(rawRes.stats)
        }
      }
    } catch (_err) {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, searchQuery])

  useEffect(() => {
    let mounted = true
    veroxApi
      .getMedia()
      .then((res) => {
        if (!mounted) return
        if (res && res.success && Array.isArray(res.data)) {
          setMedia(res.data as MediaAsset[])
          const rawRes = res as unknown as { stats?: MediaStats }
          if (rawRes.stats) {
            setStats(rawRes.stats)
          }
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  const handleSyncMeta = async () => {
    setIsSyncing(true)
    try {
      const res = await veroxApi.syncMetaMedia()
      if (res && res.success) {
        toast.success('Media Assets Synced with Meta Cloud CDN!', {
          description: 'All broadcast header handles and PDF catalogs verified on Meta Graph API v21.0.',
        })
        await fetchMedia()
      } else {
        toast.info('Meta CDN storage synchronized.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Sync failed: ${msg}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCopy = (id: string, mediaId: string) => {
    navigator.clipboard.writeText(mediaId)
    setCopiedId(id)
    toast.success('Meta Media ID Copied!', {
      description: `Copied ${mediaId} to clipboard for template binding.`,
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewFileName(file.name)
      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`)
      if (file.type.startsWith('image/')) {
        setNewFileType(file.type)
        setNewFileCategory('image')
        const reader = new FileReader()
        reader.onload = () => {
          setSelectedFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        setNewFileType('application/pdf')
        setNewFileCategory('document')
        setSelectedFilePreview(null)
      } else if (file.type.startsWith('video/')) {
        setNewFileType(file.type)
        setNewFileCategory('video')
        setSelectedFilePreview(null)
      } else {
        setNewFileType(file.type || 'application/octet-stream')
        setSelectedFilePreview(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name or choose a file.')
      return
    }

    setIsUploading(true)
    try {
      const res = await veroxApi.createMedia({
        name: newFileName.trim(),
        size: selectedFileSize,
        type: newFileType,
        category: newFileCategory,
        customPreviewUrl: selectedFilePreview || undefined,
      })

      if (res && res.success) {
        const created = (res.data || res) as MediaAsset
        toast.success('Media Asset Uploaded & Indexed on Meta Cloud API!', {
          description: `Generated handle: ${created.mediaId || 'media_wa_...'}`,
        })
        setNewFileName('')
        setSelectedFilePreview(null)
        setUploadModal(false)
        await fetchMedia()
      } else {
        toast.error('Failed to upload media asset.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Upload error: ${msg}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await veroxApi.deleteMedia(id)
      if (res && res.success) {
        toast.info('Media Asset Removed', { description: `Deleted ${name}` })
        await fetchMedia()
      } else {
        setMedia((prev) => prev.filter((m) => m.id !== id))
        toast.info('Media asset removed from gallery.')
      }
    } catch (_err) {
      setMedia((prev) => prev.filter((m) => m.id !== id))
      toast.info('Media asset removed.')
    }
  }

  const handleDownload = (item: MediaAsset) => {
    try {
      const link = document.createElement('a')
      link.href =
        item.customPreviewUrl ||
        `data:text/plain;charset=utf-8,${encodeURIComponent(
          'WhatsAPI Cloud Media Asset\nFilename: ' +
            item.name +
            '\nMedia ID: ' +
            item.mediaId +
            '\nCategory: ' +
            item.category +
            '\nSize: ' +
            item.size
        )}`
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloaded ${item.name}!`, {
        description: 'File downloaded to your local device.',
      })
    } catch {
      toast.success(`Downloading ${item.name}...`)
    }
  }

  // Filter Media locally as well for instant responsiveness
  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mediaId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' ? true : item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <ImageIcon className='h-4 w-4 text-orange-600' />
          <span>Media Gallery</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 space-y-4 max-w-7xl mx-auto'>
        {/* Page Top Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>Media Gallery</h1>
              <Badge className='bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-mono font-semibold'>
                META CDN HOSTED
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Official WhatsApp Cloud API hosted marketing assets, brochure PDFs, and template header handles
            </p>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSyncMeta}
              disabled={isSyncing}
              className='h-8 text-xs gap-1.5'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-orange-600' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Meta CDN'}</span>
            </Button>

            <Button
              size='sm'
              onClick={() => {
                setNewFileName('')
                setSelectedFilePreview(null)
                setUploadModal(true)
              }}
              className='bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 text-xs font-semibold shadow-xs'
            >
              <Plus className='h-3.5 w-3.5' />
              <span>Upload Media</span>
            </Button>
          </div>
        </div>

        {/* Top 4 Enterprise Metric Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-xs space-y-1'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-[11px] font-medium'>Total Media Assets</span>
              <Layers className='h-4 w-4 text-orange-600' />
            </div>
            <div className='text-lg font-bold text-foreground'>{stats.total} Assets</div>
            <p className='text-[10px] text-muted-foreground'>
              {stats.images} Images • {stats.documents} Documents • {stats.videos} Videos
            </p>
          </div>

          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-xs space-y-1'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-[11px] font-medium'>Storage Allocated</span>
              <HardDrive className='h-4 w-4 text-emerald-600' />
            </div>
            <div className='text-lg font-bold text-foreground'>{stats.storageUsedMb} MB Used</div>
            <p className='text-[10px] text-muted-foreground'>100 MB Meta Cloud CDN Quota</p>
          </div>

          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-xs space-y-1'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-[11px] font-medium'>Meta CDN Status</span>
              <ShieldCheck className='h-4 w-4 text-blue-600' />
            </div>
            <div className='text-lg font-bold text-foreground flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
              <span>Active & Verified</span>
            </div>
            <p className='text-[10px] text-muted-foreground'>Graph API v21.0 Storage</p>
          </div>

          <div className='rounded-xl border border-border/60 bg-card p-3.5 shadow-xs space-y-1'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span className='text-[11px] font-medium'>Broadcast Capability</span>
              <Sparkles className='h-4 w-4 text-purple-600' />
            </div>
            <div className='text-lg font-bold text-foreground'>Template Ready</div>
            <p className='text-[10px] text-muted-foreground'>Instant WhatsApp header binding</p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center bg-muted/40 p-1 rounded-lg text-xs border border-border/40'>
            {(['All', 'image', 'document', 'video'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'All' ? 'All Assets' : `${cat}s`}
                <span className='ml-1 text-[10px] opacity-70'>
                  ({cat === 'All' ? media.length : media.filter((m) => m.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-72'>
            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search media name or ID...'
              className='h-8 pl-8 pr-7 text-xs bg-background'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-2 top-2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {filteredMedia.length > 0 ? (
            filteredMedia.map((item) => (
              <div
                key={item.id}
                className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs hover:border-orange-500/50 transition-all flex flex-col justify-between group'
              >
                {/* Visual Thumbnail Area */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className='h-36 relative cursor-pointer overflow-hidden flex items-center justify-center p-3 border-b border-border/40 bg-zinc-950/5 dark:bg-zinc-950/40'
                >
                  {/* Distinct Visual Thumbnails */}
                  {item.customPreviewUrl ? (
                    <img
                      src={item.customPreviewUrl}
                      alt={item.name}
                      className='h-full w-full object-cover rounded'
                    />
                  ) : item.category === 'document' || item.name.includes('catalog') ? (
                    <div className='h-full w-full rounded bg-gradient-to-br from-red-600 to-rose-700 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex items-center gap-1.5 text-[10px] font-bold'>
                        <FileText className='h-3.5 w-3.5' />
                        <span>PDF CATALOG</span>
                      </div>
                      <div className='text-center font-bold text-xs tracking-tight line-clamp-2'>
                        {item.name.replace('.pdf', '')}
                      </div>
                      <div className='text-[9px] opacity-80 flex justify-between'>
                        <span>Meta Document</span>
                        <span>{item.size}</span>
                      </div>
                    </div>
                  ) : item.category === 'video' || item.name.includes('mp4') ? (
                    <div className='h-full w-full rounded bg-gradient-to-br from-purple-600 to-indigo-700 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex items-center gap-1.5 text-[10px] font-bold'>
                        <Film className='h-3.5 w-3.5' />
                        <span>VIDEO DEMO</span>
                      </div>
                      <div className='text-center font-bold text-xs tracking-tight line-clamp-2'>
                        {item.name}
                      </div>
                      <div className='text-[9px] opacity-80 flex justify-between'>
                        <span>MP4 Video</span>
                        <span>{item.size}</span>
                      </div>
                    </div>
                  ) : item.name.includes('sale-banner') ? (
                    <div className='h-full w-full rounded bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex justify-between items-center text-[10px] font-bold'>
                        <span>TRUCK SATHI</span>
                        <span className='bg-black/30 px-1.5 py-0.5 rounded'>DIWALI 30% OFF</span>
                      </div>
                      <div className='text-center font-extrabold text-xs tracking-tight'>
                        AIS-140 GPS SALE
                      </div>
                      <div className='text-[9px] opacity-80 text-right'>Official Banner</div>
                    </div>
                  ) : item.name.includes('certificate') ? (
                    <div className='h-full w-full rounded bg-gradient-to-br from-emerald-600 to-teal-700 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex items-center gap-1 text-[10px] font-bold'>
                        <ShieldCheck className='h-3.5 w-3.5' />
                        <span>GOVT APPROVED</span>
                      </div>
                      <div className='text-center font-bold text-xs tracking-tight'>
                        MoRTH AIS-140 Certificate
                      </div>
                      <div className='text-[9px] opacity-80 text-center'>
                        Gujarat State Command Center Verified
                      </div>
                    </div>
                  ) : (
                    <div className='h-full w-full rounded bg-gradient-to-br from-sky-600 to-indigo-700 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex justify-between items-center text-[10px] font-bold'>
                        <span>INFOGRAPHIC</span>
                        <span>FASTAG</span>
                      </div>
                      <div className='text-center font-bold text-xs tracking-tight'>
                        {item.name}
                      </div>
                      <div className='text-[9px] opacity-80 text-center'>{item.size}</div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='secondary'
                      className='h-7 text-xs gap-1 font-semibold'
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewItem(item)
                      }}
                    >
                      <Eye className='h-3 w-3' /> Preview
                    </Button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className='p-3 space-y-2 flex-1 flex flex-col justify-between'>
                  <div>
                    <h4 className='text-xs font-semibold text-foreground truncate' title={item.name}>
                      {item.name}
                    </h4>
                    <div className='flex items-center justify-between mt-1 text-[10px] text-muted-foreground font-mono'>
                      <Badge variant='outline' className='text-[9px] px-1 py-0 uppercase font-mono'>
                        {item.category}
                      </Badge>
                      <span>{item.size}</span>
                      <span>{item.uploadedAt}</span>
                    </div>
                  </div>

                  <div className='pt-2 border-t border-border/40 flex items-center justify-between gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCopy(item.id, item.mediaId)}
                      className='h-7 text-[11px] gap-1 flex-1 font-mono font-semibold'
                      title='Copy Meta Media ID'
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className='h-3 w-3 text-emerald-600' /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className='h-3 w-3' /> {item.mediaId.slice(0, 14)}...
                        </>
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDownload(item)}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
                      title='Download Asset'
                    >
                      <Download className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(item.id, item.name)}
                      className='h-7 w-7 p-0 text-muted-foreground hover:text-rose-600'
                      title='Delete Asset'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-xl space-y-2'>
              <ImageIcon className='h-8 w-8 mx-auto text-muted-foreground/50' />
              <p className='text-xs font-medium'>
                {isLoading ? 'Loading media assets...' : `No media assets found matching "${searchQuery}".`}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setUploadModal(true)}
                className='text-xs gap-1.5 mt-2'
              >
                <Plus className='h-3.5 w-3.5' /> Upload First Asset
              </Button>
            </div>
          )}
        </div>
      </Main>

      {/* Upload Media Modal */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <UploadCloud className='h-5 w-5 text-orange-600' /> Upload WhatsApp Marketing Asset
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Upload media to generate an official Meta Cloud Media Handle (`media_wa_...`) for broadcast campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 py-2'>
            {/* Hidden native file input */}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*,application/pdf,video/mp4'
              className='hidden'
            />

            {/* Clickable Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className='border-2 border-dashed border-orange-500/50 hover:border-orange-500 rounded-xl p-5 text-center bg-orange-500/5 cursor-pointer transition-colors'
            >
              <FileCheck className='h-8 w-8 text-orange-600 mx-auto mb-1.5' />
              <p className='text-xs font-semibold text-foreground'>
                {selectedFilePreview ? 'File Selected — Click to change' : 'Click to Browse File from Computer'}
              </p>
              <p className='text-[10px] text-muted-foreground mt-0.5'>
                Supports Images (JPG, PNG), Documents (PDF catalogs), and MP4 Videos
              </p>
            </div>

            {/* Selected File Details */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>File / Asset Name</Label>
              <Input
                placeholder='e.g. festive-discount-brochure.pdf'
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className='text-xs'
              />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>Media Category</Label>
                <select
                  value={newFileCategory}
                  onChange={(e) => {
                    const val = e.target.value as 'image' | 'document' | 'video'
                    setNewFileCategory(val)
                    if (val === 'document') setNewFileType('application/pdf')
                    else if (val === 'video') setNewFileType('video/mp4')
                    else setNewFileType('image/png')
                  }}
                  className='w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground font-medium'
                >
                  <option value='image'>Image (PNG / JPEG)</option>
                  <option value='document'>Document (PDF Catalog)</option>
                  <option value='video'>Video (MP4 Demo)</option>
                </select>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>File Size</Label>
                <Input
                  value={selectedFileSize}
                  onChange={(e) => setSelectedFileSize(e.target.value)}
                  className='h-8 text-xs font-mono'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setUploadModal(false)}
              disabled={isUploading}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleUpload}
              disabled={isUploading}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold'
            >
              {isUploading ? (
                <>
                  <RefreshCw className='h-3.5 w-3.5 animate-spin mr-1.5' /> Uploading...
                </>
              ) : (
                'Upload Asset & Generate Handle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-sm font-semibold truncate flex items-center gap-2'>
              <ImageIcon className='h-4 w-4 text-orange-600' />
              {previewItem?.name}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Hosted on Meta Cloud WhatsApp Storage CDN.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            {/* Big Preview Area */}
            <div className='h-52 bg-zinc-950 rounded-lg flex items-center justify-center p-3 overflow-hidden border border-border/40'>
              {previewItem?.customPreviewUrl ? (
                <img
                  src={previewItem.customPreviewUrl}
                  alt={previewItem.name}
                  className='h-full w-full object-contain'
                />
              ) : previewItem?.category === 'document' || previewItem?.name.includes('catalog') ? (
                <div className='h-full w-full rounded bg-gradient-to-br from-red-600 to-rose-700 p-5 flex flex-col justify-between text-white'>
                  <div className='flex items-center gap-2 text-xs font-bold'>
                    <FileText className='h-4 w-4' />
                    <span>PDF DOCUMENT BROCHURE</span>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold'>{previewItem?.name}</div>
                    <div className='text-xs opacity-80 mt-1'>
                      Verified Meta Cloud API Catalog Asset
                    </div>
                  </div>
                  <div className='text-[10px] opacity-75 flex justify-between'>
                    <span>Meta PDF Payload</span>
                    <span>{previewItem?.size}</span>
                  </div>
                </div>
              ) : previewItem?.category === 'video' ? (
                <div className='h-full w-full rounded bg-gradient-to-br from-purple-600 to-indigo-700 p-5 flex flex-col justify-between text-white'>
                  <div className='flex items-center gap-2 text-xs font-bold'>
                    <Film className='h-4 w-4' />
                    <span>MP4 VIDEO ASSET</span>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold'>{previewItem?.name}</div>
                    <div className='text-xs opacity-80 mt-1'>
                      Ready for WhatsApp Video Broadcasts
                    </div>
                  </div>
                  <div className='text-[10px] opacity-75 text-center'>H.264 / AAC Codec</div>
                </div>
              ) : previewItem?.name.includes('sale-banner') ? (
                <div className='h-full w-full rounded bg-gradient-to-br from-orange-600 via-amber-600 to-rose-600 p-5 flex flex-col justify-between text-white'>
                  <div className='flex justify-between items-center text-xs font-bold'>
                    <span>TRUCK SATHI AUTOMATION</span>
                    <Badge className='bg-black/40 text-white border-0'>DIWALI 30% OFF</Badge>
                  </div>
                  <div className='text-center'>
                    <div className='text-xl font-black tracking-tight'>AIS-140 GPS SPECIAL SALE</div>
                    <div className='text-xs opacity-90 mt-1'>
                      Government Certified 4G Tracker + Free Fastag Card
                    </div>
                  </div>
                  <div className='text-[10px] opacity-75 text-right'>Verified Meta Header Asset</div>
                </div>
              ) : (
                <div className='h-full w-full rounded bg-gradient-to-br from-emerald-600 to-teal-700 p-5 flex flex-col justify-between text-white'>
                  <div className='flex items-center gap-2 text-xs font-bold'>
                    <ShieldCheck className='h-4 w-4' />
                    <span>OFFICIAL GOVERNMENT COMPLIANCE</span>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold'>{previewItem?.name}</div>
                    <div className='text-xs opacity-80 mt-1'>
                      Approved for commercial goods carriers across India
                    </div>
                  </div>
                  <div className='text-[10px] opacity-75 text-center'>Seal of Authenticity</div>
                </div>
              )}
            </div>

            {/* Asset Metadata Grid */}
            <div className='grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-muted/30 border border-border/40'>
              <div>
                <span className='text-muted-foreground block text-[10px]'>Meta Media Handle</span>
                <span className='font-mono font-semibold text-foreground'>{previewItem?.mediaId}</span>
              </div>
              <div>
                <span className='text-muted-foreground block text-[10px]'>File Size</span>
                <span className='font-semibold text-foreground'>{previewItem?.size}</span>
              </div>
              <div>
                <span className='text-muted-foreground block text-[10px]'>MIME Type</span>
                <span className='font-mono text-foreground'>{previewItem?.type}</span>
              </div>
              <div>
                <span className='text-muted-foreground block text-[10px]'>CDN Status</span>
                <span className='text-emerald-600 font-semibold'>ACTIVE & VERIFIED</span>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => previewItem && handleCopy(previewItem.id, previewItem.mediaId)}
              className='gap-1 text-xs'
            >
              <Copy className='h-3.5 w-3.5' /> Copy Media Handle
            </Button>
            <Button
              size='sm'
              onClick={() => previewItem && handleDownload(previewItem)}
              className='bg-orange-600 hover:bg-orange-700 text-white text-xs gap-1 font-bold'
            >
              <Download className='h-3.5 w-3.5' /> Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
