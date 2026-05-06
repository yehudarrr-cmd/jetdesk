export const WHATSAPP_NUMBER = "972557756660";
export const PHONE_DISPLAY = "055-775-6660";
export const INSURANCE_URL = "https://bit.ly/4fW6B98";

export const whatsappUrl = (text = "שלום, אני מעוניין/ת לקבל הצעה לחופשה") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;