import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Users } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-calm/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-warm/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Shield className="h-4 w-4" />
            Safe · Anonymous · AI-Powered
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            You&apos;re not alone.
            <br />
            <span className="text-gradient">We&apos;re here to listen.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            A safe, anonymous space where you can talk about anything.
            AI-guided support backed by CBT techniques, peer volunteers, and professional resources.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/chat">
              <Button variant="hero" size="xl" className="rounded-2xl shadow-xl">
                Talk to Someone
              </Button>
            </Link>
            <Link to="/check-in">
              <Button variant="heroOutline" size="xl" className="rounded-2xl">
                How Am I Feeling?
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Brain, title: "CBT-Based Support", desc: "Evidence-backed techniques that actually help with anxiety, stress & more" },
            { icon: Shield, title: "100% Anonymous", desc: "No sign-up needed. Your identity is always protected" },
            { icon: Users, title: "Trained Volunteers", desc: "Real humans who listen without judgment when you need them" },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
