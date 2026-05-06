import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3.5rem] gradient-hero px-8 py-20 text-center text-white shadow-2xl sm:px-16"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-semibold sm:text-6xl">
              Ready to slow down?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-relaxed font-medium">
              Join the student movement focused on emotional awareness. No login, no trace, just support.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/chat">
                <Button size="xl" className="h-16 rounded-full bg-white px-10 text-primary hover:bg-white/90 shadow-xl">
                  Start a Conversation
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="outline" size="xl" className="h-16 rounded-full border-white/30 px-10 !text-white hover:bg-white/10 backdrop-blur-md">
                  Explore Resources
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
               <span className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-white/40" />
                 Anonymous
               </span>
               <span className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-white/40" />
                 Secure
               </span>
               <span className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-white/40" />
                 Peer-Led
               </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
