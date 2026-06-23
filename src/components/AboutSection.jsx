
import React from 'react';
import './AboutSection.css';
import Me from "../assets/me.jpg"; // La tua foto

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        
        {/* Blocco Testo / Filosofia */}
        <div className="about-content">
          <span className="about-subtitle">The Philosophy</span>
          <h2>Leggero</h2>
          <div className="about-line"></div>
          
          <p className="about-lead">
            To most, "Leggero" means light. To us, it is a philosophy.
          </p>
          
          <p className="about-text">
            It is the thrill of existence and the realization that letting go is simpler than we think. 
            We embrace life’s unfairness not as a burden, but as a catalyst for growth and peace. 
            By releasing the grip on ourselves, we allow the world to breathe, turning small moments 
            into grand experiences driven by purpose rather than pride.
          </p>
          
          <blockquote className="about-quote">
            "The storm will pass, but we don’t wait for the sun to start living."
          </blockquote>
          
          <p className="about-text">
            Life has no rules and no inherent purpose — you define it. You can carry the weight, 
            or you can choose to be Leggero. Freedom isn't a destination; it is the path you choose 
            to walk every single day.
          </p>
        </div>

        {/* Blocco Immagine Personale */}
        <div className="about-image-wrapper">
          <div className="about-image-frame">
            <img src={Me} alt="Riccardo - Leggero Tours" className="about-img" />
          </div>
        </div>

      </div>
    </section>
  );
}