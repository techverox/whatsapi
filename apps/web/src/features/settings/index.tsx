import { useState, useEffect, useCallback } from 'react'
import {
  User,
  Users,
  Building2,
  CreditCard,
  Key,
  Shield,
  Palette,
  Camera,
  CheckCircle2,
  Trash2,
  Send,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Crown,
  ChevronDown,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { veroxApi } from '@/lib/api'
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

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'DEVELOPER'
  status: 'Active' | 'Inactive'
  isCurrentUser?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SettingsState {
  profile: {
    name: string
    email: string
    phone: string
    bio: string
    role?: string
    avatar?: string
  }
  organisation: {
    name: string
    industry: string
    website: string
    gstin: string
    address: string
    stateId?: string
  }
  waba: {
    wabaId: string
    phoneNumberId: string
    displayPhone: string
    accessToken: string
    verifyToken: string
    webhookUrl: string
    status?: 'CONNECTED' | 'DISCONNECTED' | 'PENDING'
    lastVerifiedAt?: string
  }
  billing?: {
    plan: 'ANNUAL PRO PLAN' | 'PRO PLAN' | 'ENTERPRISE'
    status: 'Active' | 'Past Due'
    expiresAt: string
    daysLeft: number
    amount: string
    currency: string
    features: string[]
    addonsCount: number
  }
}

const defaultSettings: SettingsState = {
  profile: {
    name: 'truck sathi',
    email: 'trucksathiamazon@gmail.com',
    phone: '+917698580034',
    bio: 'Fleet Operations Head at Truck Sathi & Whatsapi. Managing 500+ Gujarat commercial fleet AIS-140 GPS tracking devices and automated WhatsApp marketing.',
    role: 'ADMIN',
  },
  organisation: {
    name: 'Truck Sathi',
    industry: 'Transportation & Logistics',
    website: 'https://trucksathi.in',
    gstin: '24AAACT1234F1Z8',
    address: 'Near Ring Road Circle, SG Highway, Ahmedabad, Gujarat - 380054',
    stateId: 'gujarat',
  },
  waba: {
    wabaId: '109283746501928',
    phoneNumberId: '942534582278953',
    displayPhone: '+917698580043',
    accessToken: 'EAAGm0PX4ZCpsBA...K390Lks92384jsd02349sd',
    verifyToken: 'whatsapi_secure_verify_token_2026',
    webhookUrl: 'https://app.whatsapi.io/api/v2/webhook/whatsapp',
    status: 'CONNECTED',
  },
  billing: {
    plan: 'ANNUAL PRO PLAN',
    status: 'Active',
    expiresAt: '19 Jan 2027',
    daysLeft: 87,
    amount: 'INR 25,000 / year',
    currency: 'INR',
    features: [
      'WhatsApp Chatbot Automation',
      'Visual Flow Builder',
      'Automated Welcome Messages',
      'WhatsApp Broadcasting Campaigns',
    ],
    addonsCount: 1,
  },
}

const defaultTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'truck sathi',
    email: 'trucksathiamazon@gmail.com',
    phone: '+917698580034',
    role: 'ADMIN',
    status: 'Active',
    isCurrentUser: true,
  },
  {
    id: 'tm-2',
    name: 'jaydeep',
    email: 'jaydeep@trucksathi.co.in',
    phone: '+919773162952',
    role: 'AGENT',
    status: 'Active',
  },
  {
    id: 'tm-3',
    name: 'karuna',
    email: 'karuna@trucksathi.co.in',
    phone: '+918401850382',
    role: 'AGENT',
    status: 'Active',
  },
]

export function Settings({
  defaultTab = 'profile',
}: {
  defaultTab?: 'profile' | 'team' | 'organisation' | 'billing' | 'waba' | 'appearance'
}) {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParam = new URLSearchParams(window.location.search).get('tab')
      if (searchParam === 'whatsapp' || searchParam === 'waba') return 'waba'
      if (
        searchParam &&
        ['profile', 'team', 'organisation', 'billing', 'waba', 'appearance'].includes(searchParam)
      ) {
        return searchParam
      }
    }
    return defaultTab
  })

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const [profileSubTab, setProfileSubTab] = useState<'profile' | 'password'>('profile')

  // Settings & Team State
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Team invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'AGENT' | 'DEVELOPER'>('AGENT')
  const [isInviting, setIsInviting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)

  // WABA testing state
  const [isTestingWaba, setIsTestingWaba] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  // Fetch full settings and team members from Gateway API
  const loadData = useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true)
      const res = (await veroxApi.getSettings()) as {
        data?: {
          profile?: typeof defaultSettings.profile
          organisation?: typeof defaultSettings.organisation
          waba?: typeof defaultSettings.waba
          billing?: typeof defaultSettings.billing
          teamMembers?: TeamMember[]
        }
        profile?: typeof defaultSettings.profile
        organisation?: typeof defaultSettings.organisation
        waba?: typeof defaultSettings.waba
        billing?: typeof defaultSettings.billing
        teamMembers?: TeamMember[]
      }
      const data = res?.data || res

      if (data?.profile && data?.organisation && data?.waba) {
        setSettings({
          profile: data.profile,
          organisation: data.organisation,
          waba: data.waba,
          billing: data.billing || defaultSettings.billing,
        })
      }

      if (data?.teamMembers && Array.isArray(data.teamMembers)) {
        setTeamMembers(data.teamMembers)
      }

      if (showToast) {
        toast.success('Settings synchronized with API Gateway!')
      }
    } catch (_err: unknown) {
      // Local fallback in state
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initData = async () => {
      try {
        setIsRefreshing(true)
        const res = (await veroxApi.getSettings()) as {
          data?: {
            profile?: typeof defaultSettings.profile
            organisation?: typeof defaultSettings.organisation
            waba?: typeof defaultSettings.waba
            billing?: typeof defaultSettings.billing
            teamMembers?: TeamMember[]
          }
          profile?: typeof defaultSettings.profile
          organisation?: typeof defaultSettings.organisation
          waba?: typeof defaultSettings.waba
          billing?: typeof defaultSettings.billing
          teamMembers?: TeamMember[]
        }
        if (!isMounted) return
        const data = res?.data || res

        if (data?.profile && data?.organisation && data?.waba) {
          setSettings({
            profile: data.profile,
            organisation: data.organisation,
            waba: data.waba,
            billing: data.billing || defaultSettings.billing,
          })
        }

        if (data?.teamMembers && Array.isArray(data.teamMembers)) {
          setTeamMembers(data.teamMembers)
        }
      } catch {
        // Fallback to local state
      } finally {
        if (isMounted) {
          setIsRefreshing(false)
        }
      }
    }

    void initData()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await veroxApi.updateSettingsProfile(settings.profile as unknown as Record<string, unknown>)
      toast.success('Profile Updated Successfully!', {
        description: `Name: ${settings.profile.name} • Phone: ${settings.profile.phone} saved to server.`,
      })
    } catch (_err: unknown) {
      toast.error('Failed to update profile on server')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    setIsChangingPassword(true)
    try {
      await veroxApi.changeSettingsPassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password Changed Successfully!', {
        description: 'Your security credentials have been updated on the gateway.',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server error'
      toast.error('Failed to change password', {
        description: msg,
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Handle Invite Team Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !invitePhone.trim()) {
      toast.error('Please enter both Email and Phone number.')
      return
    }

    setIsInviting(true)
    try {
      const payload = {
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        phone: invitePhone.startsWith('+91') ? invitePhone.trim() : `+91${invitePhone.trim()}`,
        role: inviteRole,
      }

      const res = (await veroxApi.inviteSettingsTeamMember(payload)) as { data?: TeamMember } | undefined
      const created = res?.data || {
        id: `tm-${Date.now()}`,
        ...payload,
        status: 'Active' as const,
      }

      setTeamMembers((prev) => [...prev, created])
      setInviteEmail('')
      setInvitePhone('')
      toast.success(`Invite Sent to ${created.email}!`, {
        description: `Assigned role: ${created.role}. Member added to team list.`,
      })
    } catch (_err: unknown) {
      toast.error('Failed to invite team member')
    } finally {
      setIsInviting(false)
    }
  }

  // Handle Toggle Member Status
  const handleToggleMemberStatus = async (id: string, newStatus: 'Active' | 'Inactive') => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    )

    try {
      await veroxApi.updateSettingsTeamMember(id, { status: newStatus })
      toast.info(`Member status changed to ${newStatus}.`)
    } catch (_err: unknown) {
      void loadData(false)
      toast.error('Failed to update member status')
    }
  }

  // Handle Delete Team Member
  const confirmDeleteMember = async (id: string, name: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
    setMemberToDelete(null)

    try {
      await veroxApi.deleteSettingsTeamMember(id)
      toast.info(`Removed "${name}" from team access.`)
    } catch (_err: unknown) {
      void loadData(false)
      toast.error('Failed to delete member')
    }
  }

  // Handle Organisation Save
  const handleSaveOrganisation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await veroxApi.updateSettingsOrganisation(settings.organisation as unknown as Record<string, unknown>)
      toast.success('Organisation Details Saved!', {
        description: `Company: ${settings.organisation.name} • Industry: ${settings.organisation.industry}.`,
      })
    } catch (_err: unknown) {
      toast.error('Failed to save organisation details')
    } finally {
      setIsSaving(false)
    }
  }

  // Test WABA Connection
  const handleTestWabaConnection = async () => {
    setIsTestingWaba(true)
    try {
      const res = (await veroxApi.verifySettingsWaba()) as { status?: string } | undefined
      toast.success(res?.status || 'Meta WhatsApp Cloud API Verified (200 OK)!', {
        description: `Connected to Phone ID: ${settings.waba.phoneNumberId} (${settings.waba.displayPhone}).`,
      })
      setSettings((prev) => ({
        ...prev,
        waba: { ...prev.waba, status: 'CONNECTED' },
      }))
    } catch (_err: unknown) {
      toast.error('WABA Connection Test Failed', {
        description: 'Verify Meta App Access Token & Phone Number ID.',
      })
    } finally {
      setIsTestingWaba(false)
    }
  }

  // Handle Save WABA API Settings
  const handleSaveWabaSettings = async () => {
    setIsSaving(true)
    try {
      await veroxApi.updateSettingsWaba(settings.waba as unknown as Record<string, unknown>)
      toast.success('WABA API Settings Saved to Server!')
    } catch (_err: unknown) {
      toast.error('Failed to save WABA settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Switch Billing Plan
  const handleSwitchBillingPlan = async (plan: 'PRO PLAN' | 'ANNUAL PRO PLAN') => {
    try {
      await veroxApi.updateSettingsBilling(plan)
      setSettings((prev) => ({
        ...prev,
        billing: {
          ...(prev.billing || defaultSettings.billing!),
          plan,
          amount: plan === 'PRO PLAN' ? 'INR 4,000 / month' : 'INR 25,000 / year',
        },
      }))
      toast.success(`Subscription switched to ${plan}!`)
    } catch (_err: unknown) {
      toast.error('Failed to switch plan')
    }
  }

  // Reset to Defaults
  const handleResetDefaults = async () => {
    try {
      setIsRefreshing(true)
      await veroxApi.resetSettings()
      await loadData(false)
      toast.success('Platform Settings reset to agency defaults!')
    } catch (_err: unknown) {
      setSettings(defaultSettings)
      setTeamMembers(defaultTeamMembers)
      toast.info('Local settings reset to default.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Shield className='h-4 w-4 text-orange-600' />
          <span>Platform Settings</span>
          <Badge className='bg-orange-500/10 text-orange-600 border-0 text-[10px] hidden sm:inline-flex'>
            Enterprise Cloud
          </Badge>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-4 sm:p-6 space-y-6 max-w-5xl mx-auto'>
        {/* Top Header & Breadcrumb */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4'>
          <div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1'>
              <span>Dashboard</span>
              <span>&gt;</span>
              <span>Settings</span>
              <span>&gt;</span>
              <span className='capitalize text-orange-600 font-semibold'>{activeTab}</span>
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>
              Settings
            </h1>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Set up your Profile, Billing Information, Team Access and Organisation Details
            </p>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              id='btn-settings-reset'
              variant='outline'
              size='sm'
              onClick={handleResetDefaults}
              disabled={isRefreshing}
              className='gap-1.5 text-xs h-9 cursor-pointer'
              title='Reset all settings to agency defaults'
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className='hidden sm:inline'>Reset Defaults</span>
            </Button>
            <Button
              id='btn-settings-sync'
              variant='outline'
              size='sm'
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className='gap-1.5 text-xs h-9 cursor-pointer'
              title='Sync settings with server'
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className='hidden sm:inline'>Sync</span>
            </Button>
          </div>
        </div>

        {/* Top Pill Navigation Tabs */}
        <div className='flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 overflow-x-auto'>
          <button
            id='tab-profile'
            type='button'
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className='h-3.5 w-3.5' />
            Profile
          </button>
          <button
            id='tab-team'
            type='button'
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className='h-3.5 w-3.5' />
            Team ({teamMembers.length})
          </button>
          <button
            id='tab-organisation'
            type='button'
            onClick={() => setActiveTab('organisation')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'organisation'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className='h-3.5 w-3.5' />
            Organisation
          </button>
          <button
            id='tab-billing'
            type='button'
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className='h-3.5 w-3.5' />
            Billing
          </button>
          <button
            id='tab-waba'
            type='button'
            onClick={() => setActiveTab('waba')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'waba'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className='h-3.5 w-3.5' />
            WhatsApp API
          </button>
          <button
            id='tab-appearance'
            type='button'
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette className='h-3.5 w-3.5' />
            Appearance
          </button>
        </div>

        {/* TAB 1: PROFILE & PASSWORD */}
        {activeTab === 'profile' && (
          <div className='space-y-6'>
            {/* Sub-tabs: Profile vs Change Password */}
            <div>
              <h2 className='text-sm font-bold text-foreground'>Profile</h2>
              <p className='text-xs text-muted-foreground'>Manage your account settings</p>
              <div className='flex items-center gap-2 mt-3 p-1 w-fit rounded-lg bg-muted/40 border border-border/60 text-xs'>
                <button
                  id='btn-subtab-profile'
                  type='button'
                  onClick={() => setProfileSubTab('profile')}
                  className={`py-1.5 px-4 rounded-md font-medium cursor-pointer transition-all ${
                    profileSubTab === 'profile'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Profile
                </button>
                <button
                  id='btn-subtab-password'
                  type='button'
                  onClick={() => setProfileSubTab('password')}
                  className={`py-1.5 px-4 rounded-md font-medium cursor-pointer transition-all ${
                    profileSubTab === 'password'
                      ? 'bg-card text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>

            {profileSubTab === 'profile' ? (
              <form onSubmit={handleUpdateProfile} className='space-y-5 max-w-2xl'>
                {/* Avatar Box */}
                <div className='rounded-xl border border-border/70 bg-card p-4 flex items-center justify-between shadow-xs'>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <div className='h-14 w-14 rounded-full bg-orange-600/10 border-2 border-orange-600/20 text-orange-600 flex items-center justify-center font-bold text-lg'>
                        TS
                      </div>
                      <button
                        type='button'
                        onClick={() => toast.info('Click to choose avatar image.')}
                        className='absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border shadow-xs text-muted-foreground hover:text-foreground cursor-pointer'
                        title='Change Photo'
                      >
                        <Camera className='h-3.5 w-3.5' />
                      </button>
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-sm text-foreground'>{settings.profile.name}</span>
                        <Badge className='text-[10px] bg-red-600 hover:bg-red-600 text-white font-bold px-1.5 py-0'>
                          {settings.profile.role || 'ADMIN'}
                        </Badge>
                      </div>
                      <span className='text-xs text-muted-foreground font-mono'>
                        {settings.profile.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Name</Label>
                  <Input
                    id='input-profile-name'
                    value={settings.profile.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value },
                      })
                    }
                    className='h-9 text-xs'
                  />
                  <p className='text-[11px] text-muted-foreground'>Set your name.</p>
                </div>

                {/* Email */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Email</Label>
                  <Input
                    id='input-profile-email'
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value },
                      })
                    }
                    className='h-9 text-xs'
                  />
                </div>

                {/* Phone */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Phone</Label>
                  <Input
                    id='input-profile-phone'
                    value={settings.profile.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value },
                      })
                    }
                    className='h-9 text-xs font-mono'
                  />
                </div>

                {/* Bio */}
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Role & Operational Bio</Label>
                  <Input
                    id='input-profile-bio'
                    value={settings.profile.bio}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        profile: { ...settings.profile, bio: e.target.value },
                      })
                    }
                    className='h-9 text-xs'
                  />
                </div>

                <div className='pt-2'>
                  <Button
                    id='btn-profile-submit'
                    type='submit'
                    disabled={isSaving}
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs'
                  >
                    {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' /> : null}
                    Update Profile
                  </Button>
                </div>
              </form>
            ) : (
              /* CHANGE PASSWORD SUB-TAB */
              <form onSubmit={handleUpdatePassword} className='space-y-4 max-w-md'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Current Password</Label>
                  <div className='relative'>
                    <Input
                      id='input-current-password'
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder='••••••••••••'
                      className='h-9 text-xs pr-8'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer'
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>New Password</Label>
                  <Input
                    id='input-new-password'
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Min. 6 characters'
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Confirm New Password</Label>
                  <Input
                    id='input-confirm-password'
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-type new password'
                    className='h-9 text-xs'
                  />
                </div>

                <div className='pt-2'>
                  <Button
                    id='btn-password-submit'
                    type='submit'
                    disabled={isChangingPassword}
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs'
                  >
                    {isChangingPassword ? <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' /> : null}
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className='space-y-6'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>Team</h2>
              <p className='text-xs text-muted-foreground'>Manage, invite and view team members</p>
            </div>

            {/* Invite New Members Box */}
            <div className='rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4'>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                Invite new members by email address
              </h3>

              <form onSubmit={handleInviteMember} className='grid grid-cols-1 md:grid-cols-12 gap-3 items-end'>
                <div className='md:col-span-5 space-y-1.5'>
                  <Label className='text-xs font-semibold'>Email</Label>
                  <Input
                    id='input-team-email'
                    type='email'
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter member's email"
                    className='h-9 text-xs'
                  />
                </div>

                <div className='md:col-span-4 space-y-1.5'>
                  <Label className='text-xs font-semibold'>Phone</Label>
                  <div className='flex items-center gap-1.5'>
                    <div className='h-9 px-2.5 rounded-md border border-border bg-muted/30 text-xs flex items-center gap-1 shrink-0'>
                      <span>🇮🇳</span>
                      <span className='font-mono'>+91</span>
                    </div>
                    <Input
                      id='input-team-phone'
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder='9876543210'
                      className='h-9 text-xs font-mono'
                    />
                  </div>
                </div>

                <div className='md:col-span-3 space-y-1.5'>
                  <Label className='text-xs font-semibold'>Role</Label>
                  <select
                    id='select-team-role'
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                    className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden cursor-pointer'
                  >
                    <option value='AGENT'>Agent</option>
                    <option value='MANAGER'>Manager</option>
                    <option value='DEVELOPER'>Developer</option>
                    <option value='ADMIN'>Admin</option>
                  </select>
                </div>

                <div className='md:col-span-12 flex items-center justify-end gap-2 pt-2'>
                  <Button
                    id='btn-team-invite'
                    type='submit'
                    disabled={isInviting}
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs gap-1.5'
                  >
                    {isInviting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Send className='h-3.5 w-3.5' />}
                    Send Invite
                  </Button>
                </div>
              </form>
            </div>

            {/* All Team Members List */}
            <div className='space-y-3'>
              <h3 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                All team members ({teamMembers.length})
              </h3>

              <div className='space-y-2.5'>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className='rounded-xl border border-border/70 bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-muted/60 border border-border/80 flex items-center justify-center font-bold text-xs uppercase text-foreground shrink-0'>
                        {member.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold text-xs text-foreground'>
                            {member.name} {member.isCurrentUser ? '(You)' : ''}
                          </span>
                          <Badge
                            className={`text-[9px] font-bold px-1.5 py-0 ${
                              member.role === 'ADMIN'
                                ? 'bg-red-600 text-white hover:bg-red-600'
                                : 'bg-orange-600 text-white hover:bg-orange-600'
                            }`}
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5'>
                          <span>{member.email}</span>
                          <span>•</span>
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2.5 shrink-0 self-end sm:self-auto'>
                      {member.isCurrentUser ? (
                        <Badge variant='outline' className='text-xs font-semibold text-emerald-600 border-emerald-500/30'>
                          <CheckCircle2 className='h-3 w-3 mr-1' /> Active
                        </Badge>
                      ) : (
                        <>
                          <select
                            id={`select-status-member-${member.id}`}
                            value={member.status}
                            onChange={(e) =>
                              handleToggleMemberStatus(member.id, e.target.value as 'Active' | 'Inactive')
                            }
                            className={`h-8 rounded-md border px-2 text-xs font-medium outline-hidden cursor-pointer ${
                              member.status === 'Active'
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-border bg-background text-muted-foreground'
                            }`}
                          >
                            <option value='Active'>Active</option>
                            <option value='Inactive'>Inactive</option>
                          </select>
                          <Button
                            id={`btn-delete-member-${member.id}`}
                            variant='ghost'
                            size='icon'
                            onClick={() => setMemberToDelete(member)}
                            className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer'
                            title='Remove Member'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORGANISATION */}
        {activeTab === 'organisation' && (
          <div className='space-y-6 max-w-2xl'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>Organisation</h2>
              <p className='text-xs text-muted-foreground'>Edit Organisation details</p>
            </div>

            <form onSubmit={handleSaveOrganisation} className='space-y-5'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Organization Name</Label>
                <Input
                  id='input-org-name'
                  value={settings.organisation.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, name: e.target.value },
                    })
                  }
                  className='h-9 text-xs'
                />
                <p className='text-[11px] text-muted-foreground'>Set your organisation name.</p>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Industry</Label>
                <select
                  id='select-org-industry'
                  value={settings.organisation.industry}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, industry: e.target.value },
                    })
                  }
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden cursor-pointer'
                >
                  <option value='Transportation & Logistics'>Transportation & Logistics</option>
                  <option value='Commercial Fleet Management'>Commercial Fleet Management</option>
                  <option value='E-Commerce & Retail'>E-Commerce & Retail</option>
                  <option value='Software & IT Services'>Software & IT Services</option>
                  <option value='Manufacturing & Heavy Goods'>Manufacturing & Heavy Goods</option>
                  <option value='Automotive Dealership'>Automotive Dealership</option>
                </select>
                <p className='text-[11px] text-muted-foreground'>Set industry type.</p>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Website (Optional)</Label>
                <Input
                  id='input-org-website'
                  value={settings.organisation.website}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, website: e.target.value },
                    })
                  }
                  placeholder='https://example.com'
                  className='h-9 text-xs'
                />
                <p className='text-[11px] text-muted-foreground'>Set your website address.</p>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>GSTIN / Tax ID</Label>
                <Input
                  id='input-org-gstin'
                  value={settings.organisation.gstin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, gstin: e.target.value },
                    })
                  }
                  className='h-9 text-xs font-mono uppercase'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Registered Address</Label>
                <Input
                  id='input-org-address'
                  value={settings.organisation.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, address: e.target.value },
                    })
                  }
                  className='h-9 text-xs'
                />
              </div>

              <div className='pt-2'>
                <Button
                  id='btn-org-submit'
                  type='submit'
                  disabled={isSaving}
                  className='bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold h-9 px-6 cursor-pointer shadow-xs'
                >
                  {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' /> : null}
                  Save Organisation
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: BILLING & SUBSCRIPTION */}
        {activeTab === 'billing' && (
          <div className='space-y-6'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>Billing & Subscription</h2>
              <p className='text-xs text-muted-foreground'>
                Manage your subscription and explore available plans
              </p>
            </div>

            {/* Current Active Plan Card */}
            <div className='rounded-2xl border-2 border-orange-500/40 bg-card p-6 shadow-xs space-y-5 relative overflow-hidden'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-2.5'>
                  <Crown className='h-5 w-5 text-orange-600' />
                  <div>
                    <h3 className='font-bold text-base text-foreground uppercase tracking-wide'>
                      {settings.billing?.plan || 'ANNUAL PRO PLAN'}
                    </h3>
                    <p className='text-xs text-muted-foreground'>Current Plan</p>
                  </div>
                </div>
                <Badge className='bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 gap-1'>
                  <Check className='h-3 w-3' /> Active
                </Badge>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2'>
                <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1'>
                  <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    📅 EXPIRES
                  </div>
                  <div className='font-bold text-sm text-foreground'>
                    {settings.billing?.expiresAt || '19 Jan 2027'}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>Annual Billing Cycle</div>
                </div>

                <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1'>
                  <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    ✨ DAYS LEFT
                  </div>
                  <div className='font-bold text-sm text-emerald-600 dark:text-emerald-400'>
                    {settings.billing?.daysLeft || 87}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>Active & Good Standing</div>
                </div>

                <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1'>
                  <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    📦 ADD-ONS
                  </div>
                  <div className='font-bold text-sm text-foreground'>
                    {settings.billing?.addonsCount || 1} Included
                  </div>
                  <div className='text-[10px] text-muted-foreground'>AIS-140 GPS Sync Desk</div>
                </div>
              </div>

              <div className='pt-1'>
                <Button
                  id='btn-billing-contact'
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('Support Desk: support@whatsapi.io • Priority Enterprise SLA.')}
                  className='text-xs font-semibold h-8 gap-1.5 cursor-pointer'
                >
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Available Plans Section */}
            <div className='space-y-4 pt-2'>
              <div>
                <h3 className='font-bold text-sm text-foreground'>Available Plans</h3>
                <p className='text-xs text-muted-foreground'>
                  Choose the perfect plan for your business needs
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* PRO PLAN */}
                <div className='rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between space-y-4 shadow-xs'>
                  <div>
                    <h4 className='font-bold text-base text-foreground'>PRO PLAN</h4>
                    <p className='text-xs text-muted-foreground'>Monthly subscription billing</p>
                    <div className='mt-3 flex items-baseline gap-1'>
                      <span className='text-2xl font-black text-foreground'>INR 4,000</span>
                      <span className='text-xs text-muted-foreground'>/month</span>
                    </div>

                    <div className='mt-5 space-y-2.5 text-xs text-foreground'>
                      <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                        FEATURES
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>WhatsApp Chatbot Automation</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>Visual Flow Builder</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>Automated Welcome Messages</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>WhatsApp Broadcasting Campaigns</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    id='btn-billing-switch-monthly'
                    variant='outline'
                    onClick={() => handleSwitchBillingPlan('PRO PLAN')}
                    className='w-full text-xs font-semibold cursor-pointer'
                  >
                    Switch to Monthly Plan
                  </Button>
                </div>

                {/* ANNUAL PRO PLAN (Current) */}
                <div className='rounded-2xl border-2 border-orange-500 bg-card p-6 flex flex-col justify-between space-y-4 shadow-md relative'>
                  <div className='absolute -top-3 left-6 flex items-center gap-1.5'>
                    <Badge className='bg-orange-600 hover:bg-orange-600 text-white font-bold text-[10px]'>
                      👑 Popular
                    </Badge>
                    <Badge className='bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px]'>
                      Current
                    </Badge>
                  </div>

                  <div>
                    <h4 className='font-bold text-base text-foreground mt-1'>ANNUAL PRO PLAN</h4>
                    <p className='text-xs text-muted-foreground'>Whatsapp Api with all pro features</p>
                    <div className='mt-3 flex items-baseline gap-1'>
                      <span className='text-2xl font-black text-foreground'>INR 25,000</span>
                      <span className='text-xs text-muted-foreground'>/year</span>
                    </div>

                    <div className='mt-5 space-y-2.5 text-xs text-foreground'>
                      <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                        FEATURES
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>WhatsApp Chatbot Automation</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>Visual Flow Builder</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>Automated Welcome Messages</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        <span>WhatsApp Broadcasting Campaigns</span>
                      </div>
                    </div>

                    <div className='mt-4 rounded-lg bg-muted/30 p-2.5 border border-border/50 flex items-center justify-between text-xs'>
                      <span className='font-medium text-foreground'>Add-ons (1 Included)</span>
                      <ChevronDown className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </div>

                  <Button
                    id='btn-billing-active-plan'
                    disabled
                    className='w-full bg-orange-600/20 text-orange-600 dark:text-orange-400 font-bold text-xs cursor-default'
                  >
                    Current Active Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WHATSAPP CLOUD API & WABA CREDENTIALS */}
        {activeTab === 'waba' && (
          <div className='space-y-6 max-w-2xl'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>WhatsApp Cloud API & Meta WABA Settings</h2>
              <p className='text-xs text-muted-foreground'>
                Configure official Meta Graph API credentials for outbound campaigns and inbound webhook listeners.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>WABA ID</Label>
                  <Input
                    id='input-waba-id'
                    value={settings.waba.wabaId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waba: { ...settings.waba, wabaId: e.target.value },
                      })
                    }
                    className='h-9 text-xs font-mono'
                  />
                  <p className='text-[10px] text-muted-foreground'>WhatsApp Business Account ID</p>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>Phone Number ID</Label>
                  <Input
                    id='input-waba-phone-id'
                    value={settings.waba.phoneNumberId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waba: { ...settings.waba, phoneNumberId: e.target.value },
                      })
                    }
                    className='h-9 text-xs font-mono'
                  />
                  <p className='text-[10px] text-muted-foreground'>Sender phone identifier</p>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Display Phone Number</Label>
                <Input
                  id='input-waba-display-phone'
                  value={settings.waba.displayPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      waba: { ...settings.waba, displayPhone: e.target.value },
                    })
                  }
                  className='h-9 text-xs font-mono'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Permanent Access Token</Label>
                <div className='relative flex items-center'>
                  <Input
                    id='input-waba-token'
                    type='password'
                    value={settings.waba.accessToken}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waba: { ...settings.waba, accessToken: e.target.value },
                      })
                    }
                    className='h-9 text-xs font-mono pr-8'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      navigator.clipboard.writeText(settings.waba.accessToken)
                      setCopiedToken(true)
                      setTimeout(() => setCopiedToken(false), 2000)
                      toast.success('Token copied to clipboard!')
                    }}
                    className='absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer'
                  >
                    {copiedToken ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
                  </button>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Webhook Callback URL</Label>
                <div className='relative flex items-center'>
                  <Input
                    id='input-waba-webhook'
                    readOnly
                    value={settings.waba.webhookUrl}
                    className='h-9 text-xs font-mono pr-8 bg-muted/20'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      navigator.clipboard.writeText(settings.waba.webhookUrl)
                      setCopiedWebhook(true)
                      setTimeout(() => setCopiedWebhook(false), 2000)
                      toast.success('Webhook URL copied to clipboard!')
                    }}
                    className='absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer'
                  >
                    {copiedWebhook ? <Check className='h-3.5 w-3.5 text-emerald-600' /> : <Copy className='h-3.5 w-3.5' />}
                  </button>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Webhook Verify Token</Label>
                <Input
                  id='input-waba-verify-token'
                  value={settings.waba.verifyToken}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      waba: { ...settings.waba, verifyToken: e.target.value },
                    })
                  }
                  className='h-9 text-xs font-mono'
                />
              </div>

              <div className='flex items-center gap-3 pt-3 flex-wrap'>
                <Button
                  id='btn-waba-test'
                  type='button'
                  disabled={isTestingWaba}
                  onClick={handleTestWabaConnection}
                  className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-4 cursor-pointer gap-1.5 shadow-xs'
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingWaba ? 'animate-spin' : ''}`} />
                  {isTestingWaba ? 'Testing Connection...' : 'Test Connection'}
                </Button>
                <Button
                  id='btn-waba-save'
                  type='button'
                  disabled={isSaving}
                  onClick={handleSaveWabaSettings}
                  variant='outline'
                  className='text-xs font-semibold h-9 px-4 cursor-pointer'
                >
                  {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' /> : null}
                  Save API Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: APPEARANCE & ALERTS */}
        {activeTab === 'appearance' && (
          <div className='space-y-6 max-w-2xl'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>Appearance & Notifications</h2>
              <p className='text-xs text-muted-foreground'>
                Customize visual theme, sound chimes, and CRM push alerts
              </p>
            </div>

            <div className='space-y-4'>
              <div className='rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-xs font-bold text-foreground'>Theme Switcher</div>
                    <div className='text-[11px] text-muted-foreground'>
                      Toggle between Light mode and Dark mode.
                    </div>
                  </div>
                  <ThemeSwitch />
                </div>
              </div>

              <div className='rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-xs font-bold text-foreground'>Incoming Chat Sound Chime</div>
                    <div className='text-[11px] text-muted-foreground'>
                      Play notification ringtone when a new customer sends a WhatsApp query.
                    </div>
                  </div>
                  <Badge className='bg-emerald-600 text-white font-bold text-xs'>Enabled</Badge>
                </div>
              </div>

              <div className='rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-xs'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-xs font-bold text-foreground'>Auto-Save Changes</div>
                    <div className='text-[11px] text-muted-foreground'>
                      Automatically persist campaign drafts, chatbot flows, and contact tags.
                    </div>
                  </div>
                  <Badge className='bg-emerald-600 text-white font-bold text-xs'>Active</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Team Member Confirmation Modal */}
        <Dialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
          {memberToDelete && (
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-red-600'>
                  <Trash2 className='h-5 w-5' />
                  Remove Team Member
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  Are you sure you want to remove <strong className='text-foreground'>"{memberToDelete.name}"</strong> ({memberToDelete.email}) from team access?
                  Their platform login session will be revoked and they will lose access to WhatsApp live chats and contacts.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setMemberToDelete(null)}
                  className='h-8 text-xs cursor-pointer'
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => confirmDeleteMember(memberToDelete.id, memberToDelete.name)}
                  className='h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer'
                >
                  Remove Member
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </Main>
    </>
  )
}
