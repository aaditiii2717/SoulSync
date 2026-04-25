import { motion } from "framer-motion";

const floatingPanels = [
  {
    className: "left-[1%] top-[45%] hidden 2xl:block",
    transform: "rotateY(20deg) rotateX(10deg) translateZ(10px)",
    eyebrow: "Breathing Room",
    title: "You can start small.",
    copy: "A single honest sentence is enough to begin a caring conversation.",
    duration: 10.5,
  },
  {
    className: "right-[1%] top-[55%] hidden 2xl:block",
    transform: "rotateY(-20deg) rotateX(8deg) translateZ(20px)",
    eyebrow: "Human Warmth",
    title: "Support can feel close.",
    copy: "Layered guidance and peer listening create a softer emotional landing.",
    duration: 11.5,
  },
  {
    className: "left-[5%] bottom-[5%] hidden xl:block",
    transform: "rotateY(15deg) rotateX(-5deg) translateZ(5px)",
    eyebrow: "Gentle Pace",
    title: "No pressure to explain everything.",
    copy: "The interface helps people breathe, reflect, and choose their next step slowly.",
    duration: 12.5,
  },
];

const lightDots = [
  { className: "left-[18%] top-[22%] h-3 w-3 bg-primary/50", duration: 8 },
  { className: "left-[70%] top-[18%] h-2.5 w-2.5 bg-calm/50", duration: 7 },
  { className: "left-[78%] top-[58%] h-4 w-4 bg-warm/35", duration: 9 },
  { className: "left-[26%] top-[72%] h-2.5 w-2.5 bg-safe/45", duration: 10 },
  { className: "left-[56%] top-[34%] h-2 w-2 bg-primary/40", duration: 11 },
];

export function EmotionalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[120vh] overflow-hidden select-none z-0">
      <div className="backdrop-mesh absolute inset-0 opacity-80" />
      <div className="absolute left-1/2 top-[-10rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute -left-28 top-[6rem] h-[24rem] w-[24rem] rounded-full bg-warm/10 blur-[110px]" />
      <div className="absolute -right-24 top-[14rem] h-[26rem] w-[26rem] rounded-full bg-calm/8 blur-[120px]" />
      <div className="absolute bottom-[-8rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-white/40 blur-[130px]" />

      <div className="absolute left-1/2 top-20 hidden h-[34rem] w-[34rem] -translate-x-1/2 xl:block perspective-deep">
        <motion.div
          className="scene-ring absolute inset-0"
          animate={{ rotateZ: [0, 8, 0], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <motion.div
          className="scene-ring absolute inset-[15%] border-primary/18"
          animate={{ rotateZ: [0, -12, 0], scale: [0.95, 1, 0.95] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        />
        <motion.div
          className="scene-ring absolute inset-[32%] border-calm/20"
          animate={{ rotateZ: [0, 360] }}
          transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
        />
      </div>

      {floatingPanels.map((panel) => (
        <motion.div
          key={panel.title}
          className={`absolute ${panel.className}`}
          animate={{ y: [0, -18, 0], rotateZ: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: panel.duration, ease: "easeInOut" }}
        >
          <div className="scene-panel w-64 rounded-[1.6rem] p-4 opacity-40 shadow-sm transition-opacity hover:opacity-100" style={{ transform: panel.transform }}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary/40">
              {panel.eyebrow}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground/50">
              {panel.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground/40">{panel.copy}</p>
          </div>
        </motion.div>
      ))}

      {lightDots.map((dot) => (
        <motion.span
          key={dot.className}
          className={`absolute rounded-full blur-sm ${dot.className}`}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.95, 0.3], scale: [0.9, 1.2, 0.9] }}
          transition={{ repeat: Infinity, duration: dot.duration, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
