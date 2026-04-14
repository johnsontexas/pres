-- Banned askers: users who are not allowed to submit new questions.
-- App enforces admin-only for ban/unban; RLS allows authenticated to manage for simplicity.
CREATE TABLE IF NOT EXISTS banned_askers (
  user_id uuid PRIMARY KEY
);

ALTER TABLE banned_askers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (so admins can see who is banned)
CREATE POLICY "Authenticated can read banned_askers"
  ON banned_askers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert/delete (app only shows ban button to admins)
CREATE POLICY "Authenticated can insert banned_askers"
  ON banned_askers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete banned_askers"
  ON banned_askers
  FOR DELETE
  TO authenticated
  USING (true);
