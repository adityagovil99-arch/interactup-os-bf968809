import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, DollarSign, Calendar, Users, CheckSquare, ArrowUpRight,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — InteractUp OS" }] }),
  component: Dashboard,
});

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  researching: "Researching",
  email_sent: "Email Sent",
  linkedin_sent: "LinkedIn Sent",
  meeting_scheduled: "Meeting",
  proposal_shared: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};
const STATUS_ORDER = Object.keys(STATUS_LABELS);

function Dashboard() {
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [sponsors, events, members, tasks] = await Promise.all([
        supabase.from("sponsors").select("status, expected_amount"),
        supabase.from("events").select("id, name, event_date").gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date").limit(5),
        supabase.from("profiles").select("id, status, join_date"),
        supabase.from("tasks").select("id, title, due_date, status, related_type").neq("status", "done").order("due_date", { ascending: true, nullsFirst: false }).limit(5),
      ]);
      return { sponsors: sponsors.data ?? [], events: events.data ?? [], members: members.data ?? [], tasks: tasks.data ?? [] };
    },
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = (user?.email ?? "there").split("@")[0].split(".")[0];

  const totalSponsors = stats.data?.sponsors.length ?? 0;
  const totalRaised = (stats.data?.sponsors ?? [])
    .filter((s) => s.status === "won")
    .reduce((sum, s) => sum + Number(s.expected_amount ?? 0), 0);
  const upcoming = stats.data?.events.length ?? 0;
  const activeMembers = (stats.data?.members ?? []).filter((m) => m.status === "active").length;
  const pendingTasks = stats.data?.tasks.length ?? 0;

  const pipelineData = STATUS_ORDER.map((s) => ({
    name: STATUS_LABELS[s],
    count: (stats.data?.sponsors ?? []).filter((x) => x.status === s).length,
  }));

  // Membership growth: cumulative joins by month (last 6 months)
  const growthData = (() => {
    const months: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: format(d, "MMM"), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
    let cumulative = 0;
    return months.map(({ label, key }) => {
      const added = (stats.data?.members ?? []).filter((m) => (m.join_date ?? "").slice(0, 7) === key).length;
      cumulative += added;
      return { label, members: cumulative, added };
    });
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`}
        description={`Today is ${format(new Date(), "EEEE, MMM d")}. Here's what's happening.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={Trophy} label="Sponsors" value={totalSponsors} hint="In pipeline" />
        <KpiCard icon={DollarSign} label="Total Raised" value={`₹${totalRaised.toLocaleString()}`} hint="Closed deals" accent />
        <KpiCard icon={Calendar} label="Upcoming Events" value={upcoming} hint="Next 5" />
        <KpiCard icon={Users} label="Active Members" value={activeMembers} hint="Community" />
        <KpiCard icon={CheckSquare} label="Pending Tasks" value={pendingTasks} hint="Across team" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Sponsor pipeline</h3>
              <p className="text-xs text-muted-foreground">Deals by stage</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={0} angle={-20} dy={10} height={50} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Community growth</h3>
            <p className="text-xs text-muted-foreground">Cumulative members</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="members" stroke="var(--foreground)" strokeWidth={2} dot={{ r: 3, fill: "var(--accent)", stroke: "var(--foreground)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Today's priorities</h3>
              <p className="text-xs text-muted-foreground">Top 5 open tasks</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">{pendingTasks}</Badge>
          </div>
          {pendingTasks === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">All clear. Nothing pending.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(stats.data?.tasks ?? []).map((t) => (
                <li key={t.id} className="py-3 flex items-start gap-3">
                  <div className="size-1.5 rounded-full bg-accent mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                      {t.due_date && <span>Due {format(parseISO(t.due_date), "MMM d")}</span>}
                      {t.related_type && <span className="capitalize">· {t.related_type}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Upcoming events</h3>
              <p className="text-xs text-muted-foreground">Next 5 scheduled</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">{upcoming}</Badge>
          </div>
          {upcoming === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No upcoming events yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(stats.data?.events ?? []).map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.event_date && format(parseISO(e.event_date), "EEE, MMM d, yyyy")}
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, hint, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "bg-accent text-accent-foreground border-transparent" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{label}</span>
        <Icon className={`size-3.5 ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`} />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className={`text-[11px] mt-0.5 ${accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{hint}</div>}
    </Card>
  );
}
