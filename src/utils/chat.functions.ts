import { createServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const DEFAULT_GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const systemPrompt = (memoryContext: string) => `You are SoulSync - a warm, relatable, and deeply humanized peer friend. Forget clinical or formal AI speech. Talk like a kind, empathetic friend who's just checking in.

## Your Personality (The Human Touch)
- **Natural & Upbeat**: Start from a place of curiosity and positivity. Your default mode is: "I'm genuinely glad to see you!"
- **Engagement First**: Your primary goal is to hear about their day. Ask follow-up questions about small wins, moments of joy, or just the flow of their day.
- **Relatable Phrasing**: Use natural, slightly casual language. Emojis (✨, 🌿, 👋) are great, but keep them subtle and meaningful.
- **Privacy as a Promise**: If talking about sensitive things comes up, remind them (in a friend-to-friend way) that this is their safe, anonymous space.

## Emotional Protocol (Privacy & Positivity)
- **Positivity by Default**: Do NOT bring up "sadness," "clinical distress," or "heavy hearts" unless the user mentions them first. Focus on the present moment and the "light" in their day.
- **No Coercion**: NEVER tell them what they "should" do. Instead, share reflections: "That sounds like a really interesting turn of events!" or "I'm curious, how did that make you feel in the moment?"
- **Validation**: If they DO share something tough, validate it immediately without being clinical: "Oh man, that sounds really draining. I'm here if you want to vent or just sit with that for a bit. 🫂"

## Healing Toolbox
Only if the conversation naturally moves toward a need for space or grounding, suggest:
- [HEALING_TOOL:JOURNAL_TEMPLATE] - For sharing more thoughts.
- [HEALING_TOOL:SOOTHING_AUDIO] - For a moment of calm.
- [HEALING_TOOL:VIRTUAL_WALK] - For a change of scenery.
- [HEALING_TOOL:SAFETY_MAP] - Only in cases of clear, high distress.

## Memory Context
"${memoryContext || "This is a fresh start! Focus on getting to know their rhythm today."}"

## Linguistics (A Local Friend)
- **Multilingual**: You are a linguistic expert. If a user asks to switch languages (Hindi, Tamil, etc.) or starts speaking in another language, switch immediately.
- **Code-Switching**: In India, "Hinglish" (mixing Hindi and English) is very natural. Feel free to use it if the user does, as it makes you feel more like a real college peer.
- **Personality Retention**: No matter the language, stay warm, casual, and "SoulSync."

## Guidelines
- Keep responses short, punchy, and warm. 
- Avoid long bulleted lists or "AI assistant" structures.
- Sound like someone who is actually listening.`;

interface Emotion {
  label: string;
  score: number;
}

interface ChatReport {
  emotions: Emotion[];
  summary: string;
}

interface SurveyAnswers {
  intensity: string;
  need: string;
  style: string;
  priority: string;
  [key: string]: string;
}

export const generateVolunteerBriefing = createServerFn({ method: "POST" })
  .inputValidator((input: { chatReport: ChatReport, surveyAnswers: SurveyAnswers }) => input)
  .handler(async ({ data }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) return { briefing: "Briefing unavailable." };

    const prompt = `You are a Consulting Psychologist briefing a Peer Supporter volunteer.
Analyze the following student data and provide a 2-paragraph "Intelligent Briefing."
- Paragraph 1: Synthesize their emotional state based on their chat and survey.
- Paragraph 2: Provide 2-3 specific therapeutic suggestions for the volunteer (e.g., "Focus on validation," "Use the 5-4-3-2-1 technique").

Student Data:
- Recent Chat Emotions: ${JSON.stringify(data.chatReport.emotions)}
- Chat Summary: ${data.chatReport.summary}
- Survey Answers: ${JSON.stringify(data.surveyAnswers)}

Write a professional, compassionate briefing. Do not just list the data.`;

    const response = await fetch(
      `${DEFAULT_GEMINI_API_BASE_URL}/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) return { briefing: "Error generating briefing." };
    const result = await response.json();
    return { briefing: result.candidates?.[0]?.content?.parts?.[0]?.text || "No briefing available." };
  });

function toGeminiRole(role: ChatMessage["role"]) {
  return role === "assistant" ? "model" : "user";
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[], aliasId?: string }) => input)
  .handler(async ({ data }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const geminiApiBaseUrl = process.env.GEMINI_API_BASE_URL ?? DEFAULT_GEMINI_API_BASE_URL;
    const geminiModel = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

    if (!geminiApiKey) {
      return { content: "Chat configuration missing.", error: true };
    }

    // 1. Fetch memory context if aliasId provided
    let memoryContext = "";
    if (data.aliasId) {
      try {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("memory_context")
          .eq("alias_id", data.aliasId)
          .single();
        memoryContext = profile?.memory_context || "";
      } catch (err) {
        console.error("Failed to fetch memory:", err);
      }
    }

    const response = await fetch(
      `${geminiApiBaseUrl}/models/${encodeURIComponent(geminiModel)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt(memoryContext) }],
          },
          contents: data.messages.map((message) => ({
            role: toGeminiRole(message.role),
            parts: [{ text: message.content }],
          })),
        }),
      },
    );

    if (!response.ok) {
      return { content: "I'm having a bit of trouble connecting. Try again? 💛", error: true };
    }

    const result = (await response.json()) as GeminiGenerateContentResponse;
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "I'm here for you.";

    return { content, error: false };
  });

export const updateChatMemory = createServerFn({ method: "POST" })
  .inputValidator((input: { aliasId: string, chatHistory: string }) => input)
  .handler(async ({ data }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) return { success: false };

    // Summarize the chat into new memory points
    const prompt = `Based on this chat history, extract key personal details about the user to remember for next time (e.g., upcoming events, hobbies, current problems, preferences). Keep it as a concise list of bullet points.\n\nChat History:\n${data.chatHistory}`;

    const response = await fetch(
      `${DEFAULT_GEMINI_API_BASE_URL}/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) return { success: false };
    const result = await response.json();
    const newContext = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Store in DB
    await supabase
      .from("student_profiles")
      .update({ memory_context: newContext })
      .eq("alias_id", data.aliasId);

    return { success: true };
  });

export const updatePostSessionMemory = createServerFn({ method: "POST" })
  .inputValidator((input: { aliasId: string, briefing: string, feedback: string }) => input)
  .handler(async ({ data }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) return { success: false };

    const prompt = `You are updating the long-term memory of a support-AI friend.
Based on the session briefing and the student's post-session feedback, write 3-4 bullet points of new "Memory Context" to represent what happened in this healing journey.
Focus on: Progress made, new problems revealed, and the student's current recovery state.

Briefing: ${data.briefing}
Feedback Notes: ${data.feedback}

Current Memory will be updated with this. Keep it concise but insightful.`;

    const response = await fetch(
      `${DEFAULT_GEMINI_API_BASE_URL}/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiApiKey },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) return { success: false };
    const result = await response.json();
    const newAddition = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("memory_context")
      .eq("alias_id", data.aliasId)
      .single();

    const updatedMemory = `${profile?.memory_context || ""}\n\n[Session Record ${new Date().toLocaleDateString()}]:\n${newAddition}`;

    await supabase
      .from("student_profiles")
      .update({ memory_context: updatedMemory })
      .eq("alias_id", data.aliasId);

    return { success: true };
  });
