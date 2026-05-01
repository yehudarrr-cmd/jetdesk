## Goal

Replace the current centered/floating logo + stacked hero with the exact layout you specified: small logo pinned top-right, full-bleed background with dark overlay, and a strict 2-column hero (text on the right at 60%, form card on the left at 40%).

## Changes — `src/components/LandingPage.tsx` only

### 1. Header bar (logo top-right)

Add a fixed-position header at the top of the hero section:

- Absolute positioned, `top-0 right-0`, with `pt-5 pr-5 sm:pt-6 sm:pr-8` margin from edge
- Logo height locked to ~50px (`h-12`, ~48px) using `h-auto w-auto max-h-12`
- No background, no card, no halo — transparent PNG only
- Keep a very soft `drop-shadow` so it stays legible on the image, but remove the large blurred gold halo div
- Remove the `animate-float-soft` (floating logo distracts from header chrome); keep a subtle `animate-fade-in-down`
- Logo is NOT centered and NOT inside the grid

### 2. Background

- Keep `heroImage` as full-bleed `object-cover`
- Replace the current two-layer gradient with a single solid dark overlay at ~60% opacity (`bg-black/60`) plus a subtle bottom fade for legibility — readable text everywhere, no patchy banding

### 3. Hero grid — strict 60/40 split

Change the grid from `lg:grid-cols-2` (50/50) to `lg:grid-cols-5`:

- Right column (RTL first, 60%): `lg:col-span-3` — headline, subheadline, features line
- Left column (40%): `lg:col-span-2` — form card, vertically centered (`self-center`)
- Mobile: stack as today (text first, then form), but keep the spec's mobile-first ordering: headline → subheadline → features → form
- Increase gap to `gap-8 lg:gap-14` for premium spacing
- Hero section uses `min-h-[100svh]` and the grid is vertically centered inside it (`items-center`), with top padding that clears the 50px header (`pt-24 sm:pt-28`)

### 4. Right column content (text, RTL right-aligned)

- Small badge "מבית אמירים טורס" (kept)
- Headline: "טיסות וחופשות פרימיום בהתאמה אישית" — gold gradient on the second line as today
- Subheadline: existing one-liner
- Features line: small inline row of 3 icon+text pairs (Plane / ShieldCheck / Crown) with gold icons — replaces the current trust strip, always visible (also on mobile)
- All text `text-right` on desktop, `text-center` on mobile

### 5. Left column — form card

- Keep existing `handleQuickQuote` logic and fields unchanged
- Card styling refined to match spec: `bg-black/55 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-elegant`
- `self-center` so it sits vertically centered relative to the right column
- No content changes inside the form

### 6. Cleanup

- Remove the standalone centered logo block (lines ~189–213) — logo now lives only in the header
- No changes to About / Services / Why Us / detailed lead form sections below the hero
- No CSS changes needed (`animate-fade-in-down` already exists in `src/styles.css`)

## Files touched

- `src/components/LandingPage.tsx` (hero section restructure only)

## QA after build

I'll screenshot at the current 571×853 mobile viewport and at desktop width to verify:
- Logo sits top-right, ~50px, transparent, with clean margin
- Right column text is ~60% width on desktop, form card is ~40%
- Form card vertically centered, no overlap with text or logo
- Background image visible but text fully readable
- Mobile: header logo top-right, text block, then form — no horizontal scroll
