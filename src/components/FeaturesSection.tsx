import { motion } from "framer-motion";
import { MessageCircleHeart, AlertTriangle, UserCheck, Clock, TrendingUp, BookOpen, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageCircleHeart,
    title: "Humanized AI Chatbot",
    desc: "Friendly, empathetic conversations that make you comfortable before connecting to a human peer.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Sparkles,
    title: "Proactive Support",
    desc: "Detects emotional distress early and suggests help BEFORE you ask. A true game changer.",
    color: "bg-calm/10 text-calm",
  },
  {
    icon: TrendingUp,
    title: "Sentiment Analysis",
    desc: "AI classifies your emotional state — Normal, Stressed, or High-risk — to enable smart decisions.",
    color: "bg-warm/10 text-warm",
  },
  {
    icon: AlertTriangle,
    title: "Crisis Escalation",
    desc: "If high-risk is detected: alerts admin, suggests helplines, and prioritizes your support.",
    color: "bg-alert/10 text-alert",
  },
  {
    icon: UserCheck,
    title: "Smart Peer Matching",
    desc: "Matches you with verified volunteers based on issue type, language, and availability.",
    color: "bg-safe/10 text-safe",
  },
  {
    icon: Clock,
    title: "Micro Support Sessions",
    desc: "Quick 5–10 minute conversations. User-driven, no pressure, instant emotional relief.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Safe & Anonymous",
    desc: "Your identity is hidden from other users but verified in the backend for safety.",
    color: "bg-calm/10 text-calm",
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    desc: "Self-help guides, mental health tips, and support beyond conversations.",
    color: "bg-warm/10 text-warm",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Not just a chat app —
            <br />
            <span className="text-gradient">An Intelligent Support System</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our platform combines human empathy with intelligent automation to make mental health support more accessible, safe, and scalable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group rounded-2xl border bg-card p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.color} mb-3`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
