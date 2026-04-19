import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart, Globe, Mail, ShieldCheck,
  ExternalLink, Sparkles, HandHeart, Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DonationModal } from "@/components/DonationModal";
import { motion } from "framer-motion";

export const Route = createFileRoute("/partners" as any)({
  component: PartnersPage,
});

interface NGO {
  id: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  logo_url?: string;
  email: string;
}

const defaultNgos: NGO[] = [
  {
    id: "ngo-1",
    name: "The Banyan",
    category: "Holistic Care",
    description: "Providing comprehensive mental health services and housing for marginalized individuals in India since 1993.",
    logo: "https://thebanyan.org/wp-content/uploads/2021/04/thebanyan-logo.png",
    email: "contact@thebanyan.org"
  },
  {
    id: "ngo-2",
    name: "Sangath",
    category: "Community Intervention",
    description: "A leading NGO dedicated to making mental health services accessible through community-based interventions.",
    logo: "https://www.sangath.in/wp-content/uploads/2020/09/cropped-Sangath-Logo-Black-1.png",
    email: "info@sangath.in"
  },
  {
    id: "ngo-3",
    name: "Vandrevala Foundation",
    category: "Crisis Support",
    description: "Offering 24/7 free emotional support and crisis intervention across India via their multi-lingual helplines.",
    email: "help@vandrevalafoundation.com"
  }
];

function PartnersPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  useEffect(() => {
    async function fetchNgos() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ngos")
          .select("*")
          .eq("is_verified", true);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setNgos(data);
        } else {
          setNgos(defaultNgos); // Fallback to demo data
        }
      } catch (err) {
        console.error("Fetch NGOS error:", err);
        setNgos(defaultNgos); // Graceful fallback
      } finally {
        setLoading(false);
      }
    }
    fetchNgos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-calm/5 rounded-full blur-3xl opacity-50" />

          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-6">
                <HandHeart className="h-4 w-4" />
                Social Impact
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                Our <span className="text-gradient">NGO Partners</span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                SoulSync partners with India's leading mental health organizations to provide professional escalation and long-term care for students.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-12 border-y bg-slate-50/50">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: "Partner NGOs", value: "12+" },
                { label: "Community Support", value: "24/7" },
                { label: "Impact Goal", value: "100% Free" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black text-slate-900 font-display">{stat.value}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NGO Directory */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {ngos.map((ngo) => (
                  <motion.div
                    key={ngo.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all rounded-[2.5rem]">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border group-hover:border-primary/20 transition-colors">
                            {ngo.logo_url || ngo.logo ? (
                              <img src={ngo.logo_url || ngo.logo} alt={ngo.name} className="h-10 w-10 object-contain" />
                            ) : (
                              <Sparkles className="h-8 w-8 text-primary/30" />
                            )}
                          </div>
                          <span className="bg-primary/5 text-primary text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest whitespace-nowrap">
                            {ngo.category}
                          </span>
                        </div>

                        <h3 className="text-2xl font-display font-black text-slate-900 mb-3">{ngo.name}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                          {ngo.description}
                        </p>

                        <div className="flex flex-col gap-3">
                          <Button
                            variant="hero"
                            className="w-full h-12 rounded-2xl font-bold gap-2 shadow-lg"
                            onClick={() => {
                              setSelectedNgo(ngo);
                              setIsDonationOpen(true);
                            }}
                          >
                            <Heart className="h-4 w-4" /> Support with Donation
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="flex-1 h-11 rounded-2xl text-xs gap-1.5 font-bold border-slate-100 hover:bg-slate-50 h-10">
                              <Globe className="h-3.5 w-3.5" /> Website
                            </Button>
                            <Button variant="outline" className="flex-1 h-11 rounded-2xl text-xs gap-1.5 font-bold border-slate-100 hover:bg-slate-50 h-10">
                              <Mail className="h-3.5 w-3.5" /> Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Join the Network CTA */}
        <section className="py-20 px-4 mb-20">
          <div className="container mx-auto max-w-4xl bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden text-center text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-black mb-6">Are you a Mental Health NGO?</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Join our network to receive referrals from students and reach a wider audience for your social services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black h-14 px-8">
                  Partner with SoulSync
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-2xl font-black h-14 px-8">
                  <Info className="h-4 w-4 mr-2" /> Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedNgo && (
        <DonationModal
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
          ngoName={selectedNgo.name}
          ngoId={selectedNgo.id}
        />
      )}

      <Footer />
    </div>
  );
}
