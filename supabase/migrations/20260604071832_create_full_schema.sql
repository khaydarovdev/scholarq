/*
  # Full ScholarQuest Schema

  Creates all tables with column names matching the frontend TypeScript types exactly.

  ## Tables
  1. profiles - user profile with education/preference data for matching
  2. scholarships - scholarship catalog with correct column names
  3. saved_scholarships - user bookmarks
  4. applications - application tracker with status (not app_stage)
  5. success_stories - featured student success stories
  6. alumni - mentor network
  7. guides - step-by-step application guides
*/

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  avatar_url text DEFAULT '',
  nationality text DEFAULT '',
  current_degree text DEFAULT '',
  target_degree text DEFAULT '',
  field_of_study text DEFAULT '',
  country_preferences text[] DEFAULT '{}',
  gpa numeric(3,2) DEFAULT NULL,
  english_score numeric(4,1) DEFAULT NULL,
  language_scores jsonb DEFAULT '{}',
  interests text[] DEFAULT '{}',
  bio text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can read own profile') THEN
    CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ─── SCHOLARSHIPS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL,
  university text DEFAULT '',
  country text NOT NULL,
  country_code text DEFAULT '',
  countries text[] DEFAULT '{}',
  degree_level text NOT NULL DEFAULT 'all',
  field_of_study text[] DEFAULT '{}',
  funding_type text NOT NULL DEFAULT 'partial',
  amount integer DEFAULT NULL,
  currency text DEFAULT 'USD',
  deadline date DEFAULT NULL,
  deadline_is_rolling boolean DEFAULT false,
  description text DEFAULT '',
  eligibility text DEFAULT '',
  benefits text DEFAULT '',
  application_process text DEFAULT '',
  requirements text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  website_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  min_gpa numeric(3,2) DEFAULT 0,
  language_requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scholarships' AND policyname='Anyone can read active scholarships') THEN
    CREATE POLICY "Anyone can read active scholarships" ON scholarships FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scholarships' AND policyname='Admins can manage scholarships') THEN
    CREATE POLICY "Admins can manage scholarships" ON scholarships FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS scholarships_country_idx ON scholarships(country);
CREATE INDEX IF NOT EXISTS scholarships_degree_level_idx ON scholarships(degree_level);
CREATE INDEX IF NOT EXISTS scholarships_funding_type_idx ON scholarships(funding_type);
CREATE INDEX IF NOT EXISTS scholarships_deadline_idx ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS scholarships_featured_idx ON scholarships(is_featured) WHERE is_featured = true;

-- ─── SAVED SCHOLARSHIPS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_scholarships' AND policyname='Users can manage own saved scholarships') THEN
    CREATE POLICY "Users can manage own saved scholarships" ON saved_scholarships FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS saved_scholarships_user_idx ON saved_scholarships(user_id);

-- ─── APPLICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid REFERENCES scholarships(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'interested',
  notes text DEFAULT '',
  deadline_reminder text DEFAULT NULL,
  applied_date date DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='applications' AND policyname='Users can manage own applications') THEN
    CREATE POLICY "Users can manage own applications" ON applications FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id);

-- ─── SUCCESS STORIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  avatar_initials text NOT NULL DEFAULT 'SQ',
  scholarship_name text NOT NULL,
  university text NOT NULL,
  country text NOT NULL,
  degree text NOT NULL,
  amount numeric DEFAULT NULL,
  currency text DEFAULT 'USD',
  year integer NOT NULL,
  story text NOT NULL,
  quote text NOT NULL,
  field text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='success_stories' AND policyname='Success stories are publicly readable') THEN
    CREATE POLICY "Success stories are publicly readable" ON success_stories FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- ─── ALUMNI ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_initials text NOT NULL DEFAULT 'AL',
  scholarship text NOT NULL,
  university text NOT NULL,
  country text NOT NULL,
  degree text NOT NULL,
  graduation_year integer NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  bio text NOT NULL,
  linkedin_url text DEFAULT '',
  fields text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  response_time text DEFAULT 'within 1 week',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alumni' AND policyname='Alumni are publicly readable') THEN
    CREATE POLICY "Alumni are publicly readable" ON alumni FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- ─── GUIDES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  duration_minutes integer NOT NULL DEFAULT 15,
  steps jsonb NOT NULL DEFAULT '[]',
  tips text[] DEFAULT '{}',
  checklist text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='guides' AND policyname='Guides are publicly readable') THEN
    CREATE POLICY "Guides are publicly readable" ON guides FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- ─── INCREMENT VIEWS RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(scholarship_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE scholarships SET views_count = views_count + 1 WHERE id = scholarship_id;
END;
$$;
