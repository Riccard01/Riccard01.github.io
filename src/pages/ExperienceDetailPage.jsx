import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrivateTransfer from '../components/PrivateTransfer';
import { getLocale } from '../utils/locale';
import { getExperienceIdFromSlug } from '../utils/experienceRoutes';
import { localizeDolceVita } from '../locales/dolceVitaDetails';
import { localizeExperienceDetail, localizeRainbowTourContent } from '../locales/experienceDetailLocalization';
import { getExperienceUi } from '../locales/experienceUi';
import { trackWhatsAppClick } from '../utils/googleAdsConversions';
import { getWhatsAppUrl } from '../utils/whatsapp';
import img4 from '../assets/mariana.webp';
import img5 from '../assets/aperitivo.webp';
import marianImg from '../assets/marian.webp';
import florenceImg from '../assets/florence.webp';
import camoVideo from '../assets/camo.mp4';
import cinVideo from '../assets/cin.mp4';
import specialImg from '../assets/special.webp';
import specialVideo from '../assets/special.mov';
import portoAnticoImg from '../assets/portoantico.webp';
import camogliImg from '../assets/port-camogli.webp';
import portofinoImg from '../assets/portofino_extra_fee.webp';
import santaMargheritaImg from '../assets/santa_margherita_ligure_extra_fee.webp';
import nerviImg from '../assets/nervi.webp';
import reccoImg from '../assets/port-recco.webp';
import sanFruttuosoImg from '../assets/sanfrut.webp';
import puntaChiappaImg from '../assets/puntachiappa.webp';
import fallbackPortImg from '../assets/camo.webp';
import clockIcon from '../assets/clock_dark.svg';
import guestsIcon from '../assets/guests_dark.svg';
import './ExperienceDetailPage.css';

const HERO_IMAGE_BY_EXPERIENCE_ID = {
  '0': img4,
  '1': img5,
  '2': marianImg,
  '4': florenceImg,
  '3': specialImg,
};

const HERO_VIDEO_BY_EXPERIENCE_ID = {
  '1': cinVideo,
};

function getPortImage(port) {
  const searchableText = `${port?.name || ''} ${port?.area || ''} ${port?.mapsUrl || ''}`.toLowerCase();

  if (searchableText.includes('punta chiappa')) return puntaChiappaImg;
  if (searchableText.includes('portofino')) return portofinoImg;
  if (searchableText.includes('nervi')) return nerviImg;
  if (searchableText.includes('recco')) return reccoImg;
  if (
    searchableText.includes('porto antico') ||
    searchableText.includes('old port') ||
    searchableText.includes('genova') ||
    searchableText.includes('genoa')
  ) {
    return portoAnticoImg;
  }
  if (searchableText.includes('camogli')) return camogliImg;

  return fallbackPortImg;
}

function getAvatarLaneClass(index, total) {
  if (total <= 1) return 'avatar-center';
  const centerIndex = Math.floor(total / 2);
  if (index === centerIndex) return 'avatar-center';
  return 'avatar-side';
}

function getVisiblePortIndexes(total, selectedIndex) {
  if (total <= 3) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const start = Math.max(0, Math.min(selectedIndex - 1, total - 3));
  return [start, start + 1, start + 2];
}

function getRainbowTourContent(lang) {
  const isItalian = lang === 'it';

  const base = isItalian
    ? {
        heroFacts: ['6 slot orari disponibili', 'Fino a 5 ospiti'],
        basePrice: 600,
        introTitle: 'Descrizione',
        intro: [
          'Love in Portofino è un piccolo viaggio privato lungo la Riviera, pensato per chi vuole alternare la navigazione alle soste a terra.',
          'Si parte dal punto più comodo, poi si raggiungono i borghi con tempo per passeggiare, pranzare in autonomia e godersi il ritmo del mare.',
          'A bordo restano il prosciutto e melone, le foto e i video dello staff e tutta la libertà di costruire la giornata con il proprio gruppo.',
        ],
        departureProfiles: [
          {
            id: 'tigullio',
            title: 'Parti dal Tigullio',
            price: '€600',
            note: 'Percorso più diretto alle tappe',
            points: [
              {
                name: 'Nervi',
                area: 'Imbarco comodo per chi arriva da levante',
                note: 'Parcheggio lungo mare e accesso rapido al molo.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
                image: nerviImg,
                imageAlt: 'Porto di Nervi',
              },
              {
                name: 'Recco',
                area: 'Partenza pratica per il Golfo Paradiso',
                note: 'Buona soluzione per gruppi che arrivano dalla costa intermedia.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
                image: reccoImg,
                imageAlt: 'Porto di Recco',
              },
              {
                name: 'Camogli',
                area: 'Partenza nel borgo più iconico del percorso',
                note: 'Ideale per chi vuole restare già nel cuore del tour.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
                image: camogliImg,
                imageAlt: 'Porto di Camogli',
              },
              {
                name: 'Santa Margherita Ligure',
                area: 'Partenza elegante e ben collegata',
                note: 'Comoda per gruppi che soggiornano nel Tigullio.',
                multiplier: 1.3,
                mapsUrl: 'https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6',
                image: santaMargheritaImg,
                imageAlt: 'Porto di Santa Margherita Ligure',
              },
              {
                name: 'Portofino',
                area: 'Imbarco premium nel borgo più iconico della Riviera',
                note: 'Ideale se soggiorni già in zona Portofino e vuoi un imbarco diretto.',
                multiplier: 1.1,
                mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
                image: portofinoImg,
                imageAlt: 'Porto di Portofino',
              },
              {
                name: 'Rapallo',
                area: 'Partenza strategica con collegamenti comodi',
                note: 'Punto utile per gruppi alloggiati tra Golfo del Tigullio e entroterra.',
                multiplier: 1.4,
                mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Porto+di+Rapallo',
                image: fallbackPortImg,
                imageAlt: 'Porto di Rapallo',
              },
            ],
          },
          {
            id: 'genova',
            title: 'Parti da Genova',
            price: '€600',
            note: 'Traversata panoramica più lunga',
            points: [
              {
                name: 'Genova (Porto Antico)',
                area: 'Imbarco principale',
                note: 'Punto centrale, facile da raggiungere e perfetto per vedere più costa lungo il tragitto.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
                image: portoAnticoImg,
                imageAlt: 'Porto Antico di Genova',
              },
            ],
          },
        ],
        stopsTitle: 'Le tappe',
        stops: [
          {
            name: 'Camogli',
            title: 'Camogli',
            description: 'Le case colorate del borgo, una passeggiata sul lungomare e il tempo per una sosta a terra in autonomia.',
            image: camogliImg,
            imageAlt: 'Camogli',
          },
          {
            name: 'Portofino',
            title: 'Portofino',
            description: 'La tappa elegante del tour, con sbarco a terra per visitare il borgo e pranzare liberamente.',
            image: portofinoImg,
            imageAlt: 'Portofino',
          },
          {
            name: 'San Fruttuoso',
            title: 'San Fruttuoso',
            description: 'L acqua turchese e la cala raccolta rendono questa sosta una delle più suggestive della giornata.',
            image: sanFruttuosoImg,
            imageAlt: 'San Fruttuoso',
          },
          {
            name: 'Punta Chiappa',
            title: 'Punta Chiappa',
            description: 'Uno scorcio selvaggio di roccia bianca e mare cristallino, tappa fissa del tour esattamente come le altre.',
            image: puntaChiappaImg,
            imageAlt: 'Punta Chiappa',
          },
        ],
        includedTitle: 'Cosa è incluso',
        included: [
          'Skipper dedicato',
          'Carburante per la rotta della giornata',
          'Asciugamani a bordo',
          'Attrezzatura snorkeling',
          'Prosciutto e melone a bordo come piccolo ristoro',
          'Foto e video ricordo realizzati dallo staff di bordo',
        ],
        excludedTitle: 'Non incluso',
        excluded: [
          'Pranzo e pasti a terra nei borghi',
          'Bevande e snack extra oltre al ristoro base',
        ],
        departureTitle: 'Punti di partenza',
        departureIntro: 'Qui trovi i dettagli pratici di tutti i 7 punti di imbarco, con relativo moltiplicatore e prezzo finale per porto.',
        departurePriceNote:
          'Prezzo finale per porto = prezzo profilo (Genova o Tigullio) × moltiplicatore del porto. Base operativa Porto Antico x1.',
        timeSlotsTitle: 'Slot orari disponibili',
        timeSlots: [
          'Mattina 9:00 - 14:00',
          'Tramonto 16:00 - 21:00',
          'Esteso 9:00 - 16:00',
          'Giornata intera 9:00 - 21:00',
          'Tramonto + Aperitivo 16:00 - 21:00 €390',
          'Giornata intera + Aperitivo 9:00 - 21:00 €390',
        ],
        practicalTitle: 'Consigli pratici',
        practical: [
          'Porta scarpe comode per le soste a terra e un costume se vuoi fare il bagno a San Fruttuoso.',
          'Tieni con te un po di contanti per pranzo e piccole spese nei borghi.',
          'Se vi fermate a Portofino, conviene prenotare il pranzo in anticipo nei periodi più affollati.',
          'Foto e video sono già inclusi, ma una macchina fotografica personale può sempre essere utile.',
        ],
        extrasTitle: 'Combinazioni ed extra',
        extras: [
          'L attività può essere combinata con l aperitivo del Gourmet Sunset Cruise.',
          'L aperitivo è disponibile negli slot Sunset e Full Day con supplemento di €390.',
          'È disponibile anche il servizio navetta extra chiamato Transfer Privato di Terra.',
        ],
        faqTitle: 'Domande frequenti',
        faqs: [
          { q: 'Qual è la differenza tra partire da Genova e partire dal Tigullio?', a: 'Da Genova la traversata è più lunga e panoramica; dal Tigullio il percorso è più diretto verso le tappe e il prezzo è più basso.' },
          { q: 'Punta Chiappa è inclusa nel tour?', a: 'Sì, Punta Chiappa è una tappa fissa del percorso, esattamente come Camogli, Portofino e San Fruttuoso.' },
          { q: 'Il pranzo è incluso?', a: 'No, il pranzo e i pasti a terra non sono inclusi: il gruppo paga in loco nei borghi.' },
          { q: 'Il tour è privato o condiviso con altri gruppi?', a: 'È sempre privato, con barca esclusiva per il vostro gruppo.' },
          { q: 'Quanto dura esattamente il tour?', a: 'È un tour di mezza giornata, con durata e ritmo che si adattano al punto di partenza e alle soste scelte.' },
          { q: 'Le foto e i video sono inclusi nel prezzo?', a: 'Sì, sono sempre inclusi e realizzati dallo staff di bordo.' },
          { q: 'Qual è la politica di cancellazione?', a: 'Consulta la nostra politica di cancellazione generale.', link: { label: 'Consulta la nostra politica di cancellazione', href: '/it/policy' } },
        ],
        ctaTitle: 'Pronto a salpare?',
        ctaText: 'Prenota ora Love in Portofino oppure scrivici su WhatsApp per richieste personalizzate, tappe extra o esigenze del gruppo.',
      }
    : {
        heroFacts: ['6 available time slots', 'Up to 5 guests'],
        basePrice: 600,
        introTitle: 'Description',
        intro: [
          'Love in Portofino is a private journey along the Riviera, designed for guests who want to mix cruising with shore stops in the villages.',
          'You board from the most convenient departure point and then visit the villages with time to walk around, have lunch on your own and enjoy the rhythm of the sea.',
          'On board you will have prosciutto and melon, photos and videos from the crew, and the freedom to shape the day with your group.',
        ],
        departureProfiles: [
          {
            id: 'tigullio',
            title: 'Depart from the Tigullio',
            price: '€600',
            note: 'More direct route to the stops',
            points: [
              {
                name: 'Nervi',
                area: 'Easy boarding for guests arriving from the east side',
                note: 'Parking by the seafront and quick access to the pier.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
                image: nerviImg,
                imageAlt: 'Nervi harbor',
              },
              {
                name: 'Recco',
                area: 'Practical departure for the Genoa gulf area',
                note: 'A good fit for groups coming from the intermediate coastline.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
                image: reccoImg,
                imageAlt: 'Recco harbor',
              },
              {
                name: 'Camogli',
                area: 'Board in the most iconic village of the route',
                note: 'Perfect if you want to start already inside the spirit of the tour.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
                image: camogliImg,
                imageAlt: 'Camogli harbor',
              },
              {
                name: 'Santa Margherita Ligure',
                area: 'Elegant, well-connected departure',
                note: 'A convenient choice for groups staying in the Tigullio area.',
                multiplier: 1.3,
                mapsUrl: 'https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6',
                image: santaMargheritaImg,
                imageAlt: 'Santa Margherita Ligure harbor',
              },
              {
                name: 'Portofino',
                area: 'Premium boarding in the most iconic Riviera village',
                note: 'Best if you are already staying near Portofino and want direct boarding.',
                multiplier: 1.1,
                mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
                image: portofinoImg,
                imageAlt: 'Portofino harbor',
              },
              {
                name: 'Rapallo',
                area: 'Strategic departure with easy local connections',
                note: 'Useful for groups based between the Tigullio Gulf and inland areas.',
                multiplier: 1.4,
                mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Porto+di+Rapallo',
                image: fallbackPortImg,
                imageAlt: 'Rapallo harbor',
              },
            ],
          },
          {
            id: 'genova',
            title: 'Depart from Genoa',
            price: '€600',
            note: 'Longer scenic crossing',
            points: [
              {
                name: 'Genoa (Old Port)',
                area: 'Main embarkation',
                note: 'Central, easy to reach, and ideal for seeing more coastline on the way.',
                multiplier: 1,
                mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
                image: portoAnticoImg,
                imageAlt: 'Genoa Old Port',
              },
            ],
          },
        ],
        stopsTitle: 'The stops',
        stops: [
          {
            name: 'Camogli',
            title: 'Camogli',
            description: 'A village of colorful houses, a walk by the sea and time to explore ashore at your own pace.',
            image: camogliImg,
            imageAlt: 'Camogli',
          },
          {
            name: 'Portofino',
            title: 'Portofino',
            description: 'The elegant stop of the tour, with time ashore to visit the village and have lunch independently.',
            image: portofinoImg,
            imageAlt: 'Portofino',
          },
          {
            name: 'San Fruttuoso',
            title: 'San Fruttuoso',
            description: 'Turquoise water and a sheltered bay make this one of the most atmospheric stops of the day.',
            image: sanFruttuosoImg,
            imageAlt: 'San Fruttuoso',
          },
          {
            name: 'Punta Chiappa',
            title: 'Punta Chiappa',
            description: 'A wild stretch of white rock and crystal-clear water, a fixed stop of the tour just like the others.',
            image: puntaChiappaImg,
            imageAlt: 'Punta Chiappa',
          },
        ],
        includedTitle: 'What is included',
        included: [
          'Dedicated skipper',
          'Fuel for the day route',
          'Towels onboard',
          'Snorkeling gear',
          'Prosciutto and melon onboard as a light refreshment',
          'Photo and video memories produced by the onboard staff',
        ],
        excludedTitle: 'Not included',
        excluded: [
          'Lunch and meals ashore in the villages',
          'Extra drinks and snacks beyond the basic refreshment',
        ],
        departureTitle: 'Departure points',
        departureIntro: 'Below you can find practical details for all 7 boarding points, including port multiplier and final fare.',
        departurePriceNote:
          'Final port fare = profile fare (Genoa or Tigullio) × port multiplier. Old Port operational base is x1.',
        timeSlotsTitle: 'Available time slots',
        timeSlots: [
          'Morning 9AM - 2PM',
          'Sunset 4PM - 9PM',
          'Extended 9AM - 4PM',
          'Full Day 9AM - 9PM',
          'Sunset + Aperitivo 4PM - 9PM €390',
          'Full Day + Aperitivo 9AM - 9PM €390',
        ],
        practicalTitle: 'Practical tips',
        practical: [
          'Bring comfortable shoes for shore stops and a swimsuit if you want to swim in San Fruttuoso.',
          'Keep some cash for lunch and small expenses in the villages.',
          'If you plan to stop in Portofino, it is wise to book lunch in advance during busy periods.',
          'Photos and videos are already included, but a personal camera can still be handy.',
        ],
        extrasTitle: 'Combinations and extras',
        extras: [
          'This activity can be combined with the Gourmet Sunset Cruise aperitivo.',
          'The aperitivo is available on the Sunset and Full Day slots for €390.',
          'An extra land shuttle service called Private Ground Transfer is also available.',
        ],
        faqTitle: 'Frequently asked questions',
        faqs: [
          { q: 'What is the difference between departing from Genoa and from the Tigullio?', a: 'From Genoa the crossing is longer and more scenic; from the Tigullio the route is more direct and the price is lower.' },
          { q: 'Is Punta Chiappa included in the tour?', a: 'Yes, Punta Chiappa is a fixed stop on the route, just like Camogli, Portofino and San Fruttuoso.' },
          { q: 'Is lunch included?', a: 'No, lunch and meals ashore are not included: the group pays directly on site in the villages.' },
          { q: 'Is the tour private or shared with other groups?', a: 'It is always private, with an exclusive boat for your group.' },
          { q: 'How long does the tour last exactly?', a: 'It is a half-day tour, with duration and pace adjusted to the departure point and the chosen stops.' },
          { q: 'Are photos and videos included in the price?', a: 'Yes, they are always included and produced by the onboard staff.' },
          { q: 'What is the cancellation policy?', a: 'Please consult our general cancellation policy.', link: { label: 'Consult our cancellation policy', href: '/en/policy' } },
        ],
        ctaTitle: 'Ready to set sail?',
        ctaText: 'Book Love in Portofino now, or write to us on WhatsApp for custom requests, extra stops or group needs.',
      };

  return localizeRainbowTourContent(lang, base);
}

function getBaseDolceVitaContent(lang) {
  const isItalian = lang === 'it';

  return isItalian
    ? {
        name: 'Dolce Vita',
        heroFacts: ['17:00-22:00', 'Fino a 5 ospiti'],
        basePrice: 600,
        shortDescriptionTitle: 'Descrizione',
        shortDescription: [
          'Dolce Vita è un tour privato pomeridiano-serale che parte da Genova e segue la costa con soste bagno nelle calette più piacevoli.',
          'Dopo la tappa a Camogli, la navigazione continua fino a Punta Chiappa, dove il gruppo può scegliere di cenare presso il ristorante convenzionato Stella Maris.',
          'La barca resta sempre esclusiva per il vostro gruppo, con ritmo rilassato e tempi costruiti su misura della giornata.',
        ],
        routeTitle: 'Il percorso',
        routeStops: [
          {
            name: 'Genova (Porto Antico)',
            description:
              'Imbarco nel cuore del porto storico e partenza nel tardo pomeriggio, quando la luce rende la costa ancora più suggestiva.',
            image: portoAnticoImg,
            imageAlt: 'Porto Antico di Genova',
          },
          {
            name: 'Soste bagno lungo costa',
            description:
              'Durante la navigazione sono previste soste in acque limpide per un bagno e per godersi il mare con calma.',
            image: sanFruttuosoImg,
            imageAlt: 'Sosta bagno in mare',
          },
          {
            name: 'Camogli',
            description:
              'Tappa nel borgo di Camogli, tra case colorate e atmosfera marittima autentica, con tempo per una breve passeggiata.',
            image: camogliImg,
            imageAlt: 'Camogli',
          },
          {
            name: 'Punta Chiappa',
            description:
              'Arrivo finale a Punta Chiappa per vivere il momento più scenografico della serata e, se desiderato, la cena da Stella Maris.',
            image: puntaChiappaImg,
            imageAlt: 'Punta Chiappa',
          },
        ],
        dinnerTitle: 'La cena da Stella Maris (facoltativa, convenzionata)',
        dinnerDescription: [
          'Stella Maris è un resort storico del 700 immerso nel verde, raggiungibile solo via mare, all interno di un area marina protetta.',
          'Il ristorante panoramico affaccia sul Golfo Paradiso e propone cucina ligure con pesce fresco locale.',
        ],
        dinnerImportant:
          'La cena non è inclusa nel prezzo del tour. La convenzione Leggero Tours offre priorità di prenotazione e/o tariffa agevolata, ma il pasto si paga direttamente al ristorante.',
        dinnerBookingNote:
          'Per assicurare disponibilità, consigliamo di richiedere la prenotazione della cena già al momento della prenotazione del tour.',
        includedTitle: 'Cosa è incluso',
        included: [
          'Skipper dedicato',
          'Carburante per la rotta prevista',
          'Soste bagno lungo il percorso',
          'Asciugamani a bordo',
          'Attrezzatura snorkeling',
          'Prosciutto e melone a bordo come piccolo ristoro',
          'Foto e video ricordo realizzati dallo staff di bordo',
        ],
        excludedTitle: 'Cosa NON è incluso',
        excluded: [
          'Cena da Stella Maris (extra facoltativo, convenzionato, da pagare direttamente al ristorante)',
          'Bevande e snack extra oltre al ristoro base a bordo',
        ],
        departureTitle: 'Punti di partenza',
        departureIntro:
          'La base operativa è Genova Porto Antico (moltiplicatore x1). Sono disponibili anche Recco, Nervi, Camogli, Portofino, Rapallo e Santa Margherita Ligure: il prezzo finale si calcola applicando il moltiplicatore del porto alla base di €600.',
        departurePriceNote: 'Prezzo finale = €600 × moltiplicatore porto di partenza.',
        departurePoints: [
          {
            name: 'Genova (Porto Antico)',
            area: 'Base operativa principale',
            note: 'Nessun extra rispetto alla tariffa base.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
            image: portoAnticoImg,
            imageAlt: 'Porto Antico di Genova',
          },
          {
            name: 'Recco',
            area: 'Imbarco lato Golfo Paradiso',
            note: 'Nessun extra rispetto alla tariffa base.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
            image: reccoImg,
            imageAlt: 'Porto di Recco',
          },
          {
            name: 'Nervi',
            area: 'Partenza comoda da levante Genova',
            note: 'Nessun extra rispetto alla tariffa base.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
            image: nerviImg,
            imageAlt: 'Porto di Nervi',
          },
          {
            name: 'Camogli',
            area: 'Imbarco diretto nel borgo',
            note: 'Nessun extra rispetto alla tariffa base.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
            image: camogliImg,
            imageAlt: 'Porto di Camogli',
          },
          {
            name: 'Portofino',
            area: 'Porto premium con extra fee',
            note: 'Applicato moltiplicatore extra fee.',
            multiplier: 1.1,
            mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
            image: portofinoImg,
            imageAlt: 'Porto di Portofino',
          },
          {
            name: 'Rapallo',
            area: 'Porto con extra fee',
            note: 'Moltiplicatore più alto tra i porti disponibili.',
            multiplier: 1.4,
            mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Porto+di+Rapallo',
            image: fallbackPortImg,
            imageAlt: 'Porto di Rapallo',
          },
          {
            name: 'Santa Margherita Ligure',
            area: 'Porto con extra fee',
            note: 'Partenza premium nel Tigullio.',
            multiplier: 1.3,
            mapsUrl: 'https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6',
            image: santaMargheritaImg,
            imageAlt: 'Porto di Santa Margherita Ligure',
          },
        ],
        departureNotes: [
          'Il Porto Antico resta la base operativa con tariffa di riferimento (€600).',
          'Per gli altri porti il prezzo viene adeguato con il moltiplicatore indicato in tabella.',
          'Ogni porto mantiene capienza, durata e servizi del tour invariati.',
          'Ogni punto di imbarco è raggiungibile in auto o taxi; consigliamo sempre margine per parcheggio e check-in.',
          'Per gruppi con esigenze specifiche, il team può supportare il coordinamento dell arrivo.',
        ],
        practicalTitle: 'Consigli pratici',
        practical: [
          'Porta costume e telo per le soste bagno lungo la costa.',
          'Indossa scarpe comode per la tappa a Camogli.',
          'Se prenoti la cena serale, valuta un cambio o un outfit più curato per Stella Maris.',
          'Considera un budget extra per la cena, non inclusa nel tour.',
          'Tieni con te carta o contanti per eventuali spese a terra.',
        ],
        faqTitle: 'Domande frequenti',
        faqs: [
          {
            q: 'La cena a Stella Maris è inclusa nel prezzo?',
            a: 'No, la cena non è inclusa nel prezzo del tour: viene pagata direttamente al ristorante.',
          },
          {
            q: 'Come funziona la convenzione con il ristorante?',
            a: 'La convenzione Leggero Tours offre priorità di prenotazione e/o una tariffa agevolata; i dettagli vengono confermati in fase di richiesta.',
          },
          {
            q: 'Possiamo fare il bagno durante il tour?',
            a: 'Sì, il tour prevede soste bagno lungo la costa, compatibilmente con mare e sicurezza.',
          },
          {
            q: 'Il tour è privato o condiviso con altri gruppi?',
            a: 'È sempre privato: la barca è esclusiva per il vostro gruppo.',
          },
          {
            q: 'Quanto dura esattamente il tour?',
            a: '5 ore complessive, indicativamente dalle 17:00 alle 22:00.',
          },
          {
            q: 'Le foto e i video sono inclusi nel prezzo?',
            a: 'Sì, foto e video sono sempre inclusi e realizzati dallo staff di bordo.',
          },
          {
            q: 'Qual è la politica di cancellazione?',
            a: 'Per la policy completa consulta la pagina dedicata del sito.',
            link: { label: 'Consulta la politica di cancellazione', href: '/it/policy' },
          },
        ],
        ctaTitle: 'Prenota la tua Dolce Vita',
        ctaText:
          'Prenota ora il tour e, se vuoi, richiedi contestualmente la cena da Stella Maris per vivere il passaggio dal mare alla serata panoramica in modo fluido e organizzato.',
      }
    : {
        name: 'Dolce Vita',
        heroFacts: ['17:00-22:00', 'Up to 5 guests'],
        basePrice: 600,
        shortDescriptionTitle: 'Description',
        shortDescription: [
          'Dolce Vita is a private late-afternoon and evening tour departing from Genoa, with swim stops along the coast.',
          'After a stop in Camogli, the route continues to Punta Chiappa, where guests can choose to dine at the partner restaurant Stella Maris.',
          'The boat is always exclusive to your group, with a relaxed and flexible pace.',
        ],
        routeTitle: 'The route',
        routeStops: [
          {
            name: 'Genoa (Old Port)',
            description: 'Boarding from Genoa Old Port and departure in the late afternoon, when coastal light is at its best.',
            image: portoAnticoImg,
            imageAlt: 'Genoa Old Port',
          },
          {
            name: 'Swim stops along the coast',
            description: 'During navigation, swim breaks in clear water are planned whenever conditions are suitable.',
            image: sanFruttuosoImg,
            imageAlt: 'Swim stop at sea',
          },
          {
            name: 'Camogli',
            description: 'A stop in Camogli among colorful facades and an authentic seaside atmosphere.',
            image: camogliImg,
            imageAlt: 'Camogli',
          },
          {
            name: 'Punta Chiappa',
            description: 'Final arrival at Punta Chiappa for the most scenic part of the evening and optional dinner at Stella Maris.',
            image: puntaChiappaImg,
            imageAlt: 'Punta Chiappa',
          },
        ],
        dinnerTitle: 'Dinner at Stella Maris (optional, partner venue)',
        dinnerDescription: [
          'Stella Maris is a historic 18th-century resort set in greenery, reachable only by sea, inside a protected marine area.',
          'Its panoramic restaurant overlooks the Golfo Paradiso and serves Ligurian cuisine with local fresh fish.',
        ],
        dinnerImportant:
          'Dinner is not included in the tour price. The Leggero Tours partnership offers booking priority and/or a reduced rate, but the meal is paid directly to the restaurant.',
        dinnerBookingNote:
          'To secure availability, we suggest requesting dinner booking when confirming the tour.',
        includedTitle: 'What is included',
        included: [
          'Dedicated skipper',
          'Fuel for the planned route',
          'Swim stops along the coast',
          'Towels onboard',
          'Snorkeling gear',
          'Prosciutto and melon onboard as a light refreshment',
          'Photo and video memories produced by the onboard staff',
        ],
        excludedTitle: 'What is NOT included',
        excluded: [
          'Dinner at Stella Maris (optional extra with partner benefit, paid directly to the restaurant)',
          'Extra drinks and snacks beyond the basic onboard refreshment',
        ],
        departureTitle: 'Departure points',
        departureIntro:
          'The operational base is Genoa Old Port (x1 multiplier). Recco, Nervi, Camogli, Portofino, Rapallo and Santa Margherita Ligure are also available: final price is calculated by applying the departure-port multiplier to the €600 base fare.',
        departurePriceNote: 'Final fare = €600 × departure-port multiplier.',
        departurePoints: [
          {
            name: 'Genoa (Old Port)',
            area: 'Main operational base',
            note: 'No extra compared to the base fare.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
            image: portoAnticoImg,
            imageAlt: 'Genoa Old Port',
          },
          {
            name: 'Recco',
            area: 'Boarding from the Golfo Paradiso side',
            note: 'No extra compared to the base fare.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
            image: reccoImg,
            imageAlt: 'Recco harbor',
          },
          {
            name: 'Nervi',
            area: 'Convenient east-side Genoa departure',
            note: 'No extra compared to the base fare.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
            image: nerviImg,
            imageAlt: 'Nervi harbor',
          },
          {
            name: 'Camogli',
            area: 'Direct boarding in the village',
            note: 'No extra compared to the base fare.',
            multiplier: 1,
            mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
            image: camogliImg,
            imageAlt: 'Camogli harbor',
          },
          {
            name: 'Portofino',
            area: 'Premium port with extra fee',
            note: 'Extra-fee multiplier applied.',
            multiplier: 1.1,
            mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
            image: portofinoImg,
            imageAlt: 'Portofino harbor',
          },
          {
            name: 'Rapallo',
            area: 'Port with extra fee',
            note: 'Highest multiplier among available ports.',
            multiplier: 1.4,
            mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Porto+di+Rapallo',
            image: fallbackPortImg,
            imageAlt: 'Rapallo harbor',
          },
          {
            name: 'Santa Margherita Ligure',
            area: 'Port with extra fee',
            note: 'Premium departure point in Tigullio.',
            multiplier: 1.3,
            mapsUrl: 'https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6',
            image: santaMargheritaImg,
            imageAlt: 'Santa Margherita Ligure harbor',
          },
        ],
        departureNotes: [
          'Genoa Old Port remains the operational base and reference fare (€600).',
          'For other ports, final fare is adjusted by the shown multiplier.',
          'Tour duration, privacy and onboard services remain unchanged for every departure point.',
          'All ports are reachable by car or taxi; we recommend arrival margin for parking and check-in.',
          'For specific group needs, our team can help coordinate arrival logistics.',
        ],
        practicalTitle: 'Practical tips',
        practical: [
          'Bring a swimsuit and towel for coastal swim stops.',
          'Wear comfortable shoes for the Camogli stop.',
          'If booking dinner, consider bringing a change or a more refined evening outfit for Stella Maris.',
          'Plan an extra budget for dinner, which is not included in the tour.',
          'Keep a card or some cash for potential onshore expenses.',
        ],
        faqTitle: 'Frequently asked questions',
        faqs: [
          {
            q: 'Is dinner at Stella Maris included in the price?',
            a: 'No, dinner is not included in the tour price and is paid directly at the restaurant.',
          },
          {
            q: 'How does the restaurant partnership work?',
            a: 'The Leggero Tours partnership offers booking priority and/or a reduced rate; details are confirmed during booking.',
          },
          {
            q: 'Can we swim during the tour?',
            a: 'Yes, the itinerary includes swim stops along the coast when sea and safety conditions allow.',
          },
          {
            q: 'Is the tour private or shared?',
            a: 'It is always private: the boat is exclusive to your group.',
          },
          {
            q: 'How long is the tour exactly?',
            a: 'Total duration is 5 hours, typically from 17:00 to 22:00.',
          },
          {
            q: 'Are photos and videos included in the price?',
            a: 'Yes, photos and videos are always included and produced by the onboard staff.',
          },
          {
            q: 'What is the cancellation policy?',
            a: 'Please refer to the dedicated cancellation policy page on the site.',
            link: { label: 'Consult cancellation policy', href: '/en/policy' },
          },
        ],
        ctaTitle: 'Book your Dolce Vita',
        ctaText:
          'Book the tour now and, if you wish, request Stella Maris dinner at the same time for a smooth transition from sea to evening experience.',
      };
}

function getDolceVitaContent(lang) {
  return localizeDolceVita(lang, getBaseDolceVitaContent(lang));
}

const EXPERIENCE_DETAIL_CONTENT = {
  it: {
    '0': {
      charterType: 'Charter giornaliero privato tra Camogli, San Fruttuoso e Portofino',
      routeTitle: 'Rotta consigliata',
      route: [
        'Partenza da Genova Porto Antico o punto concordato.',
        'Navigazione verso Camogli, poi San Fruttuoso e infine Portofino.',
        'Tempo libero per una sosta breve in ciascuna tappa, meteo permettendo.',
        'Rientro costiero verso il porto di partenza.',
      ],
      includedTitle: 'Cosa e incluso',
      included: [
        'Skipper professionale e briefing sicurezza iniziale.',
        'Carburante per la rotta standard della giornata.',
        'Teli mare e attrezzatura snorkeling a bordo.',
        'Snack e drink freschi selezionati.',
      ],
      optionalTitle: 'Extra su richiesta',
      optional: [
        'Prolungamento orario oltre la durata prevista.',
        'Itinerario completamente custom con tappe aggiuntive.',
        'Aperitivo premium o catering dedicato.',
      ],
      timelineTitle: 'Programma indicativo',
      timeline: [
        'Check-in: 20 minuti prima della partenza.',
        'Navigazione tra Camogli, San Fruttuoso e Portofino.',
        'Pausa breve nelle tappe principali.',
        'Rientro con vista costa.',
      ],
      faqTitle: 'Informazioni utili',
      faqs: [
        {
          q: 'Serve esperienza nautica?',
          a: 'No, e un charter con skipper: devi solo goderti la giornata.',
        },
        {
          q: 'La rotta e fissa?',
          a: 'La rotta e flessibile e viene adattata a meteo, mare e preferenze del gruppo.',
        },
        {
          q: 'Cosa portare?',
          a: 'Costume, crema solare, cappello, eventuale felpa leggera e documento.',
        },
      ],
      mapTitle: 'Mini mappa e porti consigliati',
      mapCaption: 'Rotta semplice con tappe a Camogli, San Fruttuoso e Portofino.',
      ports: [
        {
          name: 'Genova Porto Antico',
          area: 'Imbarco principale',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Camogli',
          area: 'Sosta panoramica',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Portofino',
          area: 'Tappa premium',
          mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
        },
      ],
    },
    '1': {
      charterType: 'Esperienza privata con skipper dedicato, barca esclusiva per il gruppo',
      heroFacts: [
        '18:00–23:00',
        'Fino a 7 ospiti (15 con doppia barca)',
      ],
      introTitle: 'Descrizione',
      intro: [
        'Lasciati cullare dalle onde e dal Prosecco nel romantico borgo di Boccadasse. Goditi l’aperitivo italiano firmato ‘Il Genovese’, mentre i delfini danzano intorno a noi e le stelle ci osservano dall’alto.',
        'Durante il tragitto capita spesso di incontrare i delfini, senza però poterlo garantire.',
        'La barca resta ormeggiata in rada davanti a Boccadasse per il tramonto e la degustazione gourmet a bordo.',
      ],
      includedTitle: 'Cosa è incluso',
      included: [
        'Skipper',
        'Carburante',
        'Asciugamani a bordo',
        'Attrezzatura snorkeling',
        'Degustazione ricca con più portate e finger food',
        'Prosecco: 3 bottiglie ogni 7 persone incluse nel prezzo',
        'Foto e video ricordo realizzati dallo staff di bordo',
      ],
      excludedTitle: 'Non incluso',
      excluded: [
        'Bevande extra oltre le 3 bottiglie incluse ogni 7 persone',
        'Eventuali trasferimenti',
        'Mance',
      ],
      departureTitle: 'Punto di partenza',
      departureIntro: 'Imbarco al Porto Antico di Genova. Il ritrovo consigliato è 15-20 minuti prima della partenza delle 18:00.',
      departureNotes: [
        'Il punto è comodo da raggiungere in auto, taxi o a piedi dal centro città.',
        'Se arrivi in auto, considera un po di margine per il parcheggio nelle ore serali.',
        'In caso di dubbi logistici, ti aiutiamo a coordinare l arrivo prima dell imbarco.',
      ],
      departureMapLabel: 'Porto Antico di Genova',
      departureMapUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
      departureImageAlt: 'Porto Antico di Genova',
      routeTitle: 'Rotta',
      routeIntro: 'Si naviga dal Porto Antico verso Boccadasse, poi si resta in rada per il tramonto e la degustazione.',
      routeSteps: [
        'Partenza dal Porto Antico e navigazione costiera.',
        'Passaggio davanti a Boccadasse con possibilità di avvistare i delfini lungo il tragitto.',
        'Sosta in rada davanti a Boccadasse per il tramonto e il servizio gourmet.',
      ],
      routeCaption: 'Rotta essenziale, senza fretta, pensata per godersi luce, mare e servizio di bordo.',
      scheduleTitle: 'Orari e durata',
      schedule: [
        'Ritrovo: 17:40-17:45 al Porto Antico.',
        'Partenza: 18:00.',
        'Durata totale: 5 ore, fino alle 23:00.',
        'Disponibile tutto l anno: l orario resta coerente, mentre la luce del tramonto varia con la stagione.',
      ],
      practicalTitle: 'Consigli pratici',
      practical: [
        'Porta una giacca leggera per la sera e scarpe antiscivolo.',
        'Se vuoi, porta anche la macchina fotografica: foto e video sono già inclusi nello staff di bordo.',
        'Il menu è fisso e tutto a base di glutine: non è adatto a chi è intollerante al glutine e non è personalizzabile per intolleranze.',
        'Le bevande extra oltre le tre bottiglie incluse sono disponibili a pagamento.',
      ],
      faqTitle: 'Domande frequenti',
      faqs: [
        { q: 'Da dove si parte esattamente?', a: 'Dal Porto Antico di Genova, con ritrovo consigliato 15-20 minuti prima della partenza.' },
        { q: 'Il tour è privato o condiviso con altri gruppi?', a: 'È sempre privato, con barca esclusiva per il vostro gruppo.' },
        { q: 'Siamo in più di 7 persone, possiamo prenotare comunque?', a: 'Sì, con l opzione combinata che prevede una seconda barca per gruppi fino a 15 persone.' },
        { q: 'Cosa succede in caso di maltempo?', a: 'Se il meteo non consente l uscita in sicurezza, è previsto il rimborso.' },
        { q: 'È adatto a bambini e anziani?', a: 'Sì, è un esperienza versatile e privata, adatta anche a famiglie e gruppi misti.' },
        { q: 'Posso richiedere un menu personalizzato o segnalare allergie?', a: 'No, il menu è fisso e tutto a base di glutine, quindi non è adatto a chi è intollerante al glutine e non è personalizzabile per intolleranze.' },
        { q: 'Il menu può essere adattato per intolleranze?', a: 'No, il menu è fisso e tutto a base di glutine, quindi non è adatto a chi è intollerante al glutine.' },
        { q: 'Le foto e i video sono davvero inclusi nel prezzo?', a: 'Sì, sono realizzati dallo staff di bordo e inclusi nella proposta.' },
        { q: 'Vedremo sicuramente i delfini?', a: 'No, non è garantito: durante la navigazione capita spesso di incontrarli, ma resta un incontro possibile.' },
        { q: 'Qual è la politica di cancellazione e rimborso?', a: 'Il rimborso è previsto solo in caso di maltempo, non per cancellazione libera.' },
      ],
      ctaTitle: 'Pronto a salpare?',
      ctaText: 'Prenota ora il tuo tramonto privato oppure scrivici su WhatsApp per richieste personalizzate e per l uscita combinata fino a 15 persone.',
      ports: [
        {
          name: 'Genova Porto Antico',
          area: 'Partenza',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Nervi',
          area: 'Vista costa al tramonto',
          mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
        },
        {
          name: 'Recco',
          area: 'Rientro/stop alternativo',
          mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
        },
      ],
    },
    '2': {
      charterType: 'Transfer nautico privato point-to-point',
      routeTitle: 'Rotta consigliata',
      route: [
        'Partenza da porto concordato nel Golfo di Genova.',
        'Rotta diretta lungo costa verso Camogli o Portofino.',
        'Navigazione rapida con panorami costieri e zero traffico stradale.',
        'Sbarco nel porto di destinazione con assistenza bagagli leggeri.',
      ],
      includedTitle: 'Cosa e incluso',
      included: [
        'Skipper professionale e imbarcazione riservata al gruppo.',
        'Carburante sulla tratta prenotata.',
        'Giubbotti e dotazioni sicurezza certificate.',
        'Assistenza coordinamento orario di imbarco/sbarco.',
      ],
      optionalTitle: 'Extra su richiesta',
      optional: [
        'Attesa in destinazione per transfer di rientro.',
        'Upgrade mezzo terrestre premium per collegamenti inland.',
        'Sosta fotografica breve lungo rotta, se compatibile con timing.',
      ],
      timelineTitle: 'Programma indicativo',
      timeline: [
        'Check-in rapido al molo (15-20 minuti prima).',
        'Imbarco e partenza immediata.',
        'Navigazione diretta sulla tratta scelta.',
        'Arrivo e supporto sbarco.',
      ],
      faqTitle: 'Informazioni utili',
      faqs: [
        {
          q: 'Quanto dura il transfer?',
          a: 'In media circa 30 minuti, variabile in base a tratta e condizioni del mare.',
        },
        {
          q: 'Posso portare bagagli?',
          a: 'Si, bagagli leggeri e compatti; per esigenze speciali meglio segnalarlo in anticipo.',
        },
        {
          q: 'E disponibile tutti i giorni?',
          a: 'Si su prenotazione, con conferma in base a meteo e disponibilita equipaggio.',
        },
      ],
      mapTitle: 'Mini mappa e porti consigliati',
      mapCaption: 'Tratte point-to-point piu richieste nella Riviera di Levante.',
      ports: [
        {
          name: 'Genova Porto Antico',
          area: 'Partenza frequente',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Camogli',
          area: 'Arrivo rapido',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Portofino',
          area: 'Arrivo premium',
          mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
        },
      ],
    },
    '3': {
      introTitle: 'Descrizione',
      intro: [
        'La Festa della Stella Maris cade sempre la prima domenica di agosto: nel 2026 è il 2 agosto. Il Dragun, la storica imbarcazione a forma di drago, salpa verso Punta Chiappa per il rito davanti all altare della Stella Maris, mentre un corteo di barche a bandiera spiegata segue la processione lungo la costa. Al calare della sera centinaia di lumini vengono affidati al mare, davanti alla spiaggia di Camogli.',
        'La giornata si scandisce in tre momenti: al mattino si apre la festa con l uscita simbolica del Dragun, nel pomeriggio il paese si anima tra porto, vicoli e Punta Chiappa, e in serata il corteo nautico raggiunge il culmine con i lumini che scendono in mare.',
        'Ti accompagniamo con un punto di riferimento prima dell evento, una rotta pensata per non perdere i momenti più suggestivi da terra e dal mare, supporto all imbarco e allo sbarco nei punti consigliati e indicazioni aggiornate su navette e viabilità in base alle comunicazioni ufficiali del Comune. A bordo trovi anche teli da mare e set completo per lo snorkeling.',
      ],
      faqTitle: 'Informazioni utili',
      faqs: [
        {
          q: 'La data è sempre la stessa?',
          a: 'No, cambia ogni anno perché cade sempre la prima domenica di agosto: nel 2026 è il 2 agosto.',
        },
        {
          q: 'È un evento organizzato da voi?',
          a: 'No, è una ricorrenza pubblica e molto sentita dal paese. Il nostro ruolo è accompagnarti con logistica e consigli su misura.',
        },
        {
          q: 'Dove trovo il programma e gli orari ufficiali?',
          a: 'Il Comune di Camogli pubblica ogni anno un avviso ufficiale con programma completo e orari delle navette.',
        },
        {
          q: 'Meglio seguire la festa dal mare o da terra?',
          a: 'Dipende da cosa cerchi: dal mare eviti code e traffico, da terra vivi di più l atmosfera tra i vicoli del paese.',
        },
      ],
      mapTitle: 'Punti utili per vivere la festa',
      mapCaption: 'Le zone migliori per seguire corteo, rito religioso e lumini tra porto e Punta Chiappa.',
      ports: [
        {
          name: 'Porto di Camogli',
          area: 'Cuore della festa e partenza del corteo',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Punta Chiappa',
          area: 'Altare della Stella Maris',
          mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Punta+Chiappa+Camogli',
        },
        {
          name: 'Genova Porto Antico',
          area: 'Punto di partenza consigliato per il transfer',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
      ],
    },
  },
  en: {
    '0': {
      charterType: 'Private day charter visiting Camogli, San Fruttuoso and Portofino',
      routeTitle: 'Suggested route',
      route: [
        'Departure from Genoa Old Port or agreed meeting point.',
        'Cruise to Camogli, then San Fruttuoso and finally Portofino.',
        'Short free time at each stop, weather permitting.',
        'Coastal return to the departure port.',
      ],
      includedTitle: 'What is included',
      included: [
        'Professional skipper and safety briefing.',
        'Fuel for the standard day route.',
        'Beach towels and snorkeling gear onboard.',
        'Selected snacks and fresh drinks.',
      ],
      optionalTitle: 'Optional extras',
      optional: [
        'Extended cruising time beyond base duration.',
        'Fully custom itinerary with additional stops.',
        'Premium aperitif or dedicated catering.',
      ],
      timelineTitle: 'Sample timeline',
      timeline: [
        'Check-in 20 minutes before departure.',
        'Cruise between Camogli, San Fruttuoso and Portofino.',
        'Short breaks at the main stops.',
        'Return along the coast.',
      ],
      faqTitle: 'Useful info',
      faqs: [
        { q: 'Do I need boating experience?', a: 'No. This is a skippered private charter.' },
        { q: 'Is the route fixed?', a: 'Route is flexible and adjusted to weather and your preferences.' },
        { q: 'What should I bring?', a: 'Swimwear, sunscreen, hat, light layer and ID.' },
      ],
      mapTitle: 'Mini map and recommended ports',
      mapCaption: 'Simple route with stops in Camogli, San Fruttuoso and Portofino.',
      ports: [
        {
          name: 'Genoa Old Port',
          area: 'Main embarkation',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Camogli',
          area: 'Scenic stop',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Portofino',
          area: 'Premium destination',
          mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
        },
      ],
    },
    '1': {
      charterType: 'Private experience with dedicated skipper, exclusive boat for the group',
      heroFacts: [
        '18:00-23:00',
        'Up to 7 guests (15 with a second boat)',
      ],
      introTitle: 'Description',
      intro: [
        'Let the waves and Prosecco cradle you in the romantic village of Boccadasse. Enjoy the Italian aperitivo by ‘Il Genovese’ while dolphins dance around us and the stars watch from above.',
        'Along the way, it is common to spot dolphins, although this cannot be guaranteed.',
        'The boat stays anchored off Boccadasse for sunset and a rich gourmet tasting served on board.',
      ],
      includedTitle: 'What is included',
      included: [
        'Skipper',
        'Fuel',
        'Rich tasting with several courses and finger food',
        'Prosecco: 3 bottles every 7 guests included in the price',
        'Photo and video memories produced by the onboard staff',
      ],
      excludedTitle: 'Not included',
      excluded: [
        'Extra drinks beyond the 3 bottles included every 7 guests',
        'Any transfers',
        'Towels onboard',
        'Snorkeling gear',
        'Tips',
      ],
      departureTitle: 'Departure point',
      departureIntro: 'Boarding at Genoa Old Port. We recommend arriving 15-20 minutes before the 18:00 departure.',
      departureNotes: [
        'The location is easy to reach by car, taxi or on foot from the city center.',
        'If you are driving, allow some extra time for evening parking.',
        'If needed, we can help coordinate arrival before boarding.',
      ],
      departureMapLabel: 'Genoa Old Port',
      departureMapUrl: 'https://www.google.com/maps?q=Porto+Antico+Genova&z=15&output=embed',
      routeTitle: 'Route',
      routeIntro: 'The cruise goes from Genoa Old Port to Boccadasse, where the boat stays anchored for sunset and tasting.',
      routeSteps: [
        'Departure from Genoa Old Port and coastal navigation.',
        'Passage in front of Boccadasse, with a possible dolphin sighting along the way.',
        'Anchored stop off Boccadasse for sunset and gourmet service.',
      ],
      routeCaption: 'A simple, unhurried route designed for sea light, onboard service and a private atmosphere.',
      scheduleTitle: 'Schedule and duration',
      schedule: [
        'Meet-up: 17:40-17:45 at Genoa Old Port.',
        'Departure: 18:00.',
        'Total duration: 5 hours, until 23:00.',
        'Available all year: the departure time stays consistent while sunset light changes with the season.',
      ],
      practicalTitle: 'Practical tips',
      practical: [
        'Bring a light jacket for the evening and non-slip shoes.',
        'If you like, bring a camera too: photos and videos are already included with the onboard staff.',
        'The menu is fixed and entirely gluten-based: it is not suitable for guests who are gluten intolerant and cannot be customized for intolerances.',
        'Extra drinks beyond the three included bottles are available at an additional cost.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { q: 'Where exactly do we depart from?', a: 'From Genoa Old Port, with a recommended meet-up 15-20 minutes before departure.' },
        { q: 'Is the tour private or shared with other groups?', a: 'It is always private, with an exclusive boat for your group.' },
        { q: 'We are more than 7 people. Can we still book?', a: 'Yes, with the combined outing option using a second boat for groups up to 15 guests.' },
        { q: 'What happens in case of bad weather?', a: 'If the weather does not allow a safe departure, a refund is provided.' },
        { q: 'Is it suitable for children or older guests?', a: 'Yes, it is a versatile private experience suitable for families and mixed groups.' },
        { q: 'Can I request a custom menu or report allergies?', a: 'No, the menu is fixed and entirely gluten-based, so it is not suitable for guests who are gluten intolerant and cannot be customized for intolerances.' },
        { q: 'Are photos and videos really included in the price?', a: 'Yes, they are produced by the onboard staff and included in the experience.' },
        { q: 'Will we definitely see dolphins?', a: 'No, it is not guaranteed. It often happens to spot them, but it remains a possible surprise.' },
        { q: 'What is the cancellation/refund policy?', a: 'Refunds are provided only in case of bad weather, not for free cancellation.' },
      ],
      ctaTitle: 'Ready to set sail?',
      ctaText: 'Book your private sunset now, or write to us on WhatsApp for custom requests and combined outings up to 15 guests.',
      ports: [
        {
          name: 'Genoa Old Port',
          area: 'Departure',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Nervi',
          area: 'Golden hour views',
          mapsUrl: 'https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8',
        },
        {
          name: 'Recco',
          area: 'Alternative return stop',
          mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9',
        },
      ],
    },
    '2': {
      charterType: 'Private point-to-point sea transfer',
      routeTitle: 'Suggested route',
      route: [
        'Departure from agreed port in the Genoa gulf area.',
        'Direct coastal route toward Camogli or Portofino.',
        'Fast scenic navigation with no road traffic.',
        'Drop-off at destination port with light luggage assistance.',
      ],
      includedTitle: 'What is included',
      included: [
        'Professional skipper and private vessel.',
        'Fuel on the booked route.',
        'Certified life jackets and safety equipment.',
        'Boarding/disembarking time coordination support.',
      ],
      optionalTitle: 'Optional extras',
      optional: [
        'Wait-and-return transfer option.',
        'Premium inland ground transfer coordination.',
        'Short photo stop along route (timing permitting).',
      ],
      timelineTitle: 'Sample timeline',
      timeline: [
        'Fast dock check-in (15-20 minutes before).',
        'Boarding and immediate departure.',
        'Direct navigation to selected destination.',
        'Arrival and disembark assistance.',
      ],
      faqTitle: 'Useful info',
      faqs: [
        { q: 'How long is the transfer?', a: 'Usually around 30 minutes, depending on route and sea state.' },
        { q: 'Can I bring luggage?', a: 'Yes, light and compact luggage is recommended.' },
        { q: 'Is it available every day?', a: 'Yes by reservation, subject to weather and crew availability.' },
      ],
      mapTitle: 'Mini map and recommended ports',
      mapCaption: 'Most requested point-to-point routes in the Eastern Riviera.',
      ports: [
        {
          name: 'Genoa Old Port',
          area: 'Frequent departure',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
        {
          name: 'Camogli',
          area: 'Fast arrival',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Portofino',
          area: 'Premium arrival',
          mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57',
        },
      ],
    },
    '3': {
      introTitle: 'Description',
      intro: [
        'The Stella Maris feast always falls on the first Sunday of August; in 2026 it is on 2 August. The Dragun, the historic dragon-shaped boat, sails toward Punta Chiappa for the ceremony at the Stella Maris altar, while a procession of flag-decked boats follows along the coast. As evening falls, hundreds of floating lanterns are released on the sea in front of Camogli.',
        'The day unfolds in three moments: in the morning the celebrations open with the symbolic departure of the Dragun, in the afternoon the village comes alive between the harbor, the alleys and Punta Chiappa, and in the evening the nautical procession reaches its peak as lanterns are released on the sea.',
        'We support you with a pre-event briefing, a suggested route to catch the most striking moments from land and from the sea, boarding and disembarking support at the recommended points, and up-to-date guidance on shuttles and traffic based on official municipal notices. Towels and full snorkeling gear are also available onboard.',
      ],
      faqTitle: 'Useful info',
      faqs: [
        {
          q: 'Is the date always the same?',
          a: 'No, it changes every year since it always falls on the first Sunday of August; in 2026 it is 2 August.',
        },
        {
          q: 'Do you organize the event?',
          a: 'No, it is a public celebration deeply felt by the village. Our role is to support you with tailored logistics and advice.',
        },
        {
          q: 'Where can I find the official program and times?',
          a: 'The Municipality of Camogli publishes an official notice every year with the full program and shuttle times.',
        },
        {
          q: 'Is it better to follow the feast from the sea or from land?',
          a: 'It depends on what you want: the sea avoids traffic and queues, while land lets you soak up more of the village atmosphere.',
        },
      ],
      mapTitle: 'Useful spots to experience the feast',
      mapCaption: 'The best areas to follow the procession, the religious ceremony and the lanterns between the harbor and Punta Chiappa.',
      ports: [
        {
          name: 'Camogli Harbor',
          area: 'Heart of the feast and start of the procession',
          mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8',
        },
        {
          name: 'Punta Chiappa',
          area: 'Stella Maris altar',
          mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Punta+Chiappa+Camogli',
        },
        {
          name: 'Genoa Old Port',
          area: 'Recommended transfer departure point',
          mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7',
        },
      ],
      sourcesTitle: 'Learn more',
      sources: [
        {
          label: 'Municipality of Camogli - official notice on the Stella Maris feast',
          url: 'https://www.comune.camogli.ge.it/novita/notizie/novita_1487.html',
        },
      ],
    },
  },
};

function getDetailContent(lang, experienceId) {
  const safeLang = lang === 'it' ? 'it' : 'en';
  const base = (EXPERIENCE_DETAIL_CONTENT[safeLang] || EXPERIENCE_DETAIL_CONTENT.en)?.[experienceId] || null;
  return localizeExperienceDetail(lang, experienceId, base);
}

export default function ExperienceDetailPage({ setLang = () => {} }) {
  const { lang = 'en', experienceId: slug = '' } = useParams();
  const dict = getLocale(lang);
  const pageUi = getExperienceUi(lang);
  const t = dict.experienceCarousel;
  const [selectedPortIndex, setSelectedPortIndex] = useState(0);
  const heroVideoRef = useRef(null);

  const resolvedExperienceId = getExperienceIdFromSlug(slug);
  const experience = (t.experiences || []).find((exp) => exp.id === resolvedExperienceId);

  useEffect(() => {
    document.body.classList.add('page-experience-detail');
    return () => {
      document.body.classList.remove('page-experience-detail');
    };
  }, []);

  useEffect(() => {
    setSelectedPortIndex(0);
  }, [resolvedExperienceId, lang]);

  useEffect(() => {
    if (resolvedExperienceId !== '0' && resolvedExperienceId !== '1' && resolvedExperienceId !== '3' && resolvedExperienceId !== '4') return;
    if (!heroVideoRef.current) return;

    const video = heroVideoRef.current;
    const forcePlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Keep the hero stable if autoplay is temporarily blocked.
        });
      }
    };

    forcePlay();
    video.addEventListener('loadeddata', forcePlay);
    video.addEventListener('canplay', forcePlay);

    return () => {
      video.removeEventListener('loadeddata', forcePlay);
      video.removeEventListener('canplay', forcePlay);
    };
  }, [resolvedExperienceId]);

  if (!resolvedExperienceId || !experience) {
    return <Navigate to={`/${lang}`} replace />;
  }

  const detail = getDetailContent(lang, resolvedExperienceId);
  const heroImage = HERO_IMAGE_BY_EXPERIENCE_ID[resolvedExperienceId] || img4;
  const heroVideo = HERO_VIDEO_BY_EXPERIENCE_ID[resolvedExperienceId] || null;
  const hasVideoHero = Boolean(heroVideo) || resolvedExperienceId === '3';
  const rainbowDetail = resolvedExperienceId === '0' ? getRainbowTourContent(lang) : null;
  const dolceVitaDetail = resolvedExperienceId === '4' ? getDolceVitaContent(lang) : null;
  const ports = detail?.ports || [];
  const activePort = ports[selectedPortIndex] || ports[0] || null;
  const hasPortCarousel = ports.length > 3;
  const visiblePortIndexes = getVisiblePortIndexes(ports.length, selectedPortIndex);

  const getStageDescription = (portIndex) => {
    const routeStep = detail?.route?.[portIndex];
    if (routeStep) return routeStep;
    return ports[portIndex]?.area || '';
  };

  const openWhatsApp = () => {
    trackWhatsAppClick();
    window.location.href = getWhatsAppUrl(lang);
  };

  const callForBooking = () => {
    window.location.href = 'tel:+393463365699';
  };

  const isContactOnlyExperience = resolvedExperienceId === '3';
  const supportsRichLocalizedDetails = ['0', '1', '3', '4'].includes(resolvedExperienceId);
  const bookingPath = `/${lang}/book?exp=${resolvedExperienceId}`;

  const renderHeroMeta = (facts = []) => {
    const timeValue = facts?.[0] || experience.time;
    const guestsValue = facts?.[1] || experience.guests;
    const hideGuestsIcon = resolvedExperienceId === '3';

    return (
      <div className="experience-hero-meta" aria-label={pageUi.details}>
        <span className="experience-hero-meta-item">
          <img src={clockIcon} alt={t.durationAlt} className="experience-hero-meta-icon" />
          {timeValue}
        </span>
        <span className="experience-hero-meta-item">
          {hideGuestsIcon ? null : <img src={guestsIcon} alt={t.guestsAlt} className="experience-hero-meta-icon" />}
          {guestsValue}
        </span>
      </div>
    );
  };

  if (!['it', 'en'].includes(lang) && !supportsRichLocalizedDetails) {
    return (
      <>
        <Navbar lang={lang} setLang={setLang} />
        <main className="experience-detail-page">
          <section className="experience-hero" aria-label={experience.title}>
            {hasVideoHero ? (
              <video
                ref={heroVideoRef}
                className="experience-hero-image"
                src={heroVideo || specialVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={heroImage}
                aria-label={experience.title}
              />
            ) : (
              <img src={heroImage} alt={experience.title} className="experience-hero-image" loading="eager" fetchPriority="high" />
            )}
            <div className="experience-hero-overlay" />
            <div className="experience-hero-content">
              {renderHeroMeta()}
              <h1>{experience.title}</h1>
              <div className="experience-hero-cta-row">
                <Link to={bookingPath} className="experience-primary-cta">{pageUi.book}</Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>{pageUi.request}</button>
              </div>
            </div>
          </section>

          <section className="experience-detail-shell">
            <article className="experience-info-card experience-intro-card">
              <h2>{pageUi.details}</h2>
              <p>{experience.desc}</p>
            </article>
            {experience.chips?.length ? (
              <article className="experience-info-card">
                <h2>{pageUi.included}</h2>
                <div className="experience-included-chips" aria-label={pageUi.included}>
                  {experience.chips.map((chip) => <span key={chip} className="experience-included-chip">{chip}</span>)}
                </div>
              </article>
            ) : null}
            <section className="experience-cta-banner">
              <div>
                <h2>{experience.title}</h2>
                <p>{experience.desc}</p>
              </div>
              <div className="experience-cta-actions">
                <Link to={bookingPath} className="experience-primary-cta">{pageUi.book}</Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>WhatsApp</button>
              </div>
            </section>
          </section>
        </main>
        <div className="experience-sticky-cta">
          <Link to={bookingPath} className="experience-primary-cta">{pageUi.book}</Link>
          <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>WhatsApp</button>
        </div>
        <PrivateTransfer lang={lang} />
        <Footer lang={lang} />
      </>
    );
  }

  if (resolvedExperienceId === '0' && rainbowDetail) {
    const getRainbowDeparturePriceLabel = (point) => {
      const multiplier = Number(point.multiplier || 1);
      const basePrice = Number(rainbowDetail.basePrice || 600);
      const finalPrice = Math.round(basePrice * multiplier);
      return `€${finalPrice}`;
    };

    const departurePointsByProfile = (rainbowDetail.departureProfiles || []).flatMap((profile) =>
      (profile.points || []).map((point) => ({
        ...point,
        profileId: profile.id,
        profileTitle: profile.title,
      }))
    );
    const orderedDeparturePoints = [...departurePointsByProfile];

    return (
      <>
        <Navbar lang={lang} setLang={setLang} />

        <main className="experience-detail-page rainbow-detail-page">
          <section className="experience-hero rainbow-hero" aria-label={experience.title}>
            <video
              ref={heroVideoRef}
              className="experience-hero-image"
              src={camoVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroImage}
              aria-label={experience.title}
            />
            <div className="experience-hero-overlay" />

            <div className="experience-hero-content rainbow-hero-content">
              {renderHeroMeta(rainbowDetail.heroFacts)}
              <h1>{experience.title}</h1>

              <div className="experience-hero-cta-row">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  {pageUi.request}
                </button>
              </div>
            </div>
          </section>

          <section className="experience-detail-shell rainbow-shell">
            <article className="experience-info-card experience-intro-card">
              <h2>{rainbowDetail.introTitle}</h2>
              {(rainbowDetail.intro || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="experience-info-card rainbow-stops-card">
              <h2>{rainbowDetail.stopsTitle}</h2>
              <div className="rainbow-stops-grid">
                {rainbowDetail.stops.map((stop) => (
                  <article key={stop.name} className="rainbow-stop-card">
                    <img src={stop.image} alt={stop.imageAlt} loading="lazy" decoding="async" />
                    <div>
                      <h3>{stop.title}</h3>
                      <p>{stop.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            {rainbowDetail.departureTitle ? (
              <article className="experience-info-card experience-departure-card">
                <h2>{rainbowDetail.departureTitle}</h2>
                <p>{rainbowDetail.departureIntro}</p>
                <p className="dolce-vita-departure-note">{rainbowDetail.departurePriceNote}</p>
                <div className="rainbow-departure-grid">
                  {orderedDeparturePoints.map((point) => (
                    <article key={`${point.profileId}-${point.name}`} className="rainbow-departure-card">
                      <img src={point.image} alt={point.imageAlt} loading="lazy" decoding="async" />
                      <div>
                        <span className="departure-point-indicator">
                          {point.profileTitle}
                        </span>
                        <h3>{point.name}</h3>
                        <p>{point.area}</p>
                        <small>{point.note}</small>
                        <strong className="departure-port-price">{getRainbowDeparturePriceLabel(point)}</strong>
                        <a href={point.mapsUrl} target="_blank" rel="noopener noreferrer" className="experience-location-button">
                          {pageUi.location}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="experience-info-card rainbow-practical-card">
              <h2>{rainbowDetail.practicalTitle}</h2>
              <ul className="experience-practical-list">
                {(rainbowDetail.practical || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="experience-excluded-box">
                <h3>{rainbowDetail.extrasTitle}</h3>
                <ul className="experience-excluded-list">
                  {(rainbowDetail.extras || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="experience-info-card experience-faq-card">
              <h2>{rainbowDetail.faqTitle}</h2>
              <div className="experience-faq-accordion">
                {(rainbowDetail.faqs || []).map((faq) => (
                  <details key={faq.q} className="experience-faq-item">
                    <summary>{faq.q}</summary>
                    <div className="rainbow-faq-answer">
                      <p>{faq.a}</p>
                      {faq.link ? (
                        <Link to={faq.link.href} className="experience-source-link">
                          {faq.link.label}
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </article>

            <section className="experience-cta-banner">
              <div>
                <h2>{rainbowDetail.ctaTitle}</h2>
                <p>{rainbowDetail.ctaText}</p>
              </div>
              <div className="experience-cta-actions">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  WhatsApp
                </button>
              </div>
            </section>
          </section>
        </main>

        <div className="experience-sticky-cta">
          <Link to={bookingPath} className="experience-primary-cta">
            {pageUi.book}
          </Link>
          <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
            WhatsApp
          </button>
        </div>

        <PrivateTransfer lang={lang} />
        <Footer lang={lang} />
      </>
    );
  }

  if (resolvedExperienceId === '4' && dolceVitaDetail) {
    const departureBasePrice = Number(dolceVitaDetail.basePrice || 600);
    const formatEuro = (amount) => `€${Math.round(amount)}`;

    return (
      <>
        <Navbar lang={lang} setLang={setLang} />

        <main className="experience-detail-page dolce-vita-detail-page">
          <section className="experience-hero dolce-vita-hero" aria-label={dolceVitaDetail.name}>
            <video
              ref={heroVideoRef}
              className="experience-hero-image"
              src={camoVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={puntaChiappaImg}
              aria-label={dolceVitaDetail.name}
            />
            <div className="experience-hero-overlay" />

            <div className="experience-hero-content dolce-vita-hero-content">
              {renderHeroMeta(dolceVitaDetail.heroFacts)}
              <h1>{dolceVitaDetail.name}</h1>

              <div className="experience-hero-cta-row">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  {pageUi.request}
                </button>
              </div>
            </div>
          </section>

          <section className="experience-detail-shell dolce-vita-shell">
            <article className="experience-info-card experience-intro-card">
              <h2>{dolceVitaDetail.shortDescriptionTitle}</h2>
              {(dolceVitaDetail.shortDescription || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="experience-info-card dolce-vita-route-card">
              <h2>{dolceVitaDetail.routeTitle}</h2>
              <div className="dolce-vita-route-grid">
                {(dolceVitaDetail.routeStops || []).map((stop, index) => (
                  <article key={stop.name} className="dolce-vita-route-stop">
                    <img src={stop.image} alt={stop.imageAlt} loading="lazy" decoding="async" />
                    <div>
                      <span className="dolce-vita-stop-index">0{index + 1}</span>
                      <h3>{stop.name}</h3>
                      <p>{stop.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="experience-info-card dolce-vita-dinner-card">
              <h2>{dolceVitaDetail.dinnerTitle}</h2>
              {(dolceVitaDetail.dinnerDescription || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="dolce-vita-dinner-important">
                <strong>{pageUi.important}</strong>
                <p>{dolceVitaDetail.dinnerImportant}</p>
              </div>
              <p className="dolce-vita-dinner-booking">{dolceVitaDetail.dinnerBookingNote}</p>
            </article>

            <article className="experience-info-card">
              <h2>{dolceVitaDetail.includedTitle}</h2>
              <ul className="experience-checklist">
                {(dolceVitaDetail.included || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="experience-excluded-box dolce-vita-excluded-box">
                <h3>{dolceVitaDetail.excludedTitle}</h3>
                <ul className="experience-excluded-list">
                  {(dolceVitaDetail.excluded || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="experience-info-card experience-departure-card">
              <h2>{dolceVitaDetail.departureTitle}</h2>
              <p>{dolceVitaDetail.departureIntro}</p>
              <p className="dolce-vita-departure-note">{dolceVitaDetail.departurePriceNote}</p>
              <div className="rainbow-departure-grid">
                {(dolceVitaDetail.departurePoints || []).map((point) => {
                  const finalPrice = departureBasePrice * Number(point.multiplier || 1);
                  return (
                    <article key={point.name} className="rainbow-departure-card">
                      <img src={point.image} alt={point.imageAlt} loading="lazy" decoding="async" />
                      <div>
                        <span className="departure-point-indicator">
                          {pageUi.multiplier} x{point.multiplier}
                        </span>
                        <h3>{point.name}</h3>
                        <p>{point.area}</p>
                        <small>{point.note}</small>
                        <strong className="departure-port-price">{formatEuro(finalPrice)}</strong>
                        <a href={point.mapsUrl} target="_blank" rel="noopener noreferrer" className="experience-location-button">
                          {pageUi.location}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
              <ul className="experience-practical-list">
                {(dolceVitaDetail.departureNotes || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>


            <article className="experience-info-card experience-practical-card">
              <h2>{dolceVitaDetail.practicalTitle}</h2>
              <ul className="experience-practical-list">
                {(dolceVitaDetail.practical || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="experience-info-card experience-faq-card">
              <h2>{dolceVitaDetail.faqTitle}</h2>
              <div className="experience-faq-accordion">
                {(dolceVitaDetail.faqs || []).map((faq) => (
                  <details key={faq.q} className="experience-faq-item">
                    <summary>{faq.q}</summary>
                    <div className="rainbow-faq-answer">
                      <p>{faq.a}</p>
                      {faq.link ? (
                        <Link to={faq.link.href} className="experience-source-link">
                          {faq.link.label}
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </article>

            <section className="experience-cta-banner">
              <div>
                <h2>{dolceVitaDetail.ctaTitle}</h2>
                <p>{dolceVitaDetail.ctaText}</p>
              </div>
              <div className="experience-cta-actions">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  WhatsApp
                </button>
              </div>
            </section>
          </section>
        </main>

        <div className="experience-sticky-cta">
          <Link to={bookingPath} className="experience-primary-cta">
            {pageUi.book}
          </Link>
          <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
            WhatsApp
          </button>
        </div>

        <PrivateTransfer lang={lang} />
        <Footer lang={lang} />
      </>
    );
  }

  if (resolvedExperienceId === '1') {
    return (
      <>
        <Navbar lang={lang} setLang={setLang} />

        <main className="experience-detail-page gourmet-detail-page">
          <section className="experience-hero gourmet-hero" aria-label={experience.title}>
            <video
              ref={heroVideoRef}
              className="experience-hero-image"
              src={cinVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={img5}
              aria-label={experience.title}
            />
            <div className="experience-hero-overlay" />

            <div className="experience-hero-content gourmet-hero-content">
              {renderHeroMeta(detail?.heroFacts)}
              <h1>{experience.title}</h1>
              <div className="experience-hero-cta-row">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  {pageUi.request}
                </button>
              </div>
            </div>
          </section>

          <section className="experience-detail-shell">
            <article className="experience-info-card experience-intro-card">
              <h2>{detail?.introTitle}</h2>
              {(detail?.intro || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="experience-info-card">
              <h2>{detail?.includedTitle}</h2>
              <ul className="experience-checklist">
                {(detail?.included || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="experience-excluded-box">
                <h3>{detail?.excludedTitle}</h3>
                <ul className="experience-excluded-list">
                  {(detail?.excluded || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="experience-info-card experience-departure-card">
              <h2>{detail?.departureTitle}</h2>
              <p>{detail?.departureIntro}</p>
              <div className="experience-departure-visual">
                <img
                  src={portoAnticoImg}
                  alt={detail?.departureImageAlt || detail?.departureMapLabel}
                  className="experience-departure-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="experience-departure-overlay">
                  <h3>{detail?.departureMapLabel}</h3>
                  <a href={detail?.departureMapUrl} target="_blank" rel="noopener noreferrer" className="experience-location-button">
                    {pageUi.location}
                  </a>
                </div>
              </div>
              <ul className="experience-practical-list">
                {(detail?.departureNotes || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="experience-info-card experience-route-card">
              <h2>{detail?.routeTitle}</h2>
              <p>{detail?.routeIntro}</p>
              <div className="experience-route-rail">
                {(detail?.routeSteps || []).map((step, index) => (
                  <div key={step} className="experience-route-step">
                    <span className="experience-route-index">0{index + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
              <p className="experience-route-caption">{detail?.routeCaption}</p>
            </article>

            <article className="experience-info-card">
              <h2>{detail?.scheduleTitle}</h2>
              <ul className="experience-practical-list">
                {(detail?.schedule || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="experience-info-card experience-practical-card">
              <h2>{detail?.practicalTitle}</h2>
              <ul className="experience-practical-list">
                {(detail?.practical || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="experience-info-card experience-faq-card">
              <h2>{detail?.faqTitle}</h2>
              <div className="experience-faq-accordion">
                {(detail?.faqs || []).map((faq) => (
                  <details key={faq.q} className="experience-faq-item">
                    <summary>{faq.q}</summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </article>

            <section className="experience-cta-banner">
              <div>
                <h2>{detail?.ctaTitle}</h2>
                <p>{detail?.ctaText}</p>
              </div>
              <div className="experience-cta-actions">
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
                <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                  {lang === 'it' ? 'WhatsApp' : 'WhatsApp'}
                </button>
              </div>
            </section>
          </section>
        </main>

        <div className="experience-sticky-cta">
          <Link to={bookingPath} className="experience-primary-cta">
            {pageUi.book}
          </Link>
          <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
            {lang === 'it' ? 'WhatsApp' : 'WhatsApp'}
          </button>
        </div>

        <PrivateTransfer lang={lang} />
        <Footer lang={lang} />
      </>
    );
  }

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />

      <main className="experience-detail-page">
        <section className="experience-hero" aria-label={experience.title}>
          {hasVideoHero ? (
            <video
              ref={heroVideoRef}
              className="experience-hero-image"
              src={heroVideo || specialVideo}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={resolvedExperienceId === '1' ? img5 : specialImg}
              aria-label={experience.title}
            />
          ) : (
            <img
              src={heroImage}
              alt={experience.title}
              className="experience-hero-image"
              loading="eager"
              fetchPriority="high"
            />
          )}
          <div className="experience-hero-overlay" />

          <div className="experience-hero-content">
            {renderHeroMeta()}
            <h1>{experience.title}</h1>

            <div className="experience-hero-cta-row">
              {isContactOnlyExperience ? (
                <button type="button" className="experience-primary-cta" onClick={callForBooking}>
                  {pageUi.contact || pageUi.request}
                </button>
              ) : (
                <Link to={bookingPath} className="experience-primary-cta">
                  {pageUi.book}
                </Link>
              )}
              <button type="button" className="experience-secondary-cta" onClick={openWhatsApp}>
                {pageUi.request}
              </button>
            </div>
          </div>
        </section>

        <section className="experience-info-grid">
          {detail?.charterType ? (
            <article className="experience-info-card">
              <h2>{pageUi.charter}</h2>
              <p>{detail.charterType}</p>
            </article>
          ) : null}

          {detail?.intro?.length ? (
            <article className="experience-info-card experience-intro-card">
              <h2>{detail.introTitle}</h2>
              {detail.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ) : null}

          {detail?.included?.length ? (
            <article className="experience-info-card">
              <h2>{detail.includedTitle}</h2>
              {experience?.chips?.length ? (
                <div className="experience-included-chips" aria-label={pageUi.included}>
                  {experience.chips.map((chip) => (
                    <span key={chip} className="experience-included-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
              <ul>
                {detail.included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {detail?.route?.length ? (
            <article className="experience-info-card">
              <h2>{detail.routeTitle}</h2>
              <ol>
                {detail.route.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ) : null}

          {detail?.timeline?.length ? (
            <article className="experience-info-card">
              <h2>{detail.timelineTitle}</h2>
              <ul>
                {detail.timeline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {detail?.optional?.length ? (
            <article className="experience-info-card">
              <h2>{detail.optionalTitle}</h2>
              <ul>
                {detail.optional.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {resolvedExperienceId !== '3' ? (
          <article className="experience-info-card experience-map-card">
            <h2>{detail?.mapTitle}</h2>
            <p className="experience-map-caption">{detail?.mapCaption}</p>
            <div className="experience-mini-map">
              <span className="mini-map-route" />

              {hasPortCarousel ? (
                <button
                  type="button"
                  className="map-carousel-nav map-carousel-prev"
                  onClick={() => setSelectedPortIndex((prev) => Math.max(0, prev - 1))}
                  disabled={selectedPortIndex <= 0}
                  aria-label={pageUi.previous}
                >
                  {'<'}
                </button>
              ) : null}

              <div className="mini-map-lane">
                {visiblePortIndexes.map((portIndex, visibleIndex) => {
                  const port = ports[portIndex];
                  const sizeClass = getAvatarLaneClass(visibleIndex, visiblePortIndexes.length);
                  return (
                  <button
                    key={port.name}
                    type="button"
                    className={`mini-map-avatar ${sizeClass} ${selectedPortIndex === portIndex ? 'is-active' : ''}`.trim()}
                    onClick={() => setSelectedPortIndex(portIndex)}
                    aria-label={`${pageUi.show}: ${port.name}`}
                  >
                    <img src={getPortImage(port)} alt={port.name} loading="lazy" decoding="async" />
                  </button>
                  );
                })}
              </div>

              {hasPortCarousel ? (
                <button
                  type="button"
                  className="map-carousel-nav map-carousel-next"
                  onClick={() => setSelectedPortIndex((prev) => Math.min(ports.length - 1, prev + 1))}
                  disabled={selectedPortIndex >= ports.length - 1}
                  aria-label={pageUi.next}
                >
                  {'>'}
                </button>
              ) : null}
            </div>

            {activePort ? (
              <figure className="map-place-preview">
                <img src={getPortImage(activePort)} alt={activePort.name} loading="lazy" decoding="async" />
                <figcaption>
                  <strong>{activePort.name}</strong>
                  <span>{activePort.area}</span>
                </figcaption>
              </figure>
            ) : null}

            <div className="experience-map-transcript">
              <h3>{pageUi.transcript}</h3>
              <div className="experience-map-stages">
                {ports.map((port, index) => (
                  <article key={`${port.name}-transcript`} className="experience-map-stage">
                    <h4>
                      {pageUi.stop} {index + 1}: {port.name}
                    </h4>
                    <p>{getStageDescription(index)}</p>
                    <a href={port.mapsUrl} target="_blank" rel="noopener noreferrer">
                      {pageUi.map}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </article>
          ) : null}

          <article className="experience-info-card">
            <h2>{detail?.faqTitle}</h2>
            <div className="experience-faq-list">
              {(detail?.faqs || []).map((faq) => (
                <div key={faq.q} className="experience-faq-item">
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </article>

          {resolvedExperienceId !== '3' && detail?.sources?.length ? (
            <article className="experience-info-card">
              <h2>{detail?.sourcesTitle || pageUi.sources}</h2>
              <ul>
                {detail.sources.map((source) => (
                  <li key={source.url}>
                    <a className="experience-source-link" href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </section>
      </main>

      <PrivateTransfer lang={lang} />
      <Footer lang={lang} />
    </>
  );
}
