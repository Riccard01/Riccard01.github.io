import React, { useEffect, useRef, useState } from 'react';
import "./ExperienceCarousel.css";
import img1 from "../assets/aperitivo.webp";
import img6 from "../assets/sanfru.webp";

export default function ExperienceCarousel() {
  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});

  const initialCenterIndex = 1;
  const initialScrollDuration = 200;
  const easeInPower = 4;
  const easeOutPower = 400;

  const experiences = [
    {
      id: '5',
      img: img6,
      title: 'Rainbow tour',
      duration: '5-10 HOURS',
      desc: "Discover the authentic beauty of the Ligurian coast with our Rainbow Tour, the ultimate private charter for those seeking a perfect blend of relaxation and adventure. We will sail along the most picturesque stretches of the coastline, featuring cliff-side villages, crystal-clear hidden bays, and iconic headlands that make the Riviera a unique destination in the world. Enjoy the journey with a selection of fresh drinks and fresh snacks served on board."
    },
    {
      id: '0',
      img: img1,
      title: 'Gourmet Sunset Cruise',
      duration: '5 HOURS',
      desc: "As the sky dissolves into shades of gold and violet, we drift toward the charming shores of Boccadasse. Immerse yourself in the sunset with an exclusive Aperitivo curated by 'Il Genovese.' With a glass of prosecco in hand, chilled music on the breeze, and the magic of dancing dolphins alongside us, it is a moment where the Riviera truly comes to life."
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
                <img src={exp.img} alt={exp.title} className="slide-image" />
              </div>
            </div>

            {/* --- MODIFICA --- */}
            {/* Contenitore che raggruppa tutto il testo: questo blocco ora animerà opacity e translateY */}
            <div className="text-content-wrapper">
              <div className="title-container">
                <h3>{exp.title}</h3>
                <span className="duration-tag">{exp.duration}</span>
              </div>
              <p>{exp.desc}</p>
            </div>
            {/* ---------------- */}

          </div>
        ))}
      </div>
    </div>
  );
}