import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";

import studentCommunity from "@/assets/initiatives/student-community.jpg";
import professionals from "@/assets/initiatives/professionals.jpg";
import connectCircle from "@/assets/initiatives/connect-circle.jpg";
import linkedinImg from "@/assets/initiatives/linkedin.jpg";
import mindNutrients from "@/assets/initiatives/mind-nutrients.jpg";
import startup from "@/assets/initiatives/startup.jpg";
import fluency from "@/assets/initiatives/fluency.jpg";
import inspiretalk from "@/assets/initiatives/inspiretalk.jpg";
import theatre from "@/assets/initiatives/theatre.jpg";
import international from "@/assets/initiatives/international.jpg";
import blueprint from "@/assets/initiatives/blueprint.jpg";
import social from "@/assets/initiatives/social.jpg";
import experience from "@/assets/initiatives/experience.jpg";

type Initiative = {
  title: string;
  tagline: string;
  description: string;
  image: string;
};

const initiatives: Initiative[] = [
  {
    title: "Core Student Community",
    tagline: "Learn. Compete. Grow.",
    description:
      "A dynamic ecosystem with challenges, mock interviews and peer learning that sharpens both soft and hard skills.",
    image: studentCommunity,
  },
  {
    title: "InteractUp Professionals",
    tagline: "Your network is your key.",
    description:
      "The networking hub for CAs, MBAs and corporate leaders — referrals, industry insights and city meetups.",
    image: professionals,
  },
  {
    title: "Connect Circle",
    tagline: "Real conversations, real connections.",
    description:
      "A peer-to-peer initiative for emotional wellness — turning strangers into a family-like community.",
    image: connectCircle,
  },
  {
    title: "LinkedIn Branding Group",
    tagline: "Build a magnetic profile.",
    description:
      "Master personal branding and grow visibility through peer-to-peer engagement and collaboration.",
    image: linkedinImg,
  },
  {
    title: "Mind Nutrients",
    tagline: "Weekly dose of growth.",
    description:
      "An invite-only network where 6–7 members simplify complex tools and industry knowledge together.",
    image: mindNutrients,
  },
  {
    title: "Start-Up Group",
    tagline: "For early-stage founders.",
    description:
      "Solve bottlenecks, share resources and raise funds with a supportive founder-first community.",
    image: startup,
  },
  {
    title: "Fluency Sessions",
    tagline: "Speak with confidence.",
    description:
      "Certified coaches, personalized feedback and three weekly sessions to master conversation and stage.",
    image: fluency,
  },
  {
    title: "InspireTalk",
    tagline: "Leadership talks that move you.",
    description:
      "An exclusive speaker series with industry titans, entrepreneurs and visionary executives.",
    image: inspiretalk,
  },
  {
    title: "Theatre Group",
    tagline: "Storytelling, acting, expression.",
    description:
      "A PAN-India creative platform for performance-based learning through theatre and scriptwriting.",
    image: theatre,
  },
  {
    title: "InteractUp International",
    tagline: "A borderless community.",
    description:
      "Global collaborations, cultural exchanges and international opportunities for continuous improvement.",
    image: international,
  },
  {
    title: "Blueprint Syndicate",
    tagline: "Turn strategy into blueprints.",
    description:
      "Analytical thinking, business models and startup ideation through execution-based learning.",
    image: blueprint,
  },
  {
    title: "InteractUp Social",
    tagline: "Grow together, give back.",
    description:
      "Our social impact arm — welfare, city meets and community-driven contribution to society.",
    image: social,
  },
  {
    title: "Experience It",
    tagline: "Live the InteractUp energy.",
    description:
      "Immersive fests, offline meetups and flagship experiences that turn members into lifelong friends.",
    image: experience,
  },
];

function InitiativeCard({ item }: { item: Initiative }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-elegant transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <motion.img
          src={item.image}
          alt={item.title}
          loading="lazy"
          width={1024}
          height={768}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.05 }}
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <ArrowUpRight className="absolute top-3 right-3 size-4 text-white/90 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
            {item.tagline}
          </p>
          <h3 className="font-display font-semibold text-white text-base leading-tight mt-0.5">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
    </motion.article>
  );
}

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
          <Sparkles className="size-3.5" /> 13 initiatives, one community
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
