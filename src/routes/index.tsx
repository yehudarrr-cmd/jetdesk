import { createFileRoute } from "@tanstack/react-router";
import { LandingPage, landingHeroImage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "גולדטוס | טסים ברמה אחרת - טיסות וחופשות פרימיום" },
      { name: "description", content: "גולדטוס מבית אמירים טורס: טיסות וחופשות פרימיום עם שירות אישי, מלונות יוקרה, VIP בנתב\"ג, טיסות עסקיות, מגזר דתי וביטוח נסיעות. הצעה אישית תוך 24 שעות." },
      { name: "keywords", content: "גולדטוס, GoldTus, אמירים טורס, טיסות פרימיום, חופשות יוקרה, טיסות עסקיות, שירות VIP בנתב\"ג, נסיעות למגזר הדתי, מלונות בוטיק, ביטוח נסיעות לחו\"ל" },
      { property: "og:title", content: "גולדטוס - טסים ברמה אחרת" },
      { property: "og:description", content: "טיסות וחופשות פרימיום עם שירות אישי ודילים נבחרים בלבד. גולדטוס מבית אמירים טורס." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: landingHeroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: landingHeroImage },
    ],
  }),
  component: LandingPage,
});