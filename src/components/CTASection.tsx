import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-28 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.8rem] border border-white/30 gradient-hero p-9 text-primary-foreground shadow-[0_40px_120px_-60px_oklch(0.42_0.14_33_/_0.85)] sm:p-12 lg:p-16"
      >
        {/* Animated orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/14 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-8 h-60 w-60 rounded-full bg-white/12 blur-3xl animate-float-medium" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl animate-radial-pulse" />
        </div>

        {/* Shimmer effect on CTA */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.8rem] opacity-30">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, oklch(1 0 0 / 0.25) 50%, transparent 65%)",
              animation: "shimmer-slide 4s infinite",
            }}
          />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-4 py-2 text-sm font-semibold text-primary-foreground/90">
              <Sparkles className="h-3.5 w-3.5" />
              Ready When You Are
            </div>

            <h2 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.25rem]">
              You do not need the perfect words to begin.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-primary-foreground/85">
              Start with a short chat, a quick emotional check-in, or a quiet scroll through grounding
              resources. The first step can stay gentle.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm text-primary-foreground/88">
              {["Anonymous", "Low-pressure", "Guided by care"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="rounded-full border border-white/30 bg-white/14 px-5 py-2 backdrop-blur-sm transition-colors duration-200 hover:bg-white/22"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Link to="/chat">
              <Button
                size="xl"
                className="group h-14 w-full rounded-full bg-white text-foreground shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-white/95 hover:scale-105 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.55)] active:scale-98"
              >
                Start Talking Now
                <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/resources">
              <Button
                variant="heroOutline"
                size="xl"
                className="h-14 w-full rounded-full border-white/38 bg-white/10 text-primary-foreground backdrop-blur-sm transition-all duration-200 hover:bg-white/18 hover:text-primary-foreground hover:scale-105 active:scale-98"
              >
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
