CREATE TABLE IF NOT EXISTS super_admin_emails (
  email text PRIMARY KEY
);

INSERT INTO super_admin_emails (email)
VALUES ('dajohnson27@mail.strakejesuit.org')
ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_emails (email)
VALUES ('dajohnson27@mail.strakejesuit.org')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM super_admin_emails e
    WHERE lower(e.email) = lower(auth.jwt() ->> 'email')
  );
$$;

ALTER TABLE super_admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can read super admins" ON super_admin_emails;
DROP POLICY IF EXISTS "Super admins can manage super admins" ON super_admin_emails;

CREATE POLICY "Super admins can read super admins"
  ON super_admin_emails
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can manage super admins"
  ON super_admin_emails
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

INSERT INTO app_settings (key, value)
VALUES (
  'site_shutdown',
  '{"enabled": false, "title": "This site is temporarily unavailable", "caption": "Please check back later.", "showBrand": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
