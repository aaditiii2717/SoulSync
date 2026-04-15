
-- Add Admin and Verification Columns
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT false;

-- Seed the initial 3 Super-Admins
-- Replace these with actual emails if provided
UPDATE public.volunteers SET is_admin = true, verification_status = 'verified' WHERE email = 'admin@soulsync.org';
UPDATE public.volunteers SET is_admin = true, verification_status = 'verified' WHERE email = 'manager@soulsync.org';
UPDATE public.volunteers SET is_admin = true, verification_status = 'verified' WHERE email = 'governance@soulsync.org';

-- Security: Ensure new volunteers default to pending
ALTER TABLE public.volunteers ALTER COLUMN verification_status SET DEFAULT 'pending';
