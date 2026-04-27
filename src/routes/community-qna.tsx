import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Heart, MessageCircle, ChevronDown, Plus, Sparkles, Loader2, Send, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/community-qna")({
  component: CommunityQnAPage,
});

interface QnAResponse {
  id: string;
  response_text: string;
  created_at: string;
}

interface QnAItem {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  relate_count: number;
  responses_count: number;
  responses?: QnAResponse[];
}

const DEFAULT_CATEGORIES = ["All", "Loneliness", "Anxiety", "Burnout", "Emotions", "Getting Help", "Self-Worth"];

function CommunityQnAPage() {
  const { aliasId } = useAnonymousIdentity();
  const [qnaItems, setQnaItems] = useState<QnAItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Submit state
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Response state
  const [activeResponse, setActiveResponse] = useState("");
  const [isPostingResponse, setIsPostingResponse] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("community_questions")
      .select(`
        *,
        qna_responses (*)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching Q&A:", error);
    } else {
      setQnaItems((data as QnAItem[])?.map(q => ({
        ...q,
        responses: q.qna_responses || []
      })) || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();

    // Set up real-time
    const channel = supabase
      .channel('community-qna-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_questions' }, () => fetchQuestions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qna_responses' }, () => fetchQuestions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchQuestions]);

  const handleAsk = async () => {
    if (!newQuestion.trim() || !aliasId) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("community_questions")
      .insert({
        question: newQuestion.trim(),
        category: newCategory,
        alias_id: aliasId,
      });

    if (error) {
      toast.error("Failed to submit question.");
    } else {
      toast.success("Question submitted anonymously!");
      setNewQuestion("");
    }
    setIsSubmitting(false);
  };

  const handleRelate = async (id: string, currentCount: number) => {
    setQnaItems(prev => prev.map(item => item.id === id ? { ...item, relate_count: currentCount + 1 } : item));
    const { error } = await supabase
      .from("community_questions")
      .update({ relate_count: currentCount + 1 })
      .eq("id", id);
    if (error) toast.error("Couldn't update connection count.");
  };

  const handlePostResponse = async (questionId: string) => {
    if (!activeResponse.trim() || !aliasId) return;
    setIsPostingResponse(true);
    const { error } = await supabase
      .from("qna_responses")
      .insert({
        question_id: questionId,
        response_text: activeResponse.trim(),
        alias_id: aliasId
      });

    if (error) {
      toast.error("Failed to post response.");
    } else {
      toast.success("Supportive word posted!");
      setActiveResponse("");
      // Update local count
      setQnaItems(prev => prev.map(item => 
        item.id === questionId ? { ...item, responses_count: (item.responses_count || 0) + 1 } : item
      ));
      
      // Update community_questions responses_count via RPC or direct update
      await supabase.rpc('increment_response_count', { question_id: questionId });
    }
    setIsPostingResponse(false);
  };

  const filtered = selectedCategory === "All" ? qnaItems : qnaItems.filter((q) => q.category === selectedCategory);

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <HelpCircle className="h-4 w-4" />
            Collective Resilience
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight">
            Common <span className="text-gradient">Humanity</span>
          </h1>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto font-medium">
             Reading these peer stories helps you realize that your internal struggles are a shared part of the student experience.
          </p>
        </motion.div>

        {/* RE-DESIGNED Professional Ask Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-16 group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-calm/20 to-primary/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-[2.8rem] bg-white/70 backdrop-blur-xl border border-white/50 p-10 shadow-2xl overflow-hidden ring-1 ring-slate-100/50">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="h-24 w-24 text-primary" />
             </div>
             
             <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                   <Plus className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="font-display font-black text-xl text-slate-800">Ask Anonymously</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share your thought, find your peers</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="relative">
                   <textarea 
                     value={newQuestion}
                     onChange={(e) => setNewQuestion(e.target.value)}
                     placeholder="What's been on your mind? (e.g., 'Is it normal to feel like a fraud even when I succeed?')"
                     className="w-full rounded-[2rem] border-2 border-slate-50 bg-white/80 p-6 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-primary/30 min-h-[140px] resize-none transition-all shadow-inner"
                   />
                   <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Info className="h-3 w-3" /> Anonymous by default
                   </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["Loneliness", "Anxiety", "Burnout", "Self-Worth"].map(cat => (
                         <button 
                            key={cat}
                            onClick={() => setNewCategory(cat)}
                            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newCategory === cat ? 'bg-slate-800 text-white shadow-xl scale-105' : 'bg-slate-100/50 text-slate-500 hover:bg-white hover:shadow-sm'}`}
                         >
                            {cat}
                         </button>
                      ))}
                   </div>
                   <Button 
                      onClick={handleAsk}
                      disabled={isSubmitting || !newQuestion.trim()}
                      className="h-14 rounded-full px-12 font-black gap-3 text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                   >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                      Launch Question
                   </Button>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xl scale-105"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Q&A Cards */}
        <div className="space-y-6 min-h-[400px]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-30">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Tuning Community Frequencies...</p>
             </div>
          ) : filtered.length === 0 ? (
             <div className="text-center py-24 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
                <HelpCircle className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                <p className="text-lg font-bold text-slate-400 italic">Be the first voice in this shared space.</p>
             </div>
          ) : (
            filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[3rem] border border-slate-100 bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="text-left w-full group/title"
                      >
                        <p className="text-lg font-bold leading-[1.6] text-slate-800 transition-colors group-hover/title:text-primary">{item.question}</p>
                      </button>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-6">
                        <button 
                          onClick={() => handleRelate(item.id, item.relate_count)}
                          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/50 px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <Heart className={`h-4 w-4 ${item.relate_count > 0 ? "fill-primary text-primary" : ""}`} /> 
                          <span>{item.relate_count}</span>
                          <span className="text-slate-400 font-medium">relate</span>
                        </button>
                        
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/50 px-4 py-2 rounded-full">
                          <MessageCircle className="h-4 w-4" /> 
                          <span>{item.responses_count || (item.responses?.length || 0)}</span>
                          <span className="text-slate-400 font-medium">responses</span>
                        </div>
                        
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full text-slate-400 ml-auto">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="mt-1">
                      <ChevronDown className={`h-6 w-6 text-slate-300 transition-transform duration-500 ${expandedId === item.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedId === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 pt-8 border-t border-slate-50"
                      >
                        {/* SoulSync Guidance */}
                        <div className="mb-8 rounded-[2rem] bg-primary/5 p-6 border-l-4 border-primary">
                          <div className="flex items-center gap-2 mb-3">
                             <Sparkles className="h-4 w-4 text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">SoulSync Guidance</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic">
                             {item.answer || "This question is awaiting a peer or community response. You aren't alone in feeling this way."}
                          </p>
                        </div>

                        {/* Peer Responses Feed */}
                        <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Peer Voice</h4>
                           {item.responses && item.responses.length > 0 ? (
                              item.responses.map(resp => (
                                 <motion.div 
                                   key={resp.id} 
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed"
                                 >
                                    {resp.response_text}
                                    <div className="mt-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                       {formatDistanceToNow(new Date(resp.created_at))} ago
                                    </div>
                                 </motion.div>
                              ))
                           ) : (
                              <p className="text-[10px] text-slate-400 italic">No peer responses yet. Be the first to reach out.</p>
                           )}

                           {/* Add Response Input */}
                           <div className="mt-6 pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-3">
                                 <input 
                                   type="text"
                                   value={activeResponse}
                                   onChange={(e) => setActiveResponse(e.target.value)}
                                   placeholder="Add a word of support..."
                                   className="flex-1 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                 />
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => handlePostResponse(item.id)}
                                   disabled={!activeResponse.trim() || isPostingResponse}
                                   className="h-9 w-9 rounded-xl text-primary hover:bg-primary/5"
                                 >
                                    {isPostingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                 </Button>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
