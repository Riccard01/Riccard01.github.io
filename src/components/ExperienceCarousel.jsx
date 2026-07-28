import React, { useEffect, useRef, useState } from 'react';
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


export default function ExperienceCarousel() {

  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});

  const initialCenterIndex = 1;
  const initialScrollDuration = 300;

  const experiences = [
    {
      id: '0',
      images: [img2, img6, img10],
      title: 'Portofino Private Boat Tour',
      time: '5-10 Hrs',
      guests: '5 Max',
      price: 'From €750 per group',
      desc: "Explore the gems of the Two Gulfs at your own pace. Discover sheer cliffs, pristine bays, and charming seaside villages with drinks and onboard snacks included."
    },
    {
      id: '1',
      images: [img5, img7, img8],
      title: 'Gourmet Sunset Cruise',
      time: '4 Hrs',
      guests: '14 Max',
      price: 'From €390 per group',
      desc: "Experience a golden-hour sunset cruise off Genoa and Boccadasse featuring the signature 'Il Genovese' aperitif, Prosecco, and lounge music."
    },
    {
      id: '2',
      images: [img4, img11, img12],
      title: 'Private Transfer',
      time: '30 min',
      guests: '7 Max',
      price: 'From €250 per group',
      desc: "Skip the traffic along the Ligurian coast with a fast, scenic water transfer directly to Portofino or Camogli."
    }
  ];

  const animateScrollTo = (element, left, duration) => {
    if (!element || duration <= 0) {
      if (element) element.scrollLeft = left;
      return;
    }
    const start = element.scrollLeft;
    const change = left - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      element.scrollLeft = start + change * ease;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const centerInitialCard = () => {
    const carousel = carouselRef.current;
    if (!carousel || window.innerWidth >= 1024) return;

    const wrappers = carousel.querySelectorAll('.carousel-wrapper');
    const target = wrappers[initialCenterIndex];

    if (target) {
      const offset = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
      animateScrollTo(carousel, offset, initialScrollDuration);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    centerInitialCard();

    const wrappers = carousel.querySelectorAll('.carousel-wrapper');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-index');
        setVisibleIndices((prev) => ({ ...prev, [id]: entry.isIntersecting }));
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
                    Call Us
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}