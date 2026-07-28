import React, { useEffect, useRef, useState } from 'react';
import './PrivateTransfer.css';
import Recco from '../assets/port-recco.webp';
import Portoantico from '../assets/portoantico.webp';
import Portofino from '../assets/portofino_extra_fee.webp';
import Camogli from '../assets/port-camogli.webp';
import Nervi from '../assets/nervi.webp';
import Santa from '../assets/santa_margherita_ligure_extra_fee.webp';
import { getLocale } from '../utils/locale';

const AVAILABLE_PORTS = [
  {
    id: 1,
    name: "Porto di Genova (Porto Antico)",
    imageUrl: Portoantico,
    mapsUrl: "https://maps.app.goo.gl/1KiRd4PbU27GshzT7"
  },
  {
    id: 2,
    name: "Porto di Recco",
    imageUrl: Recco,
    mapsUrl: "https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9"
  },
  {
    id: 3,
    name: "Porto di Portofino",
    imageUrl: Portofino,
    mapsUrl: "https://maps.app.goo.gl/LrZCvqUgcyCTooV57"
  },
  {
    id: 4,
    name: "Porto di Camogli",
    imageUrl: Camogli,
    mapsUrl: "https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8"
  },
  {
    id: 5,
    name: "Porto di Nervi",
    imageUrl: Nervi,
    mapsUrl: "https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8"
  },
  {
    id: 6,
    name: "S. Margherita Ligure",
    imageUrl: Santa,
    mapsUrl: "https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6"
  },
  {
    id: 7,
    name: "Rapallo",
    imageUrl: "...",
    mapsUrl: ""
  }
];

export default function PrivateTransfer({ lang = 'it' }) {
  const dict = getLocale(lang);
  const t = dict.privateTransfer;
  const fleetVehicles = t.fleetVehicles || [];

  const carouselRef = useRef(null);
  const [visibleIndices, setVisibleIndices] = useState({});

  const initialCenterIndex = 2;
  const initialScrollDuration = 200;
  const easeInPower = 4;
  const easeOutPower = 400;

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
      const ease = progress < 0.5
        ? 0.5 * Math.pow(progress * 2, easeInPower)
        : 0.5 + 0.5 * Math.pow((progress - 0.5) * 2, easeOutPower);
      element.scrollLeft = start + change * ease;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // Effetto di scroll iniziale al centro (Solo per schermi mobile/tablet < 1024px)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || window.innerWidth >= 1024) return;

    const wrappers = carousel.querySelectorAll('.transfer-carousel-wrapper');
    const target = wrappers[initialCenterIndex];
    if (!target) return;

    const offset = target.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;
    animateScrollTo(carousel, offset, initialScrollDuration);
  }, []);

  // IntersectionObserver per tracciare la card attiva al centro dello schermo
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          setVisibleIndices((prev) => ({ ...prev, [id]: entry.isIntersecting }));
        });
      },
      {
        root: carousel,
        rootMargin: '0px -15% 0px -15%',
        threshold: 0.5
      }
    );

    const wrappers = carousel.querySelectorAll('.transfer-carousel-wrapper');
    wrappers.forEach((wrapper) => observer.observe(wrapper));

    return () => {
      wrappers.forEach((wrapper) => observer.unobserve(wrapper));
    };
  }, []);

  return (
    <section className="private-transfer">

      <div className="private-transfer-container">
        {/* Contenuto Principale */}
        <div className="private-transfer-content">
          <h2 className="private-transfer-title">{t.title}</h2>
          <p className="private-transfer-subtitle">{t.subtitle}</p>
          
          <ul className="fleet-list">
            {fleetVehicles.map((vehicle, index) => (
              <li key={index} className="fleet-item">
                <span className="fleet-bullet">•</span> {vehicle}
              </li>
            ))}
          </ul>
        </div>

        {/* Carousel Header */}
        <div className="carousel-header">
          <h3 className="carousel-section-title">{t.portsTitle}</h3>
          <p className="carousel-section-hint">{t.portsHint}</p>
        </div>
      </div>

      {/* Binario del Carosello */}
      <div className="transfer-carousel-container">
        <div className="transfer-carousel" ref={carouselRef}>
          {AVAILABLE_PORTS.map((port) => (
            <div 
              key={port.id} 
              className={`transfer-carousel-wrapper ${visibleIndices[port.id] ? 'is-visible' : ''}`} 
              data-id={port.id}
            >
              {/* Box Immagine Elevata */}
              <div className="transfer-carousel-slide">
                <div className="transfer-slide-content">
                  <img 
                    src={port.imageUrl} 
                    alt={port.name} 
                    className="transfer-slide-image" 
                    loading="lazy" 
                  />
                </div>
              </div>

              {/* Informazioni e Azione sotto la card */}
              <h4 className="transfer-port-name">{port.name}</h4>
              
              <div className="transfer-action-wrapper">
                <a 
                  href={port.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-transfer-discover"
                >
                  <svg 
                    className="btn-transfer-icon" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t.discoverLocation}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}