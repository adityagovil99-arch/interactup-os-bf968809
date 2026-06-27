import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { inviteUser } from "@/lib/users.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — InteractUp OS" }] }),
  component: UsersPage,
});

type RoleRow = { user_id: string; role: "admin" | "team_member" | "member" };

function UsersPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const invite = useServerFn(inviteUser);

  const profiles = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const [{ data: ps }, { data: rs }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, title, status, join_date").order("join_date", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const byUser = new Map<string, string[]>();
      (rs as RoleRow[] | null ?? []).forEach((r) => {
        const list = byUser.get(r.user_id) ?? [];
        list.push(r.role);
        byUser.set(r.user_id, list);
      });
      return (ps ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
    },
  });

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "team_member" | "member">("member");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Users" />
        <Card className="p-6 text-sm text-muted-foreground">Admin access required.</Card>
      </div>
    );
  }

  const onCreate = async () => {
    setSubmitting(true);
    try {
      await invite({ data: { email, full_name: name, role, password } });
      toast.success(`Created ${email}`);
      setOpen(false);
      setEmail(""); setName(""); setPassword(""); setRole("member");
      qc.invalidateQueries({ queryKey: ["users-list"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & roles"
        description="Create members and team accounts. Public sign-up is disabled."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="size-4 mr-2" /> New user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
                <DialogDescription>They'll sign in with this email + temporary password.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Temporary password</Label><Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 chars" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={onCreate} disabled={submitting || !email || !name || password.length < 8}>
                  {submitting ? "Creating…" : "Create user"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(profiles.data ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.length === 0 && <span className="text-muted-foreground">—</span>}
                      {u.roles.map((r) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-[10px] capitalize">
                          {r === "admin" && <ShieldCheck className="size-3 mr-1" />}
                          {r.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.join_date?.slice(0, 10)}</td>
                </tr>
              ))}
              {profiles.data && profiles.data.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
