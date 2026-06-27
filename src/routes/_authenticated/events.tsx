import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Events — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Events" description="Competitions, workshops, and signature events." /><ComingSoon feature="Events" note="Event detail, sponsors, judges, tasks, and budgets in Phase 3." /></div>),
});
