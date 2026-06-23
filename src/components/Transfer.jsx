import React from "react";
import "./Transfer.css";
import DropDown from "./DropDown";

// Props:
// - embarkOptions: array di stringhe per il dropdown imbarco
// - selectedEmbark: valore selezionato
// - onEmbarkChange: funzione di callback per cambio imbarco
// - arrangePickup: booleano per pickup
// - onPickupChange: funzione di callback per cambio pickup
// - embarkLabel: testo per label imbarco
// - pickupLabel: testo per label pickup
//
// Icone: usa emoji come placeholder, sostituibili con svg

const Transfer = ({
  embarkOptions = [],
  selectedEmbark = "",
  onEmbarkChange = () => {},
  arrangePickup = false,
  onPickupChange = () => {},
  embarkLabel = "Imbarco",
  pickupLabel = "Arrange Pickup?",
  className = ""
}) => {
  return (
    <div className={`transfer-container ${className}`.trim()}>
      <div className="transfer-section">
        <label className="transfer-label">
          <span>{embarkLabel}</span>
          <span className="transfer-icon" role="img" aria-label="boat">⛵</span>
        </label>
        <DropDown
          options={embarkOptions}
          value={selectedEmbark}
          onChange={onEmbarkChange}
          width="100%"
          text={embarkLabel}
        />
      </div>
      <div className="transfer-section transfer-section-pickup">
        <label className="transfer-label">
          <span>{pickupLabel}</span>
          <span className="transfer-icon" role="img" aria-label="car">🚗</span>
        </label>
        <div className="transfer-pickup-buttons">
          <button
            className={arrangePickup ? "active" : ""}
            onClick={() => onPickupChange(true)}
            type="button"
          >
            Yes
          </button>
          <button
            className={!arrangePickup ? "active" : ""}
            onClick={() => onPickupChange(false)}
            type="button"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
