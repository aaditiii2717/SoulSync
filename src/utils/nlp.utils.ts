import { pipeline } from "@xenova/transformers";

// We use the roberta-base-go_emotions model as it's well-suited for multi-label emotion classification
// https://huggingface.co/SamLowe/roberta-base-go_emotions
let classifier: any = null;

export async function detectEmotions(text: string): Promise<DetectedEmotion[]> {
  if (!classifier) {
    classifier = await pipeline("text-classification", "SamLowe/roberta-base-go_emotions", {
      revision: "main",
    });
  }

  const result = await classifier(text, { topk: 5 });
  
  // Filter for emotions with a confidence score > 0.1
  return (result as any[])
    .filter((r) => r.score > 0.1)
    .map((r) => ({
      label: r.label,
      score: r.score,
    }));
}

export type DetectedEmotion = {
  label: string;
  score: number;
};
