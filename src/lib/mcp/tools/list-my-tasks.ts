import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, errorResult } from "../supabase";

export default defineTool({
  name: "list_my_tasks",
  title: "List my tasks",
  description: "List open tasks assigned to the signed-in InteractUp user.",
  inputSchema: {
    include_done: z.boolean().default(false),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ include_done, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("tasks")
      .select("id, title, description, due_date, status, related_type, related_id")
      .eq("assigned_to", ctx.getUserId())
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(limit);
    if (!include_done) q = q.neq("status", "done");
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tasks: data ?? [] },
    };
  },
});
