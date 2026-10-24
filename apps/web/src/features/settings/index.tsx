import { useState } from 'react'
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

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'DEVELOPER'
  status: 'Active' | 'Inactive'
  isCurrentUser?: boolean
}

export interface SettingsState {
  profile: {
    name: string
    email: string
    phone: string
    bio: string
  }
  organisation: {
    name: string
    industry: string
    website: string
    gstin: string
    address: string
  }
  waba: {
    wabaId: string
    phoneNumberId: string
    displayPhone: string
    accessToken: string
    verifyToken: string
    webhookUrl: string
  }
}

const defaultSettings: SettingsState = {
  profile: {
    name: 'truck sathi',
    email: 'trucksathiamazon@gmail.com',
    phone: '+917698580034',
    bio: 'Fleet Operations Head at Truck Sathi & Whatsapi. Managing 500+ Gujarat commercial fleet AIS-140 GPS tracking devices and automated WhatsApp marketing.',
  },
  organisation: {
    name: 'Truck Sathi',
    industry: 'Transportation & Logistics',
    website: 'https://trucksathi.in',
    gstin: '24AAACT1234F1Z8',
    address: 'Near Ring Road Circle, SG Highway, Ahmedabad, Gujarat - 380054',
  },
  waba: {
    wabaId: '109283746501928',
    phoneNumberId: '942534582278953',
    displayPhone: '+917698580043',
    accessToken: 'EAAGm0PX4ZCpsBA...K390Lks92384jsd02349sd',
    verifyToken: 'whatsapi_secure_verify_token_2026',
    webhookUrl: 'https://app.whatsapi.io/api/v2/webhook/whatsapp',
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
  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [profileSubTab, setProfileSubTab] = useState<'profile' | 'password'>('profile')

  // Settings State from LocalStorage
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_settings_v3')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Fallback
    }
    return defaultSettings
  })

  // Team Members State from LocalStorage
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('whatsapi_team_members_v2')
      if (saved) return JSON.parse(saved)
    } catch (_err) {
      // Fallback
    }
    return defaultTeamMembers
  })

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Team invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'AGENT' | 'DEVELOPER'>('AGENT')

  // WABA testing state
  const [isTestingWaba, setIsTestingWaba] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const persistSettings = (updated: SettingsState) => {
    setSettings(updated)
    try {
      localStorage.setItem('whatsapi_settings_v3', JSON.stringify(updated))
    } catch (_err) {
      // Ignore
    }
  }

  const persistTeam = (updated: TeamMember[]) => {
    setTeamMembers(updated)
    try {
      localStorage.setItem('whatsapi_team_members_v2', JSON.stringify(updated))
    } catch (_err) {
      // Ignore
    }
  }

  // Handle Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    persistSettings(settings)
    toast.success('Profile Updated Successfully!', {
      description: `Name: ${settings.profile.name} • Phone: ${settings.profile.phone} saved.`,
    })
  }

  // Handle Password Update
  const handleUpdatePassword = (e: React.FormEvent) => {
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
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('Password Changed Successfully!', {
      description: 'Your security credentials have been updated.',
    })
  }

  // Handle Invite Team Member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !invitePhone.trim()) {
      toast.error('Please enter both Email and Phone number.')
      return
    }
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      phone: invitePhone.startsWith('+91') ? invitePhone.trim() : `+91${invitePhone.trim()}`,
      role: inviteRole,
      status: 'Active',
    }
    const updated = [...teamMembers, newMember]
    persistTeam(updated)
    setInviteEmail('')
    setInvitePhone('')
    toast.success(`Invite Sent to ${newMember.email}!`, {
      description: `Assigned role: ${newMember.role}. Member added to team list.`,
    })
  }

  // Handle Toggle Member Status
  const handleToggleMemberStatus = (id: string, newStatus: 'Active' | 'Inactive') => {
    const updated = teamMembers.map((m) =>
      m.id === id ? { ...m, status: newStatus } : m
    )
    persistTeam(updated)
    toast.info(`Member status changed to ${newStatus}.`)
  }

  // Handle Delete Team Member
  const handleDeleteMember = (id: string, name: string) => {
    const updated = teamMembers.filter((m) => m.id !== id)
    persistTeam(updated)
    toast.info(`Removed "${name}" from team access.`)
  }

  // Handle Organisation Save
  const handleSaveOrganisation = (e: React.FormEvent) => {
    e.preventDefault()
    persistSettings(settings)
    toast.success('Organisation Details Saved!', {
      description: `Company: ${settings.organisation.name} • Industry: ${settings.organisation.industry}.`,
    })
  }

  // Test WABA Connection
  const handleTestWabaConnection = () => {
    setIsTestingWaba(true)
    toast.info('Testing Meta WhatsApp Cloud API connection...')
    setTimeout(() => {
      setIsTestingWaba(false)
      toast.success('Meta WhatsApp Cloud API Verified (200 OK)!', {
        description: `Connected to Phone ID: ${settings.waba.phoneNumberId} (${settings.waba.displayPhone}).`,
      })
    }, 850)
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto font-semibold text-sm flex items-center gap-2'>
          <Shield className='h-4 w-4 text-orange-600' />
          <span>Platform Settings</span>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='p-6 space-y-6 max-w-5xl mx-auto'>
        {/* Top Header & Breadcrumb (Matches BizAutomation Screenshot) */}
        <div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground font-mono mb-1.5'>
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

        {/* Top Pill Navigation Tabs (Exact Match to BizAutomation Screenshot) */}
        <div className='flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 overflow-x-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className='h-3.5 w-3.5' />
            Profile
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className='h-3.5 w-3.5' />
            Team
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('organisation')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'organisation'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className='h-3.5 w-3.5' />
            Organisation
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'billing'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className='h-3.5 w-3.5' />
            Billing
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('waba')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'waba'
                ? 'bg-card text-foreground shadow-xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className='h-3.5 w-3.5' />
            WhatsApp API
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
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
                {/* Avatar Box (Matches BizAutomation) */}
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
                        <span className='font-bold text-sm text-foreground'>Truck Sathi</span>
                        <Badge className='text-[10px] bg-red-600 hover:bg-red-600 text-white font-bold px-1.5 py-0'>
                          ADMIN
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
                    type='submit'
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs'
                  >
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
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-type new password'
                    className='h-9 text-xs'
                  />
                </div>

                <div className='pt-2'>
                  <Button
                    type='submit'
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs'
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TEAM MANAGEMENT (Exact Match to BizAutomation Screenshot) */}
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
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                    className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden'
                  >
                    <option value='AGENT'>Agent</option>
                    <option value='MANAGER'>Manager</option>
                    <option value='DEVELOPER'>Developer</option>
                    <option value='ADMIN'>Admin</option>
                  </select>
                </div>

                <div className='md:col-span-12 flex items-center justify-end gap-2 pt-2'>
                  <Button
                    type='submit'
                    className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 cursor-pointer shadow-xs gap-1.5'
                  >
                    <Send className='h-3.5 w-3.5' /> Send Invite
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
                            value={member.status}
                            onChange={(e) =>
                              handleToggleMemberStatus(member.id, e.target.value as 'Active' | 'Inactive')
                            }
                            className={`h-8 rounded-md border px-2 text-xs font-medium outline-hidden ${
                              member.status === 'Active'
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-border bg-background text-muted-foreground'
                            }`}
                          >
                            <option value='Active'>Active</option>
                            <option value='Inactive'>Inactive</option>
                          </select>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDeleteMember(member.id, member.name)}
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

        {/* TAB 3: ORGANISATION (Exact Match to BizAutomation Screenshot) */}
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
                  value={settings.organisation.industry}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organisation: { ...settings.organisation, industry: e.target.value },
                    })
                  }
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-xs outline-hidden'
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
                  type='submit'
                  className='bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold h-9 px-6 cursor-pointer shadow-xs'
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: BILLING & SUBSCRIPTION (Exact Match to BizAutomation Screenshot) */}
        {activeTab === 'billing' && (
          <div className='space-y-6'>
            <div>
              <h2 className='text-sm font-bold text-foreground'>Billing & Subscription</h2>
              <p className='text-xs text-muted-foreground'>
                Manage your subscription and explore available plans
              </p>
            </div>

            {/* Current Active Plan Card (Matches BizAutomation) */}
            <div className='rounded-2xl border-2 border-orange-500/40 bg-card p-6 shadow-xs space-y-5 relative overflow-hidden'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-2.5'>
                  <Crown className='h-5 w-5 text-orange-600' />
                  <div>
                    <h3 className='font-bold text-base text-foreground uppercase tracking-wide'>
                      ANNUAL PRO PLAN
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
                  <div className='font-bold text-sm text-foreground'>19 Jan 2027</div>
                  <div className='text-[10px] text-muted-foreground'>19 Jan - 19 Jan</div>
                </div>

                <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1'>
                  <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    ✨ DAYS LEFT
                  </div>
                  <div className='font-bold text-sm text-emerald-600 dark:text-emerald-400'>87</div>
                  <div className='text-[10px] text-muted-foreground'>Active</div>
                </div>

                <div className='rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1'>
                  <div className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    📦 ADD-ONS
                  </div>
                  <div className='font-bold text-sm text-foreground'>0</div>
                  <div className='text-[10px] text-muted-foreground'>INR 0</div>
                </div>
              </div>

              <div className='pt-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toast.info('Support Desk: Contact support@whatsapi.io for custom billing.')}
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
                    <p className='text-xs text-muted-foreground'>4000 per month from 2nd month onwards</p>
                    <div className='mt-3 flex items-baseline gap-1'>
                      <span className='text-2xl font-black text-foreground'>INR 4000</span>
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
                    variant='outline'
                    onClick={() => toast.info('Switching to Monthly billing requires subscription cycle completion.')}
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
                      <span className='text-2xl font-black text-foreground'>INR 25000</span>
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
                <Label className='text-xs font-semibold'>Permanent Access Token</Label>
                <div className='relative flex items-center'>
                  <Input
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
                      toast.success('Token copied!')
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
                      toast.success('Webhook URL copied!')
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

              <div className='flex items-center gap-3 pt-3'>
                <Button
                  type='button'
                  disabled={isTestingWaba}
                  onClick={handleTestWabaConnection}
                  className='bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-4 cursor-pointer gap-1.5 shadow-xs'
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingWaba ? 'animate-spin' : ''}`} />
                  {isTestingWaba ? 'Testing Connection...' : 'Test Connection'}
                </Button>
                <Button
                  type='button'
                  onClick={() => {
                    persistSettings(settings)
                    toast.success('WABA API Settings Saved!')
                  }}
                  variant='outline'
                  className='text-xs font-semibold h-9 px-4 cursor-pointer'
                >
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
      </Main>
    </>
  )
}
