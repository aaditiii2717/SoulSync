import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShieldCheck, Star, Coins, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ngoName?: string;
  ngoId?: string;
}

const amounts = [100, 500, 1000, 2000];

export function DonationModal({ isOpen, onClose, ngoName, ngoId }: DonationModalProps) {
  const [amount, setAmount] = useState<number | "">(500);
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDonate = async () => {
    setIsProcessing(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Record donation in Supabase
    const aliasId = localStorage.getItem("soulSync_alias_id");
    
    await supabase.from("donations").insert({
      donor_alias_id: aliasId,
      amount: Number(amount),
      ngo_id: ngoId || null,
      status: "completed",
    });

    setIsProcessing(false);
    setStep("success");
    toast.success("Thank you for your generous contribution! 💛");
  };

  const reset = () => {
    setStep("amount");
    setAmount(500);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
      <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden border-none p-0 bg-transparent shadow-none">
        <AnimatePresence mode="wait">
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl"
            >
              <DialogHeader className="text-center p-0 mb-6">
                <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <DialogTitle className="text-2xl font-display font-bold">
                  Support {ngoName || "SoulSync"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-2">
                  Your donation helps us provide 24/7 mental health support to students who need it most.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`py-3 px-4 rounded-2xl border-2 transition-all font-bold font-display ${
                      amount === a
                        ? "border-primary bg-primary text-white shadow-lg scale-[1.02]"
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>

              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || "")}
                  className="pl-8 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary/50 text-lg font-bold"
                />
              </div>

              <Button
                variant="hero"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl flex items-center justify-center gap-2"
                onClick={() => setStep("payment")}
                disabled={!amount || Number(amount) <= 0}
              >
                Continue to Payment <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold font-display">Secure Payment</h3>
                <p className="text-sm text-slate-500 mt-1">Paying ₹{amount} to {ngoName || "SoulSync"}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="border-2 border-primary/20 bg-primary/5 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">UPI / Cards</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Safe & Instant</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[10px] text-center text-slate-400 italic">
                  * This is a simulated payment for demo purposes
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl border-2"
                  onClick={() => setStep("amount")}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-[2] h-14 rounded-2xl text-lg font-bold shadow-xl"
                  onClick={handleDonate}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    `Pay ₹${amount}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center"
            >
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-12 w-12 text-green-600 animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold font-display text-gradient">You're a Hero!</h3>
              <p className="text-slate-500 mt-3 mb-8 leading-relaxed">
                Your donation of <strong>₹{amount}</strong> has been received. This will fund roughly **{(Number(amount)/50).toFixed(0)} sessions** for students in need.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex items-center gap-3 text-left">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                <p className="text-xs font-medium text-slate-600">
                  Transaction successful. Impact log added to your anonymous profile.
                </p>
              </div>

              <Button
                variant="hero"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl"
                onClick={reset}
              >
                Close & Return
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
