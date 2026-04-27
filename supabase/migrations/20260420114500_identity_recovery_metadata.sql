-- Identity recovery metadata for existing anonymous UUIDs.
-- Run this migration after the base student_profiles schema exists.

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS recovery_key_hash TEXT;

-- Preserve any earlier recovery hashes if they were stored under the old column name.
UPDATE public.student_profiles
SET recovery_key_hash = recovery_hash
WHERE recovery_key_hash IS NULL
  AND recovery_hash IS NOT NULL;

-- Usernames must stay unique for account recovery lookups.
CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_username_unique_idx
ON public.student_profiles (lower(username))
WHERE username IS NOT NULL;
