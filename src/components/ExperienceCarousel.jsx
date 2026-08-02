import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./ExperienceCarousel.css";
import img4 from "../assets/mariana.webp";
import img5 from "../assets/aperitivo.webp";
import florenceImg from "../assets/florence.webp";
import specialImg from "../assets/special.webp";
import clockIcon from "../assets/clock_dark.svg";
import guestsIcon from "../assets/guests_dark.svg";
import { getLocale } from '../utils/locale';
import enLocale from '../locales/en';
import itLocale from '../locales/it';
import { getExperienceSlugById } from '../utils/experienceRoutes';

export default function ExperienceCarousel({ lang = 'en' }) {
  const navigate = useNavigate();
  const dict = getLocale(lang);
  const t = dict.experienceCarousel;
  const detailsLabel = lang === 'it' ? 'Dettagli' : 'Details';

  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  // Associazione delle immagini statiche basata sull'ID dell'esperienza
  const experienceImages = {
    '0': [img4],
    '1': [img5],
    '3': [specialImg],
    '4': [florenceImg],
  };

  const canonicalOrder = ['1', '4', '0', '3'];
  const localeExperiences = Array.isArray(dict?.experienceCarousel?.experiences)
    ? dict.experienceCarousel.experiences
    : [];
  const fallbackExperiences = lang === 'it'
    ? (itLocale?.experienceCarousel?.experiences || [])
    : (enLocale?.experienceCarousel?.experiences || []);
  const experienceById = new Map();

  [...localeExperiences, ...fallbackExperiences].forEach((exp) => {
    if (exp?.id && !experienceById.has(exp.id)) {
      experienceById.set(exp.id, exp);
    }
  });

  const experiences = canonicalOrder
    .filter((id) => experienceById.has(id))
    .map((id) => ({
      ...experienceById.get(id),
      id,
      images: experienceImages[id] || [],
    }));

  const openExperiencePage = (experienceId) => {
    const slug = getExperienceSlugById(experienceId);
    if (!slug) return;
    const experiencePathPrefix = lang === 'it' ? 'esperienze' : 'experiences';
    navigate(`/${lang}/${experiencePathPrefix}/${slug}`);
  };

  return (
    <div className="carousel-container">
      <h2 className="experiences-heading">{t.sectionTitle || 'Private boat experiences'}</h2>
      <div className="carousel">
        {experiences.map((exp) => (
          <article
            key={exp.id}
            className="carousel-wrapper"
            data-index={exp.id}
            onClick={() => openExperiencePage(exp.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openExperiencePage(exp.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${exp.title} - ${t.callUs}`}
          >
            <div className="carousel-slide">
              <div className="slide-content">
                <div className={`image-grid ${exp.images?.length === 1 ? 'single-image' : ''}`}>
                  {exp.images && exp.images.map((src, idx) => (
                    <div key={idx} className={`grid-item ${exp.images.length > 1 ? `grid-item-${idx}` : ''}`.trim()}>
                      <img src={src} alt={`${exp.title} ${idx + 1}`} loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
                <div className="pill-wrapper">
                  <div className="pill-actions">
                    <button
                      type="button"
                      className="nav-link nav-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        openExperiencePage(exp.id);
                      }}
                    >
                      {detailsLabel}
                    </button>
                    <button
                      type="button"
                      className="nav-link nav-booking"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp();
                      }}
                    >
                      {t.callUs}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-content-wrapper">
              <div className="title-container">
                <h3>{exp.title}</h3>
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

              <p>{exp.desc}</p>
              <span className="price-inline">{exp.price}</span>

            </div>
          </article>
        ))}
      </div>
    </div>
  );
}