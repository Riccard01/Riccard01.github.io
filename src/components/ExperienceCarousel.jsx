import React, { useEffect, useRef, useState } from 'react';
import "./ExperienceCarousel.css";
import img1 from "../assets/aperitivo.webp";
import img6 from "../assets/sanfrut.jpeg";
import img2 from "../assets/florence.webp";
import img3 from "../assets/logan.webp";
import img4 from "../assets/mariana.jpeg";
import img5 from "../assets/aperitivo.webp";
import img7 from "../assets/aperitivor.webp";
import img8 from "../assets/meape.jpeg";
import img9 from "../assets/marian.jpeg";
import img10 from "../assets/melone.jpeg";


export default function ExperienceCarousel() {
  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});

  const initialCenterIndex = 1;
  const initialScrollDuration = 200;
  const easeInPower = 4;
  const easeOutPower = 400;

  const experiences = [
    {
      id: '0',
      images: [img2, img6, img10],
      title: 'The Rainbow Tour',
      duration: '5-10 HOURS • 4 GUESTS',
      price: 'From €650',
      desc: "Charter privato esclusivo lungo la Riviera Ligure. Esplora le perle del Golfo Paradiso e del Tigullio: scogliere a picco, baie incontaminate e borghi marinari. Un’esperienza nautica su misura con drink freschi e snack a bordo per un relax totale tra cielo e mare."
    },
    {
      id: '1',
      images: [img5, img7, img8],
      title: 'Gourmet Sunset Cruise',
      duration: '3 HOURS • 7 GUESTS',
      price: 'From €390',
      desc: "Vivi il tramonto più suggestivo della Liguria. Navigazione esclusiva verso Boccadasse con aperitivo gourmet firmato 'Il Genovese'. Prosaic, musica lounge e il fascino unico della costa illuminata dalle luci dorate: il modo migliore per vivere il mare di Genova."
    },
    {
      id: '2',
      images: [img9, img8, img7],
      title: 'Private Transfer',
      duration: '3 HOURS • 7 GUESTS',
      price: 'From €350',
      desc: "Trasferimenti privati via mare tra le località iconiche della Riviera. Evita il traffico e raggiungi Portofino, San Fruttuoso o le Cinque Terre con il comfort di un charter nautico di lusso. Velocità, stile e panorama mozzafiato per i tuoi spostamenti sulla costa ligure."
    }
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

    const wrappers = carousel.querySelectorAll('.carousel-wrapper');
    const target = wrappers[initialCenterIndex];

    if (target) {
      const offset = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
      animateScrollTo(carousel, offset, initialScrollDuration);
    }

    // L'Observer attiva la classe 'is-visible' quando la card entra nel 50% centrale del carosello
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-index');
        setVisibleIndices((prev) => ({ ...prev, [id]: entry.isIntersecting }));
      });
    }, { root: carousel, rootMargin: '0px -25% 0px -25%', threshold: 0.5 });

    wrappers.forEach((wrapper) => observer.observe(wrapper));
    return () => wrappers.forEach((wrapper) => observer.unobserve(wrapper));
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className={`carousel-wrapper ${visibleIndices[exp.id] ? 'is-visible' : ''}`}
            data-index={exp.id}
          >
            {/* Parte superiore: Immagine (nessuna animazione richiesta sul contenitore) */}
            <div className="carousel-slide">
              <div className="slide-content">
                <div className="image-grid">
                  {exp.images && exp.images.map((src, idx) => (
                    <div key={idx} className={`grid-item grid-item-${idx}`}>
                      <img src={src} alt={`${exp.title} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
                <div className="pill-wrapper">
                  <button className="nav-link nav-booking" onClick={() => { window.location.href = '/book'; }}>
                    Prenota
                  </button>
                </div>
              </div>
            </div>

            {/* --- MODIFICA --- */}
            {/* Contenitore che raggruppa tutto il testo: questo blocco ora animerà opacity e translateY */}
            <div className="text-content-wrapper">
              <div className="title-container">
                <span className="duration-tag">{exp.duration}</span>
              </div>
              <h3>{exp.title}</h3>
              <p>{exp.desc}</p>
              <div className="price-tag">{exp.price}</div>
            </div>
            {/* ---------------- */}

          </div>
        ))}
      </div>
    </div>
  );
}