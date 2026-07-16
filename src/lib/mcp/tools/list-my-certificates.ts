import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, errorResult } from "../supabase";

export default defineTool({
  name: "list_my_certificates",
  title: "List my certificates",
  description:
    "List certificates issued to the signed-in InteractUp user (matched by recipient email).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const email = ctx.getUserEmail();
    if (!email) return errorResult("No email on session");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("certificates")
      .select("code, event_name_snapshot, issued_at, file_url")
      .eq("recipient_email", email)
      .order("issued_at", { ascending: false });
    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { certificates: data ?? [] },
    };
  },
});
