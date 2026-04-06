import { Link } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

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
    <footer className="border-t border-white/45 bg-white/45 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-wellness shadow-sm">
                <HeartHandshake className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">SoulSync</span>
            </Link>
            <p className="text-sm leading-7 text-muted-foreground">
              A softer digital space for emotional support, pairing warm AI guidance with peer listeners and real safety
              cues.
            </p>
            <p className="mt-3 text-xs italic leading-6 text-muted-foreground">
              SoulSync is not a replacement for professional therapy. It is a bridge that helps people reach the kind of
              support they need.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 font-display text-sm font-semibold">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>Built with care by Code Catalysts · HM49</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} SoulSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
