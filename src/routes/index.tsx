import { createFileRoute } from "@tanstack/react-router";
import { LandingPage, landingHeroImage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Tus | טוס גולד - לטוס בסטנדרט אחר" },
      { name: "description", content: "Gold Tus מקבוצת טוס - אמירים טורס: טיסות עסקים, נסיעות למגזר הדתי, שירות VIP בנתב\"ג, מלונות יוקרה, השכרת רכב וביטוח נסיעות לחו\"ל. הצעה אישית תוך 24 שעות." },
      { name: "keywords", content: "טוס גולד, גולד טוס, TUS, אמירים טורס, טיסות עסקים, נסיעות למגזר הדתי, שירות VIP בנתב\"ג, ביטוח נסיעות לחו\"ל, מלונות יוקרה, השכרת רכב בחו\"ל" },
      { property: "og:title", content: "Gold Tus - לטוס בסטנדרט אחר" },
      { property: "og:description", content: "השירות האישי שלנו, העוצמה של קבוצת טוס - אמירים טורס. טיסות, מלונות יוקרה, VIP בנתב\"ג, מגזר עסקי ודתי - הכל תחת גג אחד." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: landingHeroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: landingHeroImage },
    ],
  }),
  component: LandingPage,
});