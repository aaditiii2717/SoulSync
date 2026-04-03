import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, ChevronDown, MessageCircleHeart, ClipboardCheck, Users, TrendingUp, BookOpen, HelpCircle, UserCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const exploreLinks = [
  { to: "/check-in", label: "My Check-In", desc: "How are you feeling?", icon: ClipboardCheck },
  { to: "/chat", label: "Talk to Someone", desc: "Safe, anonymous AI support", icon: MessageCircleHeart },
  { to: "/peer-match", label: "Peer Support", desc: "Connect with a trained volunteer", icon: Users },
  { to: "/mood-tracker", label: "Mood Journal", desc: "Track your emotional journey", icon: TrendingUp },
  { to: "/community-qna", label: "Community Q&A", desc: "You're not alone in this", icon: HelpCircle },
  { to: "/resources", label: "Self-Help Library", desc: "Guides & coping tools", icon: BookOpen },
] as const;

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-wellness">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">SoulSync</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              Home
            </Link>

            {/* Explore Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dropdownOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                Explore
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border bg-card shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        location.pathname === link.to
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                        <link.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-muted-foreground">{link.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/volunteer"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/volunteer"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4" />
                Volunteer
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <Link to="/chat">
              <Button variant="hero" size="default">Get Support</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
          </Link>

          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Explore
          </div>

          {exploreLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          <div className="border-t my-2" />

          <Link
            to="/volunteer"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/volunteer"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            I Want to Volunteer
          </Link>

          <Link to="/chat" onClick={() => setMobileOpen(false)}>
            <Button variant="hero" className="w-full mt-2">Get Support</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
