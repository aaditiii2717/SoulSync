import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircleHeart, Shield, Sparkles, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const supportSignals = [
  { icon: Shield, label: "Private by design", color: "bg-calm/12 text-calm" },
  { icon: Sparkles, label: "Emotion-aware AI", color: "bg-primary/12 text-primary" },
  { icon: Users, label: "Real human follow-up", color: "bg-safe/12 text-safe" },
];

const supportChoices = ["Grounding in 60 seconds", "Mood journal", "Peer listener match"];

const statsPulse = [
  { value: "12k+", label: "Conversations" },
  { value: "4.9★", label: "Warmth score" },
  { value: "98%", label: "Felt heard" },
  { value: "100%", label: "Anonymous" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-36 sm:px-6 lg:px-8 lg:pt-40">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-30 animate-morph-blob"
          style={{ background: "radial-gradient(circle, oklch(0.93 0.08 55 / 0.55), transparent 70%)" }}
        />
        <div
          className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full opacity-20 animate-morph-blob"
          style={{ background: "radial-gradient(circle, oklch(0.90 0.08 190 / 0.5), transparent 70%)", animationDelay: "4s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, oklch(0.92 0.06 65 / 0.6), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Tag pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pill-badge inline-flex max-w-full flex-wrap items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.72rem]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-wellness">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </span>
            Designed to feel supportive, not clinical
          </motion.div>

          {/* Headline */}
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-tight sm:text-6xl lg:text-[5.5rem]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="block"
            >
              When emotions feel tangled,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-2 block text-gradient"
            >
              start somewhere that feels human.
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            SoulSync gives students and young adults a softer first step into support — blending emotionally
            aware AI, peer listening, and gentle next actions when words are hard to find.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
          >
            <Link to="/chat">
              <Button variant="hero" size="xl" className="h-14 rounded-full px-9 shadow-[0_20px_50px_-18px_oklch(0.42_0.15_30_/_0.65)] transition-all duration-300 hover:scale-105 hover:shadow-[0_28px_60px_-20px_oklch(0.42_0.15_30_/_0.75)] active:scale-98">
                Start Talking
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/check-in">
              <Button variant="heroOutline" size="xl" className="h-14 rounded-full px-9 transition-all duration-200 hover:bg-white/80 hover:scale-105 active:scale-98">
                Check In With Myself
              </Button>
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {supportSignals.map((signal, i) => (
              <motion.div
                key={signal.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="surface-card hover-lift flex items-center gap-3 rounded-[1.4rem] px-4 py-3.5 text-sm text-foreground"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${signal.color}`}>
                  <signal.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{signal.label}</span>
              </motion.div>
            ))}
          </motion.div>


        </motion.div>

        {/* Right column — 3D chat card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[36rem] lg:mx-0"
        >
          {/* Glow behind card */}
          <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2.5rem] blur-3xl opacity-40 gradient-calm" />
          <div className="absolute inset-0 -translate-x-4 -translate-y-2 rounded-[2.5rem] blur-2xl opacity-20 gradient-hero" />

          <div className="relative perspective-deep">
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ repeat: Infinity, duration: 6.8, ease: "easeInOut" }}
            >
              <div
                className="scene-panel preserve-3d rounded-[2.2rem] p-7 sm:p-9"
                style={{ transform: "rotateY(-14deg) rotateX(9deg)" }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/70">
                      Live Emotional Check-In
                    </p>
                    <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">
                      A softer place to begin
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-safe/15 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-safe [animation:pulse-glow_2.8s_ease-in-out_infinite]" />
                    <span className="text-xs font-semibold text-safe">Safe + anonymous</span>
                  </div>
                </div>

                {/* Chat bubbles */}
                <div className="mt-7 space-y-4 text-sm leading-7 text-foreground">
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="ml-auto max-w-sm rounded-[1.5rem] rounded-br-md bg-primary/12 px-4 py-3"
                  >
                    I don&apos;t need a perfect answer. I just need somewhere to start.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="max-w-sm rounded-[1.5rem] rounded-bl-md bg-white/85 px-4 py-3 shadow-sm"
                  >
                    You don&apos;t have to explain everything at once. We can slow this down together.
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="max-w-[92%] rounded-[1.35rem] bg-background/80 px-4 py-3 text-muted-foreground shadow-sm"
                  >
                    From here, SoulSync can guide grounding, journaling, or a peer listener if talking to a
                    human feels better today.
                  </motion.div>
                </div>

                {/* Choice pills */}
                <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
                  {supportChoices.map((choice, i) => (
                    <motion.div
                      key={choice}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                      className="cursor-pointer rounded-[1.2rem] border border-white/65 bg-white/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-white hover:scale-105 hover:shadow-md"
                    >
                      {choice}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>



            {/* Floating next step */}
            <motion.div
              className="absolute -right-7 top-10 hidden lg:block"
              animate={{ y: [0, -18, 0] }}
              transition={{ repeat: Infinity, duration: 7.4, ease: "easeInOut" }}
            >
              <div
                className="scene-panel w-62 rounded-[1.6rem] p-4 hover-lift"
                style={{ transform: "rotateY(-26deg) rotateX(11deg) translateZ(56px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-calm/12">
                    <MessageCircleHeart className="h-4 w-4 text-calm" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Next Step</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">Matched to your pace</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[1.2rem] bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Quiet resources if you want space. A peer listener if you want warmth.
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats strip — full-width below the hero grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="mx-auto mt-16 max-w-7xl border-t border-white/45 pt-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          {statsPulse.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-semibold text-gradient-warm">{stat.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
