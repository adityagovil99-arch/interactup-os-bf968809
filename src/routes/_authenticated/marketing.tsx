import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/marketing")({
  head: () => ({ meta: [{ title: "Marketing Studio — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Marketing Studio" description="Draft posts and email blasts with AI." /><ComingSoon feature="Marketing Studio" note="AI-assisted editor wired to Lovable AI Gateway in Phase 4." /></div>),
});
