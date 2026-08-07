const availabilityUi = {
  it: { available: 'Prossima partenza disponibile' },
  en: { available: 'Next available departure' },
  de: { available: 'Nächste verfügbare Abfahrt' },
  es: { available: 'Próxima salida disponible' },
  fr: { available: 'Prochain départ disponible' },
  ar: { available: 'موعد المغادرة التالي متاح' },
  zh: { available: '下一班出发可预订' },
  pl: { available: 'Najbliższy dostępny rejs' },
  ru: { available: 'Ближайший доступный выход' },
  uk: { available: 'Найближчий доступний вихід' },
  pt: { available: 'Próxima partida disponível' },
  nl: { available: 'Volgende vertrek beschikbaar' },
  he: { available: 'היציאה הבאה זמינה' },
  cs: { available: 'Nejbližší dostupný odjezd' },
  ro: { available: 'Următoarea plecare disponibilă' },
  tr: { available: 'Sonraki sefer müsait' },
  ja: { available: '次の出発を予約できます' },
  ko: { available: '다음 출발 예약 가능' },
};

export function getAvailabilityUi(lang) {
  return availabilityUi[lang] || availabilityUi.en;
}