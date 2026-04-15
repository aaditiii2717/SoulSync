import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Shield, Sparkles, LogOut, MessageSquareHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, updateChatMemory } from "@/utils/chat.functions";
import { detectEmotions, type DetectedEmotion } from "@/utils/nlp.utils";
import { HEALING_LIBRARY, type HealingTool } from "@/utils/HealingLibrary";
import { CrisisMap } from "@/components/CrisisMap";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { X, Play, FileText, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "I'm feeling anxious and don't know why",
  "I can't sleep because of stress",
  "I feel really lonely lately",
  "Help me with a breathing exercise",
];

const friendLikeGreetings = [
  "Hey! I was just thinking about you. How's your day going so far? ☕",
  "Hi friend! Glad you're here. Tell me, what's been on your mind lately? I'm all ears.",
  "Hey there! Ready for our chat? I've been looking forward to hearing how you've been doing.",
  "Hey 👋 Just wanted to check in. How was your day? I'm here if you want to talk about anything, big or small.",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: friendLikeGreetings[Math.floor(Math.random() * friendLikeGreetings.length)],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionEmotions, setSessionEmotions] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTool, setActiveTool] = useState<HealingTool | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const updateEmotions = async (text: string) => {
    try {
      setIsAnalyzing(true);
      const emotions = await detectEmotions(text);
      setSessionEmotions((prev) => {
        const next = { ...prev };
        emotions.forEach((e: DetectedEmotion) => {
          next[e.label] = (next[e.label] || 0) + e.score;
        });
        return next;
      });
    } catch (err) {
      console.error("Emotion detection failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const send = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Run BERT classification in background (don't block UI)
    updateEmotions(messageText);

    try {
      const aliasId = localStorage.getItem("soulSync_alias_id") || undefined;
      const result = await sendChatMessage({
        data: {
          messages: updatedMessages
            .filter((m) => m.id !== "1")
            .map((m) => ({ role: m.role, content: m.content })),
          aliasId
        },
      });

      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.content,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble right now. Please try again in a moment. 💛",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateReportAndRedirect = () => {
    // Generate top emotions
    const sortedEmotions = Object.entries(sessionEmotions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([label]) => label);

    const report = {
      timestamp: new Date().toISOString(),
      emotions: sortedEmotions,
      summary: `User participated in a support chat. AI-detected primary emotions: ${sortedEmotions.join(", ")}.`,
      chatPreview: messages.slice(-4).map(m => `[${m.role}] ${m.content}`).join("\n"),
    };

    // Save chat history to AI memory
    const aliasId = localStorage.getItem("soulSync_alias_id");
    if (aliasId) {
       updateChatMemory({ 
         data: { 
           aliasId, 
           chatHistory: messages.map(m => `${m.role}: ${m.content}`).join("\n") 
         } 
       }).catch(console.error);
    }

    // Store in sessionStorage for peer-match page
    sessionStorage.setItem("soulSync_chatReport", JSON.stringify(report));
    
    // Redirect to volunteer selection
    window.location.href = "/peer-match";
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card shadow-sm z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-wellness shadow-inner">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-sm font-semibold">SoulSync Companion</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" /> Anonymous · BERT Analysis Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 2 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5"
              onClick={generateReportAndRedirect}
            >
              <MessageSquareHeart className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Talk to Volunteer</span>
            </Button>
          )}
          <div className="flex items-center gap-1.5 rounded-full bg-safe/10 px-3 py-1 border border-safe/20">
            <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
            <span className="text-[10px] font-bold text-safe uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                  msg.role === "assistant" ? "bg-primary/10 border border-primary/5" : "bg-muted border"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "assistant"
                    ? "bg-card border text-card-foreground"
                    : "gradient-wellness text-primary-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content.replace(/\[HEALING_TOOL:.*?\]/g, "")}</ReactMarkdown>
                    
                    {/* Render Tool Card if detected */}
                    {Object.keys(HEALING_LIBRARY).map(key => {
                      if (msg.content.includes(`[HEALING_TOOL:${key}]`)) {
                        const tool = HEALING_LIBRARY[key];
                        return (
                          <motion.div 
                            key={key} 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm">
                                {tool.type === "audio" && <Play className="h-5 w-5 text-primary" />}
                                {tool.type === "text" && <FileText className="h-5 w-5 text-primary" />}
                                {tool.type === "video" && <ExternalLink className="h-5 w-5 text-primary" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Healing Unlock</p>
                                <p className="text-sm font-bold">{tool.title}</p>
                              </div>
                            </div>
                            <Button size="sm" className="w-full rounded-lg h-8 text-xs" onClick={() => setActiveTool(tool)}>
                              Open Resource
                            </Button>
                          </motion.div>
                        );
                      }
                      return null;
                    })}

                    {/* Crisis Map Unlock */}
                    {msg.content.includes("[HEALING_TOOL:SAFETY_MAP]") && (
                       <motion.div 
                         initial={{ y: 20, opacity: 0 }} 
                         animate={{ y: 0, opacity: 1 }} 
                         className="mt-4"
                       >
                          <CrisisMap />
                       </motion.div>
                    )}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Healing Tool Modal */}
        <AnimatePresence>
          {activeTool && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-display font-bold">{activeTool.title}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setActiveTool(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6">
                  {activeTool.type === "text" && (
                    <div className="bg-muted/50 p-6 rounded-2xl font-serif text-sm leading-relaxed whitespace-pre-wrap italic">
                      {activeTool.content}
                    </div>
                  )}
                  {activeTool.type === "audio" && (
                    <div className="flex flex-col items-center gap-6 py-8">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Play className="h-10 w-10 text-primary" />
                      </div>
                      <audio controls className="w-full">
                        <source src={activeTool.content} type="audio/mpeg" />
                      </audio>
                      <p className="text-xs text-muted-foreground text-center">Close your eyes and focus on your breath.</p>
                    </div>
                  )}
                  {activeTool.type === "video" && (
                    <div className="aspect-video rounded-2xl overflow-hidden border">
                       <iframe 
                         width="100%" height="100%" 
                         src={activeTool.content} 
                         title="YouTube video player" 
                         frameBorder="0" 
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                       />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/30 border-t flex justify-center">
                   <Button variant="hero" onClick={() => setActiveTool(null)} className="rounded-xl px-12">
                     Done
                   </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick prompts */}
        {showQuickPrompts && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-2 pl-11">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <Sparkles className="h-3 w-3 text-primary/50" />
                {prompt}
              </button>
            ))}
          </motion.div>
        )}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/5">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl bg-card border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* BERT Analysis status */}
        {isAnalyzing && (
          <div className="mx-auto text-[10px] text-muted-foreground italic flex items-center gap-2 opacity-50">
            <Sparkles className="h-3 w-3 animate-spin duration-3000" />
            Analyzing emotional context...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="border-t bg-card p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {messages.length > 5 && (
          <div className="mb-3 flex justify-center sm:hidden">
            <Button 
               variant="outline" 
               size="sm" 
               className="rounded-xl flex gap-2 border-primary/20 w-full"
               onClick={generateReportAndRedirect}
             >
               <MessageSquareHeart className="h-4 w-4 text-primary" />
               <span className="text-xs font-semibold">End Chat & Contact Volunteer</span>
             </Button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk it out... completely anonymous"
            className="flex-1 rounded-xl border bg-background px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isTyping}
          />
          <Button type="submit" variant="hero" size="icon" className="rounded-xl h-12 w-12 shrink-0 shadow-md enabled:hover:scale-105 transition-transform active:scale-95" disabled={isTyping || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="mt-2 text-[10px] text-center text-muted-foreground/60">
          SoulSync uses machine learning to better understand how you&apos;re feeling.
        </p>
      </div>
    </div>
  );
}

