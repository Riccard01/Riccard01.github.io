const bookingUi = {
  it: {
    select: 'Seleziona', experience: 'Esperienza', guests: 'Ospiti', time: 'Orario', date: 'Data', ports: 'Porti',
    chooseExperience: 'Scegli un’esperienza', chooseExperienceHint: 'Seleziona un’esperienza per continuare.',
    guestQuestion: 'Quante persone parteciperanno?', decreaseGuests: 'Diminuisci ospiti', increaseGuests: 'Aumenta ospiti',
    chooseTime: 'Scegli l’orario', chooseDate: 'Scegli la data', portsTitle: 'Porti e transfer',
    portsHint: 'Scegli il porto di partenza, quello finale e gli eventuali transfer privati.',
    continue: 'Continua', back: 'Indietro', review: 'Rivedi il riepilogo',
    noBoats: 'Nessuna barca disponibile con questi filtri', reset: 'Reset filtri', showAll: 'Mostra tutte le esperienze',
    formName: 'Come ti chiami?', formPhone: 'Qual è il tuo numero di telefono?', formEmail: 'Qual è la tua email?', formNotes: 'Hai richieste particolari?', optional: 'Facoltativo',
  },
  en: {
    select: 'Select', experience: 'Experience', guests: 'Guests', time: 'Time', date: 'Date', ports: 'Ports',
    chooseExperience: 'Choose an experience', chooseExperienceHint: 'Select an experience to continue.',
    guestQuestion: 'How many guests?', decreaseGuests: 'Decrease guests', increaseGuests: 'Increase guests',
    chooseTime: 'Choose a time', chooseDate: 'Choose a date', portsTitle: 'Ports and transfer',
    portsHint: 'Choose the departure port, final port and any private transfers.',
    continue: 'Continue', back: 'Back', review: 'Review summary', noBoats: 'No boats available for these filters', reset: 'Reset filters', showAll: 'Show all experiences',
    formName: 'What is your name?', formPhone: 'What is your phone number?', formEmail: 'What is your email?', formNotes: 'Any special requests?', optional: 'Optional',
  },
  de: {
    select: 'Auswählen', experience: 'Erlebnis', guests: 'Gäste', time: 'Uhrzeit', date: 'Datum', ports: 'Häfen',
    chooseExperience: 'Erlebnis auswählen', chooseExperienceHint: 'Wähle ein Erlebnis, um fortzufahren.', guestQuestion: 'Wie viele Gäste?', decreaseGuests: 'Weniger Gäste', increaseGuests: 'Mehr Gäste', chooseTime: 'Uhrzeit auswählen', chooseDate: 'Datum auswählen', portsTitle: 'Häfen und Transfer', portsHint: 'Wähle Abfahrts- und Zielhafen sowie private Transfers.', continue: 'Weiter', back: 'Zurück', review: 'Zusammenfassung prüfen', noBoats: 'Keine Boote für diese Auswahl verfügbar', reset: 'Filter zurücksetzen', showAll: 'Alle Erlebnisse anzeigen', formName: 'Wie heißt du?', formPhone: 'Wie lautet deine Telefonnummer?', formEmail: 'Wie lautet deine E-Mail?', formNotes: 'Besondere Wünsche?', optional: 'Optional',
  },
  es: {
    select: 'Seleccionar', experience: 'Experiencia', guests: 'Personas', time: 'Horario', date: 'Fecha', ports: 'Puertos',
    chooseExperience: 'Elige una experiencia', chooseExperienceHint: 'Selecciona una experiencia para continuar.', guestQuestion: '¿Cuántas personas?', decreaseGuests: 'Reducir personas', increaseGuests: 'Aumentar personas', chooseTime: 'Elige un horario', chooseDate: 'Elige una fecha', portsTitle: 'Puertos y traslado', portsHint: 'Elige los puertos de salida y llegada y los traslados privados.', continue: 'Continuar', back: 'Atrás', review: 'Revisar resumen', noBoats: 'No hay barcos disponibles con estos filtros', reset: 'Restablecer filtros', showAll: 'Ver todas las experiencias', formName: '¿Cómo te llamas?', formPhone: '¿Cuál es tu teléfono?', formEmail: '¿Cuál es tu correo?', formNotes: '¿Tienes alguna solicitud especial?', optional: 'Opcional',
  },
  fr: {
    select: 'Sélectionner', experience: 'Expérience', guests: 'Participants', time: 'Horaire', date: 'Date', ports: 'Ports',
    chooseExperience: 'Choisissez une expérience', chooseExperienceHint: 'Sélectionnez une expérience pour continuer.', guestQuestion: 'Combien de participants ?', decreaseGuests: 'Réduire le nombre', increaseGuests: 'Augmenter le nombre', chooseTime: 'Choisissez un horaire', chooseDate: 'Choisissez une date', portsTitle: 'Ports et transfert', portsHint: 'Choisissez les ports de départ et d’arrivée ainsi que les transferts privés.', continue: 'Continuer', back: 'Retour', review: 'Vérifier le récapitulatif', noBoats: 'Aucun bateau disponible avec ces filtres', reset: 'Réinitialiser', showAll: 'Voir toutes les expériences', formName: 'Comment vous appelez-vous ?', formPhone: 'Quel est votre numéro de téléphone ?', formEmail: 'Quelle est votre adresse e-mail ?', formNotes: 'Avez-vous une demande particulière ?', optional: 'Facultatif',
  },
  ar: {
    select: 'اختر', experience: 'التجربة', guests: 'الضيوف', time: 'الوقت', date: 'التاريخ', ports: 'الموانئ',
    chooseExperience: 'اختر تجربة', chooseExperienceHint: 'اختر تجربة للمتابعة.', guestQuestion: 'كم عدد الضيوف؟', decreaseGuests: 'تقليل الضيوف', increaseGuests: 'زيادة الضيوف', chooseTime: 'اختر الوقت', chooseDate: 'اختر التاريخ', portsTitle: 'الموانئ والنقل', portsHint: 'اختر ميناء الانطلاق والوصول وخدمات النقل الخاصة.', continue: 'متابعة', back: 'رجوع', review: 'مراجعة الملخص', noBoats: 'لا توجد قوارب متاحة لهذه الخيارات', reset: 'إعادة الضبط', showAll: 'عرض كل التجارب', formName: 'ما اسمك؟', formPhone: 'ما رقم هاتفك؟', formEmail: 'ما بريدك الإلكتروني؟', formNotes: 'هل لديك طلبات خاصة؟', optional: 'اختياري',
  },
  zh: {
    select: '选择', experience: '体验', guests: '人数', time: '时间', date: '日期', ports: '港口',
    chooseExperience: '选择体验', chooseExperienceHint: '选择一项体验以继续。', guestQuestion: '有多少位客人？', decreaseGuests: '减少人数', increaseGuests: '增加人数', chooseTime: '选择时间', chooseDate: '选择日期', portsTitle: '港口与接送', portsHint: '选择出发港、到达港和私人接送。', continue: '继续', back: '返回', review: '查看摘要', noBoats: '没有符合这些条件的船只', reset: '重置条件', showAll: '查看所有体验', formName: '您的姓名是？', formPhone: '您的电话号码是？', formEmail: '您的电子邮箱是？', formNotes: '有特别要求吗？', optional: '选填',
  },
  pl: {
    select: 'Wybierz', experience: 'Atrakcja', guests: 'Goście', time: 'Godzina', date: 'Data', ports: 'Porty',
    chooseExperience: 'Wybierz atrakcję', chooseExperienceHint: 'Wybierz atrakcję, aby kontynuować.', guestQuestion: 'Ilu będzie gości?', decreaseGuests: 'Mniej gości', increaseGuests: 'Więcej gości', chooseTime: 'Wybierz godzinę', chooseDate: 'Wybierz datę', portsTitle: 'Porty i transfer', portsHint: 'Wybierz port wypłynięcia i powrotu oraz prywatny transfer.', continue: 'Kontynuuj', back: 'Wstecz', review: 'Sprawdź podsumowanie', noBoats: 'Brak łodzi dla wybranych filtrów', reset: 'Resetuj filtry', showAll: 'Pokaż wszystkie atrakcje', formName: 'Jak się nazywasz?', formPhone: 'Jaki jest Twój numer telefonu?', formEmail: 'Jaki jest Twój e-mail?', formNotes: 'Masz specjalne życzenia?', optional: 'Opcjonalnie',
  },
  ru: {
    select: 'Выбрать', experience: 'Программа', guests: 'Гости', time: 'Время', date: 'Дата', ports: 'Порты',
    chooseExperience: 'Выберите программу', chooseExperienceHint: 'Выберите программу, чтобы продолжить.', guestQuestion: 'Сколько будет гостей?', decreaseGuests: 'Уменьшить число гостей', increaseGuests: 'Увеличить число гостей', chooseTime: 'Выберите время', chooseDate: 'Выберите дату', portsTitle: 'Порты и трансфер', portsHint: 'Выберите порты отправления и прибытия и частный трансфер.', continue: 'Продолжить', back: 'Назад', review: 'Проверить итог', noBoats: 'Для этих фильтров нет доступных лодок', reset: 'Сбросить фильтры', showAll: 'Показать все программы', formName: 'Как вас зовут?', formPhone: 'Ваш номер телефона?', formEmail: 'Ваш адрес электронной почты?', formNotes: 'Есть особые пожелания?', optional: 'Необязательно',
  },
  uk: {
    select: 'Обрати', experience: 'Програма', guests: 'Гості', time: 'Час', date: 'Дата', ports: 'Порти',
    chooseExperience: 'Оберіть програму', chooseExperienceHint: 'Оберіть програму, щоб продовжити.', guestQuestion: 'Скільки буде гостей?', decreaseGuests: 'Зменшити кількість гостей', increaseGuests: 'Збільшити кількість гостей', chooseTime: 'Оберіть час', chooseDate: 'Оберіть дату', portsTitle: 'Порти й трансфер', portsHint: 'Оберіть порти відправлення й прибуття та приватний трансфер.', continue: 'Продовжити', back: 'Назад', review: 'Перевірити підсумок', noBoats: 'Немає доступних човнів для цих фільтрів', reset: 'Скинути фільтри', showAll: 'Показати всі програми', formName: 'Як вас звати?', formPhone: 'Ваш номер телефону?', formEmail: 'Ваша електронна адреса?', formNotes: 'Є особливі побажання?', optional: 'Необов’язково',
  },
};

const bookingExperienceNotes = {
  it: {
    aperitivoCalloutTitle: 'Aperitivo disponibile solo su alcuni slot',
    aperitivoCalloutText: 'Solo gli slot Tramonto + Aperitivo e Giornata intera + Aperitivo includono l’abbinamento con il Gourmet Sunset Cruise. Supplemento €390.',
    earlyBirdLegend: 'Indica una data con sconto early bird per questa esperienza.',
  },
  en: {
    aperitivoCalloutTitle: 'Aperitivo available only on selected slots',
    aperitivoCalloutText: 'Only the Sunset + Aperitivo and Full Day + Aperitivo slots include the Gourmet Sunset Cruise pairing. €390 supplement.',
    earlyBirdLegend: 'Marks a date with an early bird discount for this experience.',
  },
  de: {
    aperitivoCalloutTitle: 'Aperitivo nur in ausgewählten Zeitfenstern',
    aperitivoCalloutText: 'Nur Sonnenuntergang + Aperitivo und Ganztag + Aperitivo enthalten die Kombination mit der Gourmet Sunset Cruise. Aufpreis €390.',
    earlyBirdLegend: 'Kennzeichnet ein Datum mit Frühbucherrabatt für dieses Erlebnis.',
  },
  es: {
    aperitivoCalloutTitle: 'Aperitivo disponible solo en algunos horarios',
    aperitivoCalloutText: 'Solo Atardecer + Aperitivo y Día completo + Aperitivo incluyen la combinación con Gourmet Sunset Cruise. Suplemento de €390.',
    earlyBirdLegend: 'Indica una fecha con descuento por reserva anticipada para esta experiencia.',
  },
  fr: {
    aperitivoCalloutTitle: 'Aperitivo disponible sur certains créneaux',
    aperitivoCalloutText: 'Seuls Coucher de soleil + Aperitivo et Journée complète + Aperitivo incluent la combinaison Gourmet Sunset Cruise. Supplément de €390.',
    earlyBirdLegend: 'Signale une date avec réduction early bird pour cette expérience.',
  },
  ar: {
    aperitivoCalloutTitle: 'الأبيريتيف متاح في أوقات محددة فقط',
    aperitivoCalloutText: 'فقط خياري الغروب + أبيريتيف واليوم الكامل + أبيريتيف يشملان الدمج مع Gourmet Sunset Cruise، بتكلفة إضافية €390.',
    earlyBirdLegend: 'تشير إلى تاريخ يتضمن خصم الحجز المبكر لهذه التجربة.',
  },
  zh: {
    aperitivoCalloutTitle: 'Aperitivo 仅在部分时段提供',
    aperitivoCalloutText: '仅日落 + Aperitivo 和全天 + Aperitivo 时段包含 Gourmet Sunset Cruise 组合，附加费 €390。',
    earlyBirdLegend: '表示该日期享有此体验的早鸟优惠。',
  },
  pl: {
    aperitivoCalloutTitle: 'Aperitivo tylko w wybranych godzinach',
    aperitivoCalloutText: 'Tylko Zachód + Aperitivo i Cały dzień + Aperitivo obejmują połączenie z Gourmet Sunset Cruise. Dopłata €390.',
    earlyBirdLegend: 'Oznacza datę ze zniżką early bird dla tej atrakcji.',
  },
  ru: {
    aperitivoCalloutTitle: 'Аперитив доступен только в отдельных слотах',
    aperitivoCalloutText: 'Только Закат + аперитив и Полный день + аперитив включают комбинацию с Gourmet Sunset Cruise. Доплата €390.',
    earlyBirdLegend: 'Отмечает дату со скидкой раннего бронирования для этой программы.',
  },
  uk: {
    aperitivoCalloutTitle: 'Аперитив доступний лише в окремих слотах',
    aperitivoCalloutText: 'Лише Захід + аперитив і Повний день + аперитив включають поєднання з Gourmet Sunset Cruise. Доплата €390.',
    earlyBirdLegend: 'Позначає дату зі знижкою раннього бронювання для цієї програми.',
  },
};

export function getBookingUi(lang) {
  const safeLang = bookingUi[lang] ? lang : 'en';
  return { ...bookingUi[safeLang], ...bookingExperienceNotes[safeLang] };
}
