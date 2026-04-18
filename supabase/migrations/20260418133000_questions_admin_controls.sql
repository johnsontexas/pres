-- Q&A safety controls: banned askers, review mode, question approval, and admin glow grants.

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_status_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_status_check
  CHECK (status IN ('approved', 'pending', 'rejected'));

UPDATE questions
SET status = 'approved'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_questions_status_created
  ON questions(status, created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value)
VALUES ('question_review_required', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;

CREATE POLICY "Admins can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update app settings"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE banned_askers
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_banned_askers_email
  ON banned_askers(lower(email))
  WHERE email IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated can insert banned_askers" ON banned_askers;
DROP POLICY IF EXISTS "Authenticated can delete banned_askers" ON banned_askers;
DROP POLICY IF EXISTS "Authenticated can read banned_askers" ON banned_askers;
DROP POLICY IF EXISTS "Admins can read banned_askers" ON banned_askers;
DROP POLICY IF EXISTS "Admins can manage banned_askers" ON banned_askers;
DROP POLICY IF EXISTS "Users can read their own ban" ON banned_askers;

CREATE POLICY "Admins can read banned_askers"
  ON banned_askers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can read their own ban"
  ON banned_askers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage banned_askers"
  ON banned_askers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE vote_signatures
  ADD COLUMN IF NOT EXISTS glow_granted_by_admin boolean NOT NULL DEFAULT false;
