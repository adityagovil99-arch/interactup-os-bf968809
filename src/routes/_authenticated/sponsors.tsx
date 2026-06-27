import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/sponsors")({
  head: () => ({ meta: [{ title: "Sponsors — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Sponsors" description="Kanban pipeline of sponsor deals across 9 stages." /><ComingSoon feature="Sponsor pipeline Kanban" note="Drag-and-drop board with Lead → Won pipeline. Building in Phase 2." /></div>),
});
