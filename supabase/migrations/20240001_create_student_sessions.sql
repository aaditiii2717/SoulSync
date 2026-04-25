CREATE TABLE IF NOT EXISTS public.student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id TEXT NOT NULL REFERENCES public.student_profiles(alias_id) ON DELETE CASCADE,
  volunteer_id TEXT REFERENCES public.volunteers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.session_bookings(id) ON DELETE SET NULL,
  topic TEXT,
  mood_before TEXT,
  mood_after TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
