import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl gradient-hero rounded-3xl p-12 sm:p-16 text-center text-primary-foreground"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold">
          No student should feel alone.
        </h2>
        <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
          Help is always one safe conversation away. Start your journey to feeling better today.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/chat">
            <Button size="xl" className="rounded-2xl bg-card text-foreground hover:bg-card/90 shadow-xl">
              Start Talking Now
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="heroOutline" size="xl" className="rounded-2xl border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              Browse Resources
            </Button>
          </Link>
        </div>
      </motion.div>

    </section>
  );
}
