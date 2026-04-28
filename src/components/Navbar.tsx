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
  ShieldCheck
} from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";

import { Button } from "@/components/ui/button";
import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const exploreLinks = [
  { to: "/check-in", label: "My Check-In", desc: "How are you feeling?", icon: ClipboardCheck },
  { to: "/chat", label: "Talk to Someone", desc: "Safe, anonymous AI support", icon: MessageCircleHeart },
  { to: "/peer-match", label: "Peer Support", desc: "Connect with a trained volunteer", icon: Users },
  { to: "/partners", label: "NGO Partners", desc: "Our network of professional help", icon: HeartHandshake },
  { to: "/mood-tracker", label: "Mood Journal", desc: "Track your emotional journey", icon: TrendingUp },
  { to: "/community-qna", label: "Community Q&A", desc: "You are not alone in this", icon: HelpCircle },
  { to: "/resources", label: "Self-Help Library", desc: "Guides and coping tools", icon: BookOpen },
] as const;

export const Navbar = memo(() => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/volunteer");

  useEffect(() => {
    const updateAuthStatus = async (session: Session | null) => {
      const email = session?.user?.email || null;
      setUserEmail(email);
      
      if (email) {
        setIsAdmin(ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(email)));
        
        // Check if user is a verified volunteer
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select("id, verification_status")
          .eq("email", email)
          .single();
          
        setIsVolunteer(volunteerData?.verification_status === "verified");
      } else {
        setIsAdmin(false);
        setIsVolunteer(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthStatus(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthStatus(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card rounded-[1.75rem] px-4 sm:px-6">
          <div className="flex min-h-[4.5rem] min-w-0 items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-wellness shadow-[0_18px_36px_-22px_oklch(0.45_0.12_145_/_0.9)] sm:h-11 sm:w-11">
                <HeartHandshake className="h-5 w-5 text-primary-foreground" />
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

            <div className="hidden xl:flex items-center gap-1 rounded-full border border-white/55 bg-white/50 p-1 shadow-sm">
              <Link
                to="/"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                Home
              </Link>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((value) => !value)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    dropdownOpen
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white hover:text-foreground"
                  }`}
                >
                  Explore
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-3 w-80 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-xl">
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-3 rounded-[1.1rem] px-3 py-3 transition-colors ${
                          location.pathname === link.to
                            ? "bg-primary/18 text-primary"
                            : "text-foreground hover:bg-primary/8"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                          <link.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{link.label}</div>
                          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/volunteer"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/volunteer"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Volunteer
                </span>
              </Link>
            </div>

            <div className="hidden shrink-0 md:flex items-center gap-2 lg:gap-3">
              {userEmail ? (
                <div className="flex items-center gap-3">
                  <div className="hidden flex-col items-end xl:flex">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Logged in as</span>
                    <span className="text-sm font-semibold text-foreground truncate max-w-[12rem]">{userEmail}</span>
                  </div>
                  {isAdmin && (
                    <Link to="/admin/command-center">
                      <Button variant="outline" size="sm" className="rounded-full border-primary/30 text-primary font-bold px-4 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Admin Hub
                      </Button>
                    </Link>
                  )}
                  {isVolunteer && !isAdmin && (
                    <Link to="/volunteer/dashboard" search={{ tab: "overview" }}>
                      <Button variant="outline" size="sm" className="rounded-full border-rose-500/30 text-rose-600 font-bold px-4 flex items-center gap-2 hover:bg-rose-50">
                        <HeartHandshake className="h-4 w-4" />
                        Volunteer Hub
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="heroOutline" 
                    size="sm" 
                    className="rounded-full px-4"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  {!isAuthRoute && <IdentityRecoveryButton className="hidden md:inline-flex" />}
                  <Link to="/chat">
                    <Button variant="hero" size="default" className="rounded-full px-4 lg:px-5 xl:px-6">
                      <span className="lg:hidden">Get Support</span>
                      <span className="hidden lg:inline xl:hidden">Start Chat</span>
                      <span className="hidden xl:inline">Start a Conversation</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/55 bg-white/60 text-foreground shadow-sm transition-colors hover:bg-white md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="glass-card mt-3 rounded-[1.5rem] p-4 md:hidden">
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

            {exploreLinks.map((link) => (
              <Link
                key={link.to}
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
              <Button variant="hero" className="mt-4 h-12 w-full rounded-full">
                Get Support
              </Button>
            </Link>

            {!userEmail && !isAuthRoute && (
              <div className="mt-4 flex justify-center">
                <IdentityRecoveryButton />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
