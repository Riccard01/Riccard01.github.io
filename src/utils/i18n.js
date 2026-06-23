// src/utils/i18n.js
// Simple i18n utility for language switching and formatting

const LANGUAGES = {
  it: {
    daysShort: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
    daysShort2: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
    months: [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ],
    formatTime: (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  },
  en: {
    daysShort: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    daysShort2: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    formatTime: (date) => {
      let hours = date.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes} ${ampm}`;
    }
  }
};

let currentLang = "it";

export function setLanguage(lang) {
  if (LANGUAGES[lang]) currentLang = lang;
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return LANGUAGES[currentLang][key];
}

export function formatTime(date) {
  return LANGUAGES[currentLang].formatTime(date);
}

export default LANGUAGES;
