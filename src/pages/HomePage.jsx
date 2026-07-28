import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import homepageprova from "../assets/homepageprova.webm";
import './HomePage.css';
import ExperienceCarousel from '../components/ExperienceCarousel';
import marian from '../assets/marian.webp';
import { getLocale } from '../utils/locale';

const ReviewCarousel = lazy(() => import('../components/ReviewCarousel'));
const PrivateTransfer = lazy(() => import('../components/PrivateTransfer'));
const Faq = lazy(() => import('../components/Faq'));

function HomePage({ lang = 'it', setLang = () => {} }) {
  const dict = getLocale(lang);
  const [showExperienceVideo, setShowExperienceVideo] = useState(false);

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
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
          <h1 className="main-title">
            {dict.homepage.title.split('\n')[0]}<br /> {dict.homepage.title.split('\n')[1]}
          </h1>
          <div className="hero-subtitle">
            <p>{dict.homepage.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="experiences">
        <div className="experiences-content">
          <ExperienceCarousel lang={lang} />
        </div>

        <button
          type="button"
          className="video-load-button"
          onClick={() => setShowExperienceVideo(true)}
        >
          Carica il video
        </button>

        {showExperienceVideo && (
          <video
            src={homepageprova}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="thevideo"
          />
        )}
      </section>

      <Suspense fallback={null}>
        <ReviewCarousel lang={lang} />
      </Suspense>

      <Suspense fallback={null}>
        <PrivateTransfer lang={lang} />
      </Suspense>

      <section className="Faq-section">
        <Suspense fallback={null}>
          <Faq lang={lang} />
        </Suspense>
      </section>
      <Footer lang={lang} />
    </>
  );
}

export default HomePage;