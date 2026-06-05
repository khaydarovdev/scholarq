import { supabase } from './supabase'
import type { Scholarship, Profile } from './supabase'

export async function fetchScholarships(filters: {
  search?: string
  country?: string
  degree?: string
  funding?: string
  field?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const { search = '', country = '', degree = '', funding = '', field = '', sort = 'deadline', page = 1, limit = 12 } = filters
  let query = supabase.from('scholarships').select('*', { count: 'exact' }).eq('is_active', true)

  if (search) query = query.or(`title.ilike.%${search}%,provider.ilike.%${search}%,description.ilike.%${search}%`)
  if (country && country !== 'all') query = query.eq('country', country)
  if (degree && degree !== 'all') query = query.eq('degree_level', degree)
  if (funding && funding !== 'all') query = query.eq('funding_type', funding)
  if (field && field !== 'all') query = query.contains('field_of_study', [field])

  if (sort === 'deadline') query = query.order('deadline', { ascending: true, nullsFirst: false })
  else if (sort === 'amount') query = query.order('amount', { ascending: false, nullsFirst: false })
  else if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'popular') query = query.order('views_count', { ascending: false })

  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  return query
}

export async function fetchFeaturedScholarships() {
  return supabase.from('scholarships').select('*').eq('is_featured', true).eq('is_active', true).limit(9)
}

export async function fetchScholarshipById(id: string) {
  return supabase.from('scholarships').select('*').eq('id', id).maybeSingle()
}

export async function fetchSimilarScholarships(scholarship: Scholarship) {
  return supabase.from('scholarships')
    .select('*')
    .eq('is_active', true)
    .eq('country', scholarship.country)
    .neq('id', scholarship.id)
    .limit(4)
}

export async function fetchUserSaved(userId: string) {
  return supabase.from('saved_scholarships').select('*, scholarship:scholarships(*)').eq('user_id', userId)
}

export async function fetchUserApplications(userId: string) {
  return supabase.from('applications').select('*, scholarship:scholarships(*)').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function saveScholarship(userId: string, scholarshipId: string) {
  return supabase.from('saved_scholarships').insert({ user_id: userId, scholarship_id: scholarshipId })
}

export async function unsaveScholarship(userId: string, scholarshipId: string) {
  return supabase.from('saved_scholarships').delete().eq('user_id', userId).eq('scholarship_id', scholarshipId)
}

export async function addApplication(userId: string, scholarshipId: string) {
  return supabase.from('applications').insert({
    user_id: userId,
    scholarship_id: scholarshipId,
    status: 'interested'
  })
}

export async function updateApplicationStatus(id: string, status: string) {
  return supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteApplication(id: string) {
  return supabase.from('applications').delete().eq('id', id)
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  return supabase.from('profiles').upsert({ ...profile, updated_at: new Date().toISOString() })
}

export async function fetchDistinctCountries() {
  return supabase.from('scholarships').select('country').eq('is_active', true).order('country')
}

export async function fetchSuccessStories(featuredOnly = false) {
  let q = supabase.from('success_stories').select('*').order('year', { ascending: false })
  if (featuredOnly) q = q.eq('is_featured', true)
  return q.limit(featuredOnly ? 6 : 20)
}

export async function fetchAlumni(fieldFilter?: string) {
  let q = supabase.from('alumni').select('*').order('graduation_year', { ascending: false })
  if (fieldFilter && fieldFilter !== 'all') q = q.contains('fields', [fieldFilter])
  return q.limit(20)
}

export async function fetchGuides(featuredOnly = false) {
  let q = supabase.from('guides').select('*').order('created_at', { ascending: false })
  if (featuredOnly) q = q.eq('is_featured', true)
  return q
}

export async function fetchGuideBySlug(slug: string) {
  return supabase.from('guides').select('*').eq('slug', slug).maybeSingle()
}

export async function incrementScholarshipViews(id: string) {
  return supabase.rpc('increment_views', { scholarship_id: id })
}

// ─── Matching Engine ────────────────────────────────────────

export function computeMatchScore(scholarship: Scholarship, profile: Profile | null): number {
  if (!profile) return 0

  let score = 0

  // Degree level match (35 pts)
  if (scholarship.degree_level === 'all') {
    score += 25
  } else if (profile.target_degree && scholarship.degree_level === profile.target_degree) {
    score += 35
  }

  // Country preference match (25 pts)
  const prefCountries = profile.country_preferences ?? []
  if (prefCountries.length === 0) {
    score += 10
  } else if (prefCountries.includes(scholarship.country)) {
    score += 25
  } else if (scholarship.countries?.some(c => prefCountries.includes(c))) {
    score += 15
  }

  // Field of study match (25 pts)
  const profileField = (profile.field_of_study ?? '').toLowerCase().trim()
  const scholFields = scholarship.field_of_study ?? []
  if (profileField && scholFields.length > 0) {
    const exactMatch = scholFields.some(f => f.toLowerCase() === profileField)
    const partialMatch = scholFields.some(f =>
      f.toLowerCase().includes(profileField) || profileField.includes(f.toLowerCase())
    )
    if (exactMatch) score += 25
    else if (partialMatch) score += 15
  } else if (!profileField) {
    score += 10
  }

  // GPA eligibility (10 pts)
  if (scholarship.min_gpa) {
    const gpa = profile.gpa ?? 0
    if (gpa >= scholarship.min_gpa) score += 10
    else if (gpa >= scholarship.min_gpa - 0.3) score += 5
  } else {
    score += 8
  }

  // Funding preference bonus (5 pts)
  if (scholarship.funding_type === 'fully-funded') score += 5

  return Math.min(Math.round(score), 100)
}

export function getMatchReasons(scholarship: Scholarship, profile: Profile | null): string[] {
  if (!profile) return []
  const reasons: string[] = []

  if (scholarship.degree_level === 'all') {
    reasons.push('Open to all degree levels')
  } else if (profile.target_degree && scholarship.degree_level === profile.target_degree) {
    const labels: Record<string, string> = {
      bachelor: 'Bachelor', masters: 'Masters', phd: 'PhD', postdoc: 'Postdoc'
    }
    reasons.push(`Matches your ${labels[profile.target_degree] ?? profile.target_degree} target`)
  }

  const prefCountries = profile.country_preferences ?? []
  if (prefCountries.includes(scholarship.country)) {
    reasons.push(`${scholarship.country} is in your preferred list`)
  }

  const profileField = (profile.field_of_study ?? '').toLowerCase().trim()
  if (profileField && scholarship.field_of_study?.length > 0) {
    const match = scholarship.field_of_study.find(f =>
      f.toLowerCase().includes(profileField) || profileField.includes(f.toLowerCase())
    )
    if (match) reasons.push(`Matches your field: ${profile.field_of_study}`)
  }

  if (scholarship.funding_type === 'fully-funded') {
    reasons.push('Fully funded — tuition + living')
  }

  if (profile.gpa && scholarship.min_gpa && profile.gpa >= scholarship.min_gpa) {
    reasons.push(`Your GPA (${profile.gpa}) meets the requirement`)
  }

  return reasons
}
