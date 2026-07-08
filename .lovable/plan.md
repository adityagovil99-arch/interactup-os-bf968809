## Changes

### 1. Add `prize_money` column
Migration: add nullable `prize_money numeric` to `public.events`. Regenerate types.

### 2. Update event form (`src/routes/_authenticated/manage-events.tsx`)
- Remove **Budget** field → replace with **Prize money (₹)** — optional
- Remove **Expected attendees** field (and its card display)
- Update `FormState`, `empty`, `openEdit`, `submit` payload accordingly
- `EventRow` type: drop `budget`/`expected_attendees`, add `prize_money`
- Card display: show "₹X prize pool" when prize_money is set

### 3. Fix "permission denied" on create
The `events` RLS policies are correct (`is_staff(auth.uid())` for INSERT, and your account `adityagovil99@gmail.com` has the `admin` role). The likely trigger of the error is that the current session's JWT was minted before roles existed, or the `is_staff` check is failing silently. Diagnosis + fix:

- Wrap the insert error in `manage-events.tsx` to log the full Postgres error code (`error.code`, `error.details`, `error.hint`) via toast so the actual cause is visible, not just the generic message.
- Ensure the app's Supabase session is fresh by calling `supabase.auth.refreshSession()` once on mount of the manage page (cheap, one-time) so the JWT reflects current claims before RLS evaluation.
- If after that the error persists, it will name the exact failing policy/column and we address it in a follow-up (e.g. a stray NOT NULL default or a missing GRANT edge case).

### 4. Keep legacy columns
Leave `budget` and `expected_attendees` columns in the DB (nullable already) to avoid breaking any existing data — just stop writing to them from the UI.

## Files touched
- `supabase/migrations/<new>.sql` — add `prize_money`
- `src/routes/_authenticated/manage-events.tsx` — form + display updates, better error surfacing, session refresh
- `src/integrations/supabase/types.ts` — regenerated after migration approval