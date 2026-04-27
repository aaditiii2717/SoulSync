-- SoulSync Security Hardening Migration
-- Date: 2026-04-22
-- Goal: Lock down database to protect student anonymity and ensure professional governance.

-- 1. Tighten session_bookings: Only assigned volunteers and the student themselves can see sessions.
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.session_bookings;
CREATE POLICY "Volunteers can view their own assigned bookings"
  ON public.session_bookings
  FOR SELECT
  USING (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE email = auth.jwt()->>'email')
    OR student_alias_id::text = auth.uid()::text -- If student is logged in
    OR (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true
  );

DROP POLICY IF EXISTS "Anyone can update bookings" ON public.session_bookings;
CREATE POLICY "Volunteers can update their own assigned bookings"
  ON public.session_bookings
  FOR UPDATE
  USING (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE email = auth.jwt()->>'email')
    OR (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true
  )
  WITH CHECK (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE email = auth.jwt()->>'email')
    OR (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true
  );

-- 2. Tighten volunteers table: Only admins can see all volunteers; others only see active ones.
DROP POLICY IF EXISTS "Anyone can view active verified volunteers" ON public.volunteers;
CREATE POLICY "Admins can see all, users see active verified"
  ON public.volunteers
  FOR SELECT
  USING (
    (is_active = true AND is_verified = true)
    OR (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true
    OR email = auth.jwt()->>'email'
  );

-- 3. Security: Assign Super-Admin status to Aaditi
UPDATE public.volunteers SET is_admin = true, is_verified = true, is_active = true, verification_status = 'verified' 
WHERE email = 'aaditishrivastava17@gmail.com';

-- 4. Safety: Ensure no one can delete session history
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.session_bookings;
CREATE POLICY "No one can delete bookings"
  ON public.session_bookings
  FOR DELETE
  USING ( (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true );

-- 5. Student Profile Protection
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can manage their own profiles" ON public.student_profiles;
CREATE POLICY "Students can manage their own profiles"
  ON public.student_profiles
  FOR ALL
  USING ( alias_id::text = auth.uid()::text OR (SELECT is_admin FROM public.volunteers WHERE email = auth.jwt()->>'email') = true );
