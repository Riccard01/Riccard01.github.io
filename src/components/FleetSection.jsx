import React from 'react';
import './FleetSection.css';
import leggera from "../assets/leggera.webp";
import { getLocale } from '../utils/locale';

export default function FleetSection({ lang = 'en' }) {
  const dict = getLocale(lang);
  const t = dict.fleetSection;
  const specsText = t.specs || [];

  const boats = [
    {
      id: 1,
      image: leggera,
      specs: [
        { 
          label: specsText[0]?.label || "Length", 
          value: specsText[0]?.value || "6.30 meters",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12H2M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4"/></svg> 
        },
        { 
          label: specsText[1]?.label || "Capacity", 
          value: specsText[1]?.value || "4 + skipper",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
        },
        { 
          label: specsText[2]?.label || "Outboard", 
          value: specsText[2]?.value || "150HP",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> 
        },
        { 
          label: specsText[3]?.label || "Bluetooth", 
          value: specsText[3]?.value || "Music System",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg> 
        },
        { 
          label: specsText[4]?.label || "Included", 
          value: specsText[4]?.value || "Towels",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg> 
        },
        { 
          label: specsText[5]?.label || "Included", 
          value: specsText[5]?.value || "Snacks",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> 
        },
        { 
          label: specsText[6]?.label || "Drinks", 
          value: specsText[6]?.value || "Open Soft Bar",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 22h8"></path><path d="M12 12v10"></path><path d="M19 4L5 4 12 12z"></path></svg> 
        },
        { 
          label: specsText[7]?.label || "Sunshade", 
          value: specsText[7]?.value || "Bimini",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12A9 9 0 0 1 3 12"></path><path d="M12 12v9"></path><path d="M10 21h4"></path></svg> 
        },
        { 
          label: specsText[8]?.label || "Boarding", 
          value: specsText[8]?.value || "Ladder",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="3" x2="6" y2="21"></line><line x1="18" y1="3" x2="18" y2="21"></line><line x1="6" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="6" y1="16" x2="18" y2="16"></line></svg> 
        },
        { 
          label: specsText[9]?.label || "GPS / Depth", 
          value: specsText[9]?.value || "Sonar",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg> 
        },
        { 
          label: specsText[10]?.label || "Allowed", 
          value: specsText[10]?.value || "Pet Friendly",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 11.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM14 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM22 11.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM15 17c0 4.14-3.5 6-6 6s-6-1.86-6-6 2-7.5 6-7.5 6 3.36 6 7.5Z"/></svg> 
        },
        { 
          label: specsText[11]?.label || "Included", 
          value: specsText[11]?.value || "Fuel",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 22h12M4 22V7a3 3 0 0 1 6 0v15M14 22V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v3h2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-5M10 7V2.5A.5.5 0 0 1 10.5 2h3a.5.5 0 0 1 .5.5V7M4 14h6" /></svg> 
        }
      ]
    }
  ];

  return (
    <section className="fleet-section">
      <div className="fleet-header">
        <h2>{t.title}</h2>
        <p className="fleet-subtitle">{t.subtitle}</p>
      </div>

      <div className="fleet-list-container">
        {boats.map((boat) => (
          <div key={boat.id} className="boat-card-wrapper">
            
            <div className="boat-image-container">
              <img src={boat.image} alt={t.imageAlt} className="boat-carousel-img" loading="lazy" decoding="async" />
            </div>

            <div className="boat-specs-container">
              {boat.specs.map((spec, specIdx) => (
                <div key={specIdx} className="spec-item">
                  <div className="spec-icon">{spec.icon}</div>
                  <span className="spec-value">{spec.value}</span>
                  <span className="spec-label">{spec.label}</span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}