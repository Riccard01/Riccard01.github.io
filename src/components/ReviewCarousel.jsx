import React, { useEffect, useRef, useState } from 'react';
import './ReviewCarousel.css';

// Importazione di tutti gli avatar reali degli ospiti
import Florence from "../assets/florence.webp";
import Logan from "../assets/logan.webp";
import Linda from "../assets/linda.webp";
import Lana from "../assets/lana.webp";
import { getLocale } from '../utils/locale';

export default function ReviewCarousel({ lang = 'it' }) {
  const dict = getLocale(lang);
  const t = dict.reviewCarousel;

  const [visibleReviewIndices, setVisibleReviewIndices] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reviewCarouselRef = useRef(null);

  const expandedIdRef = useRef(expandedId);
  useEffect(() => {
    expandedIdRef.current = expandedId;
  }, [expandedId]);

  const reviews = [
    { 
      id: 1, 
      name: t.reviews?.[0]?.name || "Florence", 
      role: t.reviews?.[0]?.role || "Guest", 
      avatarImg: Florence,
      text: t.reviews?.[0]?.text || "" 
    },
    { 
      id: 2, 
      name: t.reviews?.[1]?.name || "Logan", 
      role: t.reviews?.[1]?.role || "Guest", 
      avatarImg: Logan,
      text: t.reviews?.[1]?.text || "" 
    },
    { 
      id: 3, 
      name: t.reviews?.[2]?.name || "Linda", 
      role: t.reviews?.[2]?.role || "Local Guide", 
      avatarImg: Linda,
      text: t.reviews?.[2]?.text || "" 
    },
    { 
      id: 4, 
      name: t.reviews?.[3]?.name || "Lana", 
      role: t.reviews?.[3]?.role || "Guest", 
      avatarImg: Lana,
      text: t.reviews?.[3]?.text || "" 
    }
  ];

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
      </div>

      <div className="review-carousel-container">
        <div className="review-carousel" ref={reviewCarouselRef}>
          {reviews.map((review) => {
            const isLongText = review.text.length > 350;
            const isExpanded = expandedId === review.id;
            
            const displayedText = isLongText && !isExpanded 
              ? `${review.text.substring(0, 350)}...` 
              : review.text;

            return (
              <div 
                key={review.id} 
                className={`review-carousel-wrapper ${visibleReviewIndices[review.id] ? 'is-visible' : ''}`} 
                data-review-id={review.id}
              >
                <div className="review-carousel-slide">
                  <div
                    className="review-slide-content"
                    style={
                      review.avatarImg
                        ? { backgroundImage: `url(${review.avatarImg})` }
                        : undefined
                    }
                  >
                    <div className="review-slide-overlay">
                      <div className="review-stars">★★★★★</div>

                      <div className="review-author-container">
                        <div className="review-author-info">
                          <h4>{review.name}</h4>
                          <p>{review.role}</p>
                        </div>
                      </div>

                      <p className="review-text">
                        "{displayedText}"
                        {isLongText && (
                          <button 
                            className="review-expand-btn" 
                            onClick={() => toggleExpand(review.id)}
                          >
                            {isExpanded ? t.showLess : t.readMore}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
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