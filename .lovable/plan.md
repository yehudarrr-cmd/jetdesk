## Add Travel Requirements Search Engine

Port the AI-powered travel requirements search from the Passport Pal project into a new dedicated page on the GoldTus site, plus a prominent CTA on the landing page.

### What to copy from Passport Pal

1. **Edge function** → `supabase/functions/get-travel-requirements/index.ts`
   - Uses Lovable AI Gateway (`google/gemini-2.5-flash`) with tool-calling for structured JSON.
   - No external API key needed — `LOVABLE_API_KEY` already configured in this project.
   - Returns Hebrew travel requirements (passport validity, visa type, summary, documents list).
   - Add `[functions.get-travel-requirements] verify_jwt = false` to `supabase/config.toml` so it's publicly callable.

2. **Data file** → `src/data/travelRequirements.ts`
   - Copy types `DocumentRequirement`, `TravelRequirements`.
   - Copy `countries` array (~196 countries with flag emojis, Hebrew labels) + sorted exports `nationalities` and `destinations`.
   - Skip the unused static `requirementsDb` and `_unused`/`getDefaultRequirements` (legacy fallback, not used).

3. **Components** → `src/components/`
   - `TravelSearchForm.tsx` — two-select form (lאום + יעד). Adapt: replace `bg-gradient-navy` and `focus:ring-gold` with project tokens (`gradient-primary`, `focus:ring-primary`).
   - `RequirementsResults.tsx` — renders summary cards + grouped required/recommended document cards with source links. Adapt color tokens (`text-gold` → `text-primary`, `text-navy-light` → `text-primary`, `font-serif` → default).

### New page

Create `src/routes/travel-requirements.tsx`:
- TanStack Start file route with proper `head()` metadata (title, description, og:title/description in Hebrew).
- Page layout: hero header → `TravelSearchForm` → loading state → `RequirementsResults`.
- Calls the edge function via `supabase.functions.invoke('get-travel-requirements', { body: { nationality, destination, nationalityLabel, destinationLabel } })`.
- Handles errors (429 rate limit, 402 credits, generic) with `toast` from `sonner`.
- RTL layout to match the rest of the site.

### Landing page CTA

Edit `src/components/LandingPage.tsx`:
- Add a prominent CTA section (or button in hero) with gradient + glow styling similar to the existing insurance CTA, linking to `/travel-requirements`.
- Hebrew copy: e.g. "בדקו דרישות ויזה ומסמכים ליעד שלכם" with a "התחילו עכשיו" button.
- Use the same `animate-pulse-slow` + `gradient-primary` treatment so it stands out.

### Technical notes

- The edge function deploys automatically; no manual step needed.
- The browser client (`@/integrations/supabase/client`) is used to invoke the function — it works without auth thanks to `verify_jwt = false`.
- Style adaptation: Passport Pal uses navy/gold tokens that don't exist here. Map to existing tokens (`primary`, `accent`, `muted`) so it inherits the GoldTus visual identity.
- All text remains in Hebrew with `dir="rtl"`.

### Files to be created/edited

- `supabase/functions/get-travel-requirements/index.ts` (new)
- `supabase/config.toml` (add function block)
- `src/data/travelRequirements.ts` (new — types + countries only)
- `src/components/TravelSearchForm.tsx` (new, adapted styling)
- `src/components/RequirementsResults.tsx` (new, adapted styling)
- `src/routes/travel-requirements.tsx` (new)
- `src/components/LandingPage.tsx` (add CTA linking to new route)
