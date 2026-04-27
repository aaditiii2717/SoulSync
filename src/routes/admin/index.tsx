import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, Loader2, XCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

type UIMode = "login" | "signup" | "forgot" | "reset";

function AdminLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode]         = useState<UIMode>("login");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (session?.user?.email && ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(session.user.email))) {
        navigate({ to: "/admin/command-center" });
      } else {
        setIsCheckingAuth(false);
      }
    }

    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setError("");
        setInfo("Enter your new password below.");
        setIsCheckingAuth(false);
        return;
      }

      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user?.email) {
        if (ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(session.user.email))) {
          navigate({ to: "/admin/command-center" });
        } else {
          setError("This account is not authorized for Admin access.");
          supabase.auth.signOut();
          setLoading(false);
          setIsCheckingAuth(false);
        }
      }
      
      if (event === "SIGNED_OUT") {
        setIsCheckingAuth(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/admin/" },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = normalizeEmail(email);

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("This email is not authorized for Admin access.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed") ||
          authError.message.toLowerCase().includes("confirm")) {
        setError("Email not confirmed. Check your inbox and click the verification link first.");
      } else if (authError.message.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = normalizeEmail(email);

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("This email is not authorized for Admin access.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin/" },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists. Try signing in.");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    setInfo("Account created! Check your inbox and click the confirmation link, then come back to sign in.");
    setMode("login");
    setPassword("");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = normalizeEmail(email);

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("This email is not authorized for Admin access.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo: window.location.origin + "/admin/" }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo("Password reset email sent. Check your inbox and click the link.");
      setMode("login");
    }
    setLoading(false);
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      toast.success("Password updated! Signing you in…");
    }
  };

  const titles: Record<UIMode, { heading: string; sub: string }> = {
    login:  { heading: "Sign in to SoulSync",     sub: "Continue to Governance Dashboard" },
    signup: { heading: "Create Admin Account",     sub: "Authorized emails only" },
    forgot: { heading: "Reset Password",           sub: "We'll email you a reset link" },
    reset:  { heading: "Set New Password",         sub: "Choose a strong password" },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white selection:bg-primary/10">
      <Navbar />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#00000003_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {titles[mode].heading}
          </h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
            {titles[mode].sub}
          </p>
        </div>

        <Card className="overflow-hidden rounded-[2.5rem] border-white bg-white p-10 shadow-2xl ring-1 ring-slate-200/50">
          {info && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs font-bold leading-tight">{info}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-600 ring-1 ring-red-100">
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          {mode === "reset" && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password & Sign In"}
              </Button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
              </Button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors pt-2"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {mode === "login" && (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); setInfo(""); }}
                    className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                    placeholder="admin@soulsync.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
                </Button>
              </form>

              <div className="relative my-10 flex items-center">
                <div className="flex-grow border-t border-slate-100" />
                <span className="mx-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Secure Entry</span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </div>
              </Button>
            </>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                  placeholder="must be in authorized list"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Password <span className="text-slate-400 font-normal">(min. 6 chars)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none font-bold"
                  minLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          )}
        </Card>

        {(mode === "login" || mode === "signup") && (
          <div className="mt-10 rounded-[2rem] border border-slate-100 bg-white/50 p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600 font-bold">
              {mode === "signup" ? "Already have an account? " : "First time using manual auth? "}
              <button
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setInfo(""); }}
                className="text-primary hover:underline transition-all"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        )}

        <footer className="mt-12 text-center">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 hover:text-primary transition-all">
            Return to SoulSync platform
          </Link>
        </footer>
      </main>
      <Footer />
    </div>
  );
}

export default AdminLogin;
