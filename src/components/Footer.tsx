import { Link } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

const footerLinks = {
  "Get Help": [
    { to: "/chat", label: "Talk to Someone" },
    { to: "/peer-match", label: "Peer Support" },
    { to: "/resources", label: "Resources" },
  ],
  Platform: [
    { to: "/check-in", label: "Check-in" },
    { to: "/admin", label: "Admin Portal" },
    { to: "/volunteer", label: "Volunteer Portal" },
  ],
  Company: [
    { to: "/", label: "About SoulSync" },
    { to: "/", label: "Social Impact" },
    { to: "/", label: "Privacy Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-slate-100 bg-white/50 backdrop-blur-xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-wellness shadow-lg shadow-primary/20">
                <HeartHandshake className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">SoulSync</span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-muted-foreground font-medium">
              A student-led movement for emotional resilience and anonymous peer support.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {title}
              </h3>
              <ul className="mt-6 space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-50 pt-10 sm:flex-row">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © 2026 SoulSync. For Google Solution Challenge.
          </p>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure & Anonymous Connection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
