import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PublicTopbar } from "@/components/public-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & competitions — InteractUp" },
      { name: "description", content: "Browse and register for InteractUp case competitions, workshops, and signature MBA events." },
    ],
  }),
  component: EventsPage,
});

type EventRow = {
  id: string;
  name: string;
  event_date: string | null;
  venue: string | null;
  description: string | null;
  expected_attendees: number | null;
};

function EventsPage() {
  const { user } = useAuth();
  const events = useQuery({
    queryKey: ["public", "events", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, event_date, venue, description, expected_attendees")
        .order("event_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as EventRow[];
    },
  });

  const [selected, setSelected] = useState<EventRow | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicTopbar />

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Events & competitions</h1>
          <p className="text-muted-foreground mt-2">Register for upcoming InteractUp events.</p>
        </div>

        {events.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading events…</div>
        ) : events.data && events.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.data.map((ev) => (
              <Card key={ev.id} className="p-5 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date TBA"}
                </div>
                <h3 className="font-display font-semibold mt-2 line-clamp-2">{ev.name}</h3>
                {ev.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="size-3" /> {ev.venue}
                  </div>
                )}
                {ev.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{ev.description}</p>}
                {ev.expected_attendees && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Users className="size-3" /> {ev.expected_attendees}+ expected
                  </div>
                )}
                <div className="flex-1" />
                <Button
                  onClick={() => setSelected(ev)}
                  className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Register
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-muted-foreground">
            No events listed yet. Check back soon.
          </Card>
        )}

        {!user && (
          <Card className="mt-8 p-5 text-sm bg-card/60">
            <span className="text-muted-foreground">
              You'll need an account to register.{" "}
              <Link to="/auth" className="underline font-medium text-foreground">Sign up or sign in</Link>.
            </span>
          </Card>
        )}
      </div>

      <RegisterDialog event={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}

function RegisterDialog({
  event, onOpenChange,
}: {
  event: EventRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // prefill from logged-in user
  const ensurePrefill = () => {
    if (user && !email) {
      setEmail(user.email ?? "");
      setFullName((user.user_metadata?.full_name as string) ?? "");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!user) {
      toast.error("Please sign in to register.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user.id,
      full_name: fullName,
      email,
      phone: phone || null,
      notes: notes || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("You're already registered for this event with this email.");
      else toast.error(error.message);
      return;
    }
    setDone(true);
    qc.invalidateQueries({ queryKey: ["event_registrations"] });
  };

  const handleOpen = (open: boolean) => {
    if (open) {
      ensurePrefill();
      setDone(false);
    } else {
      setFullName(""); setEmail(""); setPhone(""); setNotes(""); setDone(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={!!event} onOpenChange={handleOpen}>
      <DialogContent>
        {event && !done && (
          <>
            <DialogHeader>
              <DialogTitle>Register for {event.name}</DialogTitle>
              <DialogDescription>
                {event.event_date ? new Date(event.event_date).toLocaleDateString() : "Date TBA"}
                {event.venue ? ` · ${event.venue}` : ""}
              </DialogDescription>
            </DialogHeader>
            {!user ? (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  Create a free InteractUp account to register for events.
                </p>
                <Link to="/auth">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Sign up / sign in
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Anything we should know? (optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {submitting ? "Submitting…" : "Confirm registration"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </>
        )}
        {done && (
          <div className="py-4 text-center">
            <CheckCircle2 className="size-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold">You're registered!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We'll be in touch with event details. See you there.
            </p>
            <Button onClick={() => handleOpen(false)} className="mt-5">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
