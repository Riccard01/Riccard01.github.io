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
import img13 from "../assets/special.jpg";


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
      title: 'The Rainbow Tour',
      duration: '5-10 HOURS • 4 GUESTS MAX',
      price: 'From €750',
      desc: "Exclusive private charter along the Ligurian Riviera. Explore the hidden gems of Gulf Paradise and the Tigullio Gulf: sheer cliffs, pristine bays, and charming seaside villages. A tailored nautical experience with fresh drinks and onboard snacks for total relaxation between sky and sea."
    },
    {
      id: '1',
      images: [img5, img7, img8],
      title: 'Gourmet Sunset Cruise',
      duration: '3 HOURS • 7 GUESTS MAX',
      price: 'From €390',
      desc: "Let yourself be cradled by the golden waves of Boccadasse as a special maritime delivery reaches us on board: the signature 'Il Genovese' aperitif. Prosecco for everyone, lounge music, and the unique charm of the coastline illuminated by golden lights—the ultimate way to experience the sea of Genoa."
    },
    {
      id: '2',
      images: [img4, img11, img12],
      title: 'Private Transfer',
      duration: '7 GUESTS MAX',
      price: 'From €350',
      desc: "Private sea transfers between the iconic locations of the Riviera. Skip the traffic and reach Portofino or Camogli, amidst dancing dolphins and breathtaking views for your travels along the Ligurian coast."
    }
    // {
    //   id: '3',
    //   images: [img13],
    //   title: 'Stella Maris',
    //   duration: 'CUSTOM DURATION • 4 GUESTS MAX',
    //   price: 'From €2000',
    //   desc: "A unique experience for those who want to explore the Ligurian coast in a luxurious and exclusive way. The Stella Maris is a 20-meter yacht that can accommodate up to 4 guests, offering a private and intimate experience on the sea. Enjoy the comfort of a spacious deck, a fully equipped kitchen, and a cozy cabin while discovering the hidden gems of the Riviera."
    // }
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
    // Centra la seconda card solo se siamo su schermi mobile/tablet (< 1024px)
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
                <div className="image-grid">
                  {exp.images && exp.images.map((src, idx) => (
                    <div key={idx} className={`grid-item grid-item-${idx}`}>
                      <img src={src} alt={`${exp.title} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
                <div className="pill-wrapper">
                  <button className="nav-link nav-booking" onClick={openWhatsApp}>
                    Prenota
                  </button>
                </div>
              </div>
            </div>

            <div className="text-content-wrapper">
              <div className="title-container">
                <span className="duration-tag">{exp.duration}</span>
              </div>
              <h3>{exp.title}</h3>
              <p>{exp.desc}</p>
              <div className="price-tag">{exp.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}