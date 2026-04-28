const enc = (s: string) => encodeURIComponent(s);

function cleanPhone(phone?: string | null): string | null {
  if (!phone) return null;
  let p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  // Israeli local 0XX -> 972XX
  if (p.startsWith("0")) p = "972" + p.slice(1);
  return p;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const p = cleanPhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${enc(message)}`;
}

export const WhatsAppTemplates = {
  missingCheckIn: (name: string, destination: string) =>
    `שלום ${name}, מזכירים שטרם בוצע צ׳ק אין לטיסה שלך ל${destination}. מומלץ להשלים זאת בהקדם.`,
  missingInsurance: (name: string) =>
    `שלום ${name}, לפי הרישום אצלנו טרם הוסדר ביטוח נסיעות לנסיעה שלך. מומלץ לטפל בזה לפני הטיסה.`,
  flightUpdate: (name: string, flightNumber: string) =>
    `שלום ${name}, יש עדכון חשוב בנוגע לטיסה שלך מספר ${flightNumber}. נא לבדוק את הפרטים.`,
  generalReminder: (name: string, destination: string) =>
    `שלום ${name}, תזכורת קטנה לגבי הנסיעה הקרובה שלך ל${destination}.`,
};