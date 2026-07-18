import React, { useEffect, useRef, useState } from 'react';
import './ReviewCarousel.css';

// Importazione di tutti gli avatar reali degli ospiti
import Florence from "../assets/florence.webp";
import Logan from "../assets/logan.webp";
import Linda from "../assets/linda.webp";
import Lana from "../assets/lana.webp";

export default function ReviewCarousel() {
  const [visibleReviewIndices, setVisibleReviewIndices] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // Manages the active dot (0-based)
  const reviewCarouselRef = useRef(null);

  // Ref to always keep the latest updated value of expandedId within the observer
  const expandedIdRef = useRef(expandedId);
  useEffect(() => {
    expandedIdRef.current = expandedId;
  }, [expandedId]);

  const reviews = [
    { 
      id: 1, 
      name: "Florence", 
      role: "Guest", 
      avatarImg: Florence,
      text: "It is imperative to see this sublime Leguria region, of which Genoa is the capital, and which was shaped by the port and sea around it from the lens of the sea. Being on land simply does not do this region justice. Riccardo is an experienced water guide, unimposing, discreet but warm and familiar like an old friend you are reuniting with. He will make you feel like a local for the day living the Italian dream. Everything famous about Italy- the charm, the food, the passion, the history and the nature rolled into one experience on this boat trip. -Florence Kollie, London" 
    },
    { 
      id: 2, 
      name: "Logan", 
      role: "Guest", 
      avatarImg: Logan,
      text: "What a wonderful experience to take a day on the Ligurian Sea with Riccardo! The views of the Cinque Terre from the water are truly something to behold, and the itinerary can be customized to your liking. I took the trip with my grandmother who uses a cane to walk and it was made so easy and enjoyable by Riccardo's accommodations! We especially enjoyed stepping off in Portofino and diving to see the Christ of the Abyss. In the afternoon we were given a delicious aperitivo of prosciutto and the most delicious melon I have ever eaten! Following a stop back in Genoa for the bathroom, we went back out to enjoy the spectacular sunset behind the mountains. I will absolutely book another tour with this boat the next time I'm in town!! Thanks again Riccardo, I hope our paths cross again soon!!!" 
    },
    { 
      id: 3, 
      name: "Linda", 
      role: "Local Guide", 
      avatarImg: Linda,
      text: `We had such a fantastic time with Riccardo on his boat. The tour was customized to our needs. We were able to explore the beautiful village of Camogli at our own rhythm. We had a nice swim in the warm waters and ended the day with a wonderful Ligurian aperitivo, drinking Prosecco and watching the sunset. Riccardo had thought about everything, from towels, to swim masks (we saw so many fish!). The food was delicious and the atmosphere was amazing. Riccardo is a really nice person. We could really feel his passion for the sea and the region. He speaks great english and was able to share many interesting facts with us and he also took very beautiful pictures of us in the sunset! The tour felt very professional yet also very friendly! In short: Everything was perfect and I highly recommend this tour. Thank you Riccardo for the great time and memories, I really had a taste of the "dolce vita" :)` 
    },
    { 
      id: 4, 
      name: "Lana", 
      role: "Guest", 
      avatarImg: Lana,
      text: `The trip was so fun and wonderful\nWe had lots of fun me and my family\nAnd the captain was so nice and flexible with everything\nAnd the boat was very safe, he had all of the safety equipments ready if anything happened, and he was very careful with everything it was very safe.\nAnd the prices were the best compared to any others\nWe would definitely do it again if we had to come back to genoa!` 
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
            
            // Find the array index corresponding to the ID to update pagination
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
        rootMargin: '0px -25% 0px -25%',
        threshold: 0.5 
      }
    );

    const wrappers = carousel.querySelectorAll('.review-carousel-wrapper');
    wrappers.forEach((wrapper) => observer.observe(wrapper));

    return () => {
      wrappers.forEach((wrapper) => observer.unobserve(wrapper));
    };
  }, [reviews]); // Aggiunto reviews alle dipendenze per l'allineamento degli indici

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Funzione per scrollare sulla card quando si clicca un pallino
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
        <h2>What People Say About Us</h2>
      </div>

      <div className="review-carousel-container">
        <div className="review-carousel" ref={reviewCarouselRef}>
          {reviews.map((review) => {
            // MODIFICA: Alzato il limite a 450 caratteri per mostrare più testo possibile
            const isLongText = review.text.length > 450;
            const isExpanded = expandedId === review.id;
            
            const displayedText = isLongText && !isExpanded 
              ? `${review.text.substring(0, 450)}...` 
              : review.text;

            return (
              <div 
                key={review.id} 
                className={`review-carousel-wrapper ${visibleReviewIndices[review.id] ? 'is-visible' : ''}`} 
                data-review-id={review.id}
              >
                <div className="review-carousel-slide">
                  <div className="review-slide-content">
                    
                    <div className="review-stars">★★★★★</div>
                    
                    <div className="review-author-container">
                      <div className="review-avatar">
                        {review.avatarImg ? (
                          <img 
                            src={review.avatarImg} 
                            alt={review.name} 
                            className="review-avatar-img" 
                          />
                        ) : (
                          review.name.charAt(0)
                        )}
                      </div>
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
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </p>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ELEMENTO DI PAGINAZIONE (DOT INDICATORS) */}
        <div className="review-carousel-dots">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`review-dot ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Vai alla recensione ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}