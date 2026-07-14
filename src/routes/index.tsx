import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Award, Calendar, Briefcase, MapPin, ArrowRight, ArrowUpRight,
  Scale, Megaphone, BookOpen, HeartHandshake, Users,
} from "lucide-react";
import { PublicTopbar } from "@/components/public-topbar";
import { InitiativesSection } from "@/components/initiatives-section";
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
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
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
        .limit(4);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent">
      <PublicTopbar />

      {/* HERO — dynamic aurora */}
      <header className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-accent/50 blur-[140px] animate-drift" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/30 blur-[120px] animate-drift-reverse" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/40 blur-[100px] animate-drift" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mx-auto max-w-7xl w-full px-6 lg:px-8 pt-20 md:pt-28 pb-24 md:pb-36"
        >
          <motion.div variants={fadeUp} className="mb-10">
            <span className="inline-flex rounded-full px-4 py-1.5 text-[11px] text-foreground/60 ring-1 ring-foreground/10 hover:ring-foreground/30 transition-all font-mono uppercase tracking-[0.28em] bg-card/40 backdrop-blur-md">
              Department of Social Justice · India's MBA Community
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] text-foreground mb-10 max-w-5xl"
          >
            Compete, connect,{" "}
            <span className="text-foreground/25 hover:text-foreground/80 transition-colors duration-700 cursor-default">
              stand for justice.
            </span>
          </motion.h1>

          <motion.div variants={fadeUp} className="h-px w-24 bg-foreground/20 mb-10 animate-grow-x" />

          <motion.p variants={fadeUp} className="text-xl md:text-2xl leading-relaxed text-foreground/70 max-w-2xl mb-12">
            InteractUp is the operating system for India's MBA community — case competitions,
            mentors, internships, verifiable certificates, and a Department of Social Justice
            that fights for fair treatment.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 md:gap-8">
            <Link to="/events">
              <Button
                size="lg"
                className="group relative rounded-full bg-primary px-8 md:px-10 py-6 text-base font-semibold shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10">Browse competitions</span>
                <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </Link>
            <a href="#social-justice" className="text-base font-bold text-foreground group inline-flex items-center gap-2">
              Report an injustice
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-2" />
            </a>
          </motion.div>

          {/* Stat strip */}
          <motion.div variants={fadeUp} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/5 rounded-2xl overflow-hidden border border-foreground/5 max-w-4xl">
            {[
              { k: "50+", v: "MBA campuses" },
              { k: "20+", v: "City chapters" },
              { k: "1000+", v: "Members" },
              { k: "100%", v: "Verified certificates" },
            ].map((s) => (
              <div key={s.v} className="bg-background/70 backdrop-blur px-6 py-5">
                <div className="font-display text-3xl md:text-4xl font-bold tracking-tighter">{s.k}</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mt-2">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </header>

      {/* PRIMARY ACTIONS — kinetic cards */}
      <section className="relative px-6 lg:px-8 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            <ActionCard
              icon={Calendar}
              eyebrow="Compete"
              title="Register for events"
              body="Case competitions, workshops, and signature InteractUp events open for sign-up."
              cta="Explore events"
              to="/events"
            />
            <ActionCard
              icon={Award}
              eyebrow="Verify"
              title="Download certificates"
              body="Winners receive a unique code. Enter yours to verify and download instantly."
              cta="Verify by code"
              to="/verify"
            />
            <ActionCard
              icon={MapPin}
              eyebrow="Lead"
              title="Open a city club"
              body="Bring InteractUp to your city. Get 20+ committed members and apply for a chapter license."
              cta="Apply now"
              to="/city-club"
            />
          </motion.div>
        </div>
      </section>

      {/* DEPARTMENT OF SOCIAL JUSTICE */}
      <SocialJusticeSection />

      {/* INITIATIVES — existing 12-card animated grid */}
      <InitiativesSection />

      {/* UPCOMING EVENTS — dark editorial section */}
      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-7xl bg-[oklch(0.14_0.005_260)] text-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 lg:p-20 overflow-hidden relative group">
          <div aria-hidden className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] group-hover:-translate-x-[10%] transition-transform duration-[3s]" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 mb-8 block">Calendar</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-12 md:mb-16 tracking-tight">Upcoming events</h2>

              <div className="space-y-2">
                {upcoming.isLoading && <div className="text-white/40 text-sm">Loading…</div>}
                {upcoming.data && upcoming.data.length === 0 && (
                  <div className="text-white/40 text-sm">No upcoming events listed yet. Check back soon.</div>
                )}
                {upcoming.data?.map((ev) => {
                  const d = ev.event_date ? new Date(ev.event_date) : null;
                  return (
                    <Link
                      key={ev.id}
                      to="/events"
                      className="flex items-center gap-6 md:gap-10 p-4 md:p-6 rounded-2xl hover:bg-white/5 transition-all group/item cursor-pointer"
                    >
                      <div className="text-center min-w-14">
                        <div className="text-2xl md:text-3xl font-bold tracking-tighter">
                          {d ? d.getDate().toString().padStart(2, "0") : "—"}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">
                          {d ? d.toLocaleString("en-US", { month: "short" }) : "TBA"}
                        </div>
                      </div>
                      <div className="flex-1 border-l border-white/10 pl-6 md:pl-10 min-w-0">
                        <h4 className="text-lg md:text-2xl font-medium group-hover/item:text-accent transition-colors line-clamp-1">
                          {ev.name}
                        </h4>
                        {ev.venue && (
                          <p className="text-white/40 text-xs md:text-sm mt-1 uppercase tracking-wider line-clamp-1">
                            {ev.venue}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="size-5 text-accent opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <Link
                to="/events"
                className="mt-10 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase border-b-2 border-accent pb-1 hover:gap-4 transition-all"
              >
                View all events <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Careers / Internships CTA */}
            <div className="flex flex-col justify-center">
              <div className="p-10 md:p-16 rounded-[2.5rem] md:rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden group/cta">
                <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 blur-3xl group-hover/cta:scale-150 transition-transform duration-1000" />
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-6 block">Careers</span>
                <h3 className="font-display text-3xl md:text-4xl font-bold mb-6 md:mb-8 leading-tight">
                  Internships hand-picked for MBAs.
                </h3>
                <p className="text-white/50 text-base md:text-lg mb-10 md:mb-12 leading-relaxed">
                  Curated opportunities from companies that want serious talent — from strategy to product to finance.
                </p>
                <Link to="/internships">
                  <Button
                    size="lg"
                    className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all px-8 md:px-10 py-6 text-sm font-black tracking-widest uppercase"
                  >
                    <Briefcase className="size-4 mr-2" /> Explore internships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 lg:px-8 py-24 md:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-16">
            <div className="font-display text-3xl font-black tracking-tighter">
              Int<span className="text-accent-foreground bg-accent px-1 rounded">er</span>actUp
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
              <FooterCol
                heading="Community"
                items={[
                  { label: "Events", to: "/events" },
                  { label: "Verify certificate", to: "/verify" },
                  { label: "City club", to: "/city-club" },
                ]}
              />
              <FooterCol
                heading="Justice"
                items={[
                  { label: "Report", href: "#social-justice" },
                  { label: "Talk to us", href: "mailto:justice@interactup.com" },
                ]}
              />
              <FooterCol
                heading="Account"
                items={[
                  { label: "Sign in", to: "/auth" },
                  { label: "Dashboard", to: "/dashboard" },
                ]}
              />
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} InteractUp. Justice is a right, not a privilege.
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-mono tracking-widest uppercase">
              HQ · New Delhi, India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ActionCard({
  icon: Icon, eyebrow, title, body, cta, to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string; title: string; body: string; cta: string; to: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link to={to} className="block h-full">
        <div className="group relative p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-card border border-border shadow-elegant transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:border-foreground/10 overflow-hidden h-full">
          <div aria-hidden className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-32 bg-accent/25 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative">
            <div className="size-14 md:size-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform duration-500">
              <Icon className="size-7 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">{eyebrow}</span>
            <h3 className="font-display text-2xl font-bold mb-3 tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-10">{body}</p>
            <div className="inline-flex items-center gap-3 font-bold text-xs tracking-widest uppercase group-hover:gap-5 transition-all">
              {cta} <ArrowRight className="size-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FooterCol({
  heading, items,
}: {
  heading: string;
  items: Array<{ label: string; to?: string; href?: string }>;
}) {
  return (
    <div className="space-y-5">
      <h5 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">{heading}</h5>
      <ul className="space-y-3 text-sm font-medium text-muted-foreground">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <Link to={it.to} className="hover:text-foreground hover:pl-2 transition-all duration-300 inline-block">
                {it.label}
              </Link>
            ) : (
              <a href={it.href} className="hover:text-foreground hover:pl-2 transition-all duration-300 inline-block">
                {it.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialJusticeSection() {
  return (
    <section id="social-justice" className="relative border-y border-border bg-gradient-to-b from-muted/40 via-background to-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32">
        <div className="grid gap-16 lg:gap-20 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-6 block">
              Governance
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.02]">
              Facing an{" "}
              <span className="text-accent-foreground bg-accent px-2 rounded-md">injustice</span>?
            </h2>
            <div className="h-px w-24 bg-foreground/20 my-8" />
            <p className="text-muted-foreground text-lg leading-relaxed">
              Were you promised payment for work but never received it? Were you underpaid despite completing your work?
              Or have you experienced exploitation, unfair practices, overcharging, or any other situation where you
              believe you've been treated unfairly?
            </p>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              The <span className="font-semibold text-foreground">Department of Social Justice, InteractUp</span> is
              here to listen, support you, and help raise your concerns through appropriate channels.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl">
              {[
                { icon: Users, t: "We support the right people." },
                { icon: Megaphone, t: "We empower voices that matter." },
                { icon: BookOpen, t: "We promote awareness and change." },
                { icon: HeartHandshake, t: "We work today for a just tomorrow." },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-start gap-3 text-sm">
                  <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <span className="pt-2 text-foreground/90">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="mailto:justice@interactup.com?subject=Report%20an%20injustice">
                <Button size="lg" className="rounded-full bg-primary px-8 py-6 text-sm font-bold tracking-widest uppercase hover:scale-105 transition-all">
                  <Scale className="size-4 mr-2" /> Report an injustice
                </Button>
              </a>
              <a href="mailto:justice@interactup.com">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-sm font-bold tracking-widest uppercase">
                  Talk to us
                </Button>
              </a>
            </div>

            <blockquote className="mt-12 border-l-4 border-accent pl-5 italic text-foreground/90 text-lg">
              Justice is a right. Not a privilege.
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div aria-hidden className="absolute -inset-6 bg-gradient-to-tr from-accent/40 via-transparent to-primary/10 blur-3xl rounded-[3rem]" />
            <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-card">
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
    </section>
  );
}
