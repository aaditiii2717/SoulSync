import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, CheckCircle2, Quote, BrainCircuit, Heart } from "lucide-react";
import { motion } from "framer-motion";

export interface Story {
  id: string;
  name: string;
  role: string;
  title: string;
  quote: string;
  description: string;
  thumbnail: string;
  videoUrl?: string; // Placeholder for demo
  impact: string;
}

interface TestimonialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
}

export function TestimonialVideoModal({ isOpen, onClose, story }: TestimonialVideoModalProps) {
  if (!story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl rounded-[3rem] overflow-hidden border-none p-0 bg-white shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side: Optimized Video Player */}
          <div className="relative aspect-video lg:aspect-auto bg-black flex items-center justify-center overflow-hidden">
            {story.videoUrl ? (
              <>
                <iframe
                  src={story.videoUrl}
                  className="absolute inset-0 w-full h-full border-none z-10"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
                {/* Visual Placeholder while iframe loads */}
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                   <img 
                    src={story.thumbnail} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
                   />
                   <div className="relative z-0 flex flex-col items-center gap-4">
                      <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Loading Journey...</p>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Play className="h-8 w-8 text-white/40" />
                </div>
                <p className="text-white/40 text-xs font-black uppercase tracking-widest">Video Unavailable</p>
              </div>
            )}
          </div>

          {/* Right Side: Impact Context */}
          <div className="p-10 space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {story.role}
              </div>
              <h3 className="font-display text-4xl font-black leading-tight">
                {story.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium">— {story.name}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Quote className="h-6 w-6 text-primary shrink-0 opacity-40 mt-1" />
                <p className="text-lg text-slate-600 leading-relaxed italic">
                  {story.quote}
                </p>
              </div>
              <p className="text-sm text-slate-500 leading-7">
                {story.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-safe/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-safe" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Student Outcome</p>
                <p className="text-sm font-bold text-slate-900">{story.impact}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
