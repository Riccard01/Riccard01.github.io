import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import florence from '../assets/florence.webp';
import homepageprova from "../assets/homepageprova.webm";
import aperitivo from '../assets/aperitivo.webp';
import transfer from '../assets/private-transfer.webp';
import './HomePage.css';
import ExperienceCarousel from '../components/ExperienceCarousel';
import Masonry from '../components/Masonry';
// import gourmet from '../assets/gourmet.mp4';
import Faq from '../components/Faq';
import ReviewCarousel from '../components/ReviewCarousel';
import FleetSection from '../components/FleetSection';
import AboutSection from '../components/AboutSection';
import PrivateTransfer from '../components/PrivateTransfer';
import marian from '../assets/marian.jpeg'

function HomePage() {
  const [isVisibleExperiences, setIsVisibleExperiences] = useState(false);
  // New state to handle deferred video loading
  const [videoSrc, setVideoSrc] = useState(null);
  const experiencesRef = useRef(null);

  useEffect(() => {
    // 1. Existing logic for IntersectionObserver
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisibleExperiences(true);
        }
      },
      { threshold: 0.7 }
    );
    if (experiencesRef.current) {
      observer.observe(experiencesRef.current);
    }

    // 2. Logic to load the video ONLY after the site is ready
    const handlePageLoad = () => {
      setTimeout(() => {
        setVideoSrc(gourmet);
      }, 100);
    };

    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    // Cleanup of Observer and Event Listener on unmount
    return () => {
      if (experiencesRef.current) {
        observer.unobserve(experiencesRef.current);
      }
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  // Add page-specific class to body so Home styles are scoped
  useEffect(() => {
    document.body.classList.add('page-home');
    return () => { document.body.classList.remove('page-home'); };
  }, []);

  return (
    <>
      <Navbar />
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
    <span className="early-bird-chip">Early Bird 10% OFF</span>
    <h1 className="main-title">Private Boat tours<br/> of the Two Gulfs</h1>
    
    {/* Sostituisci il <p> precedente con questo blocco */}
    <div className="hero-subtitle">
      <div>Santa Margherita • Portofino • Camogli</div>
      <div>San Fruttuoso • Punta Chiappa • Bogliasco</div>
      <div>Boccadasse</div>
    </div>
  </div>
</section>
      
      <section className="experiences" ref={experiencesRef}>
        <div className="experiences-content">
          <ExperienceCarousel />
        </div>
<video src={homepageprova} autoPlay muted loop playsInline className="thevideo" />
      </section>

      <ReviewCarousel />
      {/* <Masonry /> */}

      <FleetSection />


<PrivateTransfer />

      <section className="Faq-section">
        <Faq />
      {/* <AboutSection /> */}
      </section>
      <Footer />
    </>
  );
}

export default HomePage;