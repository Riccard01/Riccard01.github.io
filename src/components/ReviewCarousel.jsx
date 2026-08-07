import React, { useEffect, useRef, useState } from 'react';
import './ReviewCarousel.css';

// Importazione di tutti gli avatar reali degli ospiti
import Florence from "../assets/florence.webp";
import Logan from "../assets/logan.webp";
import Linda from "../assets/linda.webp";
import Lana from "../assets/lana.webp";
import Simone from "../assets/simo.webp";
import { getLocale } from '../utils/locale';

export default function ReviewCarousel({ lang = 'en' }) {
  const dict = getLocale(lang);
  const t = dict.reviewCarousel;
  const baseLocale = getLocale('en');

  const [visibleReviewIndices, setVisibleReviewIndices] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reviewCarouselRef = useRef(null);

  const expandedIdRef = useRef(expandedId);
  useEffect(() => {
    expandedIdRef.current = expandedId;
  }, [expandedId]);

  const sourceReviews = Array.isArray(t?.reviews)
    ? t.reviews
    : Array.isArray(baseLocale?.reviewCarousel?.reviews)
      ? baseLocale.reviewCarousel.reviews
    : [];

  const orderedReviews = (() => {
    const florenceIndex = sourceReviews.findIndex((review) => {
      const normalizedName = (review?.name || '').toLowerCase();
      return normalizedName.startsWith('florence');
    });

    if (florenceIndex === -1) {
      return sourceReviews;
    }

    const florenceReview = sourceReviews[florenceIndex];
    const remainingReviews = sourceReviews.filter((_, idx) => idx !== florenceIndex);
    return [florenceReview, ...remainingReviews];
  })();

  const getAvatarByName = (name) => {
    const normalizedName = (name || '').toLowerCase();

    if (normalizedName.startsWith('florence')) return Florence;
    if (normalizedName.startsWith('logan')) return Logan;
    if (normalizedName.startsWith('linda')) return Linda;
    if (normalizedName.startsWith('lana')) return Lana;
    if (normalizedName.startsWith('simone')) return Simone;

    return null;
  };

  const reviews = orderedReviews.map((review, idx) => ({
    id: review.id || idx + 1,
    name: review.name || `Guest ${idx + 1}`,
    role: review.role || 'Guest',
    text: review.text || '',
    avatarImg: getAvatarByName(review.name),
  }));

  useEffect(() => {
    const carousel = reviewCarouselRef.current;
    if (!carousel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute('data-review-id'));
          
          if (entry.isIntersecting) {
            setVisibleReviewIndices((prev) => ({ ...prev, [id]: true }));
            
            const index = reviews.findIndex(r => r.id === id);
            if (index !== -1) {
              setActiveIndex(index);
            }
          } else {
            setVisibleReviewIndices((prev) => ({ ...prev, [id]: false }));
            
            if (expandedIdRef.current === id) {
              setExpandedId(null);
            }
          }
        });
      },
      {
        root: carousel,
        rootMargin: '0px -10% 0px -10%',
        threshold: 0.4 
      }
    );

    const wrappers = carousel.querySelectorAll('.review-carousel-wrapper');
    wrappers.forEach((wrapper) => observer.observe(wrapper));

    return () => {
      wrappers.forEach((wrapper) => observer.unobserve(wrapper));
    };
  }, [reviews]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDotClick = (index) => {
    const carousel = reviewCarouselRef.current;
    if (!carousel) return;
    
    const targetWrapper = carousel.querySelectorAll('.review-carousel-wrapper')[index];
    if (targetWrapper) {
      targetWrapper.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  return (
    <section className="review-carousel-section">
      <div className="review-carousel-header">
        <h2>{t.title}</h2>
        <p className="review-count">{reviews.length} {t.countLabel || (lang === 'it' ? 'recensioni' : 'reviews')}</p>
      </div>

      <div className="review-carousel-container">
        <div className="review-carousel" ref={reviewCarouselRef}>
          {reviews.map((review) => {
            const isExpanded = expandedId === review.id;

            return (
              <div 
                key={review.id} 
                className={`review-carousel-wrapper ${visibleReviewIndices[review.id] ? 'is-visible' : ''}`} 
                data-review-id={review.id}
              >
                <div className="review-carousel-slide">
                  <article className="review-card">
                    <div className="review-author-info">
                      <div className="review-author-top">
                        <h3>{review.name}</h3>
                        <span className="review-stars-inline" aria-hidden="true">★★★★★</span>
                      </div>
                      <p>{review.role}</p>
                    </div>

                    <p className={`review-text ${!isExpanded ? 'is-clamped' : ''}`}>
                      "{review.text}"
                    </p>

                    <button
                      className="review-expand-btn"
                      onClick={() => toggleExpand(review.id)}
                    >
                      {isExpanded ? t.showLess : t.readMore}
                    </button>

                    {review.avatarImg && (
                      <img
                        src={review.avatarImg}
                        alt={review.name}
                        className="review-image"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </article>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginazione pallini (visibile solo su mobile via CSS) */}
        <div className="review-carousel-dots">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`review-dot ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={t.dotAria(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}