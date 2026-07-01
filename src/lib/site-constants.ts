export const WHATSAPP_NUMBER = "972557756660";
export const PHONE_DISPLAY = "055-775-6660";
export const INSURANCE_URL = "https://bit.ly/4fW6B98";
export const SITE_URL = "https://www.goldtus.com";

/** Affiliate: PassportCard travel insurance */
export const PASSPORTCARD_URL =
  "https://marketing.passportcard.co.il/BLP/vRzjRu5u8%2BxXbCU%2BP5prTw==";
/** Affiliate: WiFly eSIM / global roaming */
export const WIFLY_URL = "https://aff.wifly.co.il/click?campaign_id=1&ref_id=247";

export const canonical = (path = "/") =>
  `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;

export const ldScript = (data: unknown) => ({
  type: "application/ld+json" as const,
  children: JSON.stringify(data),
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: canonical(it.path),
  })),
});

export const whatsappUrl = (text = "שלום, אני מעוניין/ת לקבל הצעה לחופשה") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;