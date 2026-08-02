import React from "react";
import { Link } from 'react-router-dom';
import "./Footer.css";
import logo from '../assets/logo.svg';
import { getLocale } from '../utils/locale';
import { FOOTER_AREAS, getFooterUi } from '../locales/footerUi';
import { getExperienceSlugById } from '../utils/experienceRoutes';
import { trackWhatsAppClick } from '../utils/googleAdsConversions';

export default function Footer({ lang = 'en' }) {
  const dict = getLocale(lang);
  const ui = getFooterUi(lang);
  const homePath = `/${lang}`;
  const experiencePathPrefix = lang === 'it' ? 'esperienze' : 'experiences';
  const experienceOrder = ['1', '4', '0', '3'];
  const experiences = experienceOrder
    .map((id) => dict.experienceCarousel?.experiences?.find((experience) => experience.id === id))
    .filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section className="footer-brand" aria-label="Leggero Tours">
          <Link className="footer-logo-link" to={homePath} aria-label={`${ui.home} - Leggero Tours`}>
            <img className="footer-logo" src={logo} alt="" />
            <span className="footer-brand-name">Leggero Tours</span>
          </Link>
          <p className="footer-tagline">{ui.tagline}</p>
          <Link className="footer-booking-link" to={`/${lang}/book`}>
            {ui.book}
          </Link>
        </section>

        <nav className="footer-section" aria-label={ui.explore}>
          <h2>{ui.explore}</h2>
          <ul className="footer-link-list">
            <li><Link to={homePath}>{ui.home}</Link></li>
            <li><Link to={`${homePath}#experiences`}>{ui.experiences}</Link></li>
            <li><Link to={`${homePath}#faq`}>{ui.faq}</Link></li>
          </ul>
        </nav>

        <nav className="footer-section footer-experiences" aria-label={ui.experiences}>
          <h2>{ui.experiences}</h2>
          <ul className="footer-link-list">
            {experiences.map((experience) => (
              <li key={experience.id}>
                <Link to={`/${lang}/${experiencePathPrefix}/${getExperienceSlugById(experience.id)}`}>
                  {experience.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-section footer-areas">
          <h2>{ui.areas}</h2>
          <ul>
            {FOOTER_AREAS.map((area) => <li key={area}>{area}</li>)}
          </ul>
        </section>

        <address className="footer-section footer-contact">
          <h2>{ui.contact}</h2>
          <ul className="footer-link-list">
            <li><a href="tel:+393463365699">{ui.call}<span>+39 346 336 5699</span></a></li>
            <li><a href="https://wa.me/393463365699" target="_blank" rel="noreferrer" onClick={trackWhatsAppClick}>{ui.whatsapp}</a></li>
            <li><a href="mailto:riccardo@leggerotours.com">{ui.email}<span>riccardo@leggerotours.com</span></a></li>
          </ul>
        </address>
      </div>

      <div className="footer-legal">
        <div className="footer-legal-heading">
          <span>{ui.legalInfo}</span>
          <span>{ui.taxId}</span>
        </div>
        <p>{ui.taxNote}</p>
        <small>{ui.copyright}</small>
      </div>
    </footer>
  );
}