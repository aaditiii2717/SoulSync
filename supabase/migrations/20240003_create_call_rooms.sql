CREATE TABLE IF NOT EXISTS public.call_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.session_bookings(id) ON DELETE CASCADE,
  room_url TEXT NOT NULL,
  room_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
