import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Award, Calendar, Briefcase, MapPin, ArrowRight,
  Scale, Megaphone, BookOpen, HeartHandshake, Users,
} from "lucide-react";
import { PublicTopbar } from "@/components/public-topbar";
import { InitiativesSection } from "@/components/initiatives-section";
import logoAsset from "@/assets/interactup-logo.png.asset.json";
import socialJusticeAsset from "@/assets/social-justice.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InteractUp — MBA Community & Social Justice Platform" },
      { name: "description", content: "Compete, learn, network and stand for justice with the InteractUp MBA community. Register for events, verify certificates, start a city club, and reach the Department of Social Justice." },
      { property: "og:title", content: "InteractUp — MBA Community & Social Justice Platform" },
      { property: "og:description", content: "Compete, learn, network and stand for justice with the InteractUp community." },
      { property: "og:image", content: socialJusticeAsset.url },
      { property: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

function LandingPage() {
  const upcoming = useQuery({
    queryKey: ["public", "events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("id, name, event_date, venue, description")
        .eq("status", "published")
        .or(`event_date.gte.${today},event_date.is.null`)
        .order("event_date", { ascending: true, nullsFirst: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicTopbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated ambient background */}
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-20 size-[520px] rounded-full bg-accent/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-40 -right-24 size-[420px] rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,oklch(0.93_0.17_95/0.25),transparent_60%)]" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative mx-auto max-w-6xl px-4 md:px-6 pt-16 md:pt-28 pb-16 md:pb-24"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            India's MBA Community OS
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.05]"
          >
            Where MBA students{" "}
            <span className="relative inline-block">
              <span className="relative z-10">compete, connect</span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-1 h-3 md:h-4 bg-accent origin-left -z-0"
              />
            </span>{" "}
            and lead.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl">
            Join InteractUp to register for case competitions, find mentors, post
            internships, earn verifiable certificates, and stand up for fairness
            through our Department of Social Justice.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link to="/events">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Browse competitions <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline">Verify a certificate</Button>
            </Link>
            <a href="#social-justice">
              <Button size="lg" variant="ghost">
                <Scale className="size-4 mr-1.5" /> Report an injustice
              </Button>
            </a>
          </motion.div>

          {/* Stat strip */}
          <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { k: "50+", v: "MBA campuses" },
              { k: "20+", v: "City chapters" },
              { k: "1000+", v: "Community members" },
              { k: "100%", v: "Verified certificates" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border bg-card/60 backdrop-blur p-4">
                <div className="font-display text-2xl md:text-3xl font-bold">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Department of Social Justice */}
      <SocialJusticeSection />

      {/* Three primary actions */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="mx-auto max-w-6xl px-4 md:px-6 py-16 grid gap-4 md:grid-cols-3"
      >
        <FeatureCard
          icon={Calendar}
          title="Register for events"
          description="Case competitions, workshops, and signature InteractUp events open for sign-up."
          to="/events"
          cta="Explore events"
        />
        <FeatureCard
          icon={Award}
          title="Download certificates"
          description="Winners receive a unique code. Enter yours to verify and download instantly."
          to="/verify"
          cta="Verify by code"
        />
        <FeatureCard
          icon={MapPin}
          title="Open a city club"
          description="Bring InteractUp to your city. Get 20+ committed members and apply for a chapter license."
          to="/city-club"
          cta="Apply now"
        />
      </motion.section>

      {/* Initiatives */}
      <InitiativesSection />



      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Upcoming events</h2>
            <p className="text-sm text-muted-foreground mt-1">Compete with the best MBA minds in the country.</p>
          </div>
          <Link to="/events" className="text-sm font-medium hover:underline hidden md:inline-flex items-center gap-1">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
        {upcoming.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : upcoming.data && upcoming.data.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-4 md:grid-cols-3"
          >
            {upcoming.data.map((ev) => (
              <motion.div key={ev.id} variants={fadeUp}>
                <Card className="p-5 h-full hover:shadow-elegant hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "Date TBA"}
                  </div>
                  <h3 className="font-display font-semibold mt-2 line-clamp-2">{ev.name}</h3>
                  {ev.venue && <p className="text-xs text-muted-foreground mt-1">{ev.venue}</p>}
                  {ev.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{ev.description}</p>}
                  <Link to="/events" className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
                    View & register <ArrowRight className="size-3.5" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No upcoming events listed yet. Check back soon.
          </Card>
        )}
      </section>

      {/* Internships teaser */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-10 bg-card/60">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="size-12 rounded-xl bg-accent text-accent-foreground grid place-items-center shrink-0">
                <Briefcase className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold">Internships hand-picked for MBAs</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Curated opportunities from companies that want serious talent.
                </p>
              </div>
              <Link to="/internships">
                <Button variant="outline">Browse internships</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} InteractUp</span>
          <div className="flex gap-4">
            <a href="#social-justice" className="hover:text-foreground">Social Justice</a>
            <Link to="/verify" className="hover:text-foreground">Verify certificate</Link>
            <Link to="/events" className="hover:text-foreground">Events</Link>
            <Link to="/city-club" className="hover:text-foreground">City club</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialJusticeSection() {
  return (
    <section id="social-justice" className="relative">
      <div className="border-y border-border bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
                <Scale className="size-3.5" /> Department of Social Justice
              </div>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Facing an{" "}
                <span className="text-accent-foreground bg-accent px-2 rounded-md">injustice</span>?
              </h2>
              <p className="mt-5 text-muted-foreground md:text-lg leading-relaxed">
                Were you promised payment for work but never received it? Were you underpaid despite completing your work?
                Or have you experienced exploitation, unfair practices, overcharging, or any other situation where you
                believe you've been treated unfairly?
              </p>
              <p className="mt-4 text-muted-foreground md:text-lg leading-relaxed">
                The <span className="font-semibold text-foreground">Department of Social Justice, InteractUp</span> is
                here to listen, support you, and help raise your concerns through appropriate channels. Wherever
                justified, we will engage with the concerned parties, amplify genuine issues, and stand with those
                seeking a fair resolution.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg">
                {[
                  { icon: Users, t: "We support the right people." },
                  { icon: Megaphone, t: "We empower voices that matter." },
                  { icon: BookOpen, t: "We promote awareness and change." },
                  { icon: HeartHandshake, t: "We work today for a just tomorrow." },
                ].map(({ icon: Icon, t }) => (
                  <div key={t} className="flex items-start gap-2.5 text-sm">
                    <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <span className="pt-1.5 text-foreground/90">{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="mailto:justice@interactup.com?subject=Report%20an%20injustice">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Scale className="size-4 mr-2" /> Report an injustice
                  </Button>
                </a>
                <a href="mailto:justice@interactup.com">
                  <Button size="lg" variant="outline">Talk to us</Button>
                </a>
              </div>

              <blockquote className="mt-10 border-l-4 border-accent pl-4 italic text-foreground/90">
                Justice is a right. Not a privilege.
              </blockquote>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-accent/40 via-transparent to-primary/10 blur-2xl rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-elegant bg-card">
                <img
                  src={socialJusticeAsset.url}
                  alt="Department of Social Justice — InteractUp"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon, title, description, to, cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description: string; to: string; cta: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-6 h-full hover:shadow-elegant hover:-translate-y-1 transition-all">
        <div className="size-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
          <Icon className="size-5" />
        </div>
        <h3 className="font-display font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
          {cta} <ArrowRight className="size-3.5" />
        </Link>
      </Card>
    </motion.div>
  );
}
