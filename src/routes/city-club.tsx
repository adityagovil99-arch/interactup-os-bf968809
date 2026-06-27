import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PublicTopbar } from "@/components/public-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/city-club")({
  head: () => ({
    meta: [
      { title: "Start a city club — InteractUp" },
      { name: "description", content: "Bring InteractUp to your city. Apply for a city chapter license once you have committed members." },
    ],
  }),
  component: CityClubPage,
});

function CityClubPage() {
  const { user } = useAuth();
  const threshold = useQuery({
    queryKey: ["setting", "city_club_min_members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "city_club_min_members")
        .maybeSingle();
      const v = data?.value as number | string | undefined;
      return typeof v === "number" ? v : parseInt(String(v ?? 20), 10) || 20;
    },
  });
  const minMembers = threshold.data ?? 20;

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    city: "",
    country: "India",
    committed_members: minMembers,
    motivation: "",
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        applicant_email: f.applicant_email || user.email || "",
        applicant_name: f.applicant_name || (user.user_metadata?.full_name as string) || "",
      }));
    }
  }, [user]);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.committed_members < minMembers) {
      toast.error(`You need at least ${minMembers} committed members to apply.`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("city_club_applications").insert({
      applicant_user_id: user?.id ?? null,
      applicant_name: form.applicant_name,
      applicant_email: form.applicant_email,
      applicant_phone: form.applicant_phone || null,
      city: form.city,
      country: form.country || null,
      committed_members: form.committed_members,
      motivation: form.motivation || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicTopbar />

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex size-12 rounded-xl bg-accent text-accent-foreground items-center justify-center mb-4">
            <MapPin className="size-6" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Open an InteractUp city club</h1>
          <p className="text-muted-foreground mt-2">
            Lead the MBA community in your city. Apply for a chapter license.
          </p>
        </div>

        <Card className="p-5 mb-6 bg-accent/15 border-accent/30">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-accent-foreground/80 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">One requirement to qualify:</p>
              <p className="text-muted-foreground mt-1">
                You need at least <span className="font-semibold text-foreground">{minMembers} committed members</span> in
                your city to receive an InteractUp club license.
              </p>
            </div>
          </div>
        </Card>

        {done ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="size-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold">Application received</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Our team will review and get back to you at <span className="font-medium text-foreground">{form.applicant_email}</span>.
            </p>
            <Link to="/" className="inline-block mt-5">
              <Button variant="outline">Back to home</Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 md:p-8">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your name</Label>
                  <Input required value={form.applicant_name} onChange={(e) => update("applicant_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={form.applicant_email} onChange={(e) => update("applicant_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.applicant_phone} onChange={(e) => update("applicant_phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Committed members</Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={form.committed_members}
                    onChange={(e) => update("committed_members", parseInt(e.target.value || "0", 10))}
                  />
                  <p className="text-[11px] text-muted-foreground">Minimum {minMembers}.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Why do you want to lead this chapter?</Label>
                <Textarea
                  rows={4}
                  value={form.motivation}
                  onChange={(e) => update("motivation", e.target.value)}
                  placeholder="Your vision for the club, your background, and how you'll grow it…"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
