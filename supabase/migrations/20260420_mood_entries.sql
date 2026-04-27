
-- 1. Student Identity Persistence (Required for Mood Journal)
CREATE TABLE IF NOT EXISTS public.student_profiles (
  alias_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_username TEXT NOT NULL,
  memory_context TEXT,
  recovery_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safely Enable RLS and Create Policies
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous select for student_profiles') THEN
        CREATE POLICY "Allow anonymous select for student_profiles" ON public.student_profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert for student_profiles') THEN
        CREATE POLICY "Allow anonymous insert for student_profiles" ON public.student_profiles FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update for student_profiles') THEN
        CREATE POLICY "Allow anonymous update for student_profiles" ON public.student_profiles FOR UPDATE USING (true);
    END IF;
END $$;

-- 2. Volunteer Visibility Fix (Required for Registration)
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert for volunteers') THEN
        CREATE POLICY "Allow anonymous insert for volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous select for volunteers') THEN
        CREATE POLICY "Allow anonymous select for volunteers" ON public.volunteers FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update for volunteers') THEN
        CREATE POLICY "Allow anonymous update for volunteers" ON public.volunteers FOR UPDATE USING (true);
    END IF;
END $$;

-- 3. Mood Journal Table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_id UUID REFERENCES public.student_profiles(alias_id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous select for mood_entries') THEN
        CREATE POLICY "Allow anonymous select for mood_entries" ON public.mood_entries FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert for mood_entries') THEN
        CREATE POLICY "Allow anonymous insert for mood_entries" ON public.mood_entries FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous update for mood_entries') THEN
        CREATE POLICY "Allow anonymous update for mood_entries" ON public.mood_entries FOR UPDATE USING (true);
    END IF;
END $$;

-- Ensure created_at is strictly handled by the database
ALTER TABLE public.mood_entries ALTER COLUMN created_at SET DEFAULT now();

-- 4. Time Slots Permission (Required for Registration Step 2)
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert for time_slots') THEN
        CREATE POLICY "Allow anonymous insert for time_slots" ON public.time_slots FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous select for time_slots') THEN
        CREATE POLICY "Allow anonymous select for time_slots" ON public.time_slots FOR SELECT USING (true);
    END IF;
END $$;
