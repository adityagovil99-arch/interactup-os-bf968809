import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { researchGrants } from "@/lib/grants.functions";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles, Trophy, Globe2, Calendar, ExternalLink, Loader2, Trash2, Plus, Target, Search, ListChecks,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sponsors")({
  head: () => ({ meta: [{ title: "Sponsors — InteractUp OS" }] }),
  component: SponsorsPage,
});

type Grant = {
  id: string;
  title: string;
  organization: string | null;
  country: string | null;
  region: string | null;
  amount: string | null;
  currency: string | null;
  deadline: string | null;
  eligibility: string | null;
  alignment: string | null;
  strategy: string[] | null;
  application_url: string | null;
  source_url: string | null;
  tags: string[] | null;
  status: "researching" | "shortlisted" | "applying" | "submitted" | "won" | "rejected" | "archived";
  notes: string | null;
  ai_generated: boolean;
  created_at: string;
};

const STATUS_META: Record<Grant["status"], { label: string; className: string }> = {
  researching: { label: "Researching", className: "bg-muted text-foreground" },
  shortlisted: { label: "Shortlisted", className: "bg-accent/40 text-foreground" },
  applying:    { label: "Applying",    className: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100" },
  submitted:   { label: "Submitted",   className: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-100" },
  won:         { label: "Won",         className: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100" },
  rejected:    { label: "Rejected",    className: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100" },
  archived:    { label: "Archived",    className: "bg-muted text-muted-foreground" },
};

function SponsorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsors & Grants"
        description="Track sponsor deals and discover funding opportunities that fit InteractUp's vision."
      />
      <Tabs defaultValue="grants">
        <TabsList>
          <TabsTrigger value="pipeline"><Trophy className="size-3.5 mr-1.5" /> Sponsor pipeline</TabsTrigger>
          <TabsTrigger value="grants"><Target className="size-3.5 mr-1.5" /> Grants research</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline" className="mt-6">
          <ComingSoon feature="Sponsor pipeline Kanban" note="Drag-and-drop board with Lead → Won pipeline. Building in Phase 2." />
        </TabsContent>
        <TabsContent value="grants" className="mt-6">
          <GrantsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GrantsSection() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const runResearch = useServerFn(researchGrants);
  const [focus, setFocus] = useState("");
  const [researching, setResearching] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<Grant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Grant | null>(null);

  const grants = useQuery({
    queryKey: ["grants", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Grant[];
    },
  });

  const doResearch = async () => {
    if (!isStaff) return toast.error("Staff only");
    setResearching(true);
    try {
      const r = await runResearch({ data: { focus: focus.trim() || undefined } });
      toast.success(`AI added ${r.added} grants — review and shortlist`);
      setFocus("");
      qc.invalidateQueries({ queryKey: ["grants", "list"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const setStatus = async (id: string, status: Grant["status"]) => {
    const { error } = await supabase.from("grants").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["grants", "list"] });
    toast.success("Status updated");
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("grants").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["grants", "list"] });
    setConfirmDelete(null);
    toast.success("Grant removed");
  };

  const filtered = (grants.data ?? []).filter((g) => {
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      (g.organization ?? "").toLowerCase().includes(q) ||
      (g.country ?? "").toLowerCase().includes(q) ||
      (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {isStaff && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-accent/40 grid place-items-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold">AI grant researcher</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask the AI to surface real grants InteractUp can win at zero cost — Indian government, foundations, CSR, and global fellowships. Each result includes a step-by-step strategy.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Optional focus, e.g. 'women in leadership' or 'legal-aid clinics'"
                  disabled={researching}
                />
                <Button onClick={doResearch} disabled={researching} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                  {researching ? <><Loader2 className="size-4 mr-2 animate-spin" /> Researching…</> : <><Sparkles className="size-4 mr-2" /> Research grants</>}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                AI can be wrong — verify eligibility, deadlines, and links on the funder's official site before applying.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, org, country, tag…" className="pl-8 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {grants.data?.length ?? 0}
          </div>
        </div>
      </Card>

      {grants.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading grants…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Target className="size-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No grants yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isStaff ? "Use the AI researcher above to seed your first batch." : "Ask a staff member to run grant research."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((g) => (
            <Card key={g.id} className="p-5 flex flex-col">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={STATUS_META[g.status].className}>
                      {STATUS_META[g.status].label}
                    </Badge>
                    {g.ai_generated && (
                      <Badge variant="outline" className="text-[10px]">
                        <Sparkles className="size-2.5 mr-1" /> AI
                      </Badge>
                    )}
                    {g.region && <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Globe2 className="size-3" /> {g.region}</span>}
                  </div>
                  <h3 className="font-semibold mt-2 leading-snug">{g.title}</h3>
                  {g.organization && <div className="text-sm text-muted-foreground mt-0.5">{g.organization}</div>}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {g.amount && <div><div className="text-muted-foreground">Amount</div><div className="font-medium">{g.amount}</div></div>}
                {g.deadline && <div><div className="text-muted-foreground inline-flex items-center gap-1"><Calendar className="size-3" />Deadline</div><div className="font-medium">{g.deadline}</div></div>}
              </div>

              {g.alignment && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{g.alignment}</p>
              )}

              <div className="mt-auto pt-4 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setView(g)} className="flex-1">
                  <ListChecks className="size-3.5 mr-1.5" /> Strategy
                </Button>
                {g.application_url || g.source_url ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={g.application_url ?? g.source_url ?? "#"} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                ) : null}
                {isStaff && (
                  <>
                    <Select value={g.status} onValueChange={(v) => setStatus(g.id, v as Grant["status"])}>
                      <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_META).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(g)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <GrantDetailDialog grant={view} onOpenChange={(o) => !o && setView(null)} onStatus={setStatus} isStaff={isStaff} />

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove grant?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently deletes <span className="font-medium text-foreground">{confirmDelete?.title}</span>.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && del(confirmDelete.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GrantDetailDialog({
  grant, onOpenChange, onStatus, isStaff,
}: {
  grant: Grant | null;
  onOpenChange: (o: boolean) => void;
  onStatus: (id: string, s: Grant["status"]) => void;
  isStaff: boolean;
}) {
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={!!grant} onOpenChange={(o) => { onOpenChange(o); if (!o) setNotes(""); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {grant && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={STATUS_META[grant.status].className}>{STATUS_META[grant.status].label}</Badge>
                {grant.region && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Globe2 className="size-3" />{grant.region}</span>}
                {grant.country && <span className="text-xs text-muted-foreground">· {grant.country}</span>}
              </div>
              <DialogTitle className="text-xl leading-snug mt-1">{grant.title}</DialogTitle>
              {grant.organization && <div className="text-sm text-muted-foreground">{grant.organization}</div>}
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {grant.amount && <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-medium">{grant.amount}</div></div>}
              {grant.deadline && <div><div className="text-xs text-muted-foreground">Deadline</div><div className="font-medium">{grant.deadline}</div></div>}
            </div>

            {grant.eligibility && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Eligibility</div>
                <p className="text-sm">{grant.eligibility}</p>
              </div>
            )}
            {grant.alignment && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Why it fits InteractUp</div>
                <p className="text-sm">{grant.alignment}</p>
              </div>
            )}
            {grant.strategy && grant.strategy.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Zero-budget winning strategy</div>
                <ol className="space-y-2">
                  {grant.strategy.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="size-5 rounded-full bg-accent/40 text-foreground text-xs font-semibold grid place-items-center shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {(grant.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {grant.tags!.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {grant.application_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={grant.application_url} target="_blank" rel="noreferrer noopener"><ExternalLink className="size-3.5 mr-1.5" /> Application</a>
                </Button>
              )}
              {grant.source_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={grant.source_url} target="_blank" rel="noreferrer noopener"><ExternalLink className="size-3.5 mr-1.5" /> Source</a>
                </Button>
              )}
            </div>
            {isStaff && (
              <div className="pt-2 border-t border-border space-y-2">
                <Label className="text-xs">Add a note</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal note (optional)" />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => onStatus(grant.id, "shortlisted")}>
                    <Plus className="size-3.5 mr-1.5" /> Shortlist
                  </Button>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={async () => {
                    if (!notes.trim()) { onOpenChange(false); return; }
                    const { error } = await supabase.from("grants").update({ notes: notes.trim() }).eq("id", grant.id);
                    if (error) toast.error(error.message); else { toast.success("Note saved"); onOpenChange(false); }
                  }}>
                    Save note
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
