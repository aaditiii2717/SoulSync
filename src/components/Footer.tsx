import { Link } from "@tanstack/react-router";
import { HeartHandshake, Phone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  "Get Help": [
    { to: "/chat", label: "Talk to Someone" },
    { to: "/peer-match", label: "Peer Support" },
    { to: "/community-qna", label: "Community Q&A" },
    { to: "/resources", label: "Self-Help Library" },
  ],
  "Your Journey": [
    { to: "/check-in", label: "My Check-In" },
    { to: "/mood-tracker", label: "Mood Journal" },
    { to: "/volunteer", label: "Become a Volunteer" },
  ],
  "Crisis Support": [
    { href: "tel:988", label: "988 Lifeline (Call/Text)" },
    { href: "sms:741741&body=HOME", label: "Crisis Text: HOME to 741741" },
    { href: "https://www.nami.org", label: "NAMI Resources" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="relative border-t border-white/40 bg-white/50 backdrop-blur-2xl">
      {/* Top gradient bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-wellness shadow-sm transition-transform duration-300 group-hover:scale-110">
                <HeartHandshake className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">SoulSync</span>
            </Link>
            <p className="text-sm leading-7 text-muted-foreground">
              A softer digital space for emotional support, pairing warm AI guidance with peer listeners and
              real safety cues.
            </p>
            <p className="mt-4 rounded-[1.2rem] border border-white/55 bg-white/60 px-4 py-3 text-xs italic leading-6 text-muted-foreground shadow-sm">
              SoulSync is not a replacement for professional therapy. It is a bridge that helps people reach
              the kind of support they need.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links], colIdx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIdx * 0.08 }}
            >
              <h4 className="mb-4 font-display text-sm font-semibold tracking-tight">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        to={link.to}
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5"
                      >
                        <span className="h-1 w-1 rounded-full bg-primary/30 transition-all duration-200 group-hover:bg-primary group-hover:scale-125" />
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
                      >
                        {link.label.startsWith("988") ? (
                          <Phone className="h-3 w-3 text-primary/50 group-hover:text-primary" />
                        ) : (
                          <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary" />
                        )}
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/40 pt-7">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Built with care by <span className="font-semibold text-foreground/70">Code Catalysts · HM49</span>
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SoulSync. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
