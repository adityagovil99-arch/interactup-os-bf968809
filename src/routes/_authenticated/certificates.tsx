import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [{ title: "Certificates — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Certificates" description="Generate branded certificates per event." /><ComingSoon feature="Certificates" /></div>),
});
