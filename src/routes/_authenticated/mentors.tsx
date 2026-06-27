import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/mentors")({
  head: () => ({ meta: [{ title: "Mentors — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Mentors" description="Manage mentors and mentee assignments." /><ComingSoon feature="Mentors" /></div>),
});
