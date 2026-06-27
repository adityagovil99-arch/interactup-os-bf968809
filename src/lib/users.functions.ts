import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InviteInput = z.object({
  email: z.string().email().max(255),
  full_name: z.string().trim().min(1).max(120),
  role: z.enum(["admin", "team_member", "member"]),
  password: z.string().min(8).max(128),
});

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InviteInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Authorize: caller must be admin or team_member
    const { data: rolesRows, error: roleErr } = await supabase
      .from("user_roles").select("role").eq("user_id", userId);
    if (roleErr) throw new Error(roleErr.message);
    const callerRoles = (rolesRows ?? []).map((r) => r.role as string);
    const isStaff = callerRoles.includes("admin") || callerRoles.includes("team_member");
    if (!isStaff) throw new Error("Forbidden: staff only");
    // Only admin can create admin/team_member
    if ((data.role === "admin" || data.role === "team_member") && !callerRoles.includes("admin")) {
      throw new Error("Forbidden: only admin can create staff accounts");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, role: data.role },
    });
    if (error) throw new Error(error.message);
    const newId = created.user?.id;
    if (!newId) throw new Error("Failed to create user");

    // Ensure role row matches requested role (trigger uses metadata but be explicit)
    await supabaseAdmin.from("user_roles").upsert({ user_id: newId, role: data.role }, { onConflict: "user_id,role" });
    return { ok: true, user_id: newId };
  });

const RoleInput = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "team_member", "member"]),
  grant: z.boolean(),
});

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RoleInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rolesRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!(rolesRows ?? []).some((r) => r.role === "admin")) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      await supabaseAdmin.from("user_roles").upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    }
    return { ok: true };
  });
