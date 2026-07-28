import React from "react";
import "./BookingFooter.css";
import checkIcon from '../assets/people.svg';
import { getLocale } from '../utils/locale';

export default function BookingFooter({
  lang = 'it',
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
  const dict = getLocale(lang);
  const t = dict.bookingFooter;

  let formattedDate = null;
  if (selectedDate) {
    const [year, month, day] = selectedDate.split("-");
    const dateObj = new Date(year, month - 1, day);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    formattedDate = dateObj.toLocaleDateString(dict.localeCode || 'it-IT', options);
  }

  let transferStatus = t.transferNone;
  if (arrangePickup && arrangeDropoff) transferStatus = t.transferRoundTrip;
  else if (arrangePickup) transferStatus = t.transferInbound;
  else if (arrangeDropoff) transferStatus = t.transferOutbound;

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
            {selectedGuests && (
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
              {selectedDate ? (
                <span key={selectedDate} className="anim-fade highlight-data">
                  {formattedDate}
                </span>
              ) : (
                <span className="missing-text">*{t.missingDate}</span>
              )}
            </div>

            {/* ROW 2: Slot (Always visible) */}
            <div className="summary-card-row-two">
              <span key={selectedSlot} className="anim-fade highlight-data slot-highlight">
                {selectedBoatName ? selectedSlot : t.selectingExperience}
              </span>
            </div>

            {/* ROWS 3 AND 4 ONLY APPEAR IN TRANSFER SCREEN */}
            {showTransferButton && (
              <>
                {/* ROW 3: Embark and Disembark Ports */}
                <div className="summary-card-row-three anim-fade">
                  <span className="connector-text">{t.port} </span>
                  <span key={whereText} className="highlight-data truncate-text">
                    {whereText ? whereText : t.selectingPorts}
                  </span>
                </div>

                {/* ROW 4: Private Transfer with gray indicator on the left */}
                <div className="summary-card-row-four anim-fade">
                  <span className="connector-text" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                    {t.privateTransfer} 
                  </span>
                  <span key={transferStatus} className="transfer-status-tag">
                    {transferStatus ? transferStatus : t.pending}
                  </span>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      <div className="booking-footer-action-row">
        <div className="booking-footer-price-block">
          <span className="booking-footer-total-label">{t.total}</span>
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
              {buttonLabel || t.continue}
            </button>
          )}

          {/* TRANSFER SCREEN: Checkout Button (White) */}
          {showTransferButton && (
            <button 
              className="booking-footer-btn checkout-btn" 
              onClick={onTransferClick}
            >
              {t.proceedToCheckout}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}