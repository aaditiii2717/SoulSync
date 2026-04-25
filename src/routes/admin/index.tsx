import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Lock, ArrowRight, AlertCircle, Command, Mail, Loader2, XCircle, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

const ALLOWED_ADMINS = [
  "varadprabhu2442@gmail.com",
  "aniket.aniket07sah@gmail.com",
  "aaditishrivastava17@gmail.com"
];

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        if (ALLOWED_ADMINS.includes(session.user.email)) {
          navigate({ to: "/admin/command-center" });
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin/'
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!ALLOWED_ADMINS.includes(normalizedEmail)) {
      setError("This email is not authorized for Admin access.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            emailRedirectTo: window.location.origin + '/admin/'
          }
        });
        
        if (signUpError) throw signUpError;

        await supabase.from("volunteers").upsert({
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          is_admin: true,
          is_verified: true,
          is_active: true,
          verification_status: 'verified'
        }, { onConflict: 'email' });

        toast.success("Account created! Confirm your email to activate manual login.");
        setIsSignUp(false);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password
        });
        if (authError) throw authError;

        const { data: vol } = await supabase
          .from("volunteers")
          .select("is_admin")
          .eq("email", normalizedEmail)
          .single();

        if (!vol?.is_admin) {
          setError("Authorized account, but admin profile is missing.");
          setLoading(false);
          return;
        }

        toast.success("Welcome to the Hub.");
        navigate({ to: "/admin/command-center" });
      }
    } catch (err: any) {
      if (err.message?.includes("confirm your email")) {
        setError("Email verification pending. Check your inbox.");
      } else {
        setError(err.message || "Invalid login credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-primary/10">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-calm/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
        <div className="mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
          >
            <Command className="h-7 w-7 text-slate-900" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign in to SoulSync
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Continue to Governance Dashboard
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl ring-1 ring-slate-200/50">
             <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 ring-1 ring-red-100"
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                    <p className="text-xs font-bold leading-tight">{error}</p>
                  </motion.div>
                )}
             </AnimatePresence>

             <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Username or email address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]" 
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign in")}
                </Button>
             </form>

             <div className="relative my-8 flex items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="mx-4 text-xs font-medium text-slate-400">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
             </div>

             <div className="space-y-3">
                <Button 
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="h-11 w-full rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
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
             </div>
          </Card>
        </motion.div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "First time using manual auth?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
        
        <footer className="mt-12 text-center">
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors">
            Return to platform
          </Link>
        </footer>
      </main>
      <Footer />
    </div>
  );
}
