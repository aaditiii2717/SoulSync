ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active verified volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Anyone can view active volunteers" ON public.volunteers;

CREATE POLICY "Anyone can view active volunteers"
  ON public.volunteers
  FOR SELECT
  USING (is_active = true);
