-- Sign your vote: one approved signature placement per user, with admin approval
-- for new/changed signature images.

CREATE TABLE IF NOT EXISTS vote_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  image_path text NOT NULL,
  color text NOT NULL DEFAULT '#1B5E20',
  x numeric NOT NULL DEFAULT 0.18 CHECK (x >= 0 AND x <= 1),
  y numeric NOT NULL DEFAULT 0.82 CHECK (y >= 0 AND y <= 1),
  width numeric NOT NULL DEFAULT 0.18 CHECK (width >= 0.08 AND width <= 0.28),
  rotation numeric NOT NULL DEFAULT 0 CHECK (rotation >= -12 AND rotation <= 12),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_signatures_status_updated
  ON vote_signatures(status, updated_at DESC);

ALTER TABLE vote_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved vote signatures" ON vote_signatures;
DROP POLICY IF EXISTS "Users can view their own vote signature" ON vote_signatures;
DROP POLICY IF EXISTS "Admins can view all vote signatures" ON vote_signatures;
DROP POLICY IF EXISTS "Users can create their vote signature" ON vote_signatures;
DROP POLICY IF EXISTS "Users can update their own vote signature" ON vote_signatures;
DROP POLICY IF EXISTS "Admins can moderate vote signatures" ON vote_signatures;
DROP POLICY IF EXISTS "Users can delete their own vote signature" ON vote_signatures;

CREATE POLICY "Anyone can view approved vote signatures"
  ON vote_signatures
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own vote signature"
  ON vote_signatures
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all vote signatures"
  ON vote_signatures
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can create their vote signature"
  ON vote_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

CREATE POLICY "Users can update their own vote signature"
  ON vote_signatures
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can moderate vote signatures"
  ON vote_signatures
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can delete their own vote signature"
  ON vote_signatures
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION touch_vote_signatures_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vote_signatures_touch_updated_at ON vote_signatures;
CREATE TRIGGER vote_signatures_touch_updated_at
  BEFORE UPDATE ON vote_signatures
  FOR EACH ROW
  EXECUTE FUNCTION touch_vote_signatures_updated_at();

CREATE OR REPLACE FUNCTION protect_vote_signature_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status = 'pending';
    NEW.reviewed_by = NULL;
    NEW.reviewed_at = NULL;
    RETURN NEW;
  END IF;

  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Users cannot move signatures between accounts';
  END IF;

  IF NEW.image_path IS DISTINCT FROM OLD.image_path THEN
    NEW.status = 'pending';
    NEW.reviewed_by = NULL;
    NEW.reviewed_at = NULL;
  ELSE
    NEW.status = OLD.status;
    NEW.reviewed_by = OLD.reviewed_by;
    NEW.reviewed_at = OLD.reviewed_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vote_signatures_protect_moderation_insert ON vote_signatures;
CREATE TRIGGER vote_signatures_protect_moderation_insert
  BEFORE INSERT ON vote_signatures
  FOR EACH ROW
  EXECUTE FUNCTION protect_vote_signature_moderation();

DROP TRIGGER IF EXISTS vote_signatures_protect_moderation_update ON vote_signatures;
CREATE TRIGGER vote_signatures_protect_moderation_update
  BEFORE UPDATE ON vote_signatures
  FOR EACH ROW
  EXECUTE FUNCTION protect_vote_signature_moderation();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vote-signatures', 'vote-signatures', true, 1048576, ARRAY['image/png'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 1048576,
    allowed_mime_types = ARRAY['image/png'];

DROP POLICY IF EXISTS "Anyone can view vote signature files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own vote signature files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vote signature files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vote signature files" ON storage.objects;

CREATE POLICY "Anyone can view vote signature files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vote-signatures');

CREATE POLICY "Users can upload their own vote signature files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own vote signature files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'vote-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own vote signature files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-signatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
