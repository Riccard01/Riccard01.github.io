import React from "react";
import "./Footer.css";
import logo from '../assets/logo.svg';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-bar">
        <div className="footer-logo-container">
          {/* Modificato src per usare il logo importato */}
          <img src={logo} alt="Leggero Tours Logo" className="footer-logo" />
        </div>
        <div className='wrapper-btn'>
          <button className="footer-link footer-booking" onClick={() => { window.location.href = '/book'; }}>
            Check Availability
          </button>
        </div>
      </div>

      <div className="footer-social">
        {/* I tuoi link social andranno qui */}
      </div>

      <hr className="footer-divider" />

      <div className="footer-legal">
        <p className="legal-company">
          <strong>Leggero Tours</strong> by Bottiglieri Riccardo
        </p>
        <p className="legal-info">
          Headquarters: Genoa (GE) — Operating in Genoa and Portofino <br />
          Tax ID: 03030880995 | <a href="mailto:riccardo@leggerotours.com">riccardo@leggerotours.com</a>
        </p>
        <p className="legal-tax-note">
          Service provided under the flat-rate regime under article 1, paragraphs 54 to 89 of Law No. 190/2014 and subsequent amendments, and therefore not subject to VAT.
        </p>
        <p className="legal-copyright">
          © 2026 Leggero Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
}