ALTER TABLE vote_signatures
  ADD COLUMN IF NOT EXISTS author_email text,
  ADD COLUMN IF NOT EXISTS glow_enabled boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_vote_signatures_author_email
  ON vote_signatures(lower(author_email));

CREATE TABLE IF NOT EXISTS vote_signature_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_email text NOT NULL,
  referred_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referrer_user_id, referred_email),
  CHECK (lower(referrer_email) <> lower(referred_email))
);

CREATE INDEX IF NOT EXISTS idx_vote_signature_referrals_referred_email
  ON vote_signature_referrals(lower(referred_email));

ALTER TABLE vote_signature_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their referral list" ON vote_signature_referrals;
DROP POLICY IF EXISTS "Users can manage their referral list" ON vote_signature_referrals;
DROP POLICY IF EXISTS "Admins can view all vote signature referrals" ON vote_signature_referrals;

CREATE POLICY "Users can view their referral list"
  ON vote_signature_referrals
  FOR SELECT
  TO authenticated
  USING (referrer_user_id = auth.uid() OR lower(referred_email) = (SELECT lower(email) FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their referral list"
  ON vote_signature_referrals
  FOR ALL
  TO authenticated
  USING (referrer_user_id = auth.uid())
  WITH CHECK (referrer_user_id = auth.uid());

CREATE POLICY "Admins can view all vote signature referrals"
  ON vote_signature_referrals
  FOR SELECT
  TO authenticated
  USING (is_admin());
