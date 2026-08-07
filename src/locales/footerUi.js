import { additionalFooterUi } from './additionalUi';

const footerUi = {
  it: {
    tagline: 'Tour privati in barca con skipper tra Genova, Golfo Paradiso e Golfo del Tigullio.',
    explore: 'Esplora', home: 'Home', book: 'Prenota', faq: 'Domande frequenti', policy: 'Policy e condizioni', experiences: 'Esperienze', areas: 'Dove navighiamo', contact: 'Contatti',
    call: 'Chiama Riccardo', whatsapp: 'Scrivi su WhatsApp', email: 'Invia una email',
    legalInfo: 'Sede: Genova (GE) - Operativo tra Genova e Portofino', taxId: 'P.IVA 03030880995',
    taxNote: "Prestazione resa in regime forfettario ai sensi dell'art. 1, commi da 54 a 89, della Legge n. 190/2014 e successive modifiche, quindi non soggetta a IVA.",
    copyright: '© 2026 Leggero Tours. Tutti i diritti riservati.',
  },
  en: {
    tagline: 'Private boat tours with skipper from Genoa across Golfo Paradiso and the Tigullio Gulf.',
    explore: 'Explore', home: 'Home', book: 'Book', faq: 'Frequently asked questions', policy: 'Policy and terms', experiences: 'Experiences', areas: 'Where we cruise', contact: 'Contact',
    call: 'Call Riccardo', whatsapp: 'Message on WhatsApp', email: 'Send an email',
    legalInfo: 'Based in Genoa (GE) - Operating between Genoa and Portofino', taxId: 'VAT no. 03030880995',
    taxNote: "Services supplied under Italy's flat-rate tax scheme pursuant to Law no. 190/2014, as amended, and therefore not subject to VAT.",
    copyright: '© 2026 Leggero Tours. All rights reserved.',
  },
  de: {
    tagline: 'Private Bootstouren mit Skipper ab Genua durch den Golfo Paradiso und den Golf von Tigullio.',
    explore: 'Entdecken', home: 'Startseite', book: 'Buchen', faq: 'Häufige Fragen', policy: 'Richtlinien und Bedingungen', experiences: 'Erlebnisse', areas: 'Unsere Fahrgebiete', contact: 'Kontakt',
    call: 'Riccardo anrufen', whatsapp: 'Über WhatsApp schreiben', email: 'E-Mail senden',
    legalInfo: 'Sitz in Genua (GE) - Aktiv zwischen Genua und Portofino', taxId: 'USt-IdNr. 03030880995',
    taxNote: 'Leistung im italienischen Pauschalsteuersystem gemäß Gesetz Nr. 190/2014 in geltender Fassung und daher ohne Mehrwertsteuer.',
    copyright: '© 2026 Leggero Tours. Alle Rechte vorbehalten.',
  },
  es: {
    tagline: 'Tours privados en barco con patrón desde Génova por Golfo Paradiso y el golfo del Tigullio.',
    explore: 'Explorar', home: 'Inicio', book: 'Reservar', faq: 'Preguntas frecuentes', policy: 'Política y condiciones', experiences: 'Experiencias', areas: 'Dónde navegamos', contact: 'Contacto',
    call: 'Llamar a Riccardo', whatsapp: 'Escribir por WhatsApp', email: 'Enviar un correo',
    legalInfo: 'Sede en Génova (GE) - Operamos entre Génova y Portofino', taxId: 'IVA 03030880995',
    taxNote: 'Servicio prestado bajo el régimen fiscal italiano a tanto alzado según la Ley n.º 190/2014 y sus modificaciones, por lo que no está sujeto a IVA.',
    copyright: '© 2026 Leggero Tours. Todos los derechos reservados.',
  },
  fr: {
    tagline: 'Excursions privées en bateau avec skipper depuis Gênes, entre Golfo Paradiso et golfe du Tigullio.',
    explore: 'Explorer', home: 'Accueil', book: 'Réserver', faq: 'Questions fréquentes', policy: 'Politique et conditions', experiences: 'Expériences', areas: 'Nos zones de navigation', contact: 'Contact',
    call: 'Appeler Riccardo', whatsapp: 'Écrire sur WhatsApp', email: 'Envoyer un e-mail',
    legalInfo: 'Siège à Gênes (GE) - Activité entre Gênes et Portofino', taxId: 'TVA 03030880995',
    taxNote: 'Prestation relevant du régime fiscal forfaitaire italien conformément à la loi n° 190/2014 modifiée, et donc non soumise à la TVA.',
    copyright: '© 2026 Leggero Tours. Tous droits réservés.',
  },
  ar: {
    tagline: 'جولات قارب خاصة مع ربان من جنوة عبر خليج باراديسو وخليج تيغوليو.',
    explore: 'استكشف', home: 'الرئيسية', book: 'احجز', faq: 'الأسئلة الشائعة', policy: 'السياسات والشروط', experiences: 'التجارب', areas: 'مناطق الإبحار', contact: 'التواصل',
    call: 'اتصل بريكاردو', whatsapp: 'راسلنا عبر واتساب', email: 'أرسل بريداً إلكترونياً',
    legalInfo: 'المقر في جنوة (GE) - نعمل بين جنوة وبورتوفينو', taxId: 'رقم ضريبة القيمة المضافة 03030880995',
    taxNote: 'تُقدَّم الخدمة ضمن النظام الضريبي الإيطالي المبسّط وفق القانون رقم 190/2014 وتعديلاته، ولذلك لا تخضع لضريبة القيمة المضافة.',
    copyright: '© 2026 Leggero Tours. جميع الحقوق محفوظة.',
  },
  zh: {
    tagline: '从热那亚出发、配备船长的私人船游，航行于 Golfo Paradiso 与 Tigullio 海湾。',
    explore: '探索', home: '首页', book: '预订', faq: '常见问题', policy: '政策与条款', experiences: '体验', areas: '航行区域', contact: '联系我们',
    call: '致电 Riccardo', whatsapp: '通过 WhatsApp 联系', email: '发送电子邮件',
    legalInfo: '总部位于热那亚（GE），运营范围为热那亚至 Portofino', taxId: '增值税号 03030880995',
    taxNote: '本服务适用意大利第 190/2014 号法律及其修订规定的定额税制，因此不征收增值税。',
    copyright: '© 2026 Leggero Tours。保留所有权利。',
  },
  pl: {
    tagline: 'Prywatne rejsy ze skipperem z Genui przez Golfo Paradiso i Zatokę Tigullio.',
    explore: 'Odkrywaj', home: 'Strona główna', book: 'Rezerwuj', faq: 'Częste pytania', policy: 'Zasady i warunki', experiences: 'Atrakcje', areas: 'Gdzie pływamy', contact: 'Kontakt',
    call: 'Zadzwoń do Riccardo', whatsapp: 'Napisz na WhatsApp', email: 'Wyślij e-mail',
    legalInfo: 'Siedziba w Genui (GE) - Rejsy między Genuą a Portofino', taxId: 'NIP VAT 03030880995',
    taxNote: 'Usługa świadczona we włoskim systemie ryczałtowym zgodnie z ustawą nr 190/2014 z późniejszymi zmianami, dlatego nie podlega VAT.',
    copyright: '© 2026 Leggero Tours. Wszelkie prawa zastrzeżone.',
  },
  ru: {
    tagline: 'Частные прогулки на катере со шкипером из Генуи по заливам Парадизо и Тигуллио.',
    explore: 'Разделы', home: 'Главная', book: 'Забронировать', faq: 'Частые вопросы', policy: 'Правила и условия', experiences: 'Программы', areas: 'Где мы ходим', contact: 'Контакты',
    call: 'Позвонить Риккардо', whatsapp: 'Написать в WhatsApp', email: 'Отправить письмо',
    legalInfo: 'Офис в Генуе (GE) - Работаем между Генуей и Портофино', taxId: 'НДС 03030880995',
    taxNote: 'Услуга предоставляется в рамках итальянского режима фиксированного налогообложения согласно закону № 190/2014 с изменениями и поэтому не облагается НДС.',
    copyright: '© 2026 Leggero Tours. Все права защищены.',
  },
  uk: {
    tagline: 'Приватні прогулянки на човні зі шкіпером з Генуї затоками Парадізо й Тігулліо.',
    explore: 'Розділи', home: 'Головна', book: 'Забронювати', faq: 'Часті запитання', policy: 'Правила й умови', experiences: 'Програми', areas: 'Де ми ходимо', contact: 'Контакти',
    call: 'Зателефонувати Ріккардо', whatsapp: 'Написати у WhatsApp', email: 'Надіслати листа',
    legalInfo: 'Офіс у Генуї (GE) - Працюємо між Генуєю та Портофіно', taxId: 'ПДВ 03030880995',
    taxNote: 'Послуга надається за італійською фіксованою системою оподаткування відповідно до закону № 190/2014 зі змінами, тому не обкладається ПДВ.',
    copyright: '© 2026 Leggero Tours. Усі права захищено.',
  },
  ...additionalFooterUi,
};

export const FOOTER_AREAS = ['Genova', 'Nervi', 'Recco', 'Camogli', 'San Fruttuoso', 'Portofino', 'Santa Margherita Ligure', 'Rapallo'];

export function getFooterUi(lang) {
  return footerUi[lang] || footerUi.en;
}
