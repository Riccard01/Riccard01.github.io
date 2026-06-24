import React, { useState, useRef } from 'react';
import './FleetSection.css';
import leggera from "../assets/leggera.webp";
import francy from "../assets/francy.webp";

export default function FleetSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const fleetCarouselRef = useRef(null);

  const boats = [
    {
      id: 1,
      name: "Leggera",
      type: "Sporty Dinghy for small groups",
      description: "Un gommone veloce, reattivo e dal carattere sportivo, ideale per piccoli gruppi che desiderano esplorare la costa in dinamicità. Progettato per massimizzare gli spazi all'aperto, offre un ampio e confortevole prendisole a prua per rilassarsi sotto il sole e una comoda seduta di poppa per godersi la navigazione a ritmo di musica.",
      image: leggera,
      specs: [
        { label: "Lunghezza", value: "6.30 metri" },
        { label: "Portata Massima", value: "4 ospiti + skipper" },
        { label: "Motorizzazione", value: "Mercury Verado 150HP" },
        { label: "Comfort", value: "Prendisole a prua, seduta di poppa, impianto audio, GPS, tendalino, doccetta" }
      ]
    },
    {
      id: 2,
      name: "Francy",
      type: "Scafo Open Premium / Cabinato",
      description: "Elegante e versatile cabinato che unisce l'esclusività degli ampi spazi aperti alla praticità degli ambienti interni. Dispone di grandi aree prendisole sia a prua sia a poppa, ideali per gustare un aperitivo in totale comodità al tramonto. Sottocoperta offre una cabina con letto matrimoniale e servizi igienici completi.",
      image: francy,
      specs: [
        { label: "Lunghezza", value: "7.30 metri" },
        { label: "Portata Massima", value: "6 ospiti + skipper" },
        { label: "Motorizzazione", value: "Evinrude 200 HP Fuoribordo" },
        { label: "Comfort", value: "Doppio prendisole (prua/poppa), cabina matrimoniale, WC e doccia interna, stereo, GPS" }
      ]
    }
  ];

  // Gestisce lo scroll matematico per aggiornare il pallino e l'opacità all'istante
  const handleScroll = () => {
    const carousel = fleetCarouselRef.current;
    if (!carousel) return;

    const scrollLeft = carousel.scrollLeft;
    const containerWidth = carousel.clientWidth;
    
    // Trova l'indice corretto dividendo lo scroll per la larghezza approssimativa di una card
    const newIndex = Math.round(scrollLeft / (containerWidth * 0.75));
    
    // Protezione per non sforare i limiti dell'array
    const boundedIndex = Math.max(0, Math.min(newIndex, boats.length - 1));
    
    if (boundedIndex !== activeIndex) {
      setActiveIndex(boundedIndex);
    }
  };

  const handleDotClick = (index) => {
    const carousel = fleetCarouselRef.current;
    if (!carousel) return;
    
    const targetWrapper = carousel.querySelectorAll('.boat-carousel-wrapper')[index];
    if (targetWrapper) {
      targetWrapper.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      setActiveIndex(index);
    }
  };

  return (
    <section className="fleet-section">
      <div className="fleet-header">
        <h2>La Nostra Flotta</h2>
                <p className="fleet-subtitle">Scopri le nostre imbarcazioni esclusive, progettate per farti vivere un'esperienza indimenticabile nel Mar Ligure.</p>
      </div>

      <div className="fleet-carousel-container">
        <div 
          className="fleet-carousel" 
          ref={fleetCarouselRef}
          onScroll={handleScroll}
        >
          {boats.map((boat, index) => (
            <div 
              key={boat.id} 
              className={`boat-carousel-wrapper ${activeIndex === index ? 'is-active' : ''}`}
            >
              <div className="boat-card-slide">
                
                <div className="boat-image-container">
                  <img src={boat.image} alt={boat.name} className="boat-carousel-img" />
                  <span className="boat-badge-type">{boat.type}</span>
                </div>

                <div className="boat-content-container">
                  <h3>{boat.name}</h3>
                  <p className="boat-carousel-description">{boat.description}</p>
                  
                  <div className="boat-specs-mini">
                    {boat.specs.map((spec, specIdx) => (
                      <div key={specIdx} className="spec-mini-row">
                        <span className="spec-mini-label">{spec.label}</span>
                        <span className="spec-mini-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="fleet-carousel-dots">
          {boats.map((_, index) => (
            <button
              key={index}
              className={`fleet-dot ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Vai a ${boats[index].name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}