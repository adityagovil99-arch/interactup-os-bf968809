import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Community — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Community" description="InteractUp members, alumni, and tags." /><ComingSoon feature="Community directory" note="Searchable, filterable member directory in Phase 5." /></div>),
});
