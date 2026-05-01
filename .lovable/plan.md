## Problem

The logo file `src/assets/goldtus-logo.png` is **1254×1254 with no alpha channel** — it has a solid (black) square baked into the PNG. That's why it looks like a sticker no matter how we style it. CSS `drop-shadow` and removing wrapper boxes can't fix a non-transparent source image.

We need to (1) make the logo truly transparent, and (2) restyle its placement so it integrates with the hero.

## Plan

### 1. Create a transparent version of the logo

Run a one-shot ImageMagick script to:
- Remove the dark background (color-key the near-black pixels to transparent with fuzz tolerance)
- Trim surrounding empty space so the logo bbox = the artwork
- Save as `src/assets/goldtus-logo-transparent.png`

If the auto background-removal looks imperfect (e.g. halos around gold strokes), I'll iterate on the fuzz % and feather edges. I'll QA by rendering the output on a dark background before swapping it in.

If the result still isn't clean, I'll ask you to upload an original transparent PNG/SVG instead.

### 2. Re-integrate the logo in the hero

In `src/components/LandingPage.tsx`:

- **Swap import** to the new transparent file.
- **Remove the top header bar layout** that pairs the logo with the phone number on the opposite side (that pairing is what makes it feel like a UI chrome sticker). Move the phone link into the existing trust strip / contact strip.
- **Place the logo top-center**, aligned with the headline column (RTL: same visual center as the headline on mobile, top-right above the headline on desktop so it shares the headline's vertical axis).
- **Resize** to ~65% of current (mobile `w-12`, desktop `w-16`) — present but not dominant.
- **Spacing**: comfortable margin from the top edge (`pt-8 sm:pt-10`), not stuck to the edge.
- **Soft integration styling**:
  - Replace the harsh gold `drop-shadow` with a very soft, low-opacity warm glow (`drop-shadow-[0_2px_24px_rgba(212,175,55,0.18)]`).
  - Add a subtle radial gold halo *behind* the logo using a pseudo-blur div (low opacity, large blur-radius) so it reads as ambient hero lighting, not a backdrop.
  - No box, no border, no card.
- **Subtle fade-in + float animation**: tailwind `animate-in fade-in slide-in-from-top-2 duration-1000`, plus a slow keyframe float (3–4s ease-in-out) defined in `styles.css` as `.animate-float-soft` — kept very minimal (~4px travel).

### 3. QA

After the change I'll screenshot the hero at the current viewport (571×853) and on desktop width to confirm:
- No visible square/edge around the logo
- Logo aligns with the headline's visual center
- Glow reads as ambient, not a halo sticker
- Animation is subtle, not distracting

## Files touched

- `src/assets/goldtus-logo-transparent.png` (new, generated)
- `src/components/LandingPage.tsx` (logo placement + header restructure)
- `src/styles.css` (add `.animate-float-soft` keyframe)
