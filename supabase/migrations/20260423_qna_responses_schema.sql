-- Table for Q&A Responses
CREATE TABLE IF NOT EXISTS public.qna_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    question_id UUID REFERENCES public.community_questions(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    alias_id UUID -- Links to the anonymous student identity
);

-- Row Level Security
ALTER TABLE public.qna_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read responses
CREATE POLICY "Responses are viewable by everyone" 
ON public.qna_responses FOR SELECT 
USING (TRUE);

-- Allow students to post anonymous responses
CREATE POLICY "Students can post anonymous responses" 
ON public.qna_responses FOR INSERT 
WITH CHECK (TRUE);

-- Enable real-time for live response feeds
ALTER PUBLICATION supabase_realtime ADD TABLE public.qna_responses;

-- Seed Data: Initial Supportive Peer Responses
-- Note: These IDs are placeholders; in a real run, they'd match the question IDs.
-- But for the prototype, I'll add them to the first few questions we inserted.

DO $$
DECLARE
    q1_id UUID;
    q2_id UUID;
    q3_id UUID;
BEGIN
    SELECT id INTO q1_id FROM public.community_questions WHERE question LIKE 'Does anyone else feel like they''re the only one struggling%' LIMIT 1;
    SELECT id INTO q2_id FROM public.community_questions WHERE question LIKE 'I can''t sleep because of exam anxiety%' LIMIT 1;
    SELECT id INTO q3_id FROM public.community_questions WHERE question LIKE 'Does everyone here feel smarter than me?%' LIMIT 1;

    IF q1_id IS NOT NULL THEN
        INSERT INTO public.qna_responses (question_id, response_text) VALUES 
        (q1_id, 'Same here. I used to think I was the only one until I joined SoulSync. We are all in this together!'),
        (q1_id, 'Social media is such a liar. Don''t compare your internal state to their outward mask.');
    END IF;

    IF q2_id IS NOT NULL THEN
        INSERT INTO public.qna_responses (question_id, response_text) VALUES 
        (q2_id, 'I started using a weighted blanket and it actually helped me for the first time in years.'),
        (q2_id, 'Try listening to brown noise—it sounds like a waterfall and really shuts off my brain.');
    END IF;

    IF q3_id IS NOT NULL THEN
        INSERT INTO public.qna_responses (question_id, response_text) VALUES 
        (q3_id, 'I''m a grad student and I STILL feel this. You are not a fraud, you''re just learning!'),
        (q3_id, 'Imposter syndrome is just a sign that you care about your work.');
    END IF;
END $$;
