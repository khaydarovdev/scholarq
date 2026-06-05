import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import type { Scholarship } from '@/lib/supabase'
import { toast } from 'sonner'

export function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Partial<Scholarship> | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const { data } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setScholarships(data as Scholarship[])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = scholarships.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => {
    setEditing({ title: '', provider: '', country: '', degree_level: 'masters', funding_type: 'fully-funded', description: '', eligibility: '', benefits: '', application_process: '', is_featured: false, is_active: true })
    setShowDialog(true)
  }

  const openEdit = (s: Scholarship) => { setEditing({ ...s }); setShowDialog(true) }

  const handleSave = async () => {
    if (!editing?.title || !editing?.provider || !editing?.country) { toast.error('Title, provider, country required'); return }
    setSaving(true)
    if (editing.id) {
      const { error } = await supabase.from('scholarships').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
      if (error) toast.error(error.message)
      else { toast.success('Scholarship updated'); fetchAll() }
    } else {
      const { error } = await supabase.from('scholarships').insert({ ...editing })
      if (error) toast.error(error.message)
      else { toast.success('Scholarship created'); fetchAll() }
    }
    setSaving(false)
    setShowDialog(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scholarship?')) return
    await supabase.from('scholarships').update({ is_active: false }).eq('id', id)
    toast.success('Scholarship deactivated')
    fetchAll()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('scholarships').update({ is_featured: !current }).eq('id', id)
    fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Scholarships</h1>
          <p className="text-muted-foreground text-sm">{scholarships.length} total</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
          <Plus className="size-4 mr-2" /> Add Scholarship
        </Button>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scholarships..." className="max-w-sm" />

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Country</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Degree</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Funding</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Views</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium line-clamp-1 max-w-xs">{s.title}</span>
                    {s.is_featured && <Star className="size-3.5 fill-amber text-amber flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{s.provider}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.country}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs capitalize">{s.degree_level}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.funding_type === 'fully-funded' ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-amber/10 text-amber border-amber/20'}`}>
                    {s.funding_type.replace(/-/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.views_count || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => toggleFeatured(s.id, s.is_featured)} className={`p-1.5 rounded hover:bg-amber/10 transition-colors ${s.is_featured ? 'text-amber' : 'text-muted-foreground'}`}>
                      <Star className={`size-3.5 ${s.is_featured ? 'fill-amber' : ''}`} />
                    </button>
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Scholarship' : 'Create Scholarship'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={editing?.title || ''} onChange={e => setEditing(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Provider *</Label>
              <Input value={editing?.provider || ''} onChange={e => setEditing(f => ({ ...f, provider: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>University</Label>
              <Input value={editing?.university || ''} onChange={e => setEditing(f => ({ ...f, university: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Country *</Label>
              <Input value={editing?.country || ''} onChange={e => setEditing(f => ({ ...f, country: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Degree Level</Label>
              <Select value={editing?.degree_level} onValueChange={v => setEditing(f => ({ ...f, degree_level: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['bachelor', 'masters', 'phd', 'postdoc', 'all'].map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Funding Type</Label>
              <Select value={editing?.funding_type} onValueChange={v => setEditing(f => ({ ...f, funding_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['fully-funded', 'partial', 'tuition-only', 'stipend-only', 'living-allowance'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" value={editing?.amount || ''} onChange={e => setEditing(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} placeholder="e.g. 20000" />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={editing?.deadline || ''} onChange={e => setEditing(f => ({ ...f, deadline: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editing?.description || ''} onChange={e => setEditing(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Eligibility</Label>
              <Textarea value={editing?.eligibility || ''} onChange={e => setEditing(f => ({ ...f, eligibility: e.target.value }))} rows={2} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Benefits</Label>
              <Textarea value={editing?.benefits || ''} onChange={e => setEditing(f => ({ ...f, benefits: e.target.value }))} rows={2} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Application Process</Label>
              <Textarea value={editing?.application_process || ''} onChange={e => setEditing(f => ({ ...f, application_process: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Official URL</Label>
              <Input value={editing?.website_url || ''} onChange={e => setEditing(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing?.is_featured || false} onChange={e => setEditing(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing?.is_active !== false} onChange={e => setEditing(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
