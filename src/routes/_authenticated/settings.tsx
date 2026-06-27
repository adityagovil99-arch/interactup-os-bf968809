import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — InteractUp OS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, roles } = useAuth();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.full_name ?? "");
      setTitle(profile.data.title ?? "");
      setCompany(profile.data.company ?? "");
      setCity(profile.data.city ?? "");
      setCollege(profile.data.college ?? "");
    }
  }, [profile.data]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName, title, company, city, college,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Manage your profile and workspace preferences." />

      <Card className="p-6">
        <h3 className="font-display text-base font-semibold mb-4">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founder" />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>College</Label>
            <Input value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Role: <span className="capitalize font-medium text-foreground">{(roles[0] ?? "member").replace("_", " ")}</span>
          </div>
          <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-base font-semibold mb-4">Appearance</h3>
        <div className="flex items-center gap-2">
          <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
            <Sun className="size-4 mr-2" /> Light
          </Button>
          <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
            <Moon className="size-4 mr-2" /> Dark
          </Button>
        </div>
      </Card>

      {roles.includes("admin") && <CityClubThresholdCard />}
    </div>
  );
}

function CityClubThresholdCard() {
  const qc = useQueryClient();
  const setting = useQuery({
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
  const [value, setValue] = useState<number>(20);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof setting.data === "number") setValue(setting.data);
  }, [setting.data]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        key: "city_club_min_members",
        value: value as unknown as never,
        description: "Minimum committed members required to apply for a city club license",
      });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["setting", "city_club_min_members"] });
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-base font-semibold">City club threshold</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Minimum committed members required for someone to apply to open an InteractUp club in their city.
      </p>
      <div className="flex items-end gap-3 mt-4 max-w-sm">
        <div className="space-y-2 flex-1">
          <Label>Minimum members</Label>
          <Input
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value || "0", 10))}
          />
        </div>
        <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
