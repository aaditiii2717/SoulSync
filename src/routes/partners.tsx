import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart, Globe, Mail, ShieldCheck,
  ExternalLink, Sparkles, HandHeart, Info,
  Phone, MapPin
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
  description: string | null;
  logo?: string | null;
  logo_url?: string | null;
  contact_email?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

const defaultNgos: NGO[] = [
  {
    id: "ngo-1",
    name: "Serene Skies Initiative",
    category: "Holistic Wellness",
    description: "Dedicated to providing global reach for anonymous mental wellness through community-driven support and decentralized healing networks.",
    logo: "/partners/serene_skies.png",
    email: "reach@sereneskies.org",
    phone: "+91 9000000000",
    location: "Global Support",
    website: "https://sereneskies.initiative"
  },
  {
    id: "ngo-2",
    name: "Mind Harbor Alliance",
    category: "Community Support",
    description: "A collaborative effort focused on mental health advocacy and providing a safe harbor for students seeking peer-to-peer connection.",
    logo: "/partners/mind_harbor.png",
    email: "hello@mindharbor.net",
    phone: "+91 8888888888",
    location: "Virtual Presence",
    website: "https://mindharbor.alliance"
  },
  {
    id: "ngo-3",
    name: "Inner Harmony Network",
    category: "Crisis Resilience",
    description: "Empowering individuals to build emotional resilience through anonymous counseling and structured support systems.",
    logo: "/partners/inner_harmony.png",
    email: "support@innerharmony.io",
    phone: "24/7 Virtual Help",
    location: "Online Network",
    website: "https://innerharmony.network"
  },
  {
    id: "ngo-4",
    name: "Resilient Spirits Collective",
    category: "Peer Advocacy",
    description: "A non-profit collective bridging the gap between student needs and anonymous professional guidance in a secure environment.",
    logo: "/partners/resilient_spirits.png",
    email: "connect@resilientspirits.org",
    phone: "+91 7777777777",
    location: "Decentralized Care",
    website: "https://resilientspirits.collective"
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
        // We are using fictional data for all partners to ensure platform anonymity
        setNgos(defaultNgos);
      } catch (err) {
        console.error("Fetch NGOS error:", err);
        setNgos(defaultNgos);
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
        <section className="py-24 px-4 relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-0 right-0 top-0 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]" />

          <div className="container mx-auto max-w-5xl relative z-10 text-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-8 border border-primary/20 shadow-sm">
                <HandHeart className="h-4 w-4" />
                Social Impact
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight text-slate-900">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Impact Network</span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                SoulSync collaborates with anonymous impact organizations to provide a safety net for students worldwide while maintaining total privacy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-12 border-y bg-white relative">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {[
                { label: "Partner NGOs", value: "4+" },
                { label: "Community Support", value: "24/7" },
                { label: "Impact Goal", value: "100% Free" },
              ].map((stat) => (
                <div key={stat.label} className="text-center py-4 sm:py-0">
                  <p className="text-4xl font-black text-slate-900 font-display mb-2">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NGO Directory */}
        <section className="py-24 px-4 bg-slate-50/50">
          <div className="container mx-auto max-w-6xl">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {ngos.map((ngo, index) => (
                  <motion.div
                    key={ngo.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group h-full"
                  >
                    <Card className="h-full overflow-hidden border-none shadow-sm bg-white group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 rounded-[2.5rem] flex flex-col ring-1 ring-slate-100/50">
                      {/* Banner Header */}
                      <div className="h-32 bg-gradient-to-br from-primary/10 via-slate-50 to-blue-500/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]" />
                        <div className="absolute top-5 right-5">
                          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-primary text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-widest shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        </div>
                      </div>

                      <div className="px-8 pb-8 flex-1 flex flex-col relative -mt-12">
                        <div className="flex items-end justify-between mb-6">
                          {/* Logo Wrapper */}
                          <div className="h-24 w-24 bg-white rounded-[1.5rem] flex items-center justify-center p-3 shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500 ring-4 ring-white">
                            {ngo.logo_url || ngo.logo ? (
                              <img 
                                src={ngo.logo_url || ngo.logo || undefined} 
                                alt={ngo.name} 
                                className="h-full w-full object-contain mix-blend-multiply"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=random&color=fff&size=128&bold=true`;
                                }}
                              />
                            ) : (
                              <Sparkles className="h-10 w-10 text-primary/30" />
                            )}
                          </div>
                          <span className="bg-slate-100/80 backdrop-blur-sm text-slate-600 text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-widest whitespace-nowrap mb-2 ring-1 ring-slate-200/50">
                            {ngo.category}
                          </span>
                        </div>

                        <h3 className="text-3xl font-display font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{ngo.name}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                          {ngo.description}
                        </p>
                        
                        {(ngo.location || ngo.phone || ngo.email) && (
                          <div className="flex flex-col gap-3 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 mb-8 group-hover:bg-primary/[0.02] group-hover:border-primary/10 transition-colors">
                            {ngo.location && (
                              <div className="flex items-center gap-3 text-sm group/item">
                                <div className="p-2 bg-white rounded-xl shadow-sm group-hover/item:scale-110 group-hover/item:text-primary transition-all">
                                  <MapPin className="h-4 w-4 shrink-0" />
                                </div>
                                <span className="font-semibold text-slate-700">{ngo.location}</span>
                              </div>
                            )}
                            {ngo.phone && (
                              <div className="flex items-center gap-3 text-sm group/item">
                                <div className="p-2 bg-white rounded-xl shadow-sm group-hover/item:scale-110 group-hover/item:text-calm transition-all">
                                  <Phone className="h-4 w-4 shrink-0" />
                                </div>
                                <span className="font-semibold text-slate-700">{ngo.phone}</span>
                              </div>
                            )}
                            {ngo.email && (
                              <div className="flex items-center gap-3 text-sm group/item">
                                <div className="p-2 bg-white rounded-xl shadow-sm group-hover/item:scale-110 group-hover/item:text-blue-500 transition-all">
                                  <Mail className="h-4 w-4 shrink-0" />
                                </div>
                                <span className="font-semibold text-slate-700 break-all">{ngo.email}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-100">
                          <Button
                            variant="default"
                            className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary hover:bg-primary/90 text-white text-base group/btn"
                            onClick={() => {
                              setSelectedNgo(ngo);
                              setIsDonationOpen(true);
                            }}
                          >
                            <Heart className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Support with Donation
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 h-12 rounded-2xl text-xs gap-2 font-bold border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all hover:-translate-y-0.5 shadow-sm"
                              onClick={() => ngo.website && window.open(ngo.website, '_blank')}
                              disabled={!ngo.website}
                            >
                              <Globe className="h-4 w-4" /> Website
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 h-12 rounded-2xl text-xs gap-2 font-bold border-slate-200 bg-white hover:bg-calm/5 hover:text-calm hover:border-calm/20 transition-all hover:-translate-y-0.5 shadow-sm group/call"
                              onClick={() => ngo.phone && window.open(`tel:${ngo.phone.replace(/[^0-9+]/g, '')}`)}
                              disabled={!ngo.phone}
                            >
                              <Phone className="h-4 w-4 group-hover/call:animate-pulse" /> Call Now
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
        <section className="py-24 px-4 pb-32">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 sm:p-20 relative overflow-hidden text-center text-white shadow-2xl ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-8 ring-1 ring-white/10 backdrop-blur-sm">
                  <HandHeart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-black mb-6 tracking-tight">Are you a Mental Health NGO?</h2>
                <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join our network to receive referrals from students and reach a wider audience for your social services. We're always looking for verified partners.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=soulsyncsoul@gmail.com", "_blank")}
                    className="inline-flex items-center justify-center bg-white text-slate-900 hover:bg-slate-50 rounded-2xl font-bold h-14 px-8 shadow-xl transition-transform hover:-translate-y-1 cursor-pointer relative z-20"
                  >
                    Partner with SoulSync
                  </button>
                  <Button 
                    size="lg" 
                    variant="ghost"
                    className="bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:text-white rounded-2xl font-bold h-14 px-8 transition-transform hover:-translate-y-1"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <Info className="h-4 w-4 mr-2" /> Learn More
                  </Button>
                </div>
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
