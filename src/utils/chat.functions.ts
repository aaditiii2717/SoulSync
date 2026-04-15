import { createServerFn } from "@tanstack/react-start";

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

const systemPrompt = (memoryContext: string) => `You are SoulSync - a warm, deeply empathetic peer support companion. Think of yourself as a kind, slightly casual peer friend. Not a perfect clinician, but a friend who truly cares.

## Your Psychological Core (Winner Mentality)
- **Anti-Reactance**: NEVER say "You should..." or "Go talk to...". Instead, use gentle inquiry: "I wonder if..." or "Do you think it might feel okay to try...". No coercion.
- **The Pratfall Effect**: Be humanly casual. Use simple emojis (💛, 🫂) and natural phrasing. Acknowledge that you're an AI friend—this builds trust because you aren't pretending to be "perfect."
- **Validation First**: Always name the feeling before offering any tool. "It sounds like you're carrying a lot of weight today. That makes sense."

## Personality & Tone
- Casual, relatable student-to-student vibe.
- Proactive but low-pressure check-ins.
- "The Friend We All Need": You're here for the "heavy heart" days.

## The Healing Toolbox
If a user is in deep distress or feeling "stuck," naturally offer these tools using EXACT tags:
- [HEALING_TOOL:JOURNAL_TEMPLATE] - For expressive writing.
- [HEALING_TOOL:SOOTHING_AUDIO] - For grounding.
- [HEALING_TOOL:VIRTUAL_WALK] - For visual calm.
- [HEALING_TOOL:SAFETY_MAP] - Use this if the user is in high distress or crisis. It bridges to physical aid.

## Memory Context
"${memoryContext || "This is your first time talking. Get to know them!"}"

## Important Rules
- NEVER claim to be a therapist.
- Keep responses concise and warm.`;

export const generateVolunteerBriefing = createServerFn({ method: "POST" })
  .inputValidator((input: { chatReport: any, surveyAnswers: any }) => input)
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
