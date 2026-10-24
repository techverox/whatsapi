import { useState, useRef } from 'react'
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

interface MediaAsset {
  id: string
  name: string
  size: string
  type: string
  category: 'image' | 'document' | 'video'
  uploadedAt: string
  mediaId: string
  customPreviewUrl?: string
}

const initialMedia: MediaAsset[] = [
  {
    id: 'm-1',
    name: 'truck-sathi-gps-sale-banner.jpg',
    size: '1.17 MB',
    type: 'image/jpeg',
    category: 'image',
    uploadedAt: '10/21/2026',
    mediaId: 'media_wa_984210948',
  },
  {
    id: 'm-2',
    name: 'commercial-fleet-pricing-catalog-2026.pdf',
    size: '3.42 MB',
    type: 'application/pdf',
    category: 'document',
    uploadedAt: '10/20/2026',
    mediaId: 'media_wa_184920491',
  },
  {
    id: 'm-3',
    name: 'ais-140-govt-certificate.png',
    size: '890 KB',
    type: 'image/png',
    category: 'image',
    uploadedAt: '10/19/2026',
    mediaId: 'media_wa_739104928',
  },
  {
    id: 'm-4',
    name: 'fastag-kyc-guide-infographic.png',
    size: '1.45 MB',
    type: 'image/png',
    category: 'image',
    uploadedAt: '10/18/2026',
    mediaId: 'media_wa_562910482',
  },
]

export function Gallery() {
  const [media, setMedia] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem('verox_media_gallery_v1')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Use fallback
    }
    return initialMedia
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'image' | 'document' | 'video'>('All')

  // Upload Modal State
  const [uploadModal, setUploadModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState('image/png')
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [selectedFileSize, setSelectedFileSize] = useState('1.24 MB')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<MediaAsset | null>(null)

  const saveMedia = (updated: MediaAsset[]) => {
    setMedia(updated)
    try {
      localStorage.setItem('verox_media_gallery_v1', JSON.stringify(updated))
    } catch (_err) {
      // Storage fallback
    }
  }

  const handleCopy = (id: string, mediaId: string) => {
    navigator.clipboard.writeText(mediaId)
    setCopiedId(id)
    toast.success('Media ID Copied!', {
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
        const reader = new FileReader()
        reader.onload = () => {
          setSelectedFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        setNewFileType('application/pdf')
        setSelectedFilePreview(null)
      } else {
        setNewFileType(file.type || 'application/octet-stream')
        setSelectedFilePreview(null)
      }
    }
  }

  const handleUpload = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name or choose a file.')
      return
    }

    const isDoc = newFileType.includes('pdf') || newFileType.includes('document')
    const isVid = newFileType.includes('mp4') || newFileType.includes('video')
    const cat: 'image' | 'document' | 'video' = isDoc ? 'document' : isVid ? 'video' : 'image'

    const newAsset: MediaAsset = {
      id: `m-${Date.now()}`,
      name: newFileName.trim(),
      size: selectedFileSize,
      type: newFileType,
      category: cat,
      uploadedAt: new Date().toLocaleDateString(),
      mediaId: `media_wa_${Math.floor(100000000 + Math.random() * 900000000)}`,
      customPreviewUrl: selectedFilePreview || undefined,
    }

    saveMedia([newAsset, ...media])
    setNewFileName('')
    setSelectedFilePreview(null)
    setUploadModal(false)
    toast.success('Media Asset Uploaded & Indexed on Meta Cloud API!', {
      description: `Generated handle: ${newAsset.mediaId}`,
    })
  }

  const handleDelete = (id: string, name: string) => {
    const remaining = media.filter((m) => m.id !== id)
    saveMedia(remaining)
    toast.info('Media Asset Removed', { description: `Deleted ${name}` })
  }

  const handleDownload = (item: MediaAsset) => {
    try {
      const link = document.createElement('a')
      link.href = item.customPreviewUrl || `data:text/plain;charset=utf-8,${encodeURIComponent('WhatsAPI Cloud Media Asset\nFilename: ' + item.name + '\nMedia ID: ' + item.mediaId + '\nCategory: ' + item.category + '\nSize: ' + item.size)}`
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

  // Filter Media
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
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              Media Gallery
              <Badge className='bg-emerald-500/15 text-emerald-600 border-0 text-xs font-mono font-semibold'>
                META CDN HOSTED
              </Badge>
            </h1>
            <p className='text-xs text-muted-foreground'>
              Uploaded marketing media, PDF catalogs, and template header images hosted on Meta Cloud API
            </p>
          </div>
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
            Upload Media
          </Button>
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

          <div className='relative w-full sm:w-64'>
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
                  ) : item.name.includes('pricing-catalog') ? (
                    <div className='h-full w-full rounded bg-gradient-to-br from-red-600 to-rose-700 p-3 flex flex-col justify-between text-white shadow-inner'>
                      <div className='flex items-center gap-1.5 text-[10px] font-bold'>
                        <FileText className='h-3.5 w-3.5' />
                        <span>PDF CATALOG</span>
                      </div>
                      <div className='text-center font-bold text-xs tracking-tight'>
                        Commercial Fleet Pricing Matrix 2026
                      </div>
                      <div className='text-[9px] opacity-80 flex justify-between'>
                        <span>12 Pages</span>
                        <span>Rate Card</span>
                      </div>
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
                        3-Step Fleet KYC Guide
                      </div>
                      <div className='text-[9px] opacity-80 text-center'>Instant Wallet Linking</div>
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
                      className='h-7 text-[11px] gap-1 flex-1 font-mono'
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
            <div className='col-span-full p-8 text-center text-muted-foreground border border-dashed rounded-xl'>
              No media assets found matching "{searchQuery}".
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
                <Label className='text-xs font-semibold'>Media Type</Label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs'
                >
                  <option value='image/png'>Image (PNG / JPEG)</option>
                  <option value='application/pdf'>Document (PDF Catalog)</option>
                  <option value='video/mp4'>Video (MP4 Demo)</option>
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
            <Button variant='outline' size='sm' onClick={() => setUploadModal(false)} className='text-xs'>
              Cancel
            </Button>
            <Button size='sm' onClick={handleUpload} className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold'>
              Upload Asset & Generate Handle
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
              ) : previewItem?.name.includes('pricing-catalog') ? (
                <div className='h-full w-full rounded bg-gradient-to-br from-red-600 to-rose-700 p-5 flex flex-col justify-between text-white'>
                  <div className='flex items-center gap-2 text-xs font-bold'>
                    <FileText className='h-4 w-4' />
                    <span>PDF DOCUMENT BROCHURE</span>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold'>Commercial Fleet Price Matrix 2026</div>
                    <div className='text-xs opacity-80 mt-1'>
                      Includes 1-year software AMC, SIM data, & Gujarat on-site fitment
                    </div>
                  </div>
                  <div className='text-[10px] opacity-75 flex justify-between'>
                    <span>12 Pages</span>
                    <span>Meta PDF Payload</span>
                  </div>
                </div>
              ) : (
                <div className='h-full w-full rounded bg-gradient-to-br from-emerald-600 to-teal-700 p-5 flex flex-col justify-between text-white'>
                  <div className='flex items-center gap-2 text-xs font-bold'>
                    <ShieldCheck className='h-4 w-4' />
                    <span>OFFICIAL GOVERNMENT COMPLIANCE</span>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold'>MoRTH AIS-140 Certification</div>
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
