import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/site-constants";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלח הודעת ווטסאפ"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-elegant hover:scale-110 transition-transform"
    >
      <MessageCircle className="w-7 h-7 text-white" fill="currentColor" />
    </a>
  );
}