import en from "../locales/en";
import it from "../locales/it";
import de from "../locales/de";
import es from "../locales/es";
import fr from "../locales/fr";
import ar from "../locales/ar";
import zh from "../locales/zh";
import pl from "../locales/pl";
import ru from "../locales/ru";
import uk from "../locales/uk";

export const DEFAULT_LANG = "it";

export const LOCALES = {
  it,
  en,
  de,
  es,
  fr,
  ar,
  zh,
  pl,
  ru,
  uk,
};

export const LANGUAGE_OPTIONS = [
  { code: "it", label: "IT", flag: "🇮🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "AR", flag: "🇦🇪" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
  { code: "pl", label: "PL", flag: "🇵🇱" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "uk", label: "UK", flag: "🇺🇦" },
];

export function getLocale(lang) {
  return LOCALES[lang] || LOCALES[DEFAULT_LANG] || LOCALES.en;
}

export function tr(locale, path, fallback = "") {
  const value = String(path)
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), locale);

  return value === undefined ? fallback : value;
}
