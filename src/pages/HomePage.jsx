import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HomePage.css';
import ExperienceCarousel from '../components/ExperienceCarousel';
import Faq from '../components/Faq';
import marian from '../assets/marian.webp';
import { getLocale } from '../utils/locale';

function HomePage({ lang = 'it', setLang = () => {} }) {
  const dict = getLocale(lang);
  const titleLines = (dict.homepage.title || '').split('\n');

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
          <h1 className="main-title">
            {titleLines.length > 1
              ? <>{titleLines[0]}<br /> {titleLines[1]}</>
              : (titleLines[0] || '')}
          </h1>
          <div className="hero-subtitle">
            <p>{dict.homepage.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="experiences" id="experiences">
        <div className="experiences-content">
          <ExperienceCarousel lang={lang} />
        </div>
      </section>

      <Faq lang={lang} />

      <Footer lang={lang} />
    </>
  );
}

export default HomePage;