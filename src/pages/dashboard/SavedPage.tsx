import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { useAuthStore, useScholarshipStore, useUserDataStore } from '@/lib/store'
import { fetchUserSaved, unsaveScholarship } from '@/lib/api'
import { toast } from 'sonner'

export function SavedPage() {
  const { user } = useAuthStore()
  const { savedScholarships, setSaved, removeSaved, setLoadingSaved, loadingSaved } = useUserDataStore()
  const { savedIds, setSavedIds } = useScholarshipStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    setLoadingSaved(true)
    fetchUserSaved(user.id).then(({ data }) => {
      if (data) {
        setSaved(data as any)
        setSavedIds(data.map((s: any) => s.scholarship_id))
      }
      setLoadingSaved(false)
    })
  }, [user?.id])

  const handleUnsave = async (scholarshipId: string) => {
    if (!user) return
    removeSaved(scholarshipId)
    const ids = new Set(savedIds)
    ids.delete(scholarshipId)
    setSavedIds(Array.from(ids))
    await unsaveScholarship(user.id, scholarshipId)
    toast.success('Removed from saved')
  }

  const filtered = savedScholarships.filter(s =>
    !search || s.scholarship?.title?.toLowerCase().includes(search.toLowerCase()) || s.scholarship?.provider?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2"><Bookmark className="size-7 text-cyan" /> Saved</h1>
          <p className="text-muted-foreground mt-1">{savedScholarships.length} scholarships saved</p>
        </div>
        {savedScholarships.length > 0 && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved..." className="pl-9 h-9" />
          </div>
        )}
      </div>

      {loadingSaved ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">{search ? 'No results' : 'No saved scholarships'}</h3>
          <p className="text-muted-foreground mb-4">{search ? 'Try a different search term' : 'Save scholarships you want to track'}</p>
          <Button asChild><Link to="/scholarships">Browse scholarships</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map(s => s.scholarship && (
            <div key={s.id} className="relative group">
              <ScholarshipCard scholarship={s.scholarship as any} />
              <button
                onClick={() => handleUnsave(s.scholarship_id)}
                className="absolute top-3 right-12 p-1.5 rounded-lg bg-background/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
