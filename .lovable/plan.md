## Hero polish, branding cleanup, and scroll indicator

Single file edited: `src/components/LandingPage.tsx`. No new assets, no deps.

### 1. Logo (top-right, +25%, soft glow)
- `h-12` → `h-16`.
- Padding: `pt-5 pr-5 sm:pt-6 sm:pr-8` → `pt-6 pr-6 sm:pt-8 sm:pr-10`.
- Filter: replace heavy shadow with warm soft glow:
  `drop-shadow(0 0 18px rgba(212,175,55,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))`.

### 2. Remove "מבית אמירים טורס" from hero
- Delete the `Sparkles` + "מבית אמירים טורס" pill in the right column.
- Keep the existing footer mention as the only place it appears.

### 3. Form (left card) — lighter & airier
- Subtitle change: `"תוך דקות בוואטסאפ"` → `"השאירו פרטים ונחזור אליכם בהקדם עם הצעה מותאמת אישית"`.
- `space-y-3.5` → `space-y-5`; field heights `h-10` → `h-11`; card padding bumped to `p-6 sm:p-7 lg:p-8`.
- Add subtle lift: `shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]`.

### 4. Detailed lead form copy
- `"נחזור אליכם תוך 24 שעות"` → `"נחזור אליכם בהקדם"`.

### 5. Scroll-down indicator
- Add `id="about"` to the About `<section>`.
- Add absolute element at hero bottom-center: `ChevronDown` (gold, animate-bounce slowed to 2s) + label `"גללו להמשך"`. Click smooth-scrolls to `#about`.
- `hidden sm:flex` to avoid overlapping form on small mobile.

### 6. Continuation peek
- Hero `min-h-[100svh]` → `min-h-[92svh]` so next section peeks.
- Keep existing bottom fade gradient.

### Imports
- Add `ChevronDown` to existing lucide import.
- Remove `Sparkles` from hero pill usage but keep import (still used in detailed-form success state).

### Out of scope
Services, why-us, footer structure, routing, backend.