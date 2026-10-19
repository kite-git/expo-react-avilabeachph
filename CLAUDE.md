@AGENTS.md

# Avila Beach PH finance app

Expo SDK 58 / React Native app for one resort owner to track cash in, expenses, balance, and monthly reports. Product facts live in `PRODUCT.md`.

## Product decisions
- One user: the owner, on their own phone. One Supabase email/password account, no sign-up screen, no roles.
- iOS and Android share one custom look. The yellow-brown theme is the owner's choice; keep it.
- The database starts empty except seeded categories and payment methods (`supabase/schema.sql`). Categories, payment methods, and the resort profile (incl. opening balance) are edited in the Supabase dashboard, not in-app.
- Tabs: Overview, Activity, center +, Reports, Settings. + opens a menu: Cash in / Add expense. Tapping an entry opens it for edit/delete.
- Reports export the selected month as CSV or PDF via the share sheet.
- Entries can be backdated (Today, Yesterday, or a picked date; no future dates). Activity is a SectionList grouped by day; every tab pulls to refresh.
- Not built yet: receipt photos, realtime sync, notifications (Settings switches are preview only).

## Supabase
- Only the publishable key goes in the app: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`. Never add a secret key or DB password.
- RLS is on for every table; `transactions` rows are limited to `user_id = auth.uid()`.
- Keep `supabase/schema.sql` in the repo; it is the only script that recreates the database.
- `.gitignore` covers `.env`.

## UI rules
- Apply the taste skill (`taste-skill:taste-skill`) to UI work here.
- Colors only from tokens in `src/theme.ts` (light + dark). Radius rule is documented there.
- No em or en dashes in visible text. Labels above inputs, errors below.
- Sign-in uses the "Horizon" layout: brown sky panel, gold horizon line, form below.

## Tooling quirks
- `npx expo install` fails on a react-dom peer conflict (Expo pins react 19.3.0); add `-- --legacy-peer-deps`.
- `npx expo lint` is blocked by the same conflict, so lint is not set up.
- Self-checks: `node src/money.check.mts` and `node src/format.check.mts` (excluded from tsc).
- Verify with `npx tsc --noEmit`, `npx expo-doctor`, and `npx expo export --platform ios`.
