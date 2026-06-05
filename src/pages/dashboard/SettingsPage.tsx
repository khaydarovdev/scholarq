import { useState } from 'react'
import { Settings, Bell, Shield, Palette, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const { user, signOut } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({ deadlines: true, recommendations: true, newsletter: false })
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setNewPassword('') }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    toast.error('Please contact support to delete your account.')
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2"><Settings className="size-7 text-muted-foreground" /> Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([value, Icon, label]) => (
              <button
                key={value as string}
                onClick={() => setTheme(value as any)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${theme === value ? 'border-emerald bg-emerald/5 text-emerald' : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'}`}
              >
                {(Icon as any)({ className: 'size-5' })}
                {label as string}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Control when and how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'deadlines', label: 'Deadline reminders', desc: 'Get notified 7 days before application deadlines' },
            { key: 'recommendations', label: 'New recommendations', desc: 'When new scholarships match your profile' },
            { key: 'newsletter', label: 'Monthly newsletter', desc: 'Tips, stories, and new scholarship announcements' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={v => setNotifications(n => ({ ...n, [key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Email</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium">Change Password</p>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min. 8 characters)" />
            <Button size="sm" onClick={handlePasswordChange} disabled={saving || !newPassword}>
              {saving ? 'Saving...' : 'Update password'}
            </Button>
          </div>
          <Separator />
          <div>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => signOut()}>Sign out of all devices</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
