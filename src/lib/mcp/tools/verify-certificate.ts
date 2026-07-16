import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, errorResult } from "../supabase";

export default defineTool({
  name: "verify_certificate",
  title: "Verify certificate",
  description:
    "Look up an InteractUp certificate by its unique code (format like IUP-XXXX-XXXX) and return the recipient, event, and issue date.",
  inputSchema: {
    code: z
      .string()
      .trim()
      .min(3)
      .describe("The certificate code printed on the certificate."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ code }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const normalized = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from("certificates")
      .select("code, event_name_snapshot, recipient_name, recipient_email, issued_at, file_url")
      .eq("code", normalized)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult(`No certificate found for code ${normalized}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { certificate: data },
    };
  },
});
