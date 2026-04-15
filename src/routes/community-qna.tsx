import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Heart, MessageCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/community-qna")({
  component: CommunityQnAPage,
});

interface QnAItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  hearts: number;
  responses: number;
}

const qnaItems: QnAItem[] = [
  {
    id: "1",
    question: "Does anyone else feel like they're the only one struggling while everyone seems fine?",
    answer: "You're absolutely not alone in this. Studies show that over 60% of college students report experiencing overwhelming anxiety. Social media creates an illusion that everyone else has it together — they don't. What you're feeling is incredibly common, and reaching out like this takes real courage. 💛",
    category: "Loneliness",
    hearts: 234,
    responses: 47,
  },
  {
    id: "2",
    question: "I can't sleep because of exam anxiety. Is this normal?",
    answer: "Very normal — exam anxiety affects nearly 40% of students. Your brain goes into 'threat mode' making it hard to wind down. Try the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7, exhale for 8. Also, avoid screens 30 minutes before bed. If it persists for weeks, consider talking to a counselor. You've got this! 🌙",
    category: "Anxiety",
    hearts: 189,
    responses: 36,
  },
  {
    id: "3",
    question: "I feel burnt out and have zero motivation. How do I get back on track?",
    answer: "Burnout is your mind's way of saying 'I need a reset.' Start small — don't try to fix everything at once. Give yourself permission to rest without guilt. Try the '2-minute rule': if something takes less than 2 minutes, do it now. Small wins build momentum. And remember: rest is productive. Your worth isn't measured by your output. 🌿",
    category: "Burnout",
    hearts: 312,
    responses: 58,
  },
  {
    id: "4",
    question: "Is it okay to feel sad for no reason?",
    answer: "Absolutely. Emotions don't always need a 'reason.' Sometimes our bodies are processing stress, hormonal changes, or accumulated fatigue. It's perfectly valid to feel sad without a specific cause. Acknowledge it, sit with it, and be gentle with yourself. If it lasts more than two weeks and affects daily life, reaching out to a professional can help. You matter. 💙",
    category: "Emotions",
    hearts: 456,
    responses: 89,
  },
  {
    id: "5",
    question: "How do I tell my parents I need therapy without them freaking out?",
    answer: "This is a really brave question. Try framing it around growth rather than crisis: 'I've been learning about mental wellness and I think talking to someone could help me handle stress better.' You can compare it to going to a doctor for a check-up — preventive, not emergency. If your parents are resistant, many colleges offer free counseling services you can access independently. 🌟",
    category: "Getting Help",
    hearts: 278,
    responses: 52,
  },
  {
    id: "6",
    question: "I lost my friend group and now I feel completely isolated. What do I do?",
    answer: "Losing a friend group is genuinely painful — it's a form of grief. Give yourself time to process it. Then, start small: join one club or study group that interests you. Quality matters more than quantity — one genuine connection is worth more than a large group where you feel invisible. You're worthy of real friendship, and the right people will see that. 🤝",
    category: "Loneliness",
    hearts: 201,
    responses: 41,
  },
  {
    id: "7",
    question: "Why do I feel anxious even when nothing bad is happening?",
    answer: "Your nervous system can stay in 'alert mode' from past stress — it's called hypervigilance. Your brain learned to watch for danger and hasn't fully turned off that alarm. Grounding exercises help: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. This tells your brain 'I'm safe right now.' Over time, it gets better. 🧠",
    category: "Anxiety",
    hearts: 345,
    responses: 67,
  },
  {
    id: "8",
    question: "I compare myself to everyone and it's destroying me. How do I stop?",
    answer: "Comparison is a natural human tendency, but social media amplifies it 100x. Try this: for every comparison thought, name one thing you've overcome or achieved this year. Unfollow accounts that trigger you. Remember — you're comparing your behind-the-scenes to everyone else's highlight reel. Your journey is uniquely yours, and that's its strength. ✨",
    category: "Self-Worth",
    hearts: 389,
    responses: 73,
  },
];

const categories = [
  "All",
  ...Array.from(new Set(qnaItems.map((q) => q.category))),
];

function CommunityQnAPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    selectedCategory === "All"
      ? qnaItems
      : qnaItems.filter((q) => q.category === selectedCategory);

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <HelpCircle className="h-4 w-4" />
            You&apos;re Not Alone
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Questions Others <span className="text-gradient">Have Asked</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Real questions from real students. Reading these might help you realize that what you&apos;re going through is more common than you think.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Q&A cards */}
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left p-5 flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{item.question}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" /> {item.hearts} relate
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> {item.responses} responses
                    </span>
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-5 border-t"
                >
                  <div className="pt-4 pl-11">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 rounded-2xl gradient-calm p-8 text-center"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            Remember: asking for help is a sign of strength, not weakness. 💪
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thousands of students feel exactly the way you do. You are never truly alone.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
