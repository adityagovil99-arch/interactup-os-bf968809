import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
export const Route = createFileRoute("/_authenticated/companies")({
  head: () => ({ meta: [{ title: "Companies — InteractUp OS" }] }),
  component: () => (<div><PageHeader title="Companies" description="Researched companies, contacts, and CSR focus." /><ComingSoon feature="Company research" note="Profile pages with paste-research, contacts, and recent news land in Phase 2." /></div>),
});
