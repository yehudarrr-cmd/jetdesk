import dealsAthensImage from "@/assets/deals-athens.jpg";
import dealsBatumiImage from "@/assets/deals-batumi.jpg";
import dealsBulgariaImage from "@/assets/deals-bulgaria.jpg";
import dealsCyprusImage from "@/assets/deals-cyprus.jpg";
import dealsGreeceIslandsImage from "@/assets/deals-greece-islands.jpg";
import dealsTbilisiImage from "@/assets/deals-tbilisi.jpg";

const DEAL_IMAGE_PROXY = "/api/public/deal-image";

export const dealImageUrl = (url?: string | null) => {
  const clean = url?.trim();
  if (!clean || clean.startsWith("data:")) return clean || "";
  if (clean.startsWith(DEAL_IMAGE_PROXY)) return clean;
  return `${DEAL_IMAGE_PROXY}?url=${encodeURIComponent(clean)}`;
};

export const generatedDestinationImageUrl = (destination?: string | null, country?: string | null) => {
  const text = `${destination ?? ""} ${country ?? ""}`;
  if (/באטומי/.test(text)) return dealsBatumiImage;
  if (/טביליסי/.test(text)) return dealsTbilisiImage;
  if (/בורגס|בולגריה/.test(text)) return dealsBulgariaImage;
  if (/אתונה/.test(text)) return dealsAthensImage;
  if (/פאפוס|איה נאפה|לימסול|לרנקה|קפריסין/.test(text)) return dealsCyprusImage;
  if (/כרתים|הרקליון|הרסוניסוס|רודוס|יוון/.test(text)) return dealsGreeceIslandsImage;
  return dealsGreeceIslandsImage;
};

export const safeDealImageUrl = (
  url?: string | null,
  destination?: string | null,
  country?: string | null,
) => {
  const clean = url?.trim();
  const localFallback = generatedDestinationImageUrl(destination, country);
  if (!clean) return localFallback;
  try {
    const host = new URL(clean).hostname.toLowerCase();
    if (host.endsWith("bstatic.com") || host === "image.pollinations.ai") return localFallback;
  } catch {
    return localFallback;
  }
  return dealImageUrl(clean);
};