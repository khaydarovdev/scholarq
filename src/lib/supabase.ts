import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

export type Scholarship = {
  id: string
  title: string
  provider: string
  university: string
  country: string
  country_code: string
  degree_level: 'bachelor' | 'masters' | 'phd' | 'postdoc' | 'all'
  field_of_study: string[]
  funding_type: 'fully-funded' | 'partial' | 'tuition-only' | 'stipend-only' | 'living-allowance'
  amount: number | null
  currency: string
  deadline: string | null
  deadline_is_rolling: boolean
  description: string
  eligibility: string
  benefits: string
  application_process: string
  requirements: string[]
  tags: string[]
  website_url: string
  is_featured: boolean
  is_active: boolean
  views_count: number
  countries: string[]
  min_gpa: number
  language_requirements: Record<string, string | number>
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  nationality: string
  current_degree: string
  target_degree: string
  field_of_study: string
  country_preferences: string[]
  gpa: number | null
  english_score: number | null
  language_scores: Record<string, string | number>
  interests: string[]
  bio: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type Application = {
  id: string
  user_id: string
  scholarship_id: string
  status: 'interested' | 'researching' | 'preparing' | 'applied' | 'interview' | 'accepted' | 'rejected' | 'withdrawn'
  notes: string
  deadline_reminder: string | null
  applied_date: string | null
  created_at: string
  updated_at: string
  scholarship?: Scholarship
}

export type SavedScholarship = {
  id: string
  user_id: string
  scholarship_id: string
  notes: string
  created_at: string
  scholarship?: Scholarship
}

export type SuccessStory = {
  id: string
  user_name: string
  avatar_initials: string
  scholarship_name: string
  university: string
  country: string
  degree: string
  amount: number | null
  currency: string
  year: number
  story: string
  quote: string
  field: string
  tags: string[]
  is_featured: boolean
  created_at: string
}

export type Alumni = {
  id: string
  name: string
  avatar_initials: string
  scholarship: string
  university: string
  country: string
  degree: string
  graduation_year: number
  role: string
  company: string
  bio: string
  linkedin_url: string
  fields: string[]
  is_available: boolean
  response_time: string
  created_at: string
}

export type Guide = {
  id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  steps: Array<{ number: number; title: string; description: string; duration: string }>
  tips: string[]
  checklist: string[]
  tags: string[]
  is_featured: boolean
  created_at: string
}
