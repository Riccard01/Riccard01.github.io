import { useRef, useState } from 'react';
import './WhatYouWillExperience.css';
import meape from '../assets/meape.webp';
import camogli from '../assets/camogli.webp';
import melone from '../assets/melone.webp';
import stellamaris from '../assets/stellamaris.webp';
import nape from '../assets/nape.webp';
import birthdayOnBoard from '../assets/compleanno-a-bordo.png';

const slides = [
  { src: meape, alt: 'Aperitivo served on board', caption: 'aperitivo' },
  { src: birthdayOnBoard, alt: 'Birthday celebration on board', caption: 'birthday' },
  { src: camogli, alt: 'A colorful Ligurian village', caption: 'villages' },
  { src: melone, alt: 'Local food served during the tour', caption: 'flavours' },
  { src: stellamaris, alt: 'Lights floating on the sea at night', caption: 'evenings' },
  { src: nape, alt: 'Relaxing aboard the boat', caption: 'relax' },
];

const slideCaptions = {
  it: {
    aperitivo: 'Aperitivo ligure servito a bordo',
    birthday: 'Compleanno a bordo',
    villages: 'Borghi colorati affacciati sul mare',
    flavours: 'Sapori locali durante il tour',
    evenings: 'Serate illuminate sul mare',
    relax: 'Relax e libertà a bordo',
  },
  en: {
    aperitivo: 'A Ligurian aperitivo served on board',
    birthday: 'Birthday on board',
    villages: 'Colourful villages overlooking the sea',
    flavours: 'Local flavours during the tour',
    evenings: 'Evenings lit up on the sea',
    relax: 'Freedom and relaxation on board',
  },
};

const sectionTitles = {
  it: 'Cosa vivrai',
  en: 'What you will experience',
  de: 'Was du erleben wirst',
  es: 'Lo que vivirás',
  fr: 'Ce que vous vivrez',
  ar: 'ما ستعيشه',
  zh: '你将体验什么',
  pl: 'Czego doświadczysz',
  ru: 'Что вас ждёт',
  uk: 'Що ви відчуєте',
  pt: 'O que vai viver',
  nl: 'Wat je gaat beleven',
  he: 'מה מחכה לכם',
  cs: 'Co zažijete',
  ro: 'Ce vei trăi',
  tr: 'Neler yaşayacaksınız',
  ja: '体験できること',
  ko: '경험하게 될 것',
};

const navigationLabels = {
  it: ['Immagine precedente', 'Immagine successiva'],
  en: ['Previous image', 'Next image'],
};

function getRelativePosition(index, activeIndex) {
  const directOffset = index - activeIndex;
  const wrappedOffset = directOffset > 0
    ? directOffset - slides.length
    : directOffset + slides.length;

  return Math.abs(directOffset) <= Math.abs(wrappedOffset) ? directOffset : wrappedOffset;
}

export default function WhatYouWillExperience({ lang = 'en' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const labels = navigationLabels[lang] || navigationLabels.en;
  const captions = slideCaptions[lang] || slideCaptions.en;

  const navigate = (direction) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 40) navigate(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <section className="what-you-will-experience" aria-labelledby="experience-preview-title">
      <h2 id="experience-preview-title">{sectionTitles[lang] || sectionTitles.en}</h2>

      <div
        className="experience-preview-stage"
        onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
        onTouchEnd={handleTouchEnd}
      >
        <div className="experience-preview-track">
          {slides.map((slide, index) => {
            const position = getRelativePosition(index, activeIndex);
            const isVisible = Math.abs(position) <= 1;

            return (
              <figure
                key={slide.src}
                className="experience-preview-card"
                data-position={isVisible ? position : 'hidden'}
                aria-hidden={position !== 0}
              >
                <img src={slide.src} alt={position === 0 ? slide.alt : ''} loading="lazy" decoding="async" />
                <figcaption>{captions[slide.caption]}</figcaption>
              </figure>
            );
          })}
        </div>

        <button
          type="button"
          className="experience-preview-arrow experience-preview-arrow--previous"
          onClick={() => navigate(-1)}
          aria-label={labels[0]}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="experience-preview-arrow experience-preview-arrow--next"
          onClick={() => navigate(1)}
          aria-label={labels[1]}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}
