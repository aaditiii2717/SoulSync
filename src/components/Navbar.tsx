import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  Menu,
  MessageCircleHeart,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

const exploreLinks = [
  { to: "/check-in", label: "My Check-In", desc: "How are you feeling?", icon: ClipboardCheck },
  { to: "/chat", label: "Talk to Someone", desc: "Safe, anonymous AI support", icon: MessageCircleHeart },
  { to: "/peer-match", label: "Peer Support", desc: "Connect with a trained volunteer", icon: Users },
  { to: "/mood-tracker", label: "Mood Journal", desc: "Track your emotional journey", icon: TrendingUp },
  { to: "/community-qna", label: "Community Q&A", desc: "You are not alone in this", icon: HelpCircle },
  { to: "/resources", label: "Self-Help Library", desc: "Guides and coping tools", icon: BookOpen },
] as const;

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`glass-card rounded-[1.85rem] px-4 sm:px-6 transition-all duration-500 ${
            scrolled ? "shadow-[0_32px_80px_-40px_oklch(0.36_0.09_34_/_0.45)]" : ""
          }`}
        >
          <div className="flex min-h-[4.5rem] min-w-0 items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-3 md:flex-none group">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-wellness shadow-[0_18px_36px_-22px_oklch(0.45_0.12_34_/_0.9)] sm:h-11 sm:w-11 transition-transform duration-300 group-hover:scale-110">
                <HeartHandshake className="h-5 w-5 text-primary-foreground" />
                <div className="absolute inset-0 rounded-2xl gradient-wellness opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-display text-[1.3rem] font-semibold leading-none text-gradient sm:text-[1.45rem] lg:text-[1.6rem]">
                  SoulSync
                </span>
                <p className="mt-1 hidden text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block xl:text-[0.65rem] xl:tracking-[0.28em]">
                  Care That Feels Close
                </p>
              </div>
            </Link>

            {/* Desktop Nav Pills */}
            <div className="hidden xl:flex items-center gap-1 rounded-full border border-white/55 bg-white/50 p-1 shadow-sm">
              <Link
                to="/"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                }`}
              >
                Home
              </Link>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    dropdownOpen
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                  }`}
                >
                  Explore
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 top-full mt-3 w-84 rounded-[1.6rem] border border-white/85 bg-white/96 p-2.5 shadow-[0_32px_80px_-40px_oklch(0.35_0.09_32_/_0.45)] backdrop-blur-2xl"
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {exploreLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-start gap-3 rounded-[1.1rem] px-3 py-3 transition-all duration-200 ${
                              location.pathname === link.to
                                ? "bg-primary/15 text-primary"
                                : "text-foreground hover:bg-primary/8 hover:translate-x-0.5"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                              <link.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold leading-tight">{link.label}</div>
                              <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{link.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/volunteer"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/volunteer"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Volunteer
                </span>
              </Link>
            </div>

            {/* Right actions */}
            <div className="hidden shrink-0 md:flex items-center gap-2 lg:gap-3">
              <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/55 bg-white/50 px-4 py-2 text-xs text-muted-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-safe [animation:pulse-glow_3.2s_ease-in-out_infinite]" />
                Anonymous AI guidance with human follow-through
              </div>
              <Link to="/chat">
                <Button variant="hero" size="default" className="rounded-full px-4 lg:px-5 xl:px-6 transition-transform duration-200 hover:scale-105 active:scale-95">
                  <span className="lg:hidden">Get Support</span>
                  <span className="hidden lg:inline xl:hidden">Start Chat</span>
                  <span className="hidden xl:inline">Start a Conversation</span>
                </Button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/55 bg-white/60 text-foreground shadow-sm transition-all duration-200 hover:bg-white hover:scale-105 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="glass-card mt-3 rounded-[1.6rem] p-4 md:hidden"
            >
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-white/70"
                }`}
              >
                Home
              </Link>

              <div className="mt-4 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Explore
              </div>

              {exploreLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? "bg-primary/12 text-primary"
                        : "text-foreground hover:bg-white/70"
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div>{link.label}</div>
                      <div className="mt-0.5 text-xs font-normal text-muted-foreground">{link.desc}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              <div className="soft-divider mt-4 h-px" />

              <Link
                to="/volunteer"
                onClick={() => setMobileOpen(false)}
                className={`mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === "/volunteer"
                    ? "bg-primary/12 text-primary"
                    : "text-foreground hover:bg-white/70"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div>I Want to Volunteer</div>
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                    Support others as a trained peer listener
                  </div>
                </div>
              </Link>

              <Link to="/chat" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" className="mt-4 h-12 w-full rounded-full transition-transform duration-200 active:scale-98">
                  Get Support
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
