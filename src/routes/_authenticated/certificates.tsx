import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Award, Copy, Download, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { downloadCertificate } from "@/lib/certificate-pdf";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [{ title: "Certificates — InteractUp OS" }] }),
  component: CertificatesPage,
});

type EventRow = { id: string; name: string };
type Cert = {
  id: string;
  code: string;
  recipient_name: string | null;
  recipient_email: string | null;
  event_id: string;
  event_name_snapshot: string | null;
  issued_at: string;
};

function CertificatesPage() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [eventId, setEventId] = useState<string>("");
  const [customCode, setCustomCode] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [issued, setIssued] = useState<Cert | null>(null);

  const events = useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, name").order("event_date", { ascending: false });
      return (data as EventRow[]) ?? [];
    },
  });

  const certs = useQuery({
    queryKey: ["certificates", "list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, code, recipient_name, recipient_email, event_id, event_name_snapshot, issued_at")
        .order("issued_at", { ascending: false })
        .limit(200);
      return (data as Cert[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    const list = certs.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.recipient_name ?? "").toLowerCase().includes(q) ||
        (c.recipient_email ?? "").toLowerCase().includes(q) ||
        (c.event_name_snapshot ?? "").toLowerCase().includes(q),
    );
  }, [certs.data, search]);

  if (!isStaff) {
    return (
      <Card className="p-8 text-center">
        <Lock className="size-8 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold">Admin only</h3>
        <p className="text-sm text-muted-foreground mt-1">Certificate generation is restricted to staff.</p>
      </Card>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return toast.error("Enter the recipient's name.");
    if (!eventId) return toast.error("Select an event.");
    const event = events.data?.find((ev) => ev.id === eventId);
    setSubmitting(true);
    const code = customCode.trim() ? customCode.trim().toUpperCase() : "";
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim() || null,
        event_id: eventId,
        event_name_snapshot: event?.name ?? null,
        metadata: description ? { description } : {},
        // Trigger generates a code when this is empty. Send a placeholder
        // value the trigger replaces, satisfying the NOT NULL constraint.
        code: code || "AUTO",
      })
      .select("id, code, recipient_name, recipient_email, event_id, event_name_snapshot, issued_at")
      .single();
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("That custom code is already in use.");
      else toast.error(error.message);
      return;
    }
    toast.success("Certificate generated");
    setIssued(data as Cert);
    setRecipientName(""); setRecipientEmail(""); setCustomCode(""); setDescription("");
    qc.invalidateQueries({ queryKey: ["certificates", "list"] });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const downloadCert = (c: Cert) => {
    downloadCertificate({
      recipientName: c.recipient_name ?? "Recipient",
      eventName: c.event_name_snapshot ?? "InteractUp Event",
      code: c.code,
      issuedAt: c.issued_at,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Generate branded certificates with unique codes. Share the code — the recipient downloads it themselves."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Award className="size-4" /> Generate certificate
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient name</Label>
              <Input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Full name as it should appear" />
            </div>
            <div className="space-y-2">
              <Label>Recipient email (optional)</Label>
              <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="for your records" />
            </div>
            <div className="space-y-2">
              <Label>Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                <SelectContent>
                  {events.data?.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                  ))}
                  {events.data?.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No events. Add one from Events.</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description / placement (optional)</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Winner, 2026 Case Competition" />
            </div>
            <div className="space-y-2">
              <Label>Custom code (optional)</Label>
              <Input value={customCode} onChange={(e) => setCustomCode(e.target.value)} placeholder="Leave blank to auto-generate" className="font-mono uppercase" />
              <p className="text-[11px] text-muted-foreground">Default: IUP-XXXX-XXXX. Must be unique.</p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {submitting ? "Generating…" : "Generate certificate"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="font-display font-semibold">Issued certificates</h3>
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, name, event…"
                className="pl-8 h-9 w-[220px]"
              />
            </div>
          </div>
          {certs.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No certificates yet. Generate the first one on the left.
            </div>
          ) : (
            <div className="divide-y divide-border -mx-2">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-2 py-3">
                  <div className="size-9 rounded-md bg-accent/30 grid place-items-center shrink-0">
                    <Award className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{c.recipient_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.event_name_snapshot}</div>
                  </div>
                  <button
                    onClick={() => copy(c.code)}
                    className="hidden sm:flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-muted hover:bg-muted/70"
                    title="Copy code"
                  >
                    {c.code} <Copy className="size-3" />
                  </button>
                  <Button size="sm" variant="outline" onClick={() => downloadCert(c)}>
                    <Download className="size-3.5 mr-1.5" />
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!issued} onOpenChange={(o) => !o && setIssued(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate generated</DialogTitle>
            <DialogDescription>
              Share this code with the recipient. They can verify and download at <span className="font-mono">/verify</span>.
            </DialogDescription>
          </DialogHeader>
          {issued && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-accent/10">
                <div className="text-xs text-muted-foreground">Unique code</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xl font-bold">{issued.code}</span>
                  <Button size="sm" variant="outline" onClick={() => copy(issued.code)}>
                    <Copy className="size-3.5 mr-1.5" /> Copy
                  </Button>
                </div>
              </div>
              <div className="text-sm">
                <div><span className="text-muted-foreground">Recipient:</span> {issued.recipient_name}</div>
                <div><span className="text-muted-foreground">Event:</span> {issued.event_name_snapshot}</div>
              </div>
              <Button onClick={() => downloadCert(issued)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Download className="size-4 mr-2" /> Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
