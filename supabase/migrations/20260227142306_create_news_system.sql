/*
  # News System for Campaign

  1. New Tables
    - `news_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `excerpt` (text, short description)
      - `content` (text, full article content)
      - `author` (text, author name)
      - `author_id` (uuid, references auth.users)
      - `published_at` (timestamptz, publication date)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
      - `is_published` (boolean, draft vs published)
      - `image_url` (text, optional featured image)
      - `slug` (text, unique URL-friendly identifier)

  2. Security
    - Enable RLS on `news_posts` table
    - Add policy for anyone to read published posts
    - Add policy for admins to create, update, delete posts
    
  3. Important Notes
    - Only published posts are visible to non-admins
    - Admins can see and manage all posts including drafts
    - Slug is used for clean URLs
*/

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

CREATE POLICY "Anyone can read published news posts"
  ON news_posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all news posts"
  ON news_posts
  FOR SELECT
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM auth.users 
      WHERE email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "Admins can create news posts"
  ON news_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (
      SELECT id FROM auth.users 
      WHERE email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "Admins can update their own news posts"
  ON news_posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM auth.users 
      WHERE email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  )
  WITH CHECK (
    author_id IN (
      SELECT id FROM auth.users 
      WHERE email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

CREATE POLICY "Admins can delete news posts"
  ON news_posts
  FOR DELETE
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM auth.users 
      WHERE email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );

-- Create an index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON news_posts(is_published, published_at DESC);