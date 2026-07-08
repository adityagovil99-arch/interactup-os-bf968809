import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Plus, Pencil, Trash2, Lock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/manage-events")({
  head: () => ({ meta: [{ title: "Manage Events — InteractUp OS" }] }),
  component: ManageEventsPage,
});

type EventRow = {
  id: string;
  name: string;
  event_date: string | null;
  venue: string | null;
  description: string | null;
  prize_money: number | null;
};

type FormState = {
  name: string;
  event_date: string;
  venue: string;
  description: string;
  prize_money: string;
};

const empty: FormState = {
  name: "", event_date: "", venue: "", description: "", prize_money: "",
};

function ManageEventsPage() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Ensure session/JWT is fresh so RLS `is_staff(auth.uid())` evaluates against current claims.
  useEffect(() => { void supabase.auth.refreshSession(); }, []);

  const events = useQuery({
    queryKey: ["events", "manage-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, event_date, venue, description, prize_money")
        .order("event_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as EventRow[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    const list = events.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const q = search.toLowerCase();
    return list.filter((ev) => {
      if (filter === "upcoming" && (!ev.event_date || ev.event_date < today)) return false;
      if (filter === "past" && (!ev.event_date || ev.event_date >= today)) return false;
      if (!q) return true;
      return (
        ev.name.toLowerCase().includes(q) ||
        (ev.venue ?? "").toLowerCase().includes(q) ||
        (ev.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [events.data, search, filter]);

  if (!isStaff) {
    return (
      <Card className="p-8 text-center">
        <Lock className="size-8 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold">Admin only</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Event management is restricted to staff.
        </p>
      </Card>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (ev: EventRow) => {
    setEditing(ev);
    setForm({
      name: ev.name,
      event_date: ev.event_date ?? "",
      venue: ev.venue ?? "",
      description: ev.description ?? "",
      prize_money: ev.prize_money?.toString() ?? "",
    });
    setDialogOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Event name required.");
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      event_date: form.event_date || null,
      venue: form.venue.trim() || null,
      description: form.description.trim() || null,
      prize_money: form.prize_money ? Number(form.prize_money) : null,
    };
    const { error } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    setSubmitting(false);
    if (error) {
      console.error("[events] save failed", error);
      return toast.error(
        `${error.message}${error.code ? ` (code ${error.code})` : ""}${error.hint ? ` — ${error.hint}` : ""}`,
      );
    }
    toast.success(editing ? "Event updated" : "Event created");
    setDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["events"] });
    qc.invalidateQueries({ queryKey: ["public", "events"] });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("events").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Event deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["events"] });
    qc.invalidateQueries({ queryKey: ["public", "events"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Events"
        description="Add, edit, and archive events, competitions, and meetups — past or upcoming."
        actions={
          <Button onClick={openCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="size-4 mr-1.5" /> New event
          </Button>
        }
      />

      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {(["all", "upcoming", "past"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition ${
                filter === k ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </Card>

      {events.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No events match. Create one to get started.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ev) => {
            const isPast = ev.event_date && ev.event_date < new Date().toISOString().slice(0, 10);
            return (
              <Card key={ev.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    {ev.event_date
                      ? new Date(ev.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Date TBA"}
                  </div>
                  {isPast && (
                    <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Past
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold mt-2 line-clamp-2">{ev.name}</h3>
                {ev.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="size-3" /> {ev.venue}
                  </div>
                )}
                {ev.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{ev.description}</p>}
                {ev.prize_money != null && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Users className="size-3" /> ₹{Number(ev.prize_money).toLocaleString("en-IN")} prize pool
                  </div>
                )}
                <div className="flex-1" />
                <div className="flex gap-2 mt-5">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(ev)}>
                    <Pencil className="size-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(ev.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
            <DialogDescription>
              Add a competition, workshop, or meetup — set any past or future date.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. InteractUp Case Championship 2026" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="City, or 'Online'" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this event about?" />
            </div>
            <div className="space-y-2">
              <Label>Prize money (₹) <span className="text-muted-foreground font-normal">— optional</span></Label>
              <Input type="number" min="0" step="0.01" value={form.prize_money} onChange={(e) => setForm({ ...form, prize_money: e.target.value })} placeholder="e.g. 50000" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {submitting ? "Saving…" : editing ? "Save changes" : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes registrations, certificates, and sponsors linked to it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
