# InteractUp OS — Build Plan

Production-ready SaaS for managing the InteractUp MBA community: sponsor CRM, events, members, mentors, internships, marketing, certificates, documents, analytics — backed by Postgres, Auth, Storage, and an AI assistant that reads your internal data.

Stack: React + TanStack Start + TypeScript + Tailwind + shadcn/ui + Lovable Cloud (Supabase under the hood) + Lovable AI Gateway (Gemini).

---

## Design system (applies to every phase)

- Minimalist white/gray UI, black text, **light-yellow** accent (~`#FFE94A`) for primary buttons, active nav, highlights, KPI deltas.
- Dark mode toggle (topbar + Settings), persisted; same yellow accent on near-black.
- Typography: Inter body + tighter display face for headings. 1px hairlines, soft shadows, generous whitespace — Notion / Linear / Apple feel.
- Smooth transitions: sidebar collapse, modal/drawer open, Kanban drag, page fade.
- All tokens in `src/styles.css`. No hardcoded colors in components. Shadcn variants customized (e.g. `Button variant="accent"`).
- Fully responsive: sidebar collapses to icon rail < md, becomes off-canvas sheet on mobile; tables horizontally scroll.

---

## Phase 1 — Foundation (first execution)

1. Enable Lovable Cloud + provision `LOVABLE_API_KEY`.
2. Design tokens, theme provider, dark mode.
3. App shell: collapsible sidebar with all 14 sections, topbar (search, theme toggle, user menu), `_authenticated` layout.
4. Auth: email/password login at `/auth`. **No public signup.** Sign-out hygiene.
5. Roles: `app_role` enum (`admin`, `team_member`, `member`), `user_roles` table, `has_role()` security-definer fn, `profiles` table + auto-create trigger.
6. **Full schema** (all 17 tables) with RLS + GRANTs:
   `profiles, user_roles, companies, contacts, sponsors, proposals, events, event_sponsors, tasks, internships, internship_interests, mentors, mentor_assignments, posts, certificates, documents, email_templates, linkedin_templates, whatsapp_templates`.
   - Admin/TeamMember write everywhere; Members read community-visible data and write their own interest/profile.
   - Polymorphic `tasks.related_type` ('event' | 'sponsor') + `related_id`.
7. **Dashboard**: KPI cards (Total Sponsors, Total Raised, Upcoming Events, Active Members, Pending Tasks), "Good morning, {name}" agenda with top 5 due tasks, pipeline bar chart (sponsors by status), membership growth line chart.
8. **Settings**: profile, theme, workspace logo upload to Storage.
9. **Admin → Users** screen: Admin/TeamMember create Member or TeamMember accounts (server fn with `supabaseAdmin`, gated by `has_role(admin|team_member)`).
10. Bootstrap: you sign up once, I promote you to `admin` via SQL.

## Phase 2 — Sponsor pipeline & companies

- **Sponsors Kanban** (9 columns) with `@dnd-kit` drag-and-drop; status persists on drop. Add/edit drawer (company, tier, expected amount, contact, next follow-up, notes).
- **Companies** list + profile view (Industry, HQ, Overview, Target Audience, CSR Focus, Recent News, Notes, paste-research box, contacts list, related sponsors).
- **Contacts** nested under company.

## Phase 3 — Events, Tasks, Proposals

- **Events** CRUD + detail (sponsors many-to-many, judges field, budget, tasks list, "Add Task").
- **Tasks** with polymorphic relations, due dates, assignee, status.
- **Proposal Generator** wizard: select event + sponsor + tier + budget + asks → HTML proposal rendered with branding → PDF via `pdf-lib` → stored in Documents (Storage) → matching email draft pre-filled.

## Phase 4 — Outreach & Marketing Studio

- Email / LinkedIn / WhatsApp **template** CRUD with variable preview (`{{member_name}}`, `{{event_name}}`, `{{amount}}`).
- **Marketing Studio**: rich-text editor (Tiptap), AI draft buttons (LinkedIn / Instagram / Email blast) via Lovable AI Gateway (`google/gemini-3-flash-preview`), save to `posts` with channel + scheduled_at.

## Phase 5 — Community, Mentors, Internships

- **Community** directory: filter/search by name, role, company, status, tags; bulk tag as Mentor.
- **Mentors** list + assign mentees UI.
- **Internships** table; Member "I'm Interested" toggle via `internship_interests` join.

## Phase 6 — Certificates, Documents, Templates, Analytics

- **Documents**: upload/list/download (Storage), filter by docType, sponsor, event.
- **Templates**: Offer Letter, NDA, MoU, Invoice — upload base file + variable map, generate filled doc.
- **Certificates**: select event + member → PDF (pdf-lib) with InteractUp branding → stored in Documents + `certificates` row.
- **Analytics**: pipeline totals + conversion rate, revenue by event, member growth, mentor stats, tasks completed, email open rates (placeholder).

## Phase 7 — AI Assistant (InteractUp Copilot)

- Floating chat panel available across the app.
- Server-side agent (`createServerFn` + AI Gateway, tool-calling) with read-only tools over `sponsors`, `companies`, `events`, `tasks`, `members`, `internships`, `mentors`. Scoped to caller's role via `requireSupabaseAuth`.
- Persistent conversation memory (`ai_conversations`, `ai_messages` tables); full history sent on each call; markdown rendering.
- Example queries: "Which sponsors haven't been followed up in 14 days?", "Draft an outreach email to Deloitte for the Case Comp", "Show top 5 mentors by mentee count".
- No web search.

---

## Technical notes

- Server boundary: TanStack `createServerFn` + `requireSupabaseAuth` for app-internal writes; `supabaseAdmin` only inside admin-gated functions (user creation, role grants).
- Routes: public `/auth`; everything else under `src/routes/_authenticated/*` (integration-managed gate).
- Charts: Recharts. Drag-and-drop: `@dnd-kit`. PDF: `pdf-lib`. Editor: Tiptap.
- No Edge Functions; no public signup route.

## What I need from you to start Phase 1

1. **Yellow accent** — `#FFE94A` (bright lemon) good, or a different shade?
2. **First admin email** — the account you'll log in with so I can promote it to `admin`.

Reply **"go"** with those two and I'll execute Phase 1 end-to-end. Tell me if you want to review between phases or just keep shipping straight through.