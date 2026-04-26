ALTER TABLE session_bookings
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION get_due_session_reminders()
RETURNS TABLE (
  booking_id UUID,
  anonymous_name TEXT,
  meeting_token TEXT,
  volunteer_email TEXT,
  volunteer_name TEXT,
  slot_date DATE,
  start_time TIME
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    b.id AS booking_id,
    b.anonymous_name,
    b.meeting_token,
    v.email AS volunteer_email,
    v.name AS volunteer_name,
    t.slot_date,
    t.start_time
  FROM session_bookings b
  JOIN time_slots t ON b.time_slot_id = t.id
  JOIN volunteers v ON t.volunteer_id = v.id
  WHERE b.reminder_sent = false
    AND b.status NOT IN ('cancelled', 'completed')
    AND (t.slot_date::timestamp + t.start_time::interval) BETWEEN now() AND now() + interval '31 minutes';
$$;
