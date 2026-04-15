ALTER TABLE public.session_bookings
ADD CONSTRAINT session_bookings_time_slot_id_key UNIQUE (time_slot_id);

ALTER TABLE public.session_bookings
ADD COLUMN volunteer_notification_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN volunteer_notification_sent_at TIMESTAMPTZ,
ADD COLUMN volunteer_notification_last_error TEXT;

ALTER TABLE public.session_bookings
ADD CONSTRAINT session_bookings_volunteer_notification_status_check
CHECK (volunteer_notification_status IN ('pending', 'sent', 'failed', 'skipped'));

CREATE OR REPLACE FUNCTION public.mark_time_slot_booked_on_session_booking()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.time_slots
  SET is_booked = true
  WHERE id = NEW.time_slot_id
    AND is_booked = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This time slot is no longer available.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mark_time_slot_booked_on_session_booking ON public.session_bookings;

CREATE TRIGGER mark_time_slot_booked_on_session_booking
BEFORE INSERT ON public.session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.mark_time_slot_booked_on_session_booking();
