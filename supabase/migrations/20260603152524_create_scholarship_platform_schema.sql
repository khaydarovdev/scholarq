/*
  # Scholarship Discovery Platform - Core Schema

  ## New Tables
  1. `profiles` - User profile with education details for matching
  2. `scholarships` - Main scholarship catalog
  3. `saved_scholarships` - User bookmarks
  4. `applications` - Application tracker (Kanban stages)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  degree_level text DEFAULT '',
  field_of_study text DEFAULT '',
  current_country text DEFAULT '',
  target_countries text[] DEFAULT '{}',
  gpa numeric(3,2) DEFAULT 0,
  ielts_score numeric(3,1) DEFAULT 0,
  toefl_score int DEFAULT 0,
  gre_score int DEFAULT 0,
  interests text[] DEFAULT '{}',
  bio text DEFAULT '',
  profile_completion int DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL,
  university text DEFAULT '',
  country text NOT NULL,
  countries text[] DEFAULT '{}',
  degree_levels text[] NOT NULL DEFAULT '{}',
  fields text[] DEFAULT '{}',
  funding_type text NOT NULL DEFAULT 'partial',
  amount text DEFAULT '',
  amount_usd int DEFAULT 0,
  currency text DEFAULT 'USD',
  deadline date,
  duration text DEFAULT '',
  description text DEFAULT '',
  eligibility text DEFAULT '',
  benefits text DEFAULT '',
  application_process text DEFAULT '',
  requirements text[] DEFAULT '{}',
  official_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  views int DEFAULT 0,
  tags text[] DEFAULT '{}',
  min_gpa numeric(3,2) DEFAULT 0,
  language_requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active scholarships"
  ON scholarships FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert scholarships"
  ON scholarships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update scholarships"
  ON scholarships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete scholarships"
  ON scholarships FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Saved scholarships
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved scholarships"
  ON saved_scholarships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert saved scholarships"
  ON saved_scholarships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved scholarships"
  ON saved_scholarships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Applications tracker
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid REFERENCES scholarships(id) ON DELETE SET NULL,
  scholarship_title text NOT NULL,
  provider text NOT NULL,
  app_stage text NOT NULL DEFAULT 'interested',
  deadline date,
  notes text DEFAULT '',
  priority text DEFAULT 'medium',
  documents_ready boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS scholarships_country_idx ON scholarships(country);
CREATE INDEX IF NOT EXISTS scholarships_funding_type_idx ON scholarships(funding_type);
CREATE INDEX IF NOT EXISTS scholarships_deadline_idx ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS scholarships_featured_idx ON scholarships(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS saved_scholarships_user_idx ON saved_scholarships(user_id);
CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id);
