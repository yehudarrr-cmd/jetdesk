import { createFileRoute } from "@tanstack/react-router";
import { LandingPage, landingHeroImage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Goldtus — חופשת היוקרה הבאה שלכם מתחילה כאן" },
      { name: "description", content: "סוכנות נסיעות פרימיום: טיסות, מלונות וחבילות יוקרה מותאמות אישית. השאירו פרטים וקבלו הצעה תוך 24 שעות." },
      { property: "og:title", content: "Goldtus — חופשת היוקרה הבאה שלכם" },
      { property: "og:description", content: "תכנון נסיעות יוקרה אישי, ליווי 24/7, יעדים אקסקלוסיביים ברחבי העולם." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: landingHeroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: landingHeroImage },
    ],
  }),
  component: LandingPage,
});