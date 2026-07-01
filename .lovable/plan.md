## Hero Polish - Alignment, Styling & Sticky Actions

### 1. Restructure hero into a balanced two-column block

Move the intro copy (badge, headline, subtitle, benefits row) into the **left column above the form**, so left and right columns start on the same top baseline. The slider on the right becomes taller and matches the full stacked height of `text + form` on the left.

Resulting structure inside the hero grid:

```text
+--------------------------+--------------------------+
| badge (pill)             |                          |
| H1 title                 |                          |
| subtitle paragraph       |         SLIDER           |
| benefits icon row        |     (full column height) |
| ------------------------ |                          |
| Quick Quote form card    |                          |
+--------------------------+--------------------------+
```

- Grid: `lg:grid-cols-2`, `items-stretch`, `gap-10`.
- Left column: `flex flex-col gap-6`, form pinned to the bottom with `mt-auto` so its bottom edge aligns with the slider's bottom edge.
- Slider container: remove fixed `min-h`; use `h-full` with a `min-h-[420px]` fallback for small screens so it fills the row height set by the left column.

### 2. Styling refinements to text block

- **Badge pill**: add top margin (`mt-2`), increase padding to `px-5 py-2`, slightly larger tracking. Sits lower and looks more substantial.
- **Subtitle**: bump weight from default to `font-medium` and color to `text-foreground/90` for stronger contrast on white.
- **Benefits row** (Plane / ShieldCheck / Crown): increase gap to `gap-x-6 gap-y-3`, add `pt-2 border-t border-primary/10` divider above so it clearly belongs to the text block and aligns to the paragraph's right edge.
- Keep all dashes as regular hyphens.

### 3. Sticky action visibility

- **Desktop**: promote the header's affiliate buttons (PassportCard + WiFly) and add a WhatsApp button next to them so all three critical CTAs live in the sticky header. The floating round WhatsApp bubble at bottom-left stays as a secondary anchor.
- **Mobile**: existing `FloatingWhatsApp` bottom bar (WhatsApp + Insurance + eSIM) already pins to the viewport - no change needed beyond confirming spacer height still clears content.

### Files touched

- `src/routes/_site.index.tsx` - hero grid restructure, badge/subtitle/benefits styling.
- `src/components/site/SiteHeader.tsx` - add WhatsApp CTA next to affiliate buttons in the desktop header.

No new dependencies, no data or route changes.
