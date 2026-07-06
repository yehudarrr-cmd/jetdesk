import { Flame, Plane, Hotel, Calendar, MoonStar, MapPin, ExternalLink, UtensilsCrossed } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { whatsappUrl } from "@/lib/site-constants";
import { generatedDestinationImageUrl, safeDealImageUrl } from "@/lib/deal-image";

type Deal = Database["public"]["Tables"]["deals"]["Row"];

export const DEAL_IMG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23001a4d'/><stop offset='1' stop-color='%23002d72'/></linearGradient></defs><rect width='800' height='500' fill='url(%23g)'/><text x='400' y='260' fill='%23FFD447' font-family='serif' font-size='42' text-anchor='middle' font-weight='700'>GoldTus</text></svg>`,
  );

export function formatDealDateRange(a: string | null, b: string | null): string {
  if (!a) return "";
  const fmt = (s: string) => {
    const d = new Date(s);
    return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit" }).format(d);
  };
  return b ? `${fmt(a)} – ${fmt(b)}` : fmt(a);
}

function isKosher(deal: Deal) {
  return Array.isArray(deal.tags) && deal.tags.some((t) => t?.toLowerCase() === "kosher");
}

export function DealCard({ deal }: { deal: Deal }) {
  const href =
    deal.external_url ||
    deal.quote_url ||
    whatsappUrl(`שלום, אשמח לפרטים על הדיל ל${deal.destination}`);
  const dateRange = formatDealDateRange(deal.start_date, deal.end_date);
  const generatedImage = generatedDestinationImageUrl(deal.destination, deal.country);
  const imageSrc = safeDealImageUrl(deal.image_url, deal.destination, deal.country);
  const kosher = isKosher(deal);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden bg-[#0b1f4a] border border-white/10 hover:border-[#FFD447]/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(255,212,71,0.35)] transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#001a4d]">
        <img
          src={imageSrc}
          data-generated-src={generatedImage}
          alt={`${deal.destination} - ${deal.title ?? ""}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget;
            const generated = img.dataset.generatedSrc;
            if (generated && img.src !== new URL(generated, window.location.origin).href) {
              img.src = generated;
              return;
            }
            if (img.src !== DEAL_IMG_FALLBACK) img.src = DEAL_IMG_FALLBACK;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {deal.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFD447] text-[#001a4d] text-[11px] font-bold tracking-wide">
              <Flame className="w-3 h-3" fill="currentColor" /> מומלץ
            </span>
          )}
          {kosher && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0b6b3a] text-white text-[11px] font-bold tracking-wide border border-[#FFD447]/40">
              <UtensilsCrossed className="w-3 h-3" /> כשר
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center gap-1.5 text-[#FFD447] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            {deal.country ? `${deal.destination} · ${deal.country}` : deal.destination}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-5 gap-3">
        <h3 className="font-display text-xl font-bold text-white leading-tight line-clamp-2 min-h-[3.5rem]">
          {deal.title || `חופשה ל${deal.destination}`}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/75">
          {dateRange && (
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#FFD447]" /> {dateRange}</div>
          )}
          {deal.nights != null && (
            <div className="flex items-center gap-1.5"><MoonStar className="w-3.5 h-3.5 text-[#FFD447]" /> {deal.nights} לילות</div>
          )}
          {deal.hotel && (
            <div className="flex items-center gap-1.5 col-span-2 truncate"><Hotel className="w-3.5 h-3.5 text-[#FFD447]" /> <span className="truncate">{deal.hotel}</span></div>
          )}
          {deal.airline && (
            <div className="flex items-center gap-1.5 col-span-2"><Plane className="w-3.5 h-3.5 text-[#FFD447]" /> {deal.airline}</div>
          )}
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-white/10">
          {deal.price_from != null ? (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/60">החל מ־</div>
              <div className="text-2xl font-bold text-[#FFD447] leading-none">
                ₪{deal.price_from.toLocaleString("he-IL")}
              </div>
            </div>
          ) : <span />}
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#001a4d] bg-[#FFD447] group-hover:bg-[#FFC000] transition-colors">
            לפרטים ולהזמנה <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}