import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

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
    <footer className="border-t bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-wellness">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">SoulSync</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A safe, anonymous peer support platform that connects students with empathetic AI and trained volunteers.
            </p>
            <p className="mt-3 text-xs text-muted-foreground italic">
              SoulSync is NOT a replacement for professional therapy. It&apos;s a bridge to help you find the right support.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

        <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>Built with ❤️ by Code Catalysts · HM49</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} SoulSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
