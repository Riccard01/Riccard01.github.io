import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('page-home');
    return () => { document.body.classList.remove('page-home'); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsPreviewReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current) return;
    const video = videoRef.current;
    const tryPlay = async () => {
      try {
        await video.play();
        setIsVideoPlaying(true);
      } catch {
        // If autoplay policy blocks playback, keep controls visible for manual play.
        setIsVideoPlaying(false);
      }
    };
    tryPlay();
  }, [shouldLoadVideo]);

  const handlePlayVideo = () => {
    setShouldLoadVideo(true);
  };

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

        <div className="video-preview-wrap">
          {!isPreviewReady && (
            <div className="video-preview-placeholder" aria-live="polite">
              Anteprima video disponibile tra pochi secondi...
            </div>
          )}

          {isPreviewReady && (
            <div className="video-frame">
              {!shouldLoadVideo && (
                <button
                  type="button"
                  className="video-preview-button"
                  onClick={handlePlayVideo}
                  aria-label="Riproduci video senza audio"
                >
                  <img
                    src={marian}
                    alt="Anteprima video"
                    className="video-preview-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="video-play-overlay" aria-hidden="true">Play</span>
                </button>
              )}

              {shouldLoadVideo && (
                <video
                  ref={videoRef}
                  src={homepageprova}
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  poster={marian}
                  className="thevideo"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                />
              )}

              {shouldLoadVideo && !isVideoPlaying && (
                <button
                  type="button"
                  className="video-replay-button"
                  onClick={() => videoRef.current && videoRef.current.play()}
                  aria-label="Riprendi riproduzione video"
                >
                  Riproduci
                </button>
              )}
            </div>
          )}
        </div>
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