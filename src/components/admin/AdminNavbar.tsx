import { Link, useLocation } from "@tanstack/react-router";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  LogOut,
  LayoutDashboard,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { memo } from "react";

export const AdminNavbar = memo(() => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  const navLinks = [
    { to: "/admin/command-center", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/volunteers", label: "Volunteers", icon: Users },
    { to: "/admin/command-center#health", label: "System Health", icon: Server },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-[1600px]">
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 uppercase tracking-widest">SoulSync Admin</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Governance Control</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === link.to
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:text-primary hover:bg-slate-50"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">System Secure</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-xl text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
});

AdminNavbar.displayName = "AdminNavbar";
