import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import homepageprova from "../assets/homepageprova.webm";
import './HomePage.css';
import ExperienceCarousel from '../components/ExperienceCarousel';
import Faq from '../components/Faq';
import ReviewCarousel from '../components/ReviewCarousel';
import FleetSection from '../components/FleetSection';
import PrivateTransfer from '../components/PrivateTransfer';
import marian from '../assets/marian.jpeg'
import { getLocale } from '../utils/locale';

function HomePage({ lang = 'it', setLang = () => {} }) {
  const dict = getLocale(lang);
  const experiencesRef = useRef(null);

  useEffect(() => {
    const section = experiencesRef.current;
    if (!section) return;
    const observer = new window.IntersectionObserver(() => {}, { threshold: 0.7 });
    observer.observe(section);

    return () => {
      observer.unobserve(section);
    };
  }, []);

  // Add page-specific class to body so Home styles are scoped
  useEffect(() => {
    document.body.classList.add('page-home');
    return () => { document.body.classList.remove('page-home'); };
  }, []);

  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
<section className="hero-section">
<img 
  src={marian} 
  alt="Marian boat" 
  style={{
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: '-1' 
  }}
/>
  <div className="hero-gradient"></div>
  <div className="app-content">
    <span className="early-bird-chip">{dict.homepage.earlyBird}</span>
    <h1 className="main-title">{dict.homepage.title.split('\n')[0]}<br/> {dict.homepage.title.split('\n')[1]}</h1>
    
    {/* Sostituisci il <p> precedente con questo blocco */}
    <div className="hero-subtitle">
      <p>{dict.homepage.subtitle}</p>
    </div>
  </div>
</section>
      
      <section className="experiences" ref={experiencesRef}>
        <div className="experiences-content">
          {/* <h2 className='package-title'>Our Packages</h2>
            <p className='package-desc'>The choice is yours, we've handpicked the best activities ready for you to live!</p> */}

          <ExperienceCarousel lang={lang} />
        </div>
        {/* <img className="meimmagine" src={me}/> */}

      <FleetSection lang={lang} />

<video src={homepageprova} autoPlay muted loop playsInline className="thevideo" />
      </section>

      <ReviewCarousel lang={lang} />

    <PrivateTransfer lang={lang} />

      <section className="Faq-section">
        <Faq lang={lang} />
      </section>
      <Footer lang={lang} />
    </>
  );
}

export default HomePage;