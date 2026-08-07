import { additionalSeoUi } from './additionalUi';

const seoUi = {
  it: {
    home: {
      title: 'Tour Privati in Barca Genova e Portofino | Leggero Tours',
      description: 'Tour privati in barca con skipper tra Genova, Camogli, San Fruttuoso e Portofino, nel Golfo Paradiso e nel Golfo del Tigullio.',
    },
    book: {
      title: 'Prenota il Tuo Tour Privato in Barca | Leggero Tours',
      description: 'Scegli esperienza, data, ospiti e porto di partenza per il tuo tour privato in barca in Liguria.',
    },
  },
  en: {
    home: {
      title: 'Private Boat Tours Genoa & Portofino | Leggero Tours',
      description: 'Private boat tours with skipper from Genoa to Camogli, San Fruttuoso and Portofino, across Golfo Paradiso and the Tigullio Gulf.',
    },
    book: {
      title: 'Book a Private Boat Tour in Liguria | Leggero Tours',
      description: 'Choose your experience, date, guests and departure port for a private boat tour along the Ligurian coast.',
    },
  },
  de: {
    home: {
      title: 'Private Bootstouren Genua & Portofino | Leggero Tours',
      description: 'Private Bootstouren mit Skipper von Genua über Camogli und San Fruttuoso bis Portofino, im Golfo Paradiso und Golf von Tigullio.',
    },
    book: {
      title: 'Private Bootstour in Ligurien buchen | Leggero Tours',
      description: 'Wähle Erlebnis, Datum, Gäste und Abfahrtshafen für deine private Bootstour an der ligurischen Küste.',
    },
  },
  es: {
    home: {
      title: 'Tours Privados en Barco Génova y Portofino | Leggero Tours',
      description: 'Tours privados en barco con patrón entre Génova, Camogli, San Fruttuoso y Portofino, por Golfo Paradiso y el golfo del Tigullio.',
    },
    book: {
      title: 'Reserva un Tour Privado en Barco | Leggero Tours',
      description: 'Elige experiencia, fecha, personas y puerto de salida para tu tour privado en barco por la costa de Liguria.',
    },
  },
  fr: {
    home: {
      title: 'Excursions Privées en Bateau Gênes & Portofino | Leggero Tours',
      description: 'Excursions privées avec skipper entre Gênes, Camogli, San Fruttuoso et Portofino, dans le Golfo Paradiso et le golfe du Tigullio.',
    },
    book: {
      title: 'Réserver une Excursion Privée en Bateau | Leggero Tours',
      description: 'Choisissez expérience, date, participants et port de départ pour votre excursion privée sur la côte ligure.',
    },
  },
  ar: {
    home: {
      title: 'جولات قارب خاصة من جنوة إلى بورتوفينو | Leggero Tours',
      description: 'جولات قارب خاصة مع ربان بين جنوة وكامولي وسان فروتوزو وبورتوفينو عبر خليج باراديسو وخليج تيغوليو.',
    },
    book: {
      title: 'احجز جولة قارب خاصة في ليغوريا | Leggero Tours',
      description: 'اختر التجربة والتاريخ وعدد الضيوف وميناء الانطلاق لجولة قارب خاصة على ساحل ليغوريا.',
    },
  },
  zh: {
    home: {
      title: '热那亚至 Portofino 私人船游 | Leggero Tours',
      description: '配备船长的私人船游，途经热那亚、Camogli、San Fruttuoso 和 Portofino，航行于 Golfo Paradiso 与 Tigullio 海湾。',
    },
    book: {
      title: '预订利古里亚私人船游 | Leggero Tours',
      description: '选择体验、日期、人数和出发港，预订利古里亚海岸私人船游。',
    },
  },
  pl: {
    home: {
      title: 'Prywatne Rejsy Genua i Portofino | Leggero Tours',
      description: 'Prywatne rejsy ze skipperem z Genui przez Camogli i San Fruttuoso do Portofino, po Golfo Paradiso i Zatoce Tigullio.',
    },
    book: {
      title: 'Zarezerwuj Prywatny Rejs w Ligurii | Leggero Tours',
      description: 'Wybierz atrakcję, datę, liczbę gości i port wypłynięcia na prywatny rejs wzdłuż wybrzeża Ligurii.',
    },
  },
  ru: {
    home: {
      title: 'Частные прогулки Генуя и Портофино | Leggero Tours',
      description: 'Частные прогулки со шкипером из Генуи через Камольи и Сан-Фруттуозо в Портофино, по заливам Парадизо и Тигуллио.',
    },
    book: {
      title: 'Забронировать частную прогулку в Лигурии | Leggero Tours',
      description: 'Выберите программу, дату, число гостей и порт отправления для частной прогулки вдоль побережья Лигурии.',
    },
  },
  uk: {
    home: {
      title: 'Приватні прогулянки Генуя й Портофіно | Leggero Tours',
      description: 'Приватні прогулянки зі шкіпером з Генуї через Камольї та Сан-Фруттуозо до Портофіно, затоками Парадізо й Тігулліо.',
    },
    book: {
      title: 'Забронювати приватну прогулянку в Лігурії | Leggero Tours',
      description: 'Оберіть програму, дату, кількість гостей і порт відправлення для приватної прогулянки узбережжям Лігурії.',
    },
  },
  ...additionalSeoUi,
};

export function getSeoUi(lang, page) {
  return seoUi[lang]?.[page] || seoUi.en[page] || {};
}
