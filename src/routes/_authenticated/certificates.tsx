import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Award, Copy, Download, Lock, Search, Trash2, Upload, FileCheck2 } from "lucide-react";
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
  file_url: string | null;
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
  const [confirmDelete, setConfirmDelete] = useState<Cert | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Cert | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .select("id, code, recipient_name, recipient_email, event_id, event_name_snapshot, issued_at, file_url")
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
        code: code || "",
      })
      .select("id, code, recipient_name, recipient_email, event_id, event_name_snapshot, issued_at, file_url")
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

  const downloadCert = async (c: Cert) => {
    if (c.file_url) {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(c.file_url, 300);
      if (error || !data?.signedUrl) return toast.error("Could not fetch custom PDF");
      window.open(data.signedUrl, "_blank", "noopener");
      return;
    }
    downloadCertificate({
      recipientName: c.recipient_name ?? "Recipient",
      eventName: c.event_name_snapshot ?? "InteractUp Event",
      code: c.code,
      issuedAt: c.issued_at,
    });
  };

  const del = async (c: Cert) => {
    if (c.file_url) {
      await supabase.storage.from("documents").remove([c.file_url]);
    }
    const { error } = await supabase.from("certificates").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Certificate deleted");
    setConfirmDelete(null);
    qc.invalidateQueries({ queryKey: ["certificates", "list"] });
  };

  const uploadCustom = async (file: File) => {
    if (!uploadTarget) return;
    if (file.type !== "application/pdf") return toast.error("Please choose a PDF file");
    if (file.size > 10 * 1024 * 1024) return toast.error("PDF must be under 10 MB");
    setUploading(true);
    const path = `certificates/${uploadTarget.id}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("documents").upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error: dbErr } = await supabase.from("certificates").update({ file_url: path }).eq("id", uploadTarget.id);
    setUploading(false);
    if (dbErr) return toast.error(dbErr.message);
    toast.success("Custom PDF uploaded — replaces the generated one");
    setUploadTarget(null);
    qc.invalidateQueries({ queryKey: ["certificates", "list"] });
  };

  const clearCustom = async (c: Cert) => {
    if (!c.file_url) return;
    await supabase.storage.from("documents").remove([c.file_url]);
    const { error } = await supabase.from("certificates").update({ file_url: null }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Reverted to system-generated PDF");
    qc.invalidateQueries({ queryKey: ["certificates", "list"] });
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
                <div key={c.id} className="flex items-center gap-2 px-2 py-3">
                  <div className="size-9 rounded-md bg-accent/30 grid place-items-center shrink-0">
                    <Award className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate flex items-center gap-2">
                      {c.recipient_name}
                      {c.file_url && (
                        <span className="text-[10px] font-medium text-green-700 dark:text-green-500 inline-flex items-center gap-1">
                          <FileCheck2 className="size-3" /> custom PDF
                        </span>
                      )}
                    </div>
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
                    <Download className="size-3.5 mr-1.5" /> PDF
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setUploadTarget(c)} title="Upload custom PDF">
                    <Upload className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(c)} title="Delete" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Success dialog */}
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

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete certificate?</DialogTitle>
            <DialogDescription>
              This permanently removes <span className="font-mono">{confirmDelete?.code}</span> for {confirmDelete?.recipient_name}.
              The recipient will no longer be able to verify this code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && del(confirmDelete)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload custom PDF */}
      <Dialog open={!!uploadTarget} onOpenChange={(o) => !o && setUploadTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload custom certificate PDF</DialogTitle>
            <DialogDescription>
              Replaces the system-generated PDF for code <span className="font-mono">{uploadTarget?.code}</span>. Recipients will download this file when they verify.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadCustom(f);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Upload className="size-4 mr-2" />
              {uploading ? "Uploading…" : "Choose PDF"}
            </Button>
            {uploadTarget?.file_url && (
              <Button variant="outline" className="w-full" onClick={() => { clearCustom(uploadTarget); setUploadTarget(null); }}>
                Revert to system-generated PDF
              </Button>
            )}
            <p className="text-[11px] text-muted-foreground">Max 10 MB. PDF only.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
