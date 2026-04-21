ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active verified volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Anyone can insert volunteer application" ON public.volunteers;

CREATE POLICY "Anyone can view active verified volunteers"
  ON public.volunteers
  FOR SELECT
  USING (is_active = true AND is_verified = true);

CREATE POLICY "Anyone can insert volunteer application"
  ON public.volunteers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view available time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Anyone can insert time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Anyone can update time slots" ON public.time_slots;

CREATE POLICY "Anyone can view available time slots"
  ON public.time_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert time slots"
  ON public.time_slots
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update time slots"
  ON public.time_slots
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create a booking" ON public.session_bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.session_bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.session_bookings;

CREATE POLICY "Anyone can create a booking"
  ON public.session_bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON public.session_bookings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update bookings"
  ON public.session_bookings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
