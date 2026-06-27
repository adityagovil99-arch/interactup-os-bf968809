import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/outreach")({
  head: () => ({ meta: [{ title: "Outreach — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Outreach" description="Email, LinkedIn, and WhatsApp templates." /><ComingSoon feature="Outreach templates" note="Template CRUD with variable preview ships in Phase 4." /></div>),
});
