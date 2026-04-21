import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Lock, ArrowRight, AlertCircle, Command } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: vol, error: volError } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (volError || !vol) {
        setError("Admin credentials not found. Access denied.");
        setLoading(false);
        return;
      }

      if (!vol.is_admin) {
        setError("Insufficient privileges. This area is reserved for Super-Admins.");
        setLoading(false);
        return;
      }

      // Success - In a real app we would use Auth, here we just navigate
      // to the command center.
      navigate({ to: "/admin/command-center" });
    } catch (err) {
      console.error("Admin login error:", err);
      setError("System authentication failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-sm">
              <Command className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight text-[#0f172a]">Command Center</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-[0.2em] font-black">Secure Governance Access</p>
          </div>

          <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem]">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Identity</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@soulsync.org"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-12 py-4 text-sm focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center gap-2 font-bold"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <Button 
                className="w-full rounded-2xl h-14 shadow-xl hover:shadow-primary/20 transition-all font-bold text-base" 
                variant="hero" 
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Authorize Access"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </Card>

          <footer className="mt-12 text-center">
            <Link to="/" className="text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1 font-black uppercase tracking-widest">
              Return to Platform
            </Link>
          </footer>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
