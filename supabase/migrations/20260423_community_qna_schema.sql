-- Table for Community Q&A
CREATE TABLE IF NOT EXISTS public.community_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    question TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    relate_count INTEGER DEFAULT 0,
    responses_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    alias_id UUID, -- Links to the anonymous student identity
    answer TEXT -- Optional: Admin/AI synthesized answer
);

-- Row Level Security
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public questions
CREATE POLICY "Public questions are viewable by everyone" 
ON public.community_questions FOR SELECT 
USING (is_public = TRUE);

-- Allow students to insert their own questions
CREATE POLICY "Students can ask anonymous questions" 
ON public.community_questions FOR INSERT 
WITH CHECK (TRUE);

-- Allow anyone to increment the relate_count (simplified for prototype)
CREATE POLICY "Anyone can update relate_count" 
ON public.community_questions FOR UPDATE 
USING (TRUE);

-- Enable real-time for live "relate" counts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_questions;

-- Seed Data (Realistic Prototype Questions)
INSERT INTO public.community_questions (question, category, relate_count, responses_count, answer)
VALUES 
('Does anyone else feel like they''re the only one struggling while everyone seems fine?', 'Loneliness', 234, 47, 'You''re absolutely not alone in this. Social media creates an illusion that everyone else has it together — they don''t.'),
('I can''t sleep because of exam anxiety. Is this normal?', 'Anxiety', 189, 36, 'Very normal — exam anxiety affects nearly 40% of students. Your brain goes into ''threat mode'' making it hard to wind down. Try the 4-7-8 breathing technique.'),
('I feel burnt out and have zero motivation. How do I get back on track?', 'Burnout', 312, 58, 'Burnout is your mind''s way of saying ''I need a reset.'' Start small — don''t try to fix everything at once. Rest is productive. Your worth isn''t measured by your output.'),
('Is it okay to feel sad for no reason?', 'Emotions', 456, 89, 'Absolutely. Emotions don''t always need a ''reason.'' Sometimes our bodies are processing stress, hormonal changes, or accumulated fatigue.'),
('How do I tell my parents I need therapy without them freaking out?', 'Getting Help', 278, 52, 'Try framing it around growth rather than crisis: ''I''ve been learning about mental wellness and I think talking to someone could help me handle stress better.'''),
('Does everyone here feel smarter than me? I feel like I''m just pretending to know what I''m doing.', 'Self-Worth', 512, 94, 'This is called Imposter Syndrome, and almost everyone feels it at some point. You belong here just as much as anyone else.'),
('Is it normal to drift apart from your freshman year friends? I feel like I have no one to sit with suddenly.', 'Loneliness', 167, 29, 'Friendships often shift as you grow. It''s a painful but normal part of the college journey. New connections are coming.'),
('I''m halfway through my degree and I think I hate my major. Is it too late to change everything?', 'Burnout', 203, 41, 'It is never too late to prioritize your happiness. Many students change paths in their 3rd or even terminal year. You have time.'),
('I can''t stop thinking about my student loans. It''s making it impossible to focus on my midterms.', 'Anxiety', 345, 61, 'Financial stress is a huge burden. Many universities have emergency financial aid or counseling for this specific stress.'),
('I feel guilty for wanting to stay in and sleep instead of going out. Am I ''failing'' the college experience?', 'Self-Worth', 489, 120, 'Your college experience is yours to define. Rest is a necessity, not a failure. Listen to your body.');
