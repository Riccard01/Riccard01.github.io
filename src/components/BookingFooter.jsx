import React from "react";
import "./BookingFooter.css";
import checkIcon from '../assets/people.svg';

export default function BookingFooter({
  total = "€0.00",
  originalTotal = null,
  discountedTotal = null,
  buttonLabel = "Proceed to Checkout",
  buttonDisabled = false,
  onButtonClick = () => {},
  showButton = true,
  onTransferClick = () => {},
  showTransferButton = false,
  selectedBoatName,
  selectedSlot,
  selectedDate,
  selectedGuests,
  boatImage,
  arrangePickup = false,
  arrangeDropoff = false,
  selectedEmbark = "Porto Antico",
  selectedDisembark = "Porto Antico"
}) {
  const isMissing = (val) => !val || val === "Select date on calendar" || val === "Select guests" || val === "";

  let serviceName = "Standard Charter";
  if (selectedSlot) {
    serviceName = selectedSlot.split(" (")[0]; 
  }

  const cleanTime = selectedSlot ? selectedSlot.split(" (")[0] : "";

  let formattedDate = null;
  if (selectedDate && selectedDate !== "Select date on calendar") {
    const [year, month, day] = selectedDate.split("-");
    const dateObj = new Date(year, month - 1, day);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    
    let englishDate = dateObj.toLocaleDateString('en-US', options);
    const dayNum = parseInt(day, 10);
    let suffix = "th";
    if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = "st";
    else if (dayNum === 2 || dayNum === 22) suffix = "nd";
    else if (dayNum === 3 || dayNum === 23) suffix = "rd";
    
    formattedDate = englishDate.replace(`, ${year}`, `${suffix} ${year}`);
  }

  // Logica ripristinata per il trasferimento
  let transferStatus = "None";
  if (arrangePickup && arrangeDropoff) transferStatus = "Round-Trip Ticket";
  else if (arrangePickup) transferStatus = "One-Way (Inbound)";
  else if (arrangeDropoff) transferStatus = "One-Way (Outbound)";

  const cleanPortName = (name) => {
    if (!name) return "";
    return name.replace(/Extra Fee/gi, "").replace(/\s*\([^)]*\)/g, "").trim();
  };

  let embark = cleanPortName(selectedEmbark);
  let disembark = cleanPortName(selectedDisembark);
  let whereText = embark;
  if (embark && disembark && embark !== disembark) {
    whereText = `${embark} - ${disembark}`;
  } else if (!embark && disembark) {
    whereText = disembark;
  }
  
  return (
    <div className="booking-footer-fixed">
      <div className="booking-summary-list">
        <div className="summary-card-horizontal">
          
          {/* IMAGE WITH CHIP ABSOLUTE AT BOTTOM */}
          <div key={boatImage || "placeholder"} className="anim-scale summary-image-container">
            <div className="summary-boat-image-wrapper">
              {boatImage ? (
                <img src={boatImage} alt="Boat" className="summary-boat-large-img" />
              ) : (
                <div className="summary-boat-large-placeholder" />
              )}
            </div>

            {/* Guests chip with check icon and number only */}
            {selectedGuests && selectedGuests !== "Select guests" && (
              <div className="guests-badge-chip">
                <img src={checkIcon} alt="Check" className="chip-check-icon" />
                <span>{selectedGuests.match(/\d+/)?.[0] || selectedGuests}</span>
              </div>
            )}
          </div>

          {/* WRAPPER WITH ROWS DIVIDED BY SCREEN */}
          <div className="summary-card-info-wrapper">
            
            {/* ROW 1: Date (Always visible) */}
            <div className="summary-card-row-one">
              {selectedDate && selectedDate !== "Select date on calendar" ? (
                <span key={selectedDate} className="anim-fade highlight-data">
                  {formattedDate}
                </span>
              ) : (
                <span className="missing-text">*Select date on calendar</span>
              )}
            </div>

            {/* ROW 2: Slot (Always visible) */}
            <div className="summary-card-row-two">
              <span key={selectedSlot} className="anim-fade highlight-data slot-highlight">
                {selectedBoatName ? selectedSlot : "Selecting experience..."}
              </span>
            </div>

            {/* ROWS 3 AND 4 ONLY APPEAR IN TRANSFER SCREEN */}
            {showTransferButton && (
              <>
                {/* ROW 3: Embark and Disembark Ports */}
                <div className="summary-card-row-three anim-fade">
                  <span className="connector-text">Port: </span>
                  <span key={whereText} className="highlight-data truncate-text">
                    {whereText ? whereText : "Selecting ports..."}
                  </span>
                </div>

                {/* ROW 4: Private Transfer with gray indicator on the left */}
                <div className="summary-card-row-four anim-fade">
                  <span className="connector-text" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                    Private Transfer: 
                  </span>
                  <span key={transferStatus} className="transfer-status-tag">
                    {transferStatus ? transferStatus : "Pending"}
                  </span>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      <div className="booking-footer-action-row">
        <div className="booking-footer-price-block">
          <span className="booking-footer-total-label">Total</span>
          <div className="booking-footer-price-column">
            {discountedTotal && originalTotal && discountedTotal !== originalTotal ? (
              <>
                <span className="booking-footer-original-price">{originalTotal}</span>
                <span className="booking-footer-total-price">{discountedTotal}</span>
              </>
            ) : (
              <span className="booking-footer-total-price">{total}</span>
            )}
          </div>
        </div>

        {/* BUTTON LOGIC INVERTED AND MODIFIED HERE */}
        <div className="booking-footer-buttons-block">
          {/* FIRST SCREEN: Continue Button (Yellow/Gold) */}
          {!showTransferButton && showButton && (
            <button 
              className="booking-footer-btn standard-btn" 
              disabled={buttonDisabled} 
              onClick={onButtonClick}
            >
              Continue
            </button>
          )}

          {/* TRANSFER SCREEN: Checkout Button (White) */}
          {showTransferButton && (
            <button 
              className="booking-footer-btn checkout-btn" 
              onClick={onTransferClick}
            >
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}