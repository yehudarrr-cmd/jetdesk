import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AccessibilityWidget } from "@/components/site/AccessibilityWidget";
import { InsuranceComparePopup } from "@/components/site/InsuranceComparePopup";
import { ldScript, SITE_URL } from "@/lib/site-constants";

export const Route = createFileRoute("/_site")({
  head: () => ({
    scripts: [
      ldScript({
        "@context": "https://schema.org",
        "@type": ["Organization", "TravelAgency"],
        name: "גולדטוס",
        alternateName: "GoldTus",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        telephone: "+972-55-775-6660",
        parentOrganization: { "@type": "Organization", name: "אמירים טורס" },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+972-55-775-6660",
            contactType: "customer service",
            availableLanguage: ["he", "en"],
          },
        ],
        sameAs: [
          "https://wa.me/972557756660",
          "https://www.goldtus.com",
        ],
        areaServed: { "@type": "Country", name: "Israel" },
        priceRange: "$$$",
        knowsLanguage: ["he", "en"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "שירותי גולדטוס",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "טיסות פרימיום ועסקיות" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "מלונות יוקרה ובוטיק" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "השכרת רכב והעברות פרטיות" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "VIP בנתב\"ג" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "נסיעות למגזר הדתי" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "ביטוח נסיעות לחו\"ל" } },
          ],
        },
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "09:00", closes: "19:00" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "09:00", closes: "13:00" },
        ],
      }),
    ],
  }),
  component: SiteLayout,
});

function SiteLayout() {
  const location = useLocation();
  const transparent = location.pathname === "/";
  return (
    <div className="site-light min-h-screen bg-background text-foreground" dir="rtl">
      <a href="#main-content" className="skip-to-content">דלג לתוכן הראשי</a>
      <SiteHeader transparent={transparent} />
      <main id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <AccessibilityWidget />
      <InsuranceComparePopup />
      <CookieConsent />
    </div>
  );
}