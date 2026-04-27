export interface HealingTool {
  id: string;
  title: string;
  description: string;
  type: "audio" | "text" | "video";
  content: string; // URL for audio/video, or the letter template text
}

export const HEALING_LIBRARY: Record<string, HealingTool> = {
  JOURNAL_TEMPLATE: {
    id: "JOURNAL_TEMPLATE",
    title: "Expressive Letter Template",
    description: "A gentle structure to help you release your thoughts onto paper.",
    type: "text",
    content: `Dear [Me/Stress/Life],
    
I'm writing to you today because my heart feels...
Right now, the hardest part is...
If I could say one thing to myself without judgment, it would be...
I am resilient because...

With care,
[Me]`,
  },
  SOOTHING_AUDIO: {
    id: "SOOTHING_AUDIO",
    title: "Mountain Rain & Breath",
    description: "5 minutes of immersive nature sounds with gentle guiding cues.",
    type: "audio",
    content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Simplified for demo
  },
  VIRTUAL_WALK: {
    id: "VIRTUAL_WALK",
    title: "Kyoto Forest Walk",
    description: "A peaceful visual journey through nature to help you ground yourself.",
    type: "video",
    content: "https://www.youtube.com/embed/2O9T_f3_Mek", // Example soothing walk
  },
};
