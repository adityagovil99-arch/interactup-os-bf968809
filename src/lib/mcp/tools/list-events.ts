import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, errorResult } from "../supabase";

export default defineTool({
  name: "list_events",
  title: "List events",
  description:
    "List InteractUp events (competitions, meetups). Filter by upcoming/past and optionally include draft events (staff only see drafts).",
  inputSchema: {
    scope: z
      .enum(["upcoming", "past", "all"])
      .default("upcoming")
      .describe("Which events to return."),
    limit: z.number().int().min(1).max(50).default(10),
    include_drafts: z
      .boolean()
      .default(false)
      .describe("Include draft events. Only visible to staff via RLS."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ scope, limit, include_drafts }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const today = new Date().toISOString().slice(0, 10);
    let q = supabase
      .from("events")
      .select("id, name, description, event_date, venue, prize_money, status")
      .limit(limit);
    if (!include_drafts) q = q.eq("status", "published");
    if (scope === "upcoming") q = q.gte("event_date", today).order("event_date", { ascending: true });
    else if (scope === "past") q = q.lt("event_date", today).order("event_date", { ascending: false });
    else q = q.order("event_date", { ascending: false });

    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
