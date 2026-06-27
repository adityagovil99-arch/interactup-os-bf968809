import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Templates — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Templates" description="Offer Letter, NDA, MoU, Invoice templates." /><ComingSoon feature="Document templates" /></div>),
});
