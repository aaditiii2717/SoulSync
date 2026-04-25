CREATE TABLE IF NOT EXISTS public.volunteer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id TEXT NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  student_alias TEXT NOT NULL REFERENCES public.student_profiles(alias_id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.student_sessions(id) ON DELETE SET NULL,
  notes TEXT,
  follow_up_needed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
