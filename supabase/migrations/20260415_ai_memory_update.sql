-- Add Memory Context to Student Profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS memory_context TEXT DEFAULT '';

-- Add a column to track last chat summary for CRM purposes
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS last_chat_summary TEXT DEFAULT '';
