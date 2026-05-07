## SEO & AI Discoverability Fixes for GoldTus

Add the missing technical SEO and AI-discovery signals flagged by the scan. All changes are additive — no visual or behavioral changes to the site.

### 1. Canonical URLs (per route)

Add a canonical `<link>` to every `_site.*` route via `head().links`, pointing to `https://www.goldtus.com<path>`.

- `/` → `https://www.goldtus.com/`
- `/services`, `/insurance`, `/contact`, `/travel-requirements`, `/privacy`, `/terms`, `/accessibility`

Add a `SITE_URL = "https://www.goldtus.com"` constant in `src/lib/site-constants.ts`.

### 2. Organization + LocalBusiness JSON-LD (global)

In `src/routes/_site.tsx` (or root via `head().scripts`), inject a JSON-LD `<script type="application/ld+json">` describing the business:

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "TravelAgency"],
  "name": "גולדטוס",
  "alternateName": "GoldTus",
  "url": "https://www.goldtus.com",
  "logo": "https://www.goldtus.com/logo.png",
  "telephone": "+972-55-775-6660",
  "areaServed": "IL",
  "parentOrganization": { "@type": "Organization", "name": "אמירים טורס" },
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+972-55-775-6660",
    "contactType": "customer service",
    "availableLanguage": ["he", "en"]
  }],
  "sameAs": []
}
```

Use TanStack's `head().scripts` with `type: "application/ld+json"` so it renders in SSR HTML (visible to crawlers/AI).

### 3. WebSite + SearchAction JSON-LD (home page)

On `_site.index.tsx`, add a second JSON-LD block of type `WebSite` so Google can show a sitelinks search box and AI assistants identify the site.

### 4. FAQ JSON-LD

Add an `FAQPage` JSON-LD to `_site.insurance.tsx` and `_site.services.tsx` covering the existing Q&A-style content (e.g. "מה כולל הביטוח?", "איך מקבלים הצעת מחיר?"). 4–6 Q/A pairs each. No visible UI change required (markup is invisible), but if helpful we'll also render a small visible FAQ block on the insurance page so the markup matches DOM content (Google's recommendation).

### 5. BreadcrumbList JSON-LD

Add breadcrumb JSON-LD on each non-home `_site.*` route: Home → {Page Title}.

### 6. `llms.txt` + AI discovery link

Create `public/llms.txt` (TanStack Start serves `public/` at the root) with:

```
# GoldTus / גולדטוס
> סוכנות נסיעות פרימיום מבית אמירים טורס. טיסות, מלונות, רכב, VIP בנתב"ג, ביטוח נסיעות.

## Contact
- Phone: +972-55-775-6660
- WhatsApp: https://wa.me/972557756660
- Site: https://www.goldtus.com

## Key pages
- [Home](https://www.goldtus.com/)
- [Services](https://www.goldtus.com/services)
- [Travel Insurance](https://www.goldtus.com/insurance)
- [Travel Requirements Tool](https://www.goldtus.com/travel-requirements)
- [Contact](https://www.goldtus.com/contact)

## Policies
- [Privacy](https://www.goldtus.com/privacy)
- [Terms](https://www.goldtus.com/terms)
- [Accessibility](https://www.goldtus.com/accessibility)
```

In `__root.tsx` head().links add: `{ rel: "llms-txt", href: "/llms.txt" }` and also a regular `<link rel="alternate" type="text/markdown" href="/llms.txt">` for broader discovery.

### 7. robots.txt + sitemap.xml

Add `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /auth
Disallow: /_app/
Sitemap: https://www.goldtus.com/sitemap.xml
```

Add a static `public/sitemap.xml` listing the 8 public routes with `lastmod` = build date. (Dynamic server-route sitemap is overkill for a fixed-page site.)

### 8. HowTo JSON-LD (optional, low cost)

Add a small `HowTo` JSON-LD on `_site.travel-requirements.tsx` describing the 3 steps to use the tool (choose country → view requirements → contact agent).

### Files to change

- `src/lib/site-constants.ts` — add `SITE_URL`
- `src/routes/__root.tsx` — add `llms-txt` link
- `src/routes/_site.tsx` — inject Organization JSON-LD globally
- `src/routes/_site.index.tsx` — canonical + WebSite JSON-LD
- `src/routes/_site.services.tsx` — canonical + Breadcrumb + FAQ JSON-LD
- `src/routes/_site.insurance.tsx` — canonical + Breadcrumb + FAQ JSON-LD
- `src/routes/_site.contact.tsx` — canonical + Breadcrumb JSON-LD
- `src/routes/_site.travel-requirements.tsx` — canonical + Breadcrumb + HowTo
- `src/routes/_site.privacy.tsx`, `_site.terms.tsx`, `_site.accessibility.tsx` — canonical + Breadcrumb
- `public/llms.txt` (new)
- `public/robots.txt` (new)
- `public/sitemap.xml` (new)

### Out of scope

No visual/UX changes, no copy rewrites, no new pages. No changes to backend, auth, RLS, or edge functions.
