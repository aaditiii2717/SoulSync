import { generateSessionReport } from "../src/utils/chat.functions";

async function test() {
  console.log("Testing AI Session Report Generation...");
  try {
    const result = await generateSessionReport({
      data: {
        handoff: "Student is feeling anxious about exams.",
        studentNote: "I can't sleep because I'm worried about my math test.",
        issueType: "Academic Stress",
        volunteerDraft: "We discussed some breathing exercises."
      }
    });
    console.log("Result:", result);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
