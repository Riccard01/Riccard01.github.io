import React from 'react';
import "./ExperienceCarousel.css";
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
import { getLocale } from '../utils/locale';

export default function ExperienceCarousel({ lang = 'en' }) {
  const dict = getLocale(lang);
  const t = dict.experienceCarousel;

  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

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

  return (
    <div className="carousel-container">
      <h2 className="experiences-heading">{t.sectionTitle || 'Private boat experiences'}</h2>
      <div className="carousel">
        {experiences.map((exp) => (
          <article key={exp.id} className="carousel-wrapper" data-index={exp.id}>
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
                    <img src={clockIcon} alt={t.durationAlt} className="duration-icon" />
                    {exp.time}
                  </span>
                  <span className="duration-tag">
                    <img src={guestsIcon} alt={t.guestsAlt} className="guests-icon" />
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
          </article>
        ))}
      </div>
    </div>
  );
}