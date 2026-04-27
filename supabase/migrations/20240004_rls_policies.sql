-- student_sessions RLS
ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to student_sessions"
  ON public.student_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow anon read student_sessions"
  ON public.student_sessions FOR SELECT
  USING (true);

-- volunteer_notes RLS
ALTER TABLE public.volunteer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to volunteer_notes"
  ON public.volunteer_notes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow anon read volunteer_notes"
  ON public.volunteer_notes FOR SELECT
  USING (true);

-- call_rooms RLS
ALTER TABLE public.call_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to call_rooms"
  ON public.call_rooms FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow anon read call_rooms"
  ON public.call_rooms FOR SELECT
  USING (true);

-- mood_entries: add index on alias_id if not exists
CREATE INDEX IF NOT EXISTS idx_mood_entries_alias_id
  ON public.mood_entries(alias_id);
