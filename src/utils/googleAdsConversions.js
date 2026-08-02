// Fires Google Ads conversion events through the gtag.js snippet loaded in index.html.
const GOOGLE_ADS_ID = 'AW-18340336234';

// Fill these in with the "send_to" labels Google Ads gives you when you create each
// conversion action (Obiettivi > Conversioni > + Crea azione di conversione > Sito web
// > "Traccia manualmente con il codice"). Each label looks like "AbCdeFGhijKLmnOPqr".
const CONVERSION_LABELS = {
  whatsapp: 'REPLACE_WITH_WHATSAPP_CONVERSION_LABEL',
  payment: 'REPLACE_WITH_PAYMENT_CONVERSION_LABEL',
};

function sendConversion(label, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (!label || label.startsWith('REPLACE_WITH_')) return;
  window.gtag('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${label}`, ...params });
}

// Call on every click of a WhatsApp button/link across the site.
export function trackWhatsAppClick() {
  sendConversion(CONVERSION_LABELS.whatsapp);
}

// Call once, right after a booking payment succeeds on the payment page.
export function trackPaymentConversion({ value, currency = 'EUR', transactionId } = {}) {
  sendConversion(CONVERSION_LABELS.payment, {
    value,
    currency,
    transaction_id: transactionId,
  });
}
