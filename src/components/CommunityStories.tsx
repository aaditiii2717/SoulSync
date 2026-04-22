import { useState } from "react";
import { motion } from "framer-motion";
import { Play, MessageCircleHeart, Users, Star, Quote } from "lucide-react";
import { Card } from "./ui/card";
import { TestimonialVideoModal, Story } from "./TestimonialVideoModal";

const stories: Story[] = [
  {
    id: "2",
    name: "Rudraksh",
    role: "International Student",
    title: "Community Roadmap",
    quote: "SoulSync gives you a community roadmap. It makes you feel like you aren't just a user, but a part of a movement.",
    description: "Unlike other apps that just give you a 1-800 number, SoulSync localizes support. Finding verified NGOs near campus changed my perspective on how student support should actually work.",
    thumbnail: "https://images.pexels.com/photos/7616706/pexels-photo-7616706.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/1-XMwxeRnYHYqixjKDn1MythLOMPN5_6a/preview",
    impact: "Joined Student Support Movement"
  },
  {
    id: "3",
    name: "Diya",
    role: "Senior Student",
    title: "Private by Design",
    quote: "SoulSync is different because it’s Private by Design. You just arrive, talk, and leave—zero trace.",
    description: "I used to avoid campus counseling because I didn't want a permanent 'record'. The Pathfinder Survey guided me to resources I didn't even know I needed. It’s the 'softer first step' students actually need.",
    thumbnail: "https://images.pexels.com/photos/6007184/pexels-photo-6007184.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/18kzczFuykVFrTbtc5OcJoJRkcW6bMwYO/preview",
    impact: "Pathfinder Survey Complete"
  },
  {
    id: "4",
    name: "Aayush",
    role: "Medical Student",
    title: "Verified Peer Match",
    quote: "My favorite thing about SoulSync is the Verified Peer Match. I got to talk to a real student volunteer who had been exactly where I was.",
    description: "Moving here for college was lonelier than I expected. Most social apps are for 'finding friends,' but sometimes you just need to be heard by someone who gets it. It's a human connection built on shared experience.",
    thumbnail: "https://images.pexels.com/photos/5888168/pexels-photo-5888168.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    videoUrl: "https://drive.google.com/file/d/1Jieawcww34QX9CD5Bpf5JjhoJvjl0ytZ/preview",
    impact: "Reclaimed Human Connection"
  }
];

export function CommunityStories() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
            Real Impact
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Peers helping peers. Every single day.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            SoulSync isn't just an app—it's a community of resilient students who've been where you are. Hear how your peers reclaimed their focus and peace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedStory(story)}
            >
              <Card className="h-full overflow-hidden rounded-[2.5rem] border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={story.thumbnail}
                    alt={story.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                      <Play className="h-7 w-7 text-white fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                     <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <Users className="h-3 w-3" /> {story.role}
                     </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                    <Star className="h-4 w-4 fill-primary" />
                  </div>
                  
                  <h3 className="font-display text-2xl font-semibold leading-tight group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  
                  <div className="mt-6 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-4">
                       <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                         Initial Result: <span className="text-slate-800">{story.impact}</span>
                       </p>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground italic">
                      "{story.quote}"
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-800">— {story.name}</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Read More →</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
           <div className="inline-flex items-center gap-4 rounded-3xl bg-slate-100/50 px-8 py-5 ring-1 ring-slate-100">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                 ))}
              </div>
              <p className="text-sm font-medium text-slate-600">
                 Join <span className="font-bold text-slate-900">30+ students</span> who started their healing journey here.
              </p>
           </div>
        </div>
      </div>

       <TestimonialVideoModal 
        isOpen={!!selectedStory} 
        onClose={() => setSelectedStory(null)} 
        story={selectedStory}
      />
    </section>
  );
}
