import { create } from 'zustand'
import { supabase, type Profile, type Scholarship, type Application, type SavedScholarship } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  fetchProfile: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    set({ profile: data as Profile | null, loading: false })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },
}))

interface ScholarshipFilters {
  search: string
  country: string
  degree: string
  funding: string
  field: string
  sort: string
  page: number
}

interface ScholarshipState {
  scholarships: Scholarship[]
  featured: Scholarship[]
  current: Scholarship | null
  total: number
  loading: boolean
  filters: ScholarshipFilters
  savedIds: Set<string>
  setScholarships: (data: Scholarship[], total: number) => void
  setFeatured: (data: Scholarship[]) => void
  setCurrent: (s: Scholarship | null) => void
  setLoading: (v: boolean) => void
  setFilters: (f: Partial<ScholarshipFilters>) => void
  setSavedIds: (ids: string[]) => void
  toggleSaved: (id: string) => void
}

export const useScholarshipStore = create<ScholarshipState>((set) => ({
  scholarships: [],
  featured: [],
  current: null,
  total: 0,
  loading: false,
  filters: { search: '', country: '', degree: '', funding: '', field: '', sort: 'deadline', page: 1 },
  savedIds: new Set(),
  setScholarships: (data, total) => set({ scholarships: data, total }),
  setFeatured: (data) => set({ featured: data }),
  setCurrent: (s) => set({ current: s }),
  setLoading: (v) => set({ loading: v }),
  setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f, page: f.page ?? 1 } })),
  setSavedIds: (ids) => set({ savedIds: new Set(ids) }),
  toggleSaved: (id) => set((state) => {
    const next = new Set(state.savedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    return { savedIds: next }
  }),
}))

interface UserDataState {
  savedScholarships: SavedScholarship[]
  applications: Application[]
  loadingSaved: boolean
  loadingApps: boolean
  setSaved: (data: SavedScholarship[]) => void
  setApplications: (data: Application[]) => void
  setLoadingSaved: (v: boolean) => void
  setLoadingApps: (v: boolean) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  removeApplication: (id: string) => void
  removeSaved: (scholarshipId: string) => void
}

export const useUserDataStore = create<UserDataState>((set) => ({
  savedScholarships: [],
  applications: [],
  loadingSaved: false,
  loadingApps: false,
  setSaved: (data) => set({ savedScholarships: data }),
  setApplications: (data) => set({ applications: data }),
  setLoadingSaved: (v) => set({ loadingSaved: v }),
  setLoadingApps: (v) => set({ loadingApps: v }),
  updateApplication: (id, updates) => set((state) => ({
    applications: state.applications.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  removeApplication: (id) => set((state) => ({
    applications: state.applications.filter(a => a.id !== id)
  })),
  removeSaved: (scholarshipId) => set((state) => ({
    savedScholarships: state.savedScholarships.filter(s => s.scholarship_id !== scholarshipId)
  })),
}))
