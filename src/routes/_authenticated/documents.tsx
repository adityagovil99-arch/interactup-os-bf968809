import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Documents" description="Proposals, MoUs, certificates, and uploads." /><ComingSoon feature="Documents" /></div>),
});
