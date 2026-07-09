import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ResearchInput = z.object({
  focus: z.string().trim().max(500).optional(),
});

type GrantSuggestion = {
  title: string;
  organization?: string;
  country?: string;
  region?: string;
  amount?: string;
  currency?: string;
  deadline?: string;
  eligibility?: string;
  alignment?: string;
  strategy?: string[];
  application_url?: string;
  source_url?: string;
  tags?: string[];
};

const SYSTEM_PROMPT = `You are a grants research analyst for InteractUp — a non-profit MBA & youth community platform based in India. InteractUp runs case competitions, mentorship, city chapters, a Department of Social Justice (help-line for exploited workers/students), skill workshops, and campus-to-career programs. Vision: empower Indian youth, promote social justice, and build an inclusive management-education community.

Your job: surface real, well-known grants, fellowships, seed funds, foundation programs, CSR RFPs, and government schemes (India + international) that a small registered non-profit like InteractUp could realistically apply for at zero cost. Prefer programs that recur annually and are publicly known. Be honest — do NOT fabricate URLs; if unsure of exact link, leave application_url blank and set source_url to the funder's homepage.

For each grant, produce a concrete zero-budget strategy: how to position InteractUp, what proof/impact data to prepare, which stakeholders to loop in, and the sequential steps to submit a winning application without paying anyone.`;

const USER_PROMPT_TEMPLATE = (focus: string) => `Return 8-12 grant opportunities as a strict JSON object matching this schema:
{
  "grants": [{
    "title": string,
    "organization": string,
    "country": string,
    "region": "India" | "Asia" | "Global" | "US" | "Europe" | other,
    "amount": string,        // e.g. "USD 25,000" or "INR 5-10 lakh" or "Unrestricted"
    "currency": string,
    "deadline": string,      // month + typical cycle, e.g. "Rolling", "Annually in March"
    "eligibility": string,   // 1-2 sentences
    "alignment": string,     // 1-2 sentences on why this fits InteractUp
    "strategy": string[],    // 4-7 concrete zero-budget steps, in order
    "application_url": string,
    "source_url": string,
    "tags": string[]
  }]
}

Mix across: (a) Indian government/CSR schemes, (b) Indian foundations (Tata Trusts, Azim Premji, Rohini Nilekani, ACT Grants, EdelGive), (c) international foundations open to Indian NGOs (Ford, MacArthur, Open Society, Ashoka, Echoing Green, DRK), (d) student/youth-org grants (Resolution Project, Davis Projects for Peace), (e) education/skilling funds.

${focus ? `Extra focus from the team: ${focus}` : ""}

Return ONLY the JSON object, no prose.`;

export const researchGrants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rolesRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const staff = (rolesRows ?? []).some((r) => r.role === "admin" || r.role === "team_member");
    if (!staff) throw new Error("Forbidden: staff only");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT_TEMPLATE(data.focus ?? "") },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached. Try again in a minute.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace billing.");
      throw new Error(`AI research failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { grants?: GrantSuggestion[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    const grants = Array.isArray(parsed.grants) ? parsed.grants : [];
    if (grants.length === 0) throw new Error("AI returned no grants. Try a more specific focus.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = grants.slice(0, 15).map((g) => ({
      title: (g.title ?? "Untitled grant").slice(0, 300),
      organization: g.organization ?? null,
      country: g.country ?? null,
      region: g.region ?? null,
      amount: g.amount ?? null,
      currency: g.currency ?? null,
      deadline: g.deadline ?? null,
      eligibility: g.eligibility ?? null,
      alignment: g.alignment ?? null,
      strategy: Array.isArray(g.strategy) ? g.strategy : [],
      application_url: g.application_url ?? null,
      source_url: g.source_url ?? null,
      tags: Array.isArray(g.tags) ? g.tags.slice(0, 8) : [],
      status: "researching" as const,
      ai_generated: true,
      created_by: userId,
    }));
    const { error } = await supabaseAdmin.from("grants").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, added: rows.length };
  });
