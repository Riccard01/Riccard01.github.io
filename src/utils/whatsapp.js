const WHATSAPP_PHONE = '393463365699';

const WHATSAPP_MESSAGES = {
  it: 'Ciao Riccardo! Quale esperienza ci consigli di scegliere?',
  en: 'Hi Riccardo! Which experience would you recommend we choose?',
  de: 'Hallo Riccardo! Welches Erlebnis würdest du uns empfehlen?',
  es: '¡Hola, Riccardo! ¿Qué experiencia nos recomiendas elegir?',
  fr: 'Bonjour Riccardo ! Quelle expérience nous conseilles-tu de choisir ?',
  ar: 'مرحباً ريكاردو! أي تجربة تنصحنا باختيارها؟',
  zh: '你好，Riccardo！你推荐我们选择哪项体验？',
  pl: 'Cześć Riccardo! Które doświadczenie polecasz nam wybrać?',
  ru: 'Привет, Риккардо! Какую экскурсию ты посоветуешь нам выбрать?',
  uk: 'Привіт, Ріккардо! Яку екскурсію ти порадиш нам обрати?',
  pt: 'Olá, Riccardo! Qual experiência nos recomenda escolher?',
  nl: 'Hoi Riccardo! Welke ervaring raad je ons aan?',
  he: 'היי ריקרדו! איזו חוויה אתה ממליץ לנו לבחור?',
  cs: 'Ahoj Riccardo! Který zážitek bys nám doporučil?',
  ro: 'Salut, Riccardo! Ce experiență ne recomanzi să alegem?',
  tr: 'Merhaba Riccardo! Hangi deneyimi seçmemizi önerirsin?',
  ja: 'こんにちは、Riccardo！どの体験がおすすめですか？',
  ko: '안녕하세요, Riccardo! 어떤 체험을 추천하시나요?',
};

export function getWhatsAppUrl(lang = 'en') {
  const message = WHATSAPP_MESSAGES[lang] || WHATSAPP_MESSAGES.en;
  return `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}