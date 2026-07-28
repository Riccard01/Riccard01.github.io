import React from "react";
import "./Footer.css";
import logo from '../assets/logo.svg';
import phoneIcon from '../assets/phone.svg';
import meAvatar from '../assets/me.webp';
import { getLocale } from '../utils/locale';

export default function Footer({ lang = 'it' }) {
  const dict = getLocale(lang);
  const t = dict.footer;
  const navT = dict.navbar;

  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  return (
    <footer className="footer">
      <div className="footer-top-bar">
        <div className="footer-logo-container">
          {/* Modificato src per usare il logo importato */}
          <img src={logo} alt="Leggero Tours Logo" className="footer-logo" />
        </div>
        <div className='footer-btn-wrap'>
          <button className="footer-whatsapp" onClick={openWhatsApp}>
            <img src={meAvatar} alt="Riccardo" className="whatsapp-avatar" />
            {navT.whatsappUs}
            <img src={phoneIcon} alt="WhatsApp" className="whatsapp-icon" />
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
          {t.legalInfo} <br />
          {t.legalTaxId} | <a href="mailto:riccardo@leggerotours.com">riccardo@leggerotours.com</a>
        </p>
        <p className="legal-tax-note">
          {t.legalTaxNote}
        </p>
        <p className="legal-copyright">
          {t.copyright}
        </p>
      </div>
    </footer>
  );
}