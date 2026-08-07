import React, { useEffect, useState } from 'react';
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
import { getExperienceUi } from '../locales/experienceUi';
import { getAvailabilityUi } from '../locales/availabilityUi';

const EXPERIENCE_REVIEW_CONFIG = {
  '0': { count: 4, reviewId: 1, keyword: 'Portofino', fallbackSentenceIndex: 2 },
  '1': { count: 6, reviewId: 3, keyword: 'aperitivo', fallbackSentenceIndex: 1 },
  '3': { count: 2, reviewId: 8, sentenceIndex: 0 },
  '4': { count: 2, reviewId: 2, keyword: 'Camogli', fallbackSentenceIndex: 1 },
};

export default function ExperienceCarousel({ lang = 'en' }) {
  const navigate = useNavigate();
  const dict = getLocale(lang);
  const t = dict.experienceCarousel;
  const learnMoreLabel = getExperienceUi(lang).learnMore;
  const availabilityText = getAvailabilityUi(lang);
  const [availability, setAvailability] = useState({});

  const localeReviews = Array.isArray(dict?.reviewCarousel?.reviews)
    ? dict.reviewCarousel.reviews
    : [];
  const localizedReviews = localeReviews.length
    ? localeReviews
    : (enLocale?.reviewCarousel?.reviews || []);
  const reviewCount = localizedReviews.length + (
    localizedReviews.some((review) => review?.name === 'Christina Speth') ? 0 : 1
  );

  const getReviewPreview = (experienceId) => {
    const config = EXPERIENCE_REVIEW_CONFIG[experienceId];
    const review = localizedReviews.find(({ id }) => id === config?.reviewId);
    if (!review?.text) return '';

    const sentences = [...new Intl.Segmenter(lang, { granularity: 'sentence' }).segment(review.text)]
      .map(({ segment }) => segment.trim())
      .filter(Boolean);
    const contextualSentence = config.keyword
      ? sentences.find((sentence) => sentence.toLocaleLowerCase(lang).includes(config.keyword.toLocaleLowerCase(lang)))
      : sentences[config.sentenceIndex];
    const fallbackSentence = sentences[config.fallbackSentenceIndex ?? config.sentenceIndex ?? 0];

    return contextualSentence || fallbackSentence || sentences[0] || review.text;
  };

  useEffect(() => {
    let cancelled = false;
    import('../utils/experienceAvailability')
      .then(({ getExperienceAvailabilityPreviews }) => getExperienceAvailabilityPreviews())
      .then((previews) => {
        if (!cancelled) setAvailability(previews);
      })
      .catch(() => {
        if (!cancelled) setAvailability({});
      });
    return () => { cancelled = true; };
  }, []);

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

  const openBookingPage = (event, experienceId) => {
    event.stopPropagation();
    navigate(`/${lang}/book?exp=${experienceId}`);
  };

  const getAvailabilityLabel = (experienceId) => {
    const preview = availability[experienceId];
    if (!preview) return null;

    const departureDay = preview.dayOffset <= 1
      ? new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(preview.dayOffset, 'day')
      : new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' })
        .format(new Date(`${preview.date}T12:00:00`));

    return `${availabilityText.available}: ${departureDay}, ${preview.time}`;
  };

  return (
    <div className="carousel-container">
      <h2 className="experiences-heading">{t.sectionTitle || 'Private boat experiences'}</h2>
      <div className="carousel">
        {experiences.map((exp) => {
          const availabilityLabel = getAvailabilityLabel(exp.id);
          const experienceReviewCount = EXPERIENCE_REVIEW_CONFIG[exp.id]?.count ?? reviewCount;
          const reviewPreview = getReviewPreview(exp.id);
          return (
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
                <div className="pill-wrapper">
                  <div className="experience-review-preview" dir={dict.rtl ? 'rtl' : 'ltr'}>
                    <span className="experience-review-count" aria-label={`${experienceReviewCount} reviews`}>
                      <span className="experience-review-star" aria-hidden="true">★</span>
                      {experienceReviewCount}
                    </span>
                    <q>{reviewPreview}</q>
                  </div>
                  <button
                    type="button"
                    className="nav-link nav-booking"
                    onClick={(e) => {
                      e.stopPropagation();
                      openExperiencePage(exp.id);
                    }}
                  >
                    {learnMoreLabel}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-content-wrapper">
              <div className="title-container">
                <h3>{exp.title}</h3>
              </div>

              <p>{exp.desc}</p>
              <span className="price-inline">{exp.price}</span>
              {availabilityLabel ? (
                <button
                  type="button"
                  className="availability-preview"
                  onClick={(event) => openBookingPage(event, exp.id)}
                >
                  <span className="availability-preview-dot" aria-hidden="true" />
                  <span>
                    <strong>{availabilityLabel}</strong>
                  </span>
                </button>
              ) : null}
              {exp.occasionTags?.length ? (
                <div className="card-chips-container" aria-label={exp.title}>
                  {exp.occasionTags.map((tag) => <span key={tag} className="card-chip">{tag}</span>)}
                </div>
              ) : null}

            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}