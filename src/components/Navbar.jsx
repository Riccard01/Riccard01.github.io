import React from 'react';
import './Navbar.css';
import meAvatar from '../assets/me.webp';
import logo from '../assets/logo.svg';
import { getLocale, LANGUAGE_OPTIONS } from '../utils/locale';
import { trackWhatsAppClick } from '../utils/googleAdsConversions';
import { getWhatsAppUrl } from '../utils/whatsapp';

function Navbar({ lang = 'en', setLang = () => {} }) {
  const dict = getLocale(lang);
  const t = dict.navbar;

  const openWhatsApp = () => {
    trackWhatsAppClick();
    window.location.href = getWhatsAppUrl(lang);
  };

  return (
    <>
      <div className="hero-gradient-top" aria-hidden="true" />
      <nav className="navbar">
        <div className="navbar-container">
          <a className="navbar-brand" href={`/${lang}`} aria-label="Leggero Tours">
            <img src={logo} alt="Leggero Tours" className="navbar-logo" />
          </a>

          <div className="wrapper-btn">
            <select
              className="lang-switcher"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label={t.switchLabel}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>

            <button className="nav-whatsapp" onClick={openWhatsApp}>
              <span dir="auto">{t.whatsappUs}</span>
              <img src={meAvatar} alt="Riccardo" className="whatsapp-avatar" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;