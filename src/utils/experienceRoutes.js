export const EXPERIENCE_SLUG_BY_ID = {
  '0': 'tour-privato-portofino',
  '1': 'crociera-gourmet-tramonto',
  '2': 'transfer-privato',
  '3': 'stella-maris-camogli',
  '4': 'dolce-vita',
};

const EXPERIENCE_ID_BY_SLUG = {
  'tour-privato-portofino': '0',
  'portofino-private-boat-tour': '0',
  'crociera-gourmet-tramonto': '1',
  'gourmet-sunset-cruise': '1',
  'transfer-privato': '2',
  'private-transfer': '2',
  'stella-maris-camogli': '3',
  'stella-maris-camogli-2026': '3',
  'stella-maris-camogli-event': '3',
  'dolce-vita': '4',
  'dolce-vita-tour': '4',
};

export function getExperienceSlugById(id) {
  return EXPERIENCE_SLUG_BY_ID[String(id)] || '';
}

export function getExperienceIdFromSlug(slug) {
  return EXPERIENCE_ID_BY_SLUG[String(slug || '').toLowerCase()] || null;
}
