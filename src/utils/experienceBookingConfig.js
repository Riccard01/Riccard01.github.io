import { getExperienceIdFromSlug } from './experienceRoutes';

const EXPERIENCE_QUERY_ALIASES = {
  rainbow: '0',
  portofino: '0',
  gourmet: '1',
  aperitivo: '1',
  transfer: '2',
  private: '2',
  stella: '3',
  dolce: '4',
};

export const EXPERIENCE_BOOKING_CONFIG = {
  '0': {
    slotKeywords: ['morning', 'sunset', 'extended', 'full', 'full_day', 'aperitivo', 'full_day_aperitivo', 'sunset_aperitivo', 'full_aperitivo'],
    boatKeywords: ['rainbow', 'portofino', 'two gulfs'],
    guestLimit: 5,
  },
  '1': {
    slotKeywords: ['sunset', '18:00', '18-23', '18:00-23:00', '18-22', '18:00-22:00', 'aperitivo'],
    preferredSlotKeywords: ['sunset_aperitivo', 'gourmet', '18:00-23:00', '18-23', '18:00-22:00', '18-22'],
    fixedTime: true,
    boatKeywords: ['gourmet', 'aperitivo', 'sunset', 'boccadasse', 'rossa'],
    guestLimit: 15,
  },
  '2': {
    slotKeywords: [],
    boatKeywords: ['transfer', 'point-to-point', 'shuttle'],
    guestLimit: 7,
  },
  '3': {
    slotKeywords: [],
    boatKeywords: ['stella', 'maris', 'camogli'],
    guestLimit: 5,
  },
  '4': {
    slotKeywords: ['17:00', '17-22', '17:00-22:00', '17-21', '17:00-21:00', 'sunset'],
    excludedSlotKeywords: ['aperitivo', 'gourmet'],
    preferredSlotKeywords: ['17:00-22:00', '17-22', '17:00-21:00', '17-21', 'sunset'],
    fixedTime: true,
    boatKeywords: ['dolce vita', 'punta chiappa', 'camogli'],
    guestLimit: 5,
  },
};

function normalizeRaw(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeExperienceQuery(value) {
  const raw = normalizeRaw(value);
  if (!raw) return null;

  if (EXPERIENCE_BOOKING_CONFIG[raw]) return raw;

  const byAlias = EXPERIENCE_QUERY_ALIASES[raw];
  if (byAlias) return byAlias;

  const bySlug = getExperienceIdFromSlug(raw);
  if (bySlug) return bySlug;

  return null;
}

export function getGuestLimitForExperience(experienceId) {
  const cfg = EXPERIENCE_BOOKING_CONFIG[String(experienceId)] || null;
  return cfg?.guestLimit || null;
}

export function hasFixedBookingTime(experienceId) {
  const cfg = EXPERIENCE_BOOKING_CONFIG[String(experienceId)] || null;
  return cfg?.fixedTime === true;
}

export function filterSlotsForExperience(slotObjects = [], experienceId = null) {
  const cfg = EXPERIENCE_BOOKING_CONFIG[String(experienceId)] || null;
  const keywords = cfg?.slotKeywords || [];
  if (!keywords.length) return slotObjects;

  const normalizedKeywords = keywords.map((k) => k.toLowerCase());
  const excludedKeywords = (cfg?.excludedSlotKeywords || []).map((key) => key.toLowerCase());
  const eligibleSlots = slotObjects.filter((slot) => {
    const searchable = `${slot?.key || ''} ${slot?.displayName || ''}`.toLowerCase();
    return !excludedKeywords.some((key) => searchable.includes(key));
  });
  const filtered = eligibleSlots.filter((slot) => {
    const searchable = `${slot?.key || ''} ${slot?.displayName || ''}`.toLowerCase();
    return normalizedKeywords.some((key) => searchable.includes(key));
  });

  const matches = filtered.length ? filtered : eligibleSlots;
  if (!cfg?.fixedTime || matches.length <= 1) return matches;

  const preferredKeywords = (cfg.preferredSlotKeywords || []).map((key) => key.toLowerCase());
  const ranked = matches.map((slot, index) => {
    const searchable = `${slot?.key || ''} ${slot?.displayName || ''}`.toLowerCase();
    const score = preferredKeywords.reduce(
      (total, keyword, keywordIndex) => total + (searchable.includes(keyword) ? preferredKeywords.length - keywordIndex : 0),
      0
    );
    return { slot, score, index };
  });

  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  return [ranked[0].slot];
}

export function getRainbowTourSlotDisplayName(lang, slotKey) {
  const isItalian = lang === 'it';

  const labels = isItalian
    ? {
        morning: 'Mattina 9:00 - 14:00',
        sunset: 'Tramonto 16:00 - 21:00',
        extended: 'Esteso 9:00 - 16:00',
        full: 'Giornata intera 9:00 - 21:00',
        full_day: 'Giornata intera 9:00 - 21:00',
        sunset_aperitivo: 'Tramonto + Aperitivo 16:00 - 21:00 €390',
        full_day_aperitivo: 'Giornata intera + Aperitivo 9:00 - 21:00 €390',
        full_aperitivo: 'Giornata intera + Aperitivo 9:00 - 21:00 €390',
      }
    : {
        morning: 'Morning 9AM - 2PM',
        sunset: 'Sunset 4PM - 9PM',
        extended: 'Extended 9AM - 4PM',
        full: 'Full Day 9AM - 9PM',
        full_day: 'Full Day 9AM - 9PM',
        sunset_aperitivo: 'Sunset + Aperitivo 4PM - 9PM €390',
        full_day_aperitivo: 'Full Day + Aperitivo 9AM - 9PM €390',
        full_aperitivo: 'Full Day + Aperitivo 9AM - 9PM €390',
      };

  return labels[String(slotKey || '').toLowerCase()] || null;
}

export function isBoatCompatibleWithExperience(boatDoc = {}, experienceId = null) {
  const cfg = EXPERIENCE_BOOKING_CONFIG[String(experienceId)] || null;
  const keywords = cfg?.boatKeywords || [];
  if (!keywords.length) return true;

  const searchable = [
    boatDoc?.id,
    boatDoc?.name,
    boatDoc?.title,
    boatDoc?.experienceId,
    boatDoc?.experienceSlug,
    boatDoc?.experience,
    boatDoc?.type,
    boatDoc?.category,
    boatDoc?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return keywords.some((key) => searchable.includes(String(key).toLowerCase()));
}
