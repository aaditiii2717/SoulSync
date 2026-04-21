import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/45 gradient-hero p-8 text-primary-foreground shadow-[0_36px_100px_-60px_oklch(0.45_0.12_35_/_0.8)] sm:p-10 lg:p-14"
      >
        <div className="absolute -right-12 top-[-5rem] h-56 w-56 rounded-full bg-white/18 blur-3xl" />
        <div className="absolute -bottom-16 left-[-2rem] h-48 w-48 rounded-full bg-white/16 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/80">
              Ready When You Are
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              You do not need the perfect words to begin.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/88">
              Start with a short chat, a quick emotional check-in, or a quiet scroll through grounding resources. The
              first step can stay gentle.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-primary-foreground/88">
              {["Anonymous", "Low-pressure", "Guided by care"].map((item) => (
                <div key={item} className="rounded-full border border-white/35 bg-white/10 px-4 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Link to="/chat">
              <Button
                size="xl"
                className="h-14 rounded-full bg-white text-foreground shadow-[0_20px_45px_-24px_rgba(0,0,0,0.4)] hover:bg-white/92"
              >
                Start Talking Now
              </Button>
            </Link>
            <Link to="/resources">
              <Button
                variant="heroOutline"
                size="xl"
                className="h-14 rounded-full border-white/40 bg-white/8 text-primary-foreground hover:bg-white/16 hover:text-primary-foreground"
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
