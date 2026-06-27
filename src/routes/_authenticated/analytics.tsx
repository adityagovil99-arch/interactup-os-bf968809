import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Analytics" description="Pipeline, revenue, growth, and engagement." /><ComingSoon feature="Analytics" /></div>),
});
