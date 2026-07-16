import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, errorResult } from "../supabase";

export default defineTool({
  name: "create_event",
  title: "Create event",
  description:
    "Create a new InteractUp event (competition, meetup, etc.). Requires staff (admin or team_member) role — RLS will reject other callers. Defaults to draft; set publish=true to publish immediately.",
  inputSchema: {
    name: z.string().trim().min(2),
    description: z.string().optional(),
    event_date: z
      .string()
      .optional()
      .describe("ISO date (YYYY-MM-DD). Optional."),
    venue: z.string().optional(),
    prize_money: z.number().nonnegative().optional(),
    publish: z.boolean().default(false),
  },
  annotations: { readOnlyHint: false, destructiveHint: false },
  handler: async ({ name, description, event_date, venue, prize_money, publish }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("events")
      .insert({
        name,
        description: description ?? null,
        event_date: event_date ?? null,
        venue: venue ?? null,
        prize_money: prize_money ?? null,
        status: publish ? "published" : "draft",
        created_by: ctx.getUserId(),
      })
      .select()
      .single();
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: `Event created: ${data.id} (${data.status})` }],
      structuredContent: { event: data },
    };
  },
});
