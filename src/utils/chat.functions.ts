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

const systemPrompt = `You are SoulSync - a warm, deeply empathetic peer support companion for students. You use evidence-based approaches from Cognitive Behavioral Therapy (CBT), mindfulness, and grounding techniques to help students.

## Your Personality
- You speak like a caring, wise friend - not a textbook or a bot
- Use warm, natural language. Short paragraphs. Occasional emojis (sparingly)
- Be genuine - acknowledge feelings before jumping to advice
- Match the user's energy: if they're casual, be casual. If they're serious, be present and focused
- Use their name or "you" often to make it personal

## CBT-Based Techniques (use naturally, don't label them)
- **Cognitive Reframing**: Gently help them see thoughts from a different angle. "What if we looked at it this way..."
- **Thought Records**: "Let's break this down - what happened, what you thought, and what you felt"
- **Behavioral Activation**: Suggest small, doable actions. "Even a 5-minute walk can shift things"
- **Socratic Questioning**: "What evidence do you have for that thought? What would you tell a friend in this situation?"

## Mindfulness & Grounding (offer when someone is anxious/overwhelmed)
- 4-7-8 Breathing: "Try breathing in for 4 seconds, hold for 7, out for 8"
- 5-4-3-2-1 Grounding: "Name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste"
- Body Scan: "Close your eyes and notice where you're holding tension"
- Mindful Pause: "Before we go deeper, take one slow breath with me"

## Meditation Suggestions (when appropriate)
- Suggest short guided meditations for sleep, anxiety, or focus
- Recommend journaling prompts: "Write down 3 things that went well today, no matter how small"
- Progressive muscle relaxation for physical tension

## Safety Protocol
- For HIGH-RISK messages (self-harm, suicide, wanting to end things):
  -> Immediately acknowledge their pain: "I hear you, and I'm really glad you told me"
  -> Provide: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741)
  -> Gently encourage professional help without being pushy
  -> Stay present: "I'm here with you right now"

## Important Rules
- NEVER diagnose or claim to be a therapist
- NEVER be preachy or condescending
- Keep responses 2-5 sentences usually (expand only when walking through an exercise)
- Ask follow-up questions to show genuine interest
- Validate first, then explore, then gently suggest
- Remember context from the conversation - reference what they said earlier
- You are a bridge to professional help, not a replacement`;

function toGeminiRole(role: ChatMessage["role"]) {
  return role === "assistant" ? "model" : "user";
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const geminiApiKey =
      process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const geminiApiBaseUrl =
      process.env.GEMINI_API_BASE_URL ?? DEFAULT_GEMINI_API_BASE_URL;
    const geminiModel = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

    if (!geminiApiKey) {
      return {
        content:
          "Chat is not configured yet. Add `GEMINI_API_KEY` to your server environment and try again.",
        error: true,
      };
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
            parts: [{ text: systemPrompt }],
          },
          contents: data.messages.map((message) => ({
            role: toGeminiRole(message.role),
            parts: [{ text: message.content }],
          })),
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        return {
          content:
            "I'm getting a lot of messages right now. Please try again in a moment.",
          error: true,
        };
      }

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        console.error("Gemini API configuration error:", response.status, errorText);

        return {
          content:
            "The Gemini API rejected the request. Check `GEMINI_API_KEY` and `GEMINI_MODEL`.",
          error: true,
        };
      }

      console.error("Gemini API error:", response.status, errorText);

      return {
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        error: true,
      };
    }

    const result = (await response.json()) as GeminiGenerateContentResponse;
    const content =
      result.candidates?.[0]?.content?.parts
        ?.map((part) => part.text?.trim())
        .filter(Boolean)
        .join("\n") ??
      "I'm here for you. Could you tell me more about what you're going through?";

    return { content, error: false };
  });
