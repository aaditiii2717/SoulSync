-- ─────────────────────────────────────────────────────────────────────────────
-- Fix session_bookings: add missing columns + heal orphaned rows
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add volunteer_id so volunteer dashboard can query bookings directly
ALTER TABLE public.session_bookings
  ADD COLUMN IF NOT EXISTS volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL;

-- 2. Add handoff_briefing (AI generated pre-session summary)
ALTER TABLE public.session_bookings
  ADD COLUMN IF NOT EXISTS handoff_briefing TEXT;

-- 3. Backfill volunteer_id from the linked time_slot (for rows that already exist)
UPDATE public.session_bookings sb
SET    volunteer_id = ts.volunteer_id
FROM   public.time_slots ts
WHERE  sb.time_slot_id = ts.id
  AND  sb.volunteer_id IS NULL;

-- 4. Heal orphaned student_alias_id = NULL rows:
--    If session_bookings.anonymous_name matches student_profiles.anonymous_username
--    we can safely link them — covers bookings made before the identity hook was integrated.
UPDATE public.session_bookings sb
SET    student_alias_id = sp.alias_id
FROM   public.student_profiles sp
WHERE  sb.student_alias_id IS NULL
  AND  sb.anonymous_name = sp.anonymous_username;

-- 5. Index for fast per-student lookups on the peer-match page
CREATE INDEX IF NOT EXISTS idx_session_bookings_student_alias_id
  ON public.session_bookings (student_alias_id);

-- 6. Index for fast per-volunteer lookups on the volunteer dashboard
CREATE INDEX IF NOT EXISTS idx_session_bookings_volunteer_id
  ON public.session_bookings (volunteer_id);

-- 7. Allow volunteers to delete their own time slots
--    (CREATE POLICY does not support IF NOT EXISTS, use a DO block instead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'time_slots'
      AND policyname = 'Volunteers can delete their own time slots'
  ) THEN
    EXECUTE '
      CREATE POLICY "Volunteers can delete their own time slots"
        ON public.time_slots FOR DELETE
        USING (true)
    ';
  END IF;
END $$;
