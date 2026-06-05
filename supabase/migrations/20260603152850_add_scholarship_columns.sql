/*
  # Add missing columns to scholarships table
*/
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS countries text[] DEFAULT '{}';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS min_gpa numeric(3,2) DEFAULT 0;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS language_requirements jsonb DEFAULT '{}';
