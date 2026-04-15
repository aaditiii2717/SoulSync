import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Heart, MessageCircleHeart, Shield, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const supportSignals = [
  { icon: Shield, label: "Private by design" },
  { icon: Sparkles, label: "Emotion-aware AI" },
  { icon: Users, label: "Real human follow-up" },
];

const supportChoices = ["Grounding in 60 seconds", "Mood journal", "Peer listener match"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold leading-relaxed text-primary shadow-sm sm:text-sm sm:leading-normal">
            <Shield className="h-4 w-4" />
            Zero Trace. Absolute Anonymity Guaranteed.
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-[5.35rem]">
            A student-led 
            <span className="mt-2 block text-gradient text-[1.1em]">healing movement.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            SoulSync is the softer first step. No login, no campus link, no judgment. Join 1,200+ peers rebuilding resilience through emotionally aware AI and verified peer support.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
            <Link to="/chat">
              <Button variant="hero" size="xl" className="h-14 rounded-full px-8">
                Start Talking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/check-in">
              <Button variant="heroOutline" size="xl" className="h-14 rounded-full px-8">
                Check In With Myself
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {supportSignals.map((signal) => (
              <div
                key={signal.label}
                className="surface-card flex items-center gap-3 rounded-[1.4rem] px-4 py-3 text-sm text-foreground"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <signal.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{signal.label}</span>
              </div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 flex items-center gap-3 px-1"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-safe"></span>
            </div>
            <p className="text-sm font-bold text-slate-500">
              <span className="text-foreground">42 students</span> are chatting right now. You aren't alone.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[36rem] lg:mx-0"
        >
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.5rem] bg-calm/12 blur-3xl" />
          <div className="relative perspective-deep">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
            >
              <div
                className="scene-panel preserve-3d rounded-[2rem] p-6 sm:p-8"
                style={{ transform: "rotateY(-12deg) rotateX(8deg)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/75">
                      Live Emotional Check-In
                    </p>
                    <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">
                      A softer place to begin
                    </h2>
                  </div>
                  <div className="rounded-full bg-safe/15 px-3 py-1 text-xs font-semibold text-safe">
                    Safe + anonymous
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-7 text-foreground">
                  <div className="ml-auto max-w-sm rounded-[1.5rem] rounded-br-md bg-primary/12 px-4 py-3">
                    I don&apos;t need a perfect answer. I just need somewhere to start.
                  </div>
                  <div className="max-w-sm rounded-[1.5rem] rounded-bl-md bg-white/80 px-4 py-3 shadow-sm">
                    You don&apos;t have to explain everything at once. We can slow this down together.
                  </div>
                  <div className="max-w-[92%] rounded-[1.35rem] bg-background/75 px-4 py-3 text-muted-foreground shadow-sm">
                    From here, SoulSync can guide grounding, journaling, or a peer listener if talking to a human feels
                    better today.
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {supportChoices.map((choice) => (
                    <div
                      key={choice}
                      className="rounded-[1.2rem] border border-white/60 bg-white/65 px-4 py-3 text-sm font-medium text-foreground shadow-sm"
                    >
                      {choice}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -left-5 bottom-6 hidden sm:block"
              animate={{ y: [0, 14, 0] }}
              transition={{ repeat: Infinity, duration: 5.8, ease: "easeInOut" }}
            >
              <div
                className="scene-panel w-56 rounded-[1.5rem] p-4"
                style={{ transform: "rotateY(22deg) rotateX(-10deg) translateZ(40px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Warm Note</p>
                    <p className="mt-1 text-sm font-medium text-foreground">You can start small here.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Even one honest sentence gives the conversation somewhere gentle to begin.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-6 top-10 hidden lg:block"
              animate={{ y: [0, -16, 0] }}
              transition={{ repeat: Infinity, duration: 7.2, ease: "easeInOut" }}
            >
              <div
                className="scene-panel w-60 rounded-[1.5rem] p-4"
                style={{ transform: "rotateY(-24deg) rotateX(10deg) translateZ(52px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-calm/12">
                    <MessageCircleHeart className="h-4 w-4 text-calm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Next Step</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Matched to your pace</p>
                  </div>
                </div>
                <div className="mt-4 rounded-[1.2rem] bg-background/75 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Quiet resources if you want space. A peer listener if you want warmth. Guidance if you want
                  direction.
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
