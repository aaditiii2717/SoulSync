import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Shield, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "@/utils/chat.functions";
import ReactMarkdown from "react-markdown";

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hey 👋 I'm here to listen — no judgment, completely anonymous. Whether you want to talk, vent, or just try a quick breathing exercise, I'm with you. How are you feeling right now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const result = await sendChatMessage({
        data: {
          messages: updatedMessages
            .filter((m) => m.id !== "1")
            .map((m) => ({ role: m.role, content: m.content })),
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

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl gradient-wellness shadow-sm">
          <Bot className="h-5 w-5 text-primary-foreground" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-safe shadow-sm">
            <span className="h-2 w-2 rounded-full bg-safe [animation:pulse-glow_2.5s_ease-in-out_infinite]" />
          </span>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold leading-tight">SoulSync Companion</h3>
          <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            Anonymous · CBT-Guided · Always here
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-safe/12 px-3.5 py-1.5 border border-safe/20">
          <div className="h-2 w-2 rounded-full bg-safe [animation:pulse-glow_2.5s_ease-in-out_infinite]" />
          <span className="text-xs font-semibold text-safe">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                  msg.role === "assistant" ? "gradient-wellness" : "bg-muted/80 border border-white/60"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[76%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === "assistant"
                    ? "premium-card text-card-foreground rounded-tl-md"
                    : "gradient-wellness text-primary-foreground rounded-tr-md shadow-[0_8px_24px_-8px_oklch(0.42_0.14_33_/_0.4)]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground/90 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Quick prompts */}
        {showQuickPrompts && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-2 pl-12"
          >
            {quickPrompts.map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                onClick={() => send(prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:text-foreground hover:border-primary/30 hover:bg-white hover:scale-105 hover:shadow-md active:scale-98"
              >
                <Sparkles className="h-3 w-3 text-primary/50" />
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl gradient-wellness shadow-sm">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="premium-card rounded-3xl rounded-tl-md px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="h-2.5 w-2.5 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/55 bg-white/70 backdrop-blur-xl px-5 py-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/65 bg-white/90 px-1 pl-4 shadow-sm focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_oklch(0.61_0.17_33_/_0.1)] transition-all duration-200">
          <Heart className="h-4 w-4 text-primary/30 shrink-0" />
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex flex-1 items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type anything — it's completely anonymous..."
              className="flex-1 bg-transparent py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
              disabled={isTyping}
            />
            <Button
              type="submit"
              variant="hero"
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              disabled={isTyping || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <p className="mt-2 text-center text-[0.65rem] text-muted-foreground/55">
          Your conversations are private and never stored with identifying info.
        </p>
      </div>
    </div>
  );
}
