ALTER TABLE public.volunteers
ADD COLUMN IF NOT EXISTS cv_storage_path TEXT;

UPDATE public.volunteers
SET cv_storage_path = NULLIF(
  CASE
    WHEN cv_storage_path IS NOT NULL AND btrim(cv_storage_path) <> '' THEN btrim(cv_storage_path)
    WHEN cv_url IS NULL OR btrim(cv_url) = '' THEN NULL
    WHEN cv_url LIKE '%/storage/v1/object/public/volunteers-cvs/%'
      THEN split_part(split_part(cv_url, '/storage/v1/object/public/volunteers-cvs/', 2), '?', 1)
    WHEN cv_url LIKE '%/storage/v1/object/sign/volunteers-cvs/%'
      THEN split_part(split_part(cv_url, '/storage/v1/object/sign/volunteers-cvs/', 2), '?', 1)
    WHEN cv_url LIKE 'http%' THEN NULL
    ELSE btrim(cv_url)
  END,
  ''
)
WHERE cv_storage_path IS NULL;

INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteers-cvs', 'volunteers-cvs', false)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert for volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Allow anonymous select for volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Allow anonymous update for volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Anyone can insert volunteer application" ON public.volunteers;
DROP POLICY IF EXISTS "Anyone can view active volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Anyone can view active verified volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can see all, users see active verified" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can update volunteers" ON public.volunteers;

CREATE POLICY "Admins can see all, users see active verified"
  ON public.volunteers
  FOR SELECT
  USING (
    (is_active = true AND is_verified = true)
    OR email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1
      FROM public.volunteers admin
      WHERE admin.email = auth.jwt()->>'email'
        AND admin.is_admin = true
    )
  );

CREATE POLICY "Public can submit volunteer applications"
  ON public.volunteers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    COALESCE(is_admin, false) = false
    AND COALESCE(is_verified, false) = false
    AND COALESCE(is_active, false) = false
    AND COALESCE(verification_status, 'pending') = 'pending'
  );

CREATE POLICY "Admins can update volunteers"
  ON public.volunteers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.volunteers admin
      WHERE admin.email = auth.jwt()->>'email'
        AND admin.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.volunteers admin
      WHERE admin.email = auth.jwt()->>'email'
        AND admin.is_admin = true
    )
  );
