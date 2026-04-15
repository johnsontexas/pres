ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS likes uuid[] NOT NULL DEFAULT ARRAY[]::uuid[];
