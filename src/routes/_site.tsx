import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AccessibilityWidget } from "@/components/site/AccessibilityWidget";
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
        areaServed: "IL",
        parentOrganization: { "@type": "Organization", name: "אמירים טורס" },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+972-55-775-6660",
            contactType: "customer service",
            availableLanguage: ["he", "en"],
          },
        ],
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
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <a href="#main-content" className="skip-to-content">דלג לתוכן הראשי</a>
      <SiteHeader transparent={transparent} />
      <main id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <AccessibilityWidget />
      <CookieConsent />
    </div>
  );
}