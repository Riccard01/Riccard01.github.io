import React from "react";
import "./Transfer.css";
import DropDown from "./DropDown";
import portIcon from '../assets/port_book.svg';
import portoAnticoImg from '../assets/portoantico.webp';
import reccoImg from '../assets/port-recco.webp';
import portofinoImg from '../assets/portofino_extra_fee.webp';
import camogliImg from '../assets/port-camogli.webp';
import nerviImg from '../assets/nervi.webp';
import santaMargheritaImg from '../assets/santa_margherita_ligure_extra_fee.webp';

function getPortImage(portName) {
  const normalizedName = String(portName || '').toLowerCase();

  if (normalizedName.includes('portofino')) return portofinoImg;
  if (normalizedName.includes('camogli')) return camogliImg;
  if (normalizedName.includes('recco')) return reccoImg;
  if (normalizedName.includes('nervi')) return nerviImg;
  if (normalizedName.includes('santa margherita')) return santaMargheritaImg;
  if (normalizedName.includes('porto antico') || normalizedName.includes('genova') || normalizedName.includes('genoa')) {
    return portoAnticoImg;
  }

  return null;
}

// Props:
// - embarkOptions: array of strings for embark dropdown
// - selectedEmbark: selected value
// - onEmbarkChange: callback function for embark change
// - arrangePickup: boolean for pickup
// - onPickupChange: callback function for pickup change
// - embarkLabel: text for embark label
// - pickupLabel: text for pickup label

const Transfer = ({
  embarkOptions = [],
  selectedEmbark = "",
  onEmbarkChange = () => {},
  arrangePickup = false,
  onPickupChange = () => {},
  embarkLabel = "Embark",
  pickupLabel = "Arrange Pickup?",
  className = ""
}) => {
  return (
    <div className={`transfer-container ${className}`.trim()}>
      <div className="transfer-section">
        <label className="transfer-label">
          <img className="transfer-icon" src={portIcon} alt="" aria-hidden="true" />
          <span>{embarkLabel}</span>
        </label>
        <DropDown
          options={embarkOptions}
          value={selectedEmbark}
          onChange={onEmbarkChange}
          width="100%"
          text={embarkLabel}
          getOptionImage={getPortImage}
          placeholderImage={portIcon}
        />
      </div>
      <div className="transfer-pickup-row">
        <span className="transfer-pickup-label">{pickupLabel}</span>
        <button
          type="button"
          role="switch"
          aria-checked={arrangePickup}
          aria-label={pickupLabel}
          className={`transfer-toggle${arrangePickup ? ' is-on' : ''}`}
          onClick={() => onPickupChange(!arrangePickup)}
        >
          <span className="transfer-toggle-knob" />
        </button>
      </div>
    </div>
  );
};

export default Transfer;
