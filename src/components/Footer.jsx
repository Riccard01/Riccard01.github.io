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
          <strong>Leggero Tours</strong> di Bottiglieri Riccardo
        </p>
        <p className="legal-info">
          Sede Legale: Genova (GE) — Operativi a Genova e Portofino <br />
          P.IVA: 03030880995 | <a href="mailto:riccardo@leggerotours.com">riccardo@leggerotours.com</a>
        </p>
        <p className="legal-tax-note">
          Prestazione svolta in regime forfettario ai sensi dell’art. 1, commi da 54 a 89, della legge n. 190/2014 e successive modifiche, e pertanto non soggetta a IVA.
        </p>
        <p className="legal-copyright">
          © 2026 Leggero Tours. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}