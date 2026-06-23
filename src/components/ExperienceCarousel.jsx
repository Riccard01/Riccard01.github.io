import React, { useEffect, useRef, useState } from 'react';
import "./ExperienceCarousel.css";
import img1 from "../assets/aperitivo.jpg";
import img2 from "../assets/dolphin.jpg";
import img3 from "../assets/portofino.jpeg"; 
import img4 from "../assets/paraggi.jpeg";
import img6 from "../assets/sanfru.jpeg";
import img7 from "../assets/puntachiappa.jpeg";
import img8 from "../assets/stellamaris.jpg";
import img9 from "../assets/camogli.jpeg";
import img10 from "../assets/anchor.svg";
import img11 from "../assets/fireworks.jpg";

export default function ExperienceCarousel() {
  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});

  // INDICE PER IL CENTRAGGIO: 0 è il primo, 1 è il secondo, ecc.
  // Se vuoi che la seconda card (Breakfast) sia centrata al caricamento:
  const initialCenterIndex = 1; 
  
  const initialScrollDuration = 200;
  const easeInPower = 4;
  const easeOutPower = 400;

  // ORDINE DEFINITO: Snorkeling e Breakfast sono ora i primi due
  const experiences = [
    { id: '5', img: img6, title: 'Snorkeling in San Fruttuoso', desc: "Ammira dal mare la maestosa Abbazia millenaria incastonata nella roccia, in una baia magica accessibile solo via mare o a piedi. Poi, indossa maschera e pinne e tuffati per nuotare sopra l'iconica statua sommersa del Cristo degli Abissi, circondato dalla natura selvaggia del monte ed un fondale ricco di vita marina!" },
    { id: '9', img: img9, title: 'Breakfast in Camogli', desc: "Inizia la giornata nel cuore del borgo marinaro. Sbarca a terra per esplorare i vicoli e fare colazione tra i caffè storici, oppure rimani a bordo ad ammirare le case colorate direttamente dalla rada, cullato dal mare del mattino." },
    { id: '1', img: img2, title: 'Dancing Dolphins', desc: "Naviga verso il largo alla ricerca dei cetacei nel cuore del Santuario Pelagos. Sai riconoscere una Stenella Striata da un Tursiope?" },
    { id: '2', img: img3, title: 'Gelato in Portofino', desc: "Sbarca nella piazzetta più famosa del mondo. Goditi una passeggiata tra i vicoli esclusivi e scopri i gusti unici del gelato portofinese, preparato con ingredienti locali di alta qualità." },
    { id: '0', img: img1, title: 'Happy Hour in Boccadasse', desc: "Un'esperienza gourmet unica: calici di Franciacorta fresco e il leggendario aperitivo firmato 'Il Genovese'. Le delizie calde della tradizione ligure vi raggiungeranno direttamente dal mare in barca, mentre vi godete il tramonto su Boccadasse." },
    { id: '3', img: img4, title: 'Paraggi Chill', desc: "Rilassati nella baia più elegante della costa, celebre per le sue acque verde smeraldo. Una sosta rigenerante tra musica soft, sole e bagni indimenticabili in un vero angolo di paradiso." },
    { id: '6', img: img7, title: 'Tuffo in Punta Chiappa', desc: "Il canto delle cicale dai boschi a strapiombo accompagna il relax di Punta Chiappa. Natura selvaggia, roccia vulcanica che taglia il blu e l’iconica altalena sull’acqua: relax selvaggio per tutta la famiglia." },
    { id: '7', img: img8, title: 'Stella Maris', desc: "Vivi la magia della storica festa dei pescatori di Camogli. Unisciti alla suggestiva sfilata di barche e assisti allo spettacolo emozionante di migliaia di lumini galleggianti lasciati in mare al tramonto. Solo una volta all'anno!" },
    { id: '8', img: img11, title: 'Rapallo Fireworks', desc: "La magia della notte si accende dal mare. Assisti in prima fila alle storiche Feste di Luglio: lo spettacolo unico dei fuochi d'artificio che illuminano l'intero golfo e il suggestivo incendio del castello sull'acqua. Poche date disponibili!" },
  ];

  const animateScrollTo = (element, left, duration) => {
    if (!element || duration <= 0) {
      element.scrollLeft = left;
      return;
    }
    const start = element.scrollLeft;
    const change = left - start;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 0.5 * Math.pow(progress * 2, easeInPower)
        : 0.5 + 0.5 * Math.pow((progress - 0.5) * 2, easeOutPower);
      element.scrollLeft = start + change * ease;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Assicuriamoci che i wrapper siano renderizzati prima di calcolare la posizione
    const wrappers = carousel.querySelectorAll('.carousel-wrapper');
    const target = wrappers[initialCenterIndex];
    
    if (target) {
      const offset = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
      animateScrollTo(carousel, offset, initialScrollDuration);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-index');
        setVisibleIndices((prev) => ({ ...prev, [id]: entry.isIntersecting }));
      });
    }, { root: carousel, rootMargin: '0px -25% 0px -25%', threshold: 0.5 });

    wrappers.forEach((wrapper) => observer.observe(wrapper));
    return () => wrappers.forEach((wrapper) => observer.unobserve(wrapper));
  }, []);

  const renderTitle = (text) => (
    <h3>
      <img src={img10} alt="Anchor" className="anchor-icon" />
      {text}
    </h3>
  );

  return (
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        {experiences.map((exp) => (
          <div 
            key={exp.id}
            className={`carousel-wrapper ${visibleIndices[exp.id] ? 'is-visible' : ''}`} 
            data-index={exp.id}
          >
            <div className="carousel-slide">
              <div className="slide-content">
                <img src={exp.img} alt={exp.title} className="slide-image" />
              </div>
            </div>
            {renderTitle(exp.title)}
            <p>{exp.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}