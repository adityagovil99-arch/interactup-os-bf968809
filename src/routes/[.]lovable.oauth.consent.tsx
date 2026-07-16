import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Minimal typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthClient = { name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: Error | null }>;
};
const oauth = () =>
  (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: session lives in localStorage; SSR would see no user.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen grid place-items-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Authorization error</CardTitle>
          <CardDescription>Could not load this authorization request.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </CardContent>
      </Card>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as AuthorizationDetails | null;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauth();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Connect {clientName} to InteractUp</CardTitle>
          <CardDescription>
            This lets {clientName} use InteractUp OS as you. It respects your role and
            the app's access policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {details?.scope && (
            <div className="text-xs text-muted-foreground">
              Requested access: <span className="font-mono">{details.scope}</span>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              disabled={busy}
              onClick={() => decide(true)}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {busy ? "Working…" : "Approve"}
            </Button>
            <Button disabled={busy} variant="outline" onClick={() => decide(false)} className="flex-1">
              Deny
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
