import { useEffect, useState } from 'react'
import { User, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { upsertProfile } from '@/lib/api'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const DEGREES = ['bachelor', 'masters', 'phd', 'postdoc']
const COUNTRIES = ['United Kingdom', 'Germany', 'United States', 'Australia', 'Canada', 'Japan', 'South Korea', 'Netherlands', 'Sweden', 'Switzerland', 'Singapore', 'France', 'China', 'New Zealand', 'Ireland', 'Austria', 'Hong Kong', 'Taiwan', 'Malaysia']
const FIELDS = ['Computer Science', 'Engineering', 'Business', 'Economics', 'Medicine', 'Law', 'Arts', 'Humanities', 'Social Sciences', 'Natural Sciences', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology', 'Education', 'Architecture', 'Agriculture', 'Environmental Science', 'Public Policy']

export function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore()
  const [form, setForm] = useState({
    full_name: '', nationality: '', target_degree: '', field_of_study: '',
    gpa: '', bio: '', country_preferences: [] as string[], interests: [] as string[],
    language_scores: { ielts: '', toefl: '', gre: '' }
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        nationality: profile.nationality || '',
        target_degree: profile.target_degree || '',
        field_of_study: profile.field_of_study || '',
        gpa: profile.gpa ? String(profile.gpa) : '',
        bio: profile.bio || '',
        country_preferences: profile.country_preferences || [],
        interests: profile.interests || [],
        language_scores: { ielts: '', toefl: '', gre: '', ...(profile.language_scores as any || {}) }
      })
    }
  }, [profile?.id])

  const completion = (() => {
    const fields = [form.full_name, form.nationality, form.target_degree, form.field_of_study, form.country_preferences.length > 0]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  })()

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      country_preferences: f.country_preferences.includes(c) ? f.country_preferences.filter(x => x !== c) : [...f.country_preferences, c]
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const updates = {
      id: user.id,
      full_name: form.full_name,
      nationality: form.nationality,
      target_degree: form.target_degree,
      field_of_study: form.field_of_study,
      gpa: form.gpa ? parseFloat(form.gpa) : null,
      bio: form.bio,
      country_preferences: form.country_preferences,
      interests: form.interests,
      language_scores: form.language_scores,
    }
    const { error } = await upsertProfile(updates as any)
    if (error) {
      toast.error('Failed to save profile')
    } else {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) setProfile(data as any)
      toast.success('Profile saved!')
    }
    setSaving(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2"><User className="size-7 text-rose" /> Profile</h1>
          <p className="text-muted-foreground mt-1">Your profile powers scholarship matching</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
          {saving ? <div className="size-4 rounded-full border-2 border-emerald-foreground border-t-transparent animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* Profile completion */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Profile Completion</span>
            <span className={`text-sm font-bold ${completion === 100 ? 'text-emerald' : 'text-amber'}`}>{completion}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald to-cyan rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          {completion < 100 && (
            <p className="text-xs text-muted-foreground mt-2">Complete all fields to get the best scholarship matches</p>
          )}
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" />
          </div>
          <div className="space-y-2">
            <Label>Nationality</Label>
            <Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} placeholder="e.g. Nigerian" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Academic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Academic Profile</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Degree Level</Label>
            <Select value={form.target_degree} onValueChange={v => setForm(f => ({ ...f, target_degree: v }))}>
              <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
              <SelectContent>
                {DEGREES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Field of Study</Label>
            <Select value={form.field_of_study} onValueChange={v => setForm(f => ({ ...f, field_of_study: v }))}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                {FIELDS.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>GPA (4.0 scale)</Label>
            <Input type="number" min="0" max="4" step="0.1" value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))} placeholder="e.g. 3.8" />
          </div>
        </CardContent>
      </Card>

      {/* Language scores */}
      <Card>
        <CardHeader><CardTitle className="text-base">Language Scores</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>IELTS</Label>
            <Input type="number" min="0" max="9" step="0.5" value={form.language_scores.ielts} onChange={e => setForm(f => ({ ...f, language_scores: { ...f.language_scores, ielts: e.target.value } }))} placeholder="e.g. 7.5" />
          </div>
          <div className="space-y-2">
            <Label>TOEFL</Label>
            <Input type="number" min="0" max="120" value={form.language_scores.toefl} onChange={e => setForm(f => ({ ...f, language_scores: { ...f.language_scores, toefl: e.target.value } }))} placeholder="e.g. 105" />
          </div>
          <div className="space-y-2">
            <Label>GRE</Label>
            <Input type="number" min="260" max="340" value={form.language_scores.gre} onChange={e => setForm(f => ({ ...f, language_scores: { ...f.language_scores, gre: e.target.value } }))} placeholder="e.g. 320" />
          </div>
        </CardContent>
      </Card>

      {/* Target countries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Target Countries</CardTitle>
            {form.country_preferences.length > 0 && <Badge variant="secondary">{form.country_preferences.length} selected</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(c => (
              <button key={c} onClick={() => toggleCountry(c)} className={`text-sm px-3 py-1.5 rounded-full border transition-all ${form.country_preferences.includes(c) ? 'bg-emerald/10 border-emerald/30 text-emerald font-medium' : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'}`}>
                {form.country_preferences.includes(c) && <CheckCircle className="size-3 inline mr-1" />}
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
