-- Create all tables needed for the campaign website

-- 1. News Posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author text NOT NULL,
  author_id uuid NOT NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  image_url text,
  slug text UNIQUE NOT NULL
);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for news_posts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read published news posts') THEN
    CREATE POLICY "Anyone can read published news posts"
      ON news_posts FOR SELECT
      USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage news posts') THEN
    CREATE POLICY "Authenticated users can manage news posts"
      ON news_posts FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON news_posts(is_published, published_at DESC);

-- 2. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  author_id uuid NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  upvotes text[] DEFAULT '{}',
  answer text,
  is_anonymous boolean DEFAULT false
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read questions') THEN
    CREATE POLICY "Anyone can read questions"
      ON questions FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert questions') THEN
    CREATE POLICY "Authenticated users can insert questions"
      ON questions FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update questions') THEN
    CREATE POLICY "Authenticated users can update questions"
      ON questions FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete questions') THEN
    CREATE POLICY "Authenticated users can delete questions"
      ON questions FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);

-- 3. Banned Askers table
CREATE TABLE IF NOT EXISTS banned_askers (
  user_id uuid PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banned_askers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read banned_askers') THEN
    CREATE POLICY "Anyone can read banned_askers"
      ON banned_askers FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage bans') THEN
    CREATE POLICY "Authenticated users can manage bans"
      ON banned_askers FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
