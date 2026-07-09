import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CodeInput = z.object({ code: z.string().trim().min(1).max(64) });

/**
 * Public server fn: given a certificate code, returns a signed download URL
 * for the custom-uploaded PDF (if any). Returns { url: null } when the cert
 * uses the auto-generated PDF (client-side jsPDF handles that).
 */
export const getCertificateFileUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CodeInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.toUpperCase();
    const { data: cert, error } = await supabaseAdmin
      .from("certificates")
      .select("file_url")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!cert || !cert.file_url) return { url: null as string | null };

    // file_url stores a storage path like "certificates/<id>.pdf" in the documents bucket.
    const path = cert.file_url;
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("documents").createSignedUrl(path, 60 * 10);
    if (sErr) throw new Error(sErr.message);
    return { url: signed?.signedUrl ?? null };
  });
