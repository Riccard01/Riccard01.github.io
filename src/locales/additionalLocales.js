import en from './en';

const createLocale = ({
  localeCode,
  rtl = false,
  navbar,
  homepage,
  carousel,
  reviews,
  faq,
  privateTransfer,
  book,
  bookingFooter,
  bookingForm,
  calendar,
}) => ({
  ...en,
  localeCode,
  rtl,
  navbar: { ...en.navbar, ...navbar },
  homepage,
  experienceCarousel: {
    ...en.experienceCarousel,
    ...carousel,
    experiences: en.experienceCarousel.experiences.map((experience, index) => ({
      ...experience,
      ...carousel.experiences[index],
    })),
  },
  reviewCarousel: { ...en.reviewCarousel, ...reviews },
  faq: {
    ...en.faq,
    title: faq.title,
    items: en.faq.items.map((item, index) => ({ ...item, ...faq.items[index] })),
  },
  privateTransfer: { ...en.privateTransfer, ...privateTransfer },
  book: { ...en.book, ...book },
  bookingFooter: { ...en.bookingFooter, ...bookingFooter },
  bookingForm: { ...en.bookingForm, ...bookingForm },
  calendar: { ...en.calendar, ...calendar },
});

export const pt = createLocale({
  localeCode: 'pt-PT',
  navbar: { whatsappUs: 'Ligue-nos', switchLabel: 'Mudar idioma' },
  homepage: { title: 'Passeios privados de barco em Génova e Portofino', subtitle: 'Uma rota, mil emoções: itinerários privados e momentos ao seu ritmo. Stay Leggero!' },
  carousel: {
    sectionTitle: 'As nossas experiências', prevAria: 'Experiência anterior', nextAria: 'Experiência seguinte', dotAria: (index) => `Ir para a experiência ${index + 1}`, callUs: 'Fale connosco', durationAlt: 'Duração', guestsAlt: 'Pessoas',
    experiences: [
      { title: 'Cruzeiro Gourmet ao Pôr do Sol', time: '5 h', guests: 'Máx. 15', price: '€390 por grupo', desc: 'Deixe-se embalar pelas ondas e pelo Prosecco na romântica Boccadasse. Desfrute do aperitivo italiano de ‘Il Genovese’, enquanto os golfinhos dançam à nossa volta e as estrelas observam do alto.', occasionTags: ['Perfeito para aniversários', 'Despedidas de solteiro e solteira'], chips: ['Combustível incluído', 'Toalhas', 'Prosecco', 'Equipamento de snorkeling', 'Skipper'] },
      { title: 'Rainbow Tour', time: '5-10 h', guests: 'Máx. 5', price: 'Desde €750 por grupo', desc: 'Descubra as joias dos Dois Golfos ao seu ritmo, entre falésias, baías cristalinas e aldeias costeiras.', chips: ['Combustível incluído', 'Toalhas', 'Petiscos', 'Bebidas frescas', 'Equipamento de snorkeling', 'Skipper'] },
      { title: 'Transfer privado', time: '30 min', guests: 'Máx. 7', price: 'Desde €250 por grupo', desc: 'Evite o trânsito da costa da Ligúria com um transfer rápido e panorâmico por mar até Portofino ou Camogli.', chips: ['Combustível incluído', 'Skipper'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'Máx. 5', price: 'Desde €600 por grupo', desc: 'Passeio privado ao fim da tarde desde Génova, com paragens para nadar, visita a Camogli e chegada a Punta Chiappa.', chips: ['Privado', 'Paragens para nadar', 'Toalhas', 'Snorkeling', 'Presunto e melão', 'Foto/Vídeo', 'Skipper'] },
      { title: 'Stella Maris', time: '2 de agosto de 2026', guests: 'Evento anual', price: '€1200 por grupo', desc: 'A celebração marítima mais emblemática de Camogli, com procissão, Dragun e lanternas flutuantes.', chips: ['Tradição local', 'Procissão marítima', 'Dragun', 'Lanternas flutuantes', 'Toalhas', 'Snorkeling'] },
    ],
  },
  reviews: { title: 'Quem escolheu a Leggero', countLabel: 'avaliações', readMore: 'Ler mais', showLess: 'Mostrar menos', dotAria: (index) => `Ir para a avaliação ${index + 1}` },
  faq: {
    title: 'Perguntas frequentes',
    items: [
      { question: 'De que portos partem os passeios?', answer: 'Partimos dos principais portos da costa: Génova, Nervi, Recco, Camogli, Santa Margherita, Portofino e Rapallo.' },
      { question: 'Qual é a política de cancelamento?', answer: 'As condições variam conforme a experiência. Se cancelarmos por condições meteorológicas inseguras, pode remarcar ou receber o reembolso total.' },
      { question: 'O que acontece em caso de mau tempo?', answer: 'Se não for possível navegar em segurança, o passeio será adiado ou totalmente reembolsado.' },
      { question: 'O que devo levar a bordo?', answer: 'Recomendamos protetor solar, fato de banho e óculos de sol. Fornecemos água, toalhas e equipamento de snorkeling.' },
      { question: 'O que está incluído?', answer: 'Conforme a experiência: toalhas, petiscos, bebidas, música e equipamento de snorkeling. O combustível está incluído.' },
      { question: 'São permitidos animais a bordo?', answer: 'Sim, os animais são bem-vindos sob a supervisão dos donos.' },
      { question: 'O barco é seguro?', answer: 'Sim. As embarcações têm manutenção regular e equipamento de segurança obrigatório e adicional.' },
    ],
  },
  privateTransfer: { title: 'Transporte fácil', portsTitle: 'Portos de partida:', portsHint: 'Pode escolher pontos personalizados de partida e regresso.', discoverLocation: 'Ver localização' },
  book: { pageHeading: 'Reserve o seu passeio privado de barco', timeDropdown: 'Hora', guestsDropdown: 'Pessoas', callButtonLabel: 'Dúvidas? Fale connosco no WhatsApp!', callButtonAria: 'Falar no WhatsApp', recapTitle: 'Resumo da reserva', recapConfirm: 'Confirmar e pagar' },
  bookingFooter: { missingDate: 'Selecione uma data', total: 'Total', continue: 'Continuar', proceedToCheckout: 'Ir para o pagamento', port: 'Porto:', privateTransfer: 'Transfer privado:', pending: 'Pendente' },
  bookingForm: { personalDetailsTitle: 'Quem vem a bordo?', fullName: 'Nome completo', phone: 'Telefone', email: 'E-mail', notes: 'Notas importantes', processing: 'A processar pagamento...', payAndBook: 'Pagar e reservar', cardDetails: 'Dados do cartão' },
  calendar: { prevMonth: 'Mês anterior', nextMonth: 'Mês seguinte' },
});

export const nl = createLocale({
  localeCode: 'nl-NL',
  navbar: { whatsappUs: 'Bel ons', switchLabel: 'Taal wijzigen' },
  homepage: { title: 'Privéboottochten in Genua en Portofino', subtitle: 'Eén route, duizend emoties: privéprogramma’s en momenten volledig op jouw tempo. Stay Leggero!' },
  carousel: {
    sectionTitle: 'Onze ervaringen', prevAria: 'Vorige ervaring', nextAria: 'Volgende ervaring', dotAria: (index) => `Ga naar ervaring ${index + 1}`, callUs: 'Stuur een bericht', durationAlt: 'Duur', guestsAlt: 'Gasten',
    experiences: [
      { title: 'Gourmet zonsondergangscruise', time: '5 uur', guests: 'Max. 15', price: '€390 per groep', desc: 'Laat je in het romantische Boccadasse wiegen door de golven en Prosecco. Geniet van het Italiaanse aperitief van ‘Il Genovese’, terwijl dolfijnen om ons heen dansen en de sterren van boven toekijken.', occasionTags: ['Perfect voor verjaardagen', 'Vrijgezellenfeesten'], chips: ['Brandstof inbegrepen', 'Handdoeken', 'Prosecco', 'Snorkeluitrusting', 'Schipper'] },
      { title: 'Rainbow Tour', time: '5-10 uur', guests: 'Max. 5', price: 'Vanaf €750 per groep', desc: 'Ontdek de mooiste plekken van de Twee Golfen op je eigen tempo: kliffen, heldere baaien en sfeervolle kustdorpen.', chips: ['Brandstof inbegrepen', 'Handdoeken', 'Snacks', 'Frisse drankjes', 'Snorkeluitrusting', 'Schipper'] },
      { title: 'Privétransfer', time: '30 min', guests: 'Max. 7', price: 'Vanaf €250 per groep', desc: 'Vermijd het verkeer langs de Ligurische kust met een snelle, panoramische transfer over zee.', chips: ['Brandstof inbegrepen', 'Schipper'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'Max. 5', price: 'Vanaf €600 per groep', desc: 'Privétocht vanuit Genua in de namiddag en avond, met zwemstops, Camogli en aankomst in Punta Chiappa.', chips: ['Privé', 'Zwemstops', 'Handdoeken', 'Snorkelen', 'Ham en meloen', 'Foto/Video', 'Schipper'] },
      { title: 'Stella Maris', time: '2 augustus 2026', guests: 'Jaarlijks evenement', price: '€1200 per groep', desc: 'Het iconische zeefeest van Camogli met processie, de Dragun en drijvende lichtjes.', chips: ['Lokale traditie', 'Processie op zee', 'Dragun', 'Drijvende lichtjes', 'Handdoeken', 'Snorkelen'] },
    ],
  },
  reviews: { title: 'Wie voor Leggero koos', countLabel: 'beoordelingen', readMore: 'Lees meer', showLess: 'Toon minder', dotAria: (index) => `Ga naar beoordeling ${index + 1}` },
  faq: {
    title: 'Veelgestelde vragen',
    items: [
      { question: 'Vanuit welke havens vertrekken de tochten?', answer: 'Onze tochten vertrekken vanuit Genua, Nervi, Recco, Camogli, Santa Margherita, Portofino en Rapallo.' },
      { question: 'Wat zijn de annuleringsvoorwaarden?', answer: 'De voorwaarden verschillen per ervaring. Bij annulering door onveilig weer kun je omboeken of krijg je het volledige bedrag terug.' },
      { question: 'Wat gebeurt er bij slecht weer?', answer: 'Als veilig varen niet mogelijk is, wordt de tocht verplaatst of volledig terugbetaald.' },
      { question: 'Wat neem ik mee aan boord?', answer: 'Neem zonnebrand, zwemkleding en een zonnebril mee. Wij bieden water, handdoeken en snorkeluitrusting.' },
      { question: 'Wat is inbegrepen?', answer: 'Afhankelijk van de ervaring: handdoeken, snacks, drankjes, muziek en snorkeluitrusting. Brandstof is inbegrepen.' },
      { question: 'Zijn huisdieren toegestaan?', answer: 'Ja, huisdieren zijn welkom onder toezicht van hun eigenaar.' },
      { question: 'Is de boot veilig?', answer: 'Ja. Onze boten worden regelmatig onderhouden en hebben alle vereiste veiligheidsuitrusting.' },
    ],
  },
  privateTransfer: { title: 'Makkelijk vervoer', portsTitle: 'Onze vertrekhavens:', portsHint: 'Je kunt een eigen vertrek- en terugkeerpunt kiezen.', discoverLocation: 'Bekijk locatie' },
  book: { pageHeading: 'Boek je privéboottocht', timeDropdown: 'Tijd', guestsDropdown: 'Gasten', callButtonLabel: 'Vragen? Stuur ons een WhatsApp!', callButtonAria: 'Bericht via WhatsApp', recapTitle: 'Boekingsoverzicht', recapConfirm: 'Bevestigen en betalen' },
  bookingFooter: { missingDate: 'Selecteer een datum', total: 'Totaal', continue: 'Doorgaan', proceedToCheckout: 'Naar betalen', port: 'Haven:', privateTransfer: 'Privétransfer:', pending: 'In behandeling' },
  bookingForm: { personalDetailsTitle: 'Wie gaat er mee aan boord?', fullName: 'Volledige naam', phone: 'Telefoon', email: 'E-mail', notes: 'Belangrijke opmerkingen', processing: 'Betaling verwerken...', payAndBook: 'Betalen en boeken', cardDetails: 'Kaartgegevens' },
  calendar: { prevMonth: 'Vorige maand', nextMonth: 'Volgende maand' },
});

export const he = createLocale({
  localeCode: 'he-IL',
  rtl: true,
  navbar: { whatsappUs: 'התקשרו אלינו', switchLabel: 'החלפת שפה' },
  homepage: { title: 'סיורי סירה פרטיים בג׳נובה ובפורטופינו', subtitle: 'מסלול אחד, אלף רגשות: מסלולים פרטיים ורגעים בקצב שלכם. Stay Leggero!' },
  carousel: {
    sectionTitle: 'החוויות שלנו', prevAria: 'החוויה הקודמת', nextAria: 'החוויה הבאה', dotAria: (index) => `מעבר לחוויה ${index + 1}`, callUs: 'כתבו לנו', durationAlt: 'משך', guestsAlt: 'אורחים',
    experiences: [
      { title: 'שייט גורמה בשקיעה', time: '5 שעות', guests: 'עד 15', price: '€390 לקבוצה', desc: 'תנו לגלים ול-Prosecco לערסל אתכם בבוקאדאסה הרומנטית. תיהנו מהאפריטיף האיטלקי של ‘Il Genovese’, בזמן שהדולפינים רוקדים סביבנו והכוכבים מביטים מלמעלה.', occasionTags: ['מושלם לימי הולדת', 'מסיבות רווקים ורווקות'], chips: ['דלק כלול', 'מגבות', 'פרוסקו', 'ציוד שנורקל', 'סקיפר'] },
      { title: 'Rainbow Tour', time: '5-10 שעות', guests: 'עד 5', price: 'החל מ-€750 לקבוצה', desc: 'גלו את אוצרות שני המפרצים בקצב שלכם, בין מצוקים, מפרצים צלולים וכפרי חוף.', chips: ['דלק כלול', 'מגבות', 'נשנושים', 'משקאות קרים', 'ציוד שנורקל', 'סקיפר'] },
      { title: 'העברה פרטית', time: '30 דקות', guests: 'עד 7', price: 'החל מ-€250 לקבוצה', desc: 'דלגו על עומסי התנועה בחוף הליגורי עם העברה מהירה ונופית דרך הים.', chips: ['דלק כלול', 'סקיפר'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'עד 5', price: 'החל מ-€600 לקבוצה', desc: 'סיור פרטי אחר הצהריים ובערב מג׳נובה, עם עצירות שחייה, ביקור בקמולי והגעה לפונטה קיאפה.', chips: ['פרטי', 'עצירות שחייה', 'מגבות', 'שנורקל', 'פרושוטו ומלון', 'צילום', 'סקיפר'] },
      { title: 'Stella Maris', time: '2 באוגוסט 2026', guests: 'אירוע שנתי', price: '€1200 לקבוצה', desc: 'חגיגת הים האיקונית של קמולי עם תהלוכה, סירת Dragun ואורות צפים.', chips: ['מסורת מקומית', 'תהלוכה ימית', 'Dragun', 'אורות צפים', 'מגבות', 'שנורקל'] },
    ],
  },
  reviews: { title: 'מי שבחרו ב-Leggero', countLabel: 'ביקורות', readMore: 'קראו עוד', showLess: 'הצג פחות', dotAria: (index) => `מעבר לביקורת ${index + 1}` },
  faq: {
    title: 'שאלות נפוצות',
    items: [
      { question: 'מאילו נמלים יוצאים הסיורים?', answer: 'הסיורים יוצאים מג׳נובה, נרבי, רקו, קמולי, סנטה מרגריטה, פורטופינו ורפאלו.' },
      { question: 'מהי מדיניות הביטולים?', answer: 'התנאים משתנים לפי החוויה. אם נבטל בשל מזג אוויר לא בטוח, תוכלו לקבוע מועד חדש או לקבל החזר מלא.' },
      { question: 'מה קורה במזג אוויר גרוע?', answer: 'אם השיט אינו בטוח, הסיור יידחה או יינתן החזר מלא.' },
      { question: 'מה כדאי להביא לסירה?', answer: 'מומלץ להביא קרם הגנה, בגד ים ומשקפי שמש. אנו מספקים מים, מגבות וציוד שנורקל.' },
      { question: 'מה כלול בסיור?', answer: 'לפי החוויה: מגבות, נשנושים, משקאות, מוזיקה וציוד שנורקל. הדלק כלול.' },
      { question: 'האם מותר להביא חיות מחמד?', answer: 'כן, חיות מחמד מתקבלות בברכה בהשגחת הבעלים.' },
      { question: 'האם הסירה בטוחה?', answer: 'כן. הסירות מתוחזקות באופן קבוע ומצוידות בציוד הבטיחות הנדרש.' },
    ],
  },
  privateTransfer: { title: 'תחבורה נוחה', portsTitle: 'נמלי היציאה שלנו:', portsHint: 'ניתן לבחור נקודת יציאה וחזרה מותאמות.', discoverLocation: 'צפייה במיקום' },
  book: { pageHeading: 'הזמינו סיור סירה פרטי', timeDropdown: 'שעה', guestsDropdown: 'אורחים', callButtonLabel: 'יש שאלות? כתבו לנו ב-WhatsApp!', callButtonAria: 'כתיבה ב-WhatsApp', recapTitle: 'סיכום ההזמנה', recapConfirm: 'אישור ותשלום' },
  bookingFooter: { missingDate: 'בחרו תאריך', total: 'סה״כ', continue: 'המשך', proceedToCheckout: 'מעבר לתשלום', port: 'נמל:', privateTransfer: 'העברה פרטית:', pending: 'בהמתנה' },
  bookingForm: { personalDetailsTitle: 'מי מצטרף אלינו לסירה?', fullName: 'שם מלא', phone: 'טלפון', email: 'דוא״ל', notes: 'הערות חשובות', processing: 'מעבד תשלום...', payAndBook: 'תשלום והזמנה', cardDetails: 'פרטי כרטיס' },
  calendar: { prevMonth: 'החודש הקודם', nextMonth: 'החודש הבא' },
});

export const cs = createLocale({
  localeCode: 'cs-CZ',
  navbar: { whatsappUs: 'Zavolejte nám', switchLabel: 'Změnit jazyk' },
  homepage: { title: 'Soukromé plavby v Janově a Portofinu', subtitle: 'Jedna trasa, tisíc emocí: soukromé itineráře a chvíle zcela ve vašem tempu. Stay Leggero!' },
  carousel: {
    sectionTitle: 'Naše zážitky', prevAria: 'Předchozí zážitek', nextAria: 'Další zážitek', dotAria: (index) => `Přejít na zážitek ${index + 1}`, callUs: 'Napište nám', durationAlt: 'Délka', guestsAlt: 'Hosté',
    experiences: [
      { title: 'Gurmánská plavba při západu slunce', time: '5 hod.', guests: 'Max. 15', price: '€390 za skupinu', desc: 'Nechte se v romantickém Boccadasse kolébat vlnami a Proseccem. Vychutnejte si italské aperitivo od ‘Il Genovese’, zatímco kolem nás tančí delfíni a hvězdy shlížejí shora.', occasionTags: ['Ideální pro narozeniny', 'Rozlučky se svobodou'], chips: ['Palivo v ceně', 'Ručníky', 'Prosecco', 'Vybavení na šnorchlování', 'Kapitán'] },
      { title: 'Rainbow Tour', time: '5-10 hod.', guests: 'Max. 5', price: 'Od €750 za skupinu', desc: 'Objevte krásy Dvou zálivů vlastním tempem: útesy, čisté zátoky a půvabné pobřežní vesnice.', chips: ['Palivo v ceně', 'Ručníky', 'Občerstvení', 'Studené nápoje', 'Šnorchlování', 'Kapitán'] },
      { title: 'Soukromý transfer', time: '30 min', guests: 'Max. 7', price: 'Od €250 za skupinu', desc: 'Vyhněte se provozu na ligurském pobřeží rychlým a panoramatickým transferem po moři.', chips: ['Palivo v ceně', 'Kapitán'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'Max. 5', price: 'Od €600 za skupinu', desc: 'Soukromá odpolední a večerní plavba z Janova se zastávkami na koupání, návštěvou Camogli a příjezdem do Punta Chiappa.', chips: ['Soukromé', 'Koupání', 'Ručníky', 'Šnorchlování', 'Prosciutto a meloun', 'Foto/Video', 'Kapitán'] },
      { title: 'Stella Maris', time: '2. srpna 2026', guests: 'Každoroční akce', price: '€1200 za skupinu', desc: 'Ikonická námořní slavnost v Camogli s průvodem, lodí Dragun a plovoucími světly.', chips: ['Místní tradice', 'Námořní průvod', 'Dragun', 'Plovoucí světla', 'Ručníky', 'Šnorchlování'] },
    ],
  },
  reviews: { title: 'Kdo si vybral Leggero', countLabel: 'recenzí', readMore: 'Číst více', showLess: 'Zobrazit méně', dotAria: (index) => `Přejít na recenzi ${index + 1}` },
  faq: { title: 'Časté otázky', items: [
    { question: 'Z jakých přístavů plavby vyplouvají?', answer: 'Vyplouváme z Janova, Nervi, Recca, Camogli, Santa Margherity, Portofina a Rapalla.' },
    { question: 'Jaké jsou storno podmínky?', answer: 'Podmínky se liší podle zážitku. Při zrušení kvůli nebezpečnému počasí nabízíme nový termín nebo plnou náhradu.' },
    { question: 'Co se stane při špatném počasí?', answer: 'Pokud není plavba bezpečná, přesuneme ji nebo vrátíme celou částku.' },
    { question: 'Co si vzít na palubu?', answer: 'Doporučujeme opalovací krém, plavky a sluneční brýle. Poskytujeme vodu, ručníky a vybavení na šnorchlování.' },
    { question: 'Co je v ceně?', answer: 'Podle zážitku ručníky, občerstvení, nápoje, hudba a šnorchlovací vybavení. Palivo je zahrnuto.' },
    { question: 'Jsou povolena domácí zvířata?', answer: 'Ano, domácí zvířata jsou pod dohledem majitele vítána.' },
    { question: 'Je loď bezpečná?', answer: 'Ano. Lodě pravidelně udržujeme a mají povinné bezpečnostní vybavení.' },
  ] },
  privateTransfer: { title: 'Snadná doprava', portsTitle: 'Přístavy odjezdu:', portsHint: 'Můžete zvolit vlastní místo odjezdu a návratu.', discoverLocation: 'Zobrazit místo' },
  book: { pageHeading: 'Rezervujte si soukromou plavbu', timeDropdown: 'Čas', guestsDropdown: 'Hosté', callButtonLabel: 'Máte otázky? Napište nám na WhatsApp!', callButtonAria: 'Napsat na WhatsApp', recapTitle: 'Shrnutí rezervace', recapConfirm: 'Potvrdit a zaplatit' },
  bookingFooter: { missingDate: 'Vyberte datum', total: 'Celkem', continue: 'Pokračovat', proceedToCheckout: 'Přejít k platbě', port: 'Přístav:', privateTransfer: 'Soukromý transfer:', pending: 'Čeká se' },
  bookingForm: { personalDetailsTitle: 'Kdo se k nám přidá?', fullName: 'Celé jméno', phone: 'Telefon', email: 'E-mail', notes: 'Důležité poznámky', processing: 'Zpracování platby...', payAndBook: 'Zaplatit a rezervovat', cardDetails: 'Údaje karty' },
  calendar: { prevMonth: 'Předchozí měsíc', nextMonth: 'Další měsíc' },
});

export const ro = createLocale({
  localeCode: 'ro-RO',
  navbar: { whatsappUs: 'Sunați-ne', switchLabel: 'Schimbă limba' },
  homepage: { title: 'Tururi private cu barca în Genova și Portofino', subtitle: 'Un traseu, o mie de emoții: itinerarii private și momente în ritmul vostru. Stay Leggero!' },
  carousel: {
    sectionTitle: 'Experiențele noastre', prevAria: 'Experiența anterioară', nextAria: 'Experiența următoare', dotAria: (index) => `Mergi la experiența ${index + 1}`, callUs: 'Scrieți-ne', durationAlt: 'Durată', guestsAlt: 'Oaspeți',
    experiences: [
      { title: 'Croazieră gourmet la apus', time: '5 ore', guests: 'Max. 15', price: '€390 per grup', desc: 'Lăsați-vă legănați de valuri și Prosecco în romantica Boccadasse. Savurați aperitivul italian de la ‘Il Genovese’, în timp ce delfinii dansează în jurul nostru, iar stelele ne privesc de sus.', occasionTags: ['Perfect pentru aniversări', 'Petreceri de burlaci și burlăcițe'], chips: ['Combustibil inclus', 'Prosoape', 'Prosecco', 'Echipament snorkeling', 'Skipper'] },
      { title: 'Rainbow Tour', time: '5-10 ore', guests: 'Max. 5', price: 'De la €750 per grup', desc: 'Descoperiți comorile celor Două Golfuri în ritmul vostru: stânci, golfuri limpezi și sate de coastă.', chips: ['Combustibil inclus', 'Prosoape', 'Gustări', 'Băuturi reci', 'Snorkeling', 'Skipper'] },
      { title: 'Transfer privat', time: '30 min', guests: 'Max. 7', price: 'De la €250 per grup', desc: 'Evitați traficul de pe coasta Liguriei cu un transfer rapid și panoramic pe mare.', chips: ['Combustibil inclus', 'Skipper'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'Max. 5', price: 'De la €600 per grup', desc: 'Tur privat după-amiaza și seara din Genova, cu opriri pentru înot, Camogli și sosire la Punta Chiappa.', chips: ['Privat', 'Opriri pentru înot', 'Prosoape', 'Snorkeling', 'Prosciutto și pepene', 'Foto/Video', 'Skipper'] },
      { title: 'Stella Maris', time: '2 august 2026', guests: 'Eveniment anual', price: '€1200 per grup', desc: 'Sărbătoarea maritimă emblematică din Camogli, cu procesiune, Dragun și lumini plutitoare.', chips: ['Tradiție locală', 'Procesiune pe mare', 'Dragun', 'Lumini plutitoare', 'Prosoape', 'Snorkeling'] },
    ],
  },
  reviews: { title: 'Cei care au ales Leggero', countLabel: 'recenzii', readMore: 'Citește mai mult', showLess: 'Arată mai puțin', dotAria: (index) => `Mergi la recenzia ${index + 1}` },
  faq: { title: 'Întrebări frecvente', items: [
    { question: 'Din ce porturi pleacă tururile?', answer: 'Plecăm din Genova, Nervi, Recco, Camogli, Santa Margherita, Portofino și Rapallo.' },
    { question: 'Care este politica de anulare?', answer: 'Condițiile diferă în funcție de experiență. Dacă anulăm din cauza vremii nesigure, puteți reprograma sau primi rambursarea integrală.' },
    { question: 'Ce se întâmplă pe vreme rea?', answer: 'Dacă navigația nu este sigură, turul va fi amânat sau rambursat integral.' },
    { question: 'Ce să aduc la bord?', answer: 'Recomandăm cremă solară, costum de baie și ochelari de soare. Oferim apă, prosoape și echipament de snorkeling.' },
    { question: 'Ce este inclus?', answer: 'În funcție de experiență: prosoape, gustări, băuturi, muzică și echipament de snorkeling. Combustibilul este inclus.' },
    { question: 'Sunt permise animalele?', answer: 'Da, animalele sunt binevenite sub supravegherea proprietarului.' },
    { question: 'Barca este sigură?', answer: 'Da. Bărcile sunt întreținute regulat și au echipamentul de siguranță necesar.' },
  ] },
  privateTransfer: { title: 'Transport simplu', portsTitle: 'Porturile de plecare:', portsHint: 'Puteți alege puncte personalizate de plecare și întoarcere.', discoverLocation: 'Vezi locația' },
  book: { pageHeading: 'Rezervați turul privat cu barca', timeDropdown: 'Ora', guestsDropdown: 'Oaspeți', callButtonLabel: 'Întrebări? Scrieți-ne pe WhatsApp!', callButtonAria: 'Scrie pe WhatsApp', recapTitle: 'Rezumatul rezervării', recapConfirm: 'Confirmă și plătește' },
  bookingFooter: { missingDate: 'Selectați data', total: 'Total', continue: 'Continuă', proceedToCheckout: 'Mergi la plată', port: 'Port:', privateTransfer: 'Transfer privat:', pending: 'În așteptare' },
  bookingForm: { personalDetailsTitle: 'Cine vine la bord?', fullName: 'Nume complet', phone: 'Telefon', email: 'E-mail', notes: 'Note importante', processing: 'Se procesează plata...', payAndBook: 'Plătește și rezervă', cardDetails: 'Datele cardului' },
  calendar: { prevMonth: 'Luna anterioară', nextMonth: 'Luna următoare' },
});

export const tr = createLocale({
  localeCode: 'tr-TR',
  navbar: { whatsappUs: 'Bizi arayın', switchLabel: 'Dili değiştir' },
  homepage: { title: 'Cenova ve Portofino’da özel tekne turları', subtitle: 'Tek rota, bin duygu: tamamen kendi temponuza göre özel programlar ve anlar. Stay Leggero!' },
  carousel: {
    sectionTitle: 'Deneyimlerimiz', prevAria: 'Önceki deneyim', nextAria: 'Sonraki deneyim', dotAria: (index) => `${index + 1}. deneyime git`, callUs: 'Bize yazın', durationAlt: 'Süre', guestsAlt: 'Misafir',
    experiences: [
      { title: 'Gün Batımı Gurme Turu', time: '5 saat', guests: 'En fazla 15', price: 'Grup başına €390', desc: 'Romantik Boccadasse’de dalgaların ve Prosecco’nun sizi sallamasına izin verin. Yunuslar etrafımızda dans ederken ve yıldızlar yukarıdan izlerken ‘Il Genovese’ imzalı İtalyan aperitivosunun tadını çıkarın.', occasionTags: ['Doğum günleri için mükemmel', 'Bekârlığa veda partileri'], chips: ['Yakıt dahil', 'Havlu', 'Prosecco', 'Şnorkel ekipmanı', 'Kaptan'] },
      { title: 'Rainbow Tour', time: '5-10 saat', guests: 'En fazla 5', price: 'Grup başına €750’den', desc: 'İki Körfez’in güzelliklerini kendi temponuzda keşfedin: kayalıklar, berrak koylar ve sahil köyleri.', chips: ['Yakıt dahil', 'Havlu', 'Atıştırmalık', 'Soğuk içecekler', 'Şnorkel', 'Kaptan'] },
      { title: 'Özel transfer', time: '30 dk', guests: 'En fazla 7', price: 'Grup başına €250’den', desc: 'Ligurya kıyısındaki trafiği hızlı ve manzaralı bir deniz transferiyle geride bırakın.', chips: ['Yakıt dahil', 'Kaptan'] },
      { title: 'Dolce Vita', time: '17:00-21:00', guests: 'En fazla 5', price: 'Grup başına €600’dan', desc: 'Cenova’dan özel öğleden sonra ve akşam turu; yüzme molaları, Camogli ve Punta Chiappa varışı.', chips: ['Özel', 'Yüzme molaları', 'Havlu', 'Şnorkel', 'Prosciutto ve kavun', 'Fotoğraf/Video', 'Kaptan'] },
      { title: 'Stella Maris', time: '2 Ağustos 2026', guests: 'Yıllık etkinlik', price: 'Grup başına €1200', desc: 'Camogli’nin deniz alayı, Dragun ve yüzen ışıklarla simgeleşen deniz kutlaması.', chips: ['Yerel gelenek', 'Deniz alayı', 'Dragun', 'Yüzen ışıklar', 'Havlu', 'Şnorkel'] },
    ],
  },
  reviews: { title: 'Leggero’yu seçenler', countLabel: 'yorum', readMore: 'Devamını oku', showLess: 'Daha az göster', dotAria: (index) => `${index + 1}. yoruma git` },
  faq: { title: 'Sık sorulan sorular', items: [
    { question: 'Turlar hangi limanlardan kalkıyor?', answer: 'Cenova, Nervi, Recco, Camogli, Santa Margherita, Portofino ve Rapallo’dan hareket ediyoruz.' },
    { question: 'İptal politikası nedir?', answer: 'Koşullar deneyime göre değişir. Güvensiz hava nedeniyle iptal edersek yeni tarih veya tam iade sunarız.' },
    { question: 'Kötü havada ne olur?', answer: 'Güvenli seyir mümkün değilse tur ertelenir veya tam iade yapılır.' },
    { question: 'Tekneye ne getirmeliyim?', answer: 'Güneş kremi, mayo ve güneş gözlüğü öneririz. Su, havlu ve şnorkel ekipmanı sağlıyoruz.' },
    { question: 'Neler dahil?', answer: 'Deneyime göre havlu, atıştırmalık, içecek, müzik ve şnorkel ekipmanı. Yakıt dahildir.' },
    { question: 'Evcil hayvan kabul ediliyor mu?', answer: 'Evet, sahibinin gözetimindeki evcil hayvanlar kabul edilir.' },
    { question: 'Tekne güvenli mi?', answer: 'Evet. Tekneler düzenli bakımdan geçer ve gerekli güvenlik ekipmanlarına sahiptir.' },
  ] },
  privateTransfer: { title: 'Kolay ulaşım', portsTitle: 'Kalkış limanlarımız:', portsHint: 'Özel kalkış ve dönüş noktası seçebilirsiniz.', discoverLocation: 'Konumu gör' },
  book: { pageHeading: 'Özel tekne turunuzu ayırtın', timeDropdown: 'Saat', guestsDropdown: 'Misafirler', callButtonLabel: 'Sorunuz mu var? WhatsApp’tan yazın!', callButtonAria: 'WhatsApp’tan yaz', recapTitle: 'Rezervasyon özeti', recapConfirm: 'Onayla ve öde' },
  bookingFooter: { missingDate: 'Tarih seçin', total: 'Toplam', continue: 'Devam et', proceedToCheckout: 'Ödemeye geç', port: 'Liman:', privateTransfer: 'Özel transfer:', pending: 'Beklemede' },
  bookingForm: { personalDetailsTitle: 'Tekneye kimler katılıyor?', fullName: 'Ad soyad', phone: 'Telefon', email: 'E-posta', notes: 'Önemli notlar', processing: 'Ödeme işleniyor...', payAndBook: 'Öde ve ayırt', cardDetails: 'Kart bilgileri' },
  calendar: { prevMonth: 'Önceki ay', nextMonth: 'Sonraki ay' },
});

export const ja = createLocale({
  localeCode: 'ja-JP',
  navbar: { whatsappUs: 'お電話ください', switchLabel: '言語を変更' },
  homepage: { title: 'ジェノヴァとポルトフィーノのプライベートボートツアー', subtitle: 'ひとつの航路、千の感動。あなたのペースに合わせたプライベートな旅を。Stay Leggero!' },
  carousel: {
    sectionTitle: '体験プラン', prevAria: '前の体験', nextAria: '次の体験', dotAria: (index) => `体験${index + 1}へ移動`, callUs: 'お問い合わせ', durationAlt: '所要時間', guestsAlt: '定員',
    experiences: [
      { title: 'グルメ・サンセットクルーズ', time: '5時間', guests: '最大15名', price: '1グループ €390', desc: 'ロマンチックなボッカダッセで、波とプロセッコに身を委ねて。イル・ジェノヴェーゼ特製のイタリアン・アペリティーボを味わいながら、周囲で踊るイルカと空から見守る星々をお楽しみください。', occasionTags: ['誕生日に最適', 'バチェラー・バチェロレッテパーティー'], chips: ['燃料込み', 'タオル', 'プロセッコ', 'シュノーケル用品', '船長'] },
      { title: 'Rainbow Tour', time: '5〜10時間', guests: '最大5名', price: '1グループ €750〜', desc: '断崖、透明な入り江、美しい海辺の村々を巡り、二つの湾の魅力を自分たちのペースで楽しめます。', chips: ['燃料込み', 'タオル', '軽食', '冷たい飲み物', 'シュノーケル用品', '船長'] },
      { title: 'プライベート送迎', time: '30分', guests: '最大7名', price: '1グループ €250〜', desc: 'リグーリア海岸の渋滞を避け、海からポルトフィーノやカモーリへ快適に移動します。', chips: ['燃料込み', '船長'] },
      { title: 'Dolce Vita', time: '17:00〜21:00', guests: '最大5名', price: '1グループ €600〜', desc: 'ジェノヴァ発の夕方のプライベートツアー。遊泳、カモーリ散策、プンタ・キアッパへの到着を楽しみます。', chips: ['貸切', '遊泳', 'タオル', 'シュノーケル', '生ハムとメロン', '写真・動画', '船長'] },
      { title: 'Stella Maris', time: '2026年8月2日', guests: '年1回のイベント', price: '1グループ €1200', desc: '海上行列、Dragun、海に浮かぶ灯りで知られるカモーリの象徴的な海の祭典です。', chips: ['地域の伝統', '海上行列', 'Dragun', '海上の灯り', 'タオル', 'シュノーケル'] },
    ],
  },
  reviews: { title: 'Leggeroを選んだお客様', countLabel: '件のレビュー', readMore: '続きを読む', showLess: '閉じる', dotAria: (index) => `レビュー${index + 1}へ移動` },
  faq: { title: 'よくある質問', items: [
    { question: 'どの港から出発しますか？', answer: 'ジェノヴァ、ネルヴィ、レッコ、カモーリ、サンタ・マルゲリータ、ポルトフィーノ、ラパッロから出発します。' },
    { question: 'キャンセル条件は？', answer: '条件は体験ごとに異なります。危険な天候により当社が中止する場合は、日程変更または全額返金を承ります。' },
    { question: '悪天候の場合は？', answer: '安全に航行できない場合、延期または全額返金となります。' },
    { question: '持ち物は？', answer: '日焼け止め、水着、サングラスをおすすめします。水、タオル、シュノーケル用品はご用意します。' },
    { question: '料金に含まれるものは？', answer: 'プランによりタオル、軽食、飲み物、音楽、シュノーケル用品が含まれます。燃料代は込みです。' },
    { question: 'ペットは同乗できますか？', answer: 'はい。飼い主様の管理のもとで同乗できます。' },
    { question: 'ボートは安全ですか？', answer: 'はい。定期的に整備し、必要な安全装備を搭載しています。' },
  ] },
  privateTransfer: { title: '便利な送迎', portsTitle: '出発港:', portsHint: '出発地と帰着地を自由に選べます。', discoverLocation: '場所を見る' },
  book: { pageHeading: 'プライベートボートツアーを予約', timeDropdown: '時間', guestsDropdown: '人数', callButtonLabel: 'ご質問はWhatsAppへ', callButtonAria: 'WhatsAppで問い合わせ', recapTitle: '予約内容', recapConfirm: '確認して支払う' },
  bookingFooter: { missingDate: '日付を選択', total: '合計', continue: '次へ', proceedToCheckout: '支払いへ', port: '港:', privateTransfer: '専用送迎:', pending: '未確定' },
  bookingForm: { personalDetailsTitle: '乗船される方', fullName: '氏名', phone: '電話番号', email: 'メール', notes: 'ご要望', processing: '決済処理中...', payAndBook: '支払って予約', cardDetails: 'カード情報' },
  calendar: { prevMonth: '前の月', nextMonth: '次の月' },
});

export const ko = createLocale({
  localeCode: 'ko-KR',
  navbar: { whatsappUs: '전화하기', switchLabel: '언어 변경' },
  homepage: { title: '제노바와 포르토피노 프라이빗 보트 투어', subtitle: '하나의 항로, 천 가지 감동. 온전히 여러분의 속도에 맞춘 프라이빗 여정을 만나보세요. Stay Leggero!' },
  carousel: {
    sectionTitle: '투어 프로그램', prevAria: '이전 프로그램', nextAria: '다음 프로그램', dotAria: (index) => `${index + 1}번 프로그램으로 이동`, callUs: '문의하기', durationAlt: '소요 시간', guestsAlt: '인원',
    experiences: [
      { title: '고메 선셋 크루즈', time: '5시간', guests: '최대 15명', price: '그룹당 €390', desc: '낭만적인 보카다세에서 파도와 프로세코에 몸을 맡겨보세요. 돌고래가 우리 곁에서 춤추고 별들이 하늘에서 내려다보는 동안 ‘Il Genovese’의 이탈리안 아페리티보를 즐겨보세요.', occasionTags: ['생일에 완벽한 선택', '총각·처녀 파티'], chips: ['연료 포함', '수건', '프로세코', '스노클링 장비', '선장'] },
      { title: 'Rainbow Tour', time: '5~10시간', guests: '최대 5명', price: '그룹당 €750부터', desc: '절벽, 맑은 만, 아름다운 해안 마을을 따라 두 만의 보석 같은 풍경을 원하는 속도로 만나보세요.', chips: ['연료 포함', '수건', '간식', '차가운 음료', '스노클링 장비', '선장'] },
      { title: '프라이빗 이동', time: '30분', guests: '최대 7명', price: '그룹당 €250부터', desc: '리구리아 해안의 교통 체증을 피해 포르토피노 또는 카몰리까지 빠르고 아름답게 이동합니다.', chips: ['연료 포함', '선장'] },
      { title: 'Dolce Vita', time: '17:00~21:00', guests: '최대 5명', price: '그룹당 €600부터', desc: '제노바에서 출발해 수영, 카몰리 방문, 푼타 키아파 도착으로 이어지는 프라이빗 오후·저녁 투어입니다.', chips: ['프라이빗', '수영', '수건', '스노클링', '프로슈토와 멜론', '사진·영상', '선장'] },
      { title: 'Stella Maris', time: '2026년 8월 2일', guests: '연례 행사', price: '그룹당 €1200', desc: '해상 행렬, Dragun, 바다 위의 불빛으로 유명한 카몰리의 상징적인 해양 축제입니다.', chips: ['지역 전통', '해상 행렬', 'Dragun', '바다 위 불빛', '수건', '스노클링'] },
    ],
  },
  reviews: { title: 'Leggero를 선택한 고객', countLabel: '개 후기', readMore: '더 보기', showLess: '접기', dotAria: (index) => `${index + 1}번 후기` },
  faq: { title: '자주 묻는 질문', items: [
    { question: '어느 항구에서 출발하나요?', answer: '제노바, 네르비, 레코, 카몰리, 산타 마르게리타, 포르토피노, 라팔로에서 출발합니다.' },
    { question: '취소 정책은 어떻게 되나요?', answer: '조건은 프로그램마다 다릅니다. 위험한 날씨로 당사가 취소하는 경우 일정 변경 또는 전액 환불이 가능합니다.' },
    { question: '날씨가 좋지 않으면 어떻게 되나요?', answer: '안전한 운항이 어려우면 투어를 연기하거나 전액 환불합니다.' },
    { question: '무엇을 준비해야 하나요?', answer: '선크림, 수영복, 선글라스를 권장합니다. 물, 수건, 스노클링 장비는 제공됩니다.' },
    { question: '무엇이 포함되나요?', answer: '프로그램에 따라 수건, 간식, 음료, 음악, 스노클링 장비가 포함됩니다. 연료비는 포함입니다.' },
    { question: '반려동물도 탈 수 있나요?', answer: '네. 보호자의 관리 아래 동반할 수 있습니다.' },
    { question: '보트는 안전한가요?', answer: '네. 정기적으로 정비하며 필수 안전 장비를 갖추고 있습니다.' },
  ] },
  privateTransfer: { title: '편리한 이동', portsTitle: '출발 항구:', portsHint: '출발지와 귀환지를 직접 선택할 수 있습니다.', discoverLocation: '위치 보기' },
  book: { pageHeading: '프라이빗 보트 투어 예약', timeDropdown: '시간', guestsDropdown: '인원', callButtonLabel: '궁금한 점은 WhatsApp으로 문의하세요', callButtonAria: 'WhatsApp 문의', recapTitle: '예약 요약', recapConfirm: '확인 및 결제' },
  bookingFooter: { missingDate: '날짜 선택', total: '합계', continue: '계속', proceedToCheckout: '결제로 이동', port: '항구:', privateTransfer: '프라이빗 이동:', pending: '대기 중' },
  bookingForm: { personalDetailsTitle: '탑승자 정보', fullName: '이름', phone: '전화번호', email: '이메일', notes: '요청 사항', processing: '결제 처리 중...', payAndBook: '결제 및 예약', cardDetails: '카드 정보' },
  calendar: { prevMonth: '이전 달', nextMonth: '다음 달' },
});