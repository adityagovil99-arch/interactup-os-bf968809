import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/internships")({
  head: () => ({ meta: [{ title: "Internships — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Internships" description="Opportunities posted by partner companies." /><ComingSoon feature="Internships" /></div>),
});
