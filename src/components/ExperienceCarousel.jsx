import React, { useEffect, useRef, useState } from 'react';
import "./ExperienceCarousel.css";
import { translations } from './translations';
import img2 from "../assets/florence.webp";
import img4 from "../assets/mariana.jpeg";
import img5 from "../assets/aperitivo.webp";
import img6 from "../assets/sanfrut.jpeg";
import img7 from "../assets/aperitivor.webp";
import img8 from "../assets/nape.jpeg";
import img10 from "../assets/melone.jpeg";
import img11 from "../assets/sori.jpeg";
import img12 from "../assets/camo.jpeg";
import clockIcon from "../assets/clock_dark.svg";
import guestsIcon from "../assets/guests_dark.svg";

export default function ExperienceCarousel({ lang = 'en' }) {
  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});
  const [activeIndex, setActiveIndex] = useState(1);

  const initialCenterIndex = 1;

  // Selezione della lingua (fallback su 'en' se non specificata o non trovata)
  const t = translations[lang] || translations.en;

  // Associazione delle immagini statiche basata sull'ID dell'esperienza
  const experienceImages = {
    '0': [img2, img6, img10],
    '1': [img5, img7, img8],
    '2': [img4, img11, img12],
  };

  const experiences = t.experiences.map((exp) => ({
    ...exp,
    images: experienceImages[exp.id] || []
  }));

  const scrollToCard = (index) => {
    const carousel = carouselRef.current;
    if (!carousel || window.innerWidth >= 1024) return;

    const wrappers = carousel.querySelectorAll('.carousel-wrapper');
    const target = wrappers[index];

    if (target) {
      const offset = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
      carousel.scrollTo({ left: offset, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const scrollByCard = (direction) => {
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= experiences.length) newIndex = experiences.length - 1;
    scrollToCard(newIndex);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    if (window.innerWidth < 1024) {
        setTimeout(() => scrollToCard(initialCenterIndex), 50);
    }

    const wrappers = carousel.querySelectorAll('.carousel-wrapper');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-index');
        const isVis = entry.isIntersecting;
        setVisibleIndices((prev) => ({ ...prev, [id]: isVis }));
        
        if (isVis) {
            setActiveIndex(parseInt(id, 10));
        }
      });
    }, { 
      root: carousel, 
      rootMargin: '0px -15% 0px -15%', 
      threshold: 0.5 
    });

    wrappers.forEach((wrapper) => observer.observe(wrapper));

    return () => wrappers.forEach((wrapper) => observer.unobserve(wrapper));
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-header-group">
        <div className="carousel-arrows-action-group">
            <button
                type="button"
                className="carousel-arrow carousel-arrow-mobile carousel-arrow-prev"
                aria-label={t.prevAria}
                onClick={() => scrollByCard(-1)}
                disabled={activeIndex === 0}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="#081f5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <button
                type="button"
                className="carousel-arrow carousel-arrow-mobile carousel-arrow-next"
                aria-label={t.nextAria}
                onClick={() => scrollByCard(1)}
                disabled={activeIndex === experiences.length - 1}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="#081f5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>

        <div className="carousel-dots-container">
            {experiences.map((exp, idx) => (
            <button
                key={exp.id}
                type="button"
                className={`carousel-dot ${activeIndex === idx ? 'active' : ''}`}
                onClick={() => scrollToCard(idx)}
                aria-label={t.dotAria(idx)}
            />
            ))}
        </div>
      </div>

      <div className="carousel" ref={carouselRef}>
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className={`carousel-wrapper ${visibleIndices[exp.id] ? 'is-visible' : ''}`}
            data-index={exp.id}
          >
            <div className="carousel-slide">
              <div className="slide-content">
                <div className="price-chip">{exp.price}</div>
                <div className="image-grid">
                  {exp.images && exp.images.map((src, idx) => (
                    <div key={idx} className={`grid-item grid-item-${idx}`}>
                      <img src={src} alt={`${exp.title} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
                <div className="pill-wrapper">
                  <button className="nav-link nav-booking" onClick={openWhatsApp}>
                    {t.callUs}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-content-wrapper">
              <h3>{exp.title}</h3>
              <p>{exp.desc}</p>
              
              <div className="title-container">
                <div className="meta-info-container">
                  <span className="duration-tag">
                    <img src={clockIcon} alt="Duration" className="duration-icon" />
                    {exp.time}
                  </span>
                  <span className="duration-tag">
                    <img src={guestsIcon} alt="Guests" className="guests-icon" />
                    {exp.guests}
                  </span>
                </div>
              </div>

              {exp.chips && exp.chips.length > 0 && (
                <div className="card-chips-container">
                  {exp.chips.map((chip, chipIdx) => (
                    <span key={chipIdx} className="card-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}