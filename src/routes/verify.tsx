import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PublicTopbar } from "@/components/public-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCertificate } from "@/lib/certificate-pdf";
import { getCertificateFileUrl } from "@/lib/certificates.functions";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a certificate — InteractUp" },
      { name: "description", content: "Enter your unique certificate code to verify and download your InteractUp certificate." },
    ],
  }),
  component: VerifyPage,
});

type Cert = {
  id: string;
  code: string;
  recipient_name: string | null;
  event_name_snapshot: string | null;
  issued_at: string;
  event_id: string;
};

function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Cert | null | "notfound">(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    const normalized = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from("certificates")
      .select("id, code, recipient_name, event_name_snapshot, issued_at, event_id")
      .eq("code", normalized)
      .maybeSingle();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setResult(data ?? "notfound");
  };

  const download = () => {
    if (!result || result === "notfound") return;
    downloadCertificate({
      recipientName: result.recipient_name ?? "Recipient",
      eventName: result.event_name_snapshot ?? "InteractUp Event",
      code: result.code,
      issuedAt: result.issued_at,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicTopbar />

      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex size-12 rounded-xl bg-accent text-accent-foreground items-center justify-center mb-4">
            <Award className="size-6" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Verify a certificate</h1>
          <p className="text-muted-foreground mt-2">
            Enter the unique code we sent you to view and download your certificate.
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={lookup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Certificate code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="IUP-XXXX-XXXX"
                className="font-mono uppercase tracking-wider"
                autoComplete="off"
                required
              />
              <p className="text-xs text-muted-foreground">
                Codes look like <span className="font-mono">IUP-A7K9-2BX4</span>.
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? <><Loader2 className="size-4 mr-2 animate-spin" /> Verifying…</> : "Verify"}
            </Button>
          </form>
        </Card>

        {result === "notfound" && (
          <Card className="mt-6 p-6 border-destructive/40 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Certificate not found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Double-check the code. It is case-insensitive but every character matters.
                </p>
              </div>
            </div>
          </Card>
        )}

        {result && result !== "notfound" && (
          <Card className="mt-6 p-6 md:p-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-medium text-green-700 dark:text-green-500 uppercase tracking-wider">
                  Verified
                </div>
                <h2 className="font-display text-2xl font-bold mt-1">{result.recipient_name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  for participation in <span className="font-medium text-foreground">{result.event_name_snapshot}</span>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Issued on</div>
                    <div className="font-medium">{new Date(result.issued_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Code</div>
                    <div className="font-mono font-medium">{result.code}</div>
                  </div>
                </div>
                <Button
                  onClick={download}
                  className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Download className="size-4 mr-2" /> Download PDF
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
