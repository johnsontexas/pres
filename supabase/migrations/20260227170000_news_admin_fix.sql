-- Fix news RLS: use a table of admin emails instead of current_setting('app.admin_emails'),
-- which is never set by the client, so admin policies never matched.

-- Table of admin emails (lowercase). Add your admin email(s) here or via Supabase dashboard.
CREATE TABLE IF NOT EXISTS admin_emails (
  email text PRIMARY KEY
);

-- Function: true if the current authenticated user's email is in admin_emails
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_emails e
    WHERE e.email = (SELECT lower(email) FROM auth.users WHERE id = auth.uid())
  );
$$;

-- Drop old policies that relied on current_setting (they don't work without it)
DROP POLICY IF EXISTS "Admins can view all news posts" ON news_posts;
DROP POLICY IF EXISTS "Admins can create news posts" ON news_posts;
DROP POLICY IF EXISTS "Admins can update their own news posts" ON news_posts;
DROP POLICY IF EXISTS "Admins can delete news posts" ON news_posts;

-- Recreate using is_admin()
CREATE POLICY "Admins can view all news posts"
  ON news_posts
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create news posts"
  ON news_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update news posts"
  ON news_posts
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete news posts"
  ON news_posts
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- IMPORTANT: In Supabase Dashboard > Table Editor > admin_emails, add a row with your
-- admin email (lowercase, e.g. your Strake Jesuit email). News create/edit/delete will
-- only work for users whose email is in this table.
