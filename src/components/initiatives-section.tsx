import { motion } from "framer-motion";
import {
  GraduationCap, Briefcase, HeartHandshake, Linkedin, Brain, Rocket,
  Mic2, Drama, Globe2, Lightbulb, Users2, Sparkles, ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Initiative = {
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  bg: React.ComponentType;
  accent: string; // tailwind color classes for icon chip
};

/* ---------- Animated backgrounds (one per initiative) ---------- */

function BgOrbits() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-foreground/10"
          style={{
            width: 120 + i * 90,
            height: 120 + i * 90,
            left: "50%",
            top: "50%",
            marginLeft: -(60 + i * 45),
            marginTop: -(60 + i * 45),
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24 + i * 8, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute size-2 rounded-full bg-blue-400/70 -top-1 left-1/2 -translate-x-1/2" />
        </motion.div>
      ))}
    </div>
  );
}

function BgWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d="M0,100 C100,60 300,140 400,100 L400,200 L0,200 Z"
            fill={`hsl(${180 + i * 20} 70% 60% / ${0.12 - i * 0.03})`}
            animate={{ x: [0, -40, 0] }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

function BgHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-2 rounded-full bg-rose-400/60"
          style={{ left: `${(i * 13) % 100}%`, bottom: -10 }}
          animate={{ y: [0, -180], opacity: [0, 0.8, 0] }}
          transition={{ duration: 6 + (i % 3), repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function BgGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(220 70% 50% / 0.12) 1px, transparent 1px), linear-gradient(to bottom, hsl(220 70% 50% / 0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        animate={{ backgroundPositionX: [0, 28], backgroundPositionY: [0, 28] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function BgNeurons() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1.5 rounded-full bg-violet-400"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function BgRocket() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px bg-gradient-to-b from-transparent via-orange-400 to-transparent"
          style={{ left: `${(i * 17) % 100}%`, height: 40, top: -40 }}
          animate={{ y: [0, 300] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function BgSoundwaves() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-teal-400/70"
          animate={{ height: [8, 40 + (i % 5) * 10, 8] }}
          transition={{ duration: 1.2 + (i % 4) * 0.2, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

function BgSpotlight() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 size-40 rounded-full bg-amber-300/40 blur-2xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-500/20 to-transparent"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function BgGlobe() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full border-2 border-cyan-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[0, 60, 120].map((deg) => (
          <div
            key={deg}
            className="absolute inset-0 rounded-full border border-cyan-400/20"
            style={{ transform: `rotateX(${deg}deg)` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function BgBlueprint() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x={20 + i * 15}
            y={20 + i * 15}
            width={160 - i * 30}
            height={160 - i * 30}
            fill="none"
            stroke="hsl(200 90% 55% / 0.35)"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: i * 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}

function BgConnect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 60;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 size-3 rounded-full bg-pink-400"
            style={{
              x: Math.cos(angle) * r - 6,
              y: Math.sin(angle) * r - 6,
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        );
      })}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-pink-500" />
    </div>
  );
}

function BgSparkleStream() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-yellow-300"
          style={{ left: `${(i * 23) % 100}%`, top: `${(i * 41) % 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/* ---------- Data ---------- */

const initiatives: Initiative[] = [
  {
    title: "Core Student Community",
    tagline: "Learn. Compete. Grow.",
    description:
      "A dynamic ecosystem with challenges, mock interviews and peer learning that sharpens both soft and hard skills.",
    icon: GraduationCap,
    bg: BgOrbits,
    accent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    title: "InteractUp Professionals",
    tagline: "Your network is your key.",
    description:
      "The networking hub for CAs, MBAs and corporate leaders — referrals, industry insights and city meetups.",
    icon: Briefcase,
    bg: BgGrid,
    accent: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Connect Circle",
    tagline: "Real conversations, real connections.",
    description:
      "A peer-to-peer initiative for emotional wellness — turning strangers into a family-like community.",
    icon: HeartHandshake,
    bg: BgHearts,
    accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    title: "LinkedIn Branding Group",
    tagline: "Build a magnetic profile.",
    description:
      "Master personal branding and grow visibility through peer-to-peer engagement and collaboration.",
    icon: Linkedin,
    bg: BgWaves,
    accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    title: "Mind Nutrients",
    tagline: "Weekly dose of growth.",
    description:
      "An invite-only network where 6–7 members simplify complex tools and industry knowledge together.",
    icon: Brain,
    bg: BgNeurons,
    accent: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Start-Up Group",
    tagline: "For early-stage founders.",
    description:
      "Solve bottlenecks, share resources and raise funds with a supportive founder-first community.",
    icon: Rocket,
    bg: BgRocket,
    accent: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  {
    title: "Fluency Sessions",
    tagline: "Speak with confidence.",
    description:
      "Certified coaches, personalized feedback and three weekly sessions to master conversation and stage.",
    icon: Mic2,
    bg: BgSoundwaves,
    accent: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  {
    title: "InspireTalk",
    tagline: "Leadership talks that move you.",
    description:
      "An exclusive speaker series with industry titans, entrepreneurs and visionary executives.",
    icon: Sparkles,
    bg: BgSpotlight,
    accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Theatre Group",
    tagline: "Storytelling, acting, expression.",
    description:
      "A PAN-India creative platform for performance-based learning through theatre and scriptwriting.",
    icon: Drama,
    bg: BgSparkleStream,
    accent: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    title: "InteractUp International",
    tagline: "A borderless community.",
    description:
      "Global collaborations, cultural exchanges and international opportunities for continuous improvement.",
    icon: Globe2,
    bg: BgGlobe,
    accent: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    title: "Blueprint Syndicate",
    tagline: "Turn strategy into blueprints.",
    description:
      "Analytical thinking, business models and startup ideation through execution-based learning.",
    icon: Lightbulb,
    bg: BgBlueprint,
    accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "InteractUp Social",
    tagline: "Grow together, give back.",
    description:
      "Our social impact arm — welfare, city meets and community-driven contribution to society.",
    icon: Users2,
    bg: BgConnect,
    accent: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  },
];

/* ---------- Card ---------- */

function InitiativeCard({ item }: { item: Initiative }) {
  const Bg = item.bg;
  const Icon = item.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-elegant transition-shadow"
    >
      {/* Animated background canvas */}
      <div className="relative h-36 bg-gradient-to-br from-muted/60 to-background">
        <Bg />
        <div className={`absolute top-4 left-4 size-11 rounded-xl grid place-items-center backdrop-blur ${item.accent}`}>
          <Icon className="size-5" />
        </div>
        <ArrowUpRight className="absolute top-4 right-4 size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-lg leading-tight">{item.title}</h3>
        <p className="text-xs font-medium text-accent-foreground/80 mt-1">{item.tagline}</p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
      </div>
    </motion.article>
  );
}

/* ---------- Section ---------- */

export function InitiativesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mb-10 md:mb-14"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3.5" /> 12 initiatives, one community
        </div>
        <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
          Everything you need to <span className="bg-accent px-2 rounded-md">learn, connect and lead</span>.
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          From public speaking to founder circles, referrals to theatre — pick your circle and start your journey.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {initiatives.map((it) => (
          <InitiativeCard key={it.title} item={it} />
        ))}
      </div>
    </section>
  );
}
