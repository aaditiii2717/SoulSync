import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityStories } from "./CommunityStories";
import { PathfinderSurvey } from "./PathfinderSurvey";
import { PlayCircle, Compass, Sparkles } from "lucide-react";

export function EngagementHub() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8 overflow-hidden bg-white/20 backdrop-blur-md">
      {/* Decorative gradient for the hub area */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col items-center mb-12">
            <TabsList className="h-16 p-2 bg-white/80 rounded-[2rem] shadow-xl ring-1 ring-slate-100 backdrop-blur-xl">
              <TabsTrigger 
                value="stories" 
                className="px-8 rounded-[1.5rem] text-sm font-black transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> 
                See the Impact
              </TabsTrigger>
              <TabsTrigger 
                value="survey" 
                className="px-8 rounded-[1.5rem] text-sm font-black transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Compass className="mr-2 h-4 w-4" />
                Find Your Path
              </TabsTrigger>
            </TabsList>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeTab}
              className="mt-6 flex items-center gap-2 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em]"
            >
              <Sparkles className="h-3 w-3" />
              {activeTab === "stories" ? "Watch Student Experiences" : "Get a Personalized Suggestion"}
            </motion.div>
          </div>

          <AnimatePresence>
            <TabsContent value="stories" key="stories" className="focus-visible:ring-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <CommunityStories />
              </motion.div>
            </TabsContent>

            <TabsContent value="survey" key="survey" className="focus-visible:ring-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <PathfinderSurvey />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
}
