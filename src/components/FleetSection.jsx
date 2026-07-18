import React from 'react';
import './FleetSection.css';
import leggera from "../assets/leggera.webp";
import francy from "../assets/francy.webp";

export default function FleetSection() {
  const boats = [
    {
      id: 1,
      name: "Leggera",
      type: "Sporty Dinghy for small groups",
      description: "A fast, responsive, and sporty inflatable boat, ideal for small groups who want to explore the coast dynamically. Designed to maximize outdoor spaces, it offers a spacious and comfortable sunbathing area at the bow to relax in the sun and a comfortable seating area at the stern to enjoy navigation to the rhythm of music.",
      image: leggera,
      specs: [
        { label: "Length", value: "6.30 meters" },
        { label: "Maximum Capacity", value: "4 guests + skipper" },
        { label: "Engine", value: "Mercury Verado 150HP" },
        { label: "Comfort", value: "Bow sunbed, stern seating, sound system, GPS, canopy, shower" }
      ]
    },
    {
      id: 2,
      name: "Francy",
      type: "Premium Open Hull / Cabin Cruiser",
      description: "An elegant and versatile cabin cruiser that combines the exclusivity of spacious outdoor areas with the practicality of indoor spaces. It features large sunbathing areas both at the bow and stern, ideal for enjoying an aperitivo in complete comfort at sunset. Below deck offers a cabin with a double bed and complete bathroom facilities.",
      image: francy,
      specs: [
        { label: "Length", value: "7.30 meters" },
        { label: "Maximum Capacity", value: "6 guests + skipper" },
        { label: "Engine", value: "Evinrude 200 HP Outboard" },
        { label: "Comfort", value: "Double sunbed (bow/stern), double cabin, toilet and indoor shower, stereo, GPS" }
      ]
    }
  ];

  return (
    <section className="fleet-section">
      <div className="fleet-header">
        <h2>Our Fleet</h2>
        <div className="fleet-line"></div>
        <p className="fleet-subtitle">Discover our exclusive vessels, designed to give you an unforgettable experience in the Ligurian Sea.</p>
      </div>

      <div className="fleet-list-container">
        {boats.map((boat) => (
          <div key={boat.id} className="boat-card-wrapper">
            <div className="boat-image-container">
              <img src={boat.image} alt={boat.name} className="boat-carousel-img" />
              <span className="boat-badge-type">{boat.type}</span>
            </div>
            <div className="boat-content-container">
              <h3>{boat.name}</h3>
              <p className="boat-carousel-description">{boat.description}</p>
              <div className="boat-specs-mini">
                {boat.specs.map((spec, specIdx) => (
                  <div key={specIdx} className="spec-mini-row">
                    <span className="spec-mini-label">{spec.label}</span>
                    <span className="spec-mini-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}