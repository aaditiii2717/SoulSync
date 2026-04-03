ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert volunteer application" ON public.volunteers;

CREATE POLICY "Anyone can insert volunteer application"
  ON public.volunteers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    COALESCE(is_verified, false) = false
    AND COALESCE(is_active, true) = true
  );
