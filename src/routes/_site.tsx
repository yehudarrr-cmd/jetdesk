import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AccessibilityWidget } from "@/components/site/AccessibilityWidget";

export const Route = createFileRoute("/_site")({
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