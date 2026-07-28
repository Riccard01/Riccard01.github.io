export const translations = {
  en: {
    callUs: "Call Us",
    prevAria: "Previous experience",
    nextAria: "Next experience",
    dotAria: (idx) => `Go to experience ${idx + 1}`,
    experiences: [
      {
        id: '0',
        title: 'Portofino Private Boat Tour',
        time: '5-10 Hrs',
        guests: '5 Max',
        price: 'From €750 per group',
        desc: "Explore the gems of the Two Gulfs at your own pace. Discover sheer cliffs, pristine bays, and charming seaside villages with drinks and onboard snacks included.",
        chips: ['Fuel Included', 'Towels', 'Snacks', 'Fresh Drinks', 'Snorkeling Gear']
      },
      {
        id: '1',
        title: 'Gourmet Sunset Cruise',
        time: '4 Hrs',
        guests: '14 Max',
        price: 'From €390 per group',
        desc: "Experience a golden-hour sunset cruise off Genoa and Boccadasse featuring the signature 'Il Genovese' aperitif, Prosecco, and lounge music.",
        chips: ['Fuel Included', 'Towels', 'Prosecco', 'Snorkeling Gear']
      },
      {
        id: '2',
        title: 'Private Transfer',
        time: '30 min',
        guests: '7 Max',
        price: 'From €250 per group',
        desc: "Skip the traffic along the Ligurian coast with a fast, scenic water transfer directly to Portofino or Camogli.",
        chips: []
      }
    ]
  },
  it: {
    callUs: "Contattaci",
    prevAria: "Esperienza precedente",
    nextAria: "Prossima esperienza",
    dotAria: (idx) => `Vai all'esperienza ${idx + 1}`,
    experiences: [
      {
        id: '0',
        title: 'Tour Privato in Barca a Portofino',
        time: '5-10 Ore',
        guests: 'Max 5',
        price: 'Da €750 a gruppo',
        desc: "Esplora le gemme dei Due Golfi al tuo ritmo. Scopri scogliere a picco sul mare, baie incontaminate e borghi marinari con drink e snack a bordo inclusi.",
        chips: ['Carburante Incluso', 'Teli Mare', 'Snack', 'Drink Freschi', 'Attrezzatura Snorkeling']
      },
      {
        id: '1',
        title: 'Crociera Gourmet al Tramonto',
        time: '4 Ore',
        guests: 'Max 14',
        price: 'Da €390 a gruppo',
        desc: "Vivi una crociera al tramonto tra Genova e Boccadasse con l'aperitivo firmato 'Il Genovese', Prosecco e musica lounge.",
        chips: ['Carburante Incluso', 'Teli Mare', 'Prosecco', 'Attrezzatura Snorkeling']
      },
      {
        id: '2',
        title: 'Transfer Privato',
        time: '30 min',
        guests: 'Max 7',
        price: 'Da €250 a gruppo',
        desc: "Salta il traffico lungo la costa ligure con un trasferimento via acqua veloce e panoramico direttamente verso Portofino o Camogli.",
        chips: []
      }
    ]
  }
};