
-- 1. Student Identity Persistence
CREATE TABLE IF NOT EXISTS public.student_profiles (
  alias_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_username TEXT NOT NULL,
  recovery_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enhanced Volunteer Records
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_summary JSONB DEFAULT '{}'::jsonb;

-- 3. NGO Registry
CREATE TABLE IF NOT EXISTS public.ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  category TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  donation_link TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Donations Tracking
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_alias_id UUID REFERENCES public.student_profiles(alias_id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  ngo_id UUID REFERENCES public.ngos(id),
  status TEXT DEFAULT 'pending',
  transaction_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Session History & CRM
ALTER TABLE public.session_bookings
ADD COLUMN IF NOT EXISTS student_alias_id UUID REFERENCES public.student_profiles(alias_id),
ADD COLUMN IF NOT EXISTS meeting_token TEXT,
ADD COLUMN IF NOT EXISTS mood_before TEXT,
ADD COLUMN IF NOT EXISTS mood_after TEXT,
ADD COLUMN IF NOT EXISTS volunteer_notes TEXT;

-- RLS Update for Anonymity
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own profile" ON public.student_profiles
  FOR SELECT USING (true); -- We will filter by LocalStorage alias_id in the app

ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view verified NGOs" ON public.ngos
  FOR SELECT USING (is_verified = true);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own donations" ON public.donations
  FOR SELECT USING (true);

