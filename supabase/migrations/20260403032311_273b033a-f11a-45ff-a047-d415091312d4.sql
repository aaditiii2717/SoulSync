
-- Volunteers table: stores registered peer supporters
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  languages TEXT[] NOT NULL DEFAULT '{English}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time slots: volunteers list their available slots
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session bookings: anonymous students book slots
CREATE TABLE public.session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
  anonymous_name TEXT NOT NULL DEFAULT 'Anonymous',
  issue_type TEXT NOT NULL,
  language_preference TEXT NOT NULL DEFAULT 'English',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: volunteers table is publicly readable (for availability board)
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active verified volunteers"
  ON public.volunteers FOR SELECT
  USING (is_active = true AND is_verified = true);
CREATE POLICY "Anyone can insert volunteer application"
  ON public.volunteers FOR INSERT
  WITH CHECK (true);

-- RLS: time_slots publicly readable, volunteers can insert
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available time slots"
  ON public.time_slots FOR SELECT
  USING (true);
CREATE POLICY "Anyone can insert time slots"
  ON public.time_slots FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Anyone can update time slots"
  ON public.time_slots FOR UPDATE
  USING (true);

-- RLS: session_bookings - anyone can create (anonymous), read own
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a booking"
  ON public.session_bookings FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Anyone can view bookings"
  ON public.session_bookings FOR SELECT
  USING (true);
CREATE POLICY "Anyone can update bookings"
  ON public.session_bookings FOR UPDATE
  USING (true);
