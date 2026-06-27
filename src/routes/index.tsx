import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Award, Calendar, Briefcase, MapPin, ArrowRight,
} from "lucide-react";
import { PublicTopbar } from "@/components/public-topbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InteractUp — MBA Community Platform" },
      { name: "description", content: "Compete, learn, network, and grow with the InteractUp MBA community. Register for events, verify certificates, and start a city club." },
      { property: "og:title", content: "InteractUp — MBA Community Platform" },
      { property: "og:description", content: "Compete, learn, network, and grow with the InteractUp MBA community." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const upcoming = useQuery({
    queryKey: ["public", "events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("id, name, event_date, venue, description")
        .or(`event_date.gte.${today},event_date.is.null`)
        .order("event_date", { ascending: true, nullsFirst: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicTopbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,oklch(0.93_0.17_95/0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            India's MBA Community OS
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Where MBA students <span className="bg-accent text-accent-foreground px-2 rounded-md">compete, connect</span> and lead.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
            Join InteractUp to register for case competitions, find mentors, post internships,
            and earn verifiable certificates that recruiters can trust.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/events">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Browse competitions <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline">Verify a certificate</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="ghost">Create account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three primary actions */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12 grid gap-4 md:grid-cols-3">
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
          description="Winners receive a unique code. Enter yours to verify and download your certificate."
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
      </section>

      {/* Upcoming events */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Upcoming events</h2>
            <p className="text-sm text-muted-foreground mt-1">Compete with the best MBA minds in the country.</p>
          </div>
          <Link to="/events" className="text-sm font-medium hover:underline hidden md:inline-flex items-center gap-1">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {upcoming.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : upcoming.data && upcoming.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {upcoming.data.map((ev) => (
              <Card key={ev.id} className="p-5">
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
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No upcoming events listed yet. Check back soon.
          </Card>
        )}
      </section>

      {/* Internships teaser */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        <Card className="p-8 md:p-10 bg-card/60">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="size-12 rounded-xl bg-accent text-accent-foreground grid place-items-center shrink-0">
              <Briefcase className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold">Internships hand-picked for MBAs</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Curated opportunities from companies that want to hire serious talent.
              </p>
            </div>
            <Link to="/internships">
              <Button variant="outline">Browse internships</Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} InteractUp</span>
          <div className="flex gap-4">
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

function FeatureCard({
  icon: Icon, title, description, to, cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description: string; to: string; cta: string;
}) {
  return (
    <Card className="p-6 hover:shadow-elegant transition-shadow">
      <div className="size-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
        <Icon className="size-5" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline">
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}
