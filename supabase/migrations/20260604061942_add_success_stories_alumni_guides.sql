/*
  # Add Success Stories, Alumni, and Guides tables
*/

CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  avatar_initials text NOT NULL DEFAULT 'SQ',
  scholarship_name text NOT NULL,
  university text NOT NULL,
  country text NOT NULL,
  degree text NOT NULL,
  amount numeric,
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

CREATE POLICY "Success stories are publicly readable"
  ON success_stories FOR SELECT
  TO anon, authenticated
  USING (true);

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

CREATE POLICY "Alumni are publicly readable"
  ON alumni FOR SELECT
  TO anon, authenticated
  USING (true);

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

CREATE POLICY "Guides are publicly readable"
  ON guides FOR SELECT
  TO anon, authenticated
  USING (true);
