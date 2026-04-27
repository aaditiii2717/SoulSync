-- Add Handoff and Summary columns to Session Bookings
ALTER TABLE public.session_bookings
ADD COLUMN IF NOT EXISTS handoff_briefing TEXT,
ADD COLUMN IF NOT EXISTS ai_session_summary TEXT;

-- Update student_profiles to track primary volunteer for continuity
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS primary_volunteer_id UUID REFERENCES public.volunteers(id);
