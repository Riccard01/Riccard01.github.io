// NOTE: keep in sync with src/utils/priceCalculator.js (ES module version).
// The logic in both files must remain identical; only the export syntax differs.

/**
 * Return the transfer price (euros) for a given place and passenger count.
 * @param {Object|null} placeObj - { prices: number[], multiplier: number }
 * @param {number} numPax
 * @returns {number}
 */
function getTransferPriceForPlace(placeObj, numPax) {
  if (!placeObj) return 0;
  const prices = Array.isArray(placeObj.prices) ? placeObj.prices : [];
  let idx;
  if (numPax <= 2) idx = 1;
  else if (numPax >= 3 && numPax <= 8) idx = 2;
  else idx = 8;
  let val = prices[idx];
  if (typeof val === 'undefined') val = prices[0];
  const num = Number(val || 0);
  const mult = Number(placeObj.multiplier || 1);
  return num * (isNaN(mult) ? 1 : mult);
}

/**
 * Find a place object by its display name inside a places map.
 * @param {Object} placesMap - { [placeId]: { name, prices, multiplier } }
 * @param {string|null} name
 * @returns {Object|null}
 */
function getPlaceByName(placesMap, name) {
  if (!name || !placesMap) return null;
  return Object.values(placesMap).find(p => p && p.name === name) || null;
}

/**
 * Compute the total booking price in euros.
 *
 * @param {Object} params
 * @param {Object} params.boatDoc      - Boat document { base_price?, price? }
 * @param {Object} params.placesMap    - Full variables/places Firestore document data
 * @param {Object|null} params.slotObj - Slot document { multiplier?, ... } from variables/boat_slots
 * @param {string|null} params.embark  - Embark place display name
 * @param {string|null} params.disembark - Disembark place display name
 * @param {boolean} params.arrangePickup  - User requested pickup transfer
 * @param {boolean} params.arrangeDropoff - User requested dropoff transfer
 * @param {number} params.numPax       - Number of passengers
 * @returns {number} Total price in euros (float)
 */
function computeTotalPrice({ boatDoc, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax }) {
  const basePrice = Number((boatDoc && (boatDoc.base_price || boatDoc.price)) || 0);

  const embarkPlace = getPlaceByName(placesMap, embark);
  const disembarkPlace = getPlaceByName(placesMap, disembark);

  const rawEmbMult = Number((embarkPlace && embarkPlace.multiplier) || 1);
  const rawDisembMult = Number((disembarkPlace && disembarkPlace.multiplier) || 1);
  const embMult = isNaN(rawEmbMult) ? 1 : rawEmbMult;
  const disembMult = isNaN(rawDisembMult) ? 1 : rawDisembMult;

  const rawSlotMult = Number((slotObj && slotObj.multiplier) || 1);
  const slotMult = isNaN(rawSlotMult) ? 1 : rawSlotMult;

  const boatPart = basePrice * embMult * disembMult * slotMult;

  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(embarkPlace, pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(disembarkPlace, pax);

  return boatPart + transferPart;
}

function findApplicableEarlyDiscount(discountsDoc, bookingDate) {
  if (!discountsDoc) return null;
  const arr = discountsDoc.early_discounts || discountsDoc.early_discount || [];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  let bkDate = null;
  if (!bookingDate) return null;
  if (typeof bookingDate === 'string') {
    const [y,m,d] = bookingDate.split('-').map(Number);
    if (!y || !m || !d) return null;
    bkDate = new Date(y, m - 1, d);
  } else if (bookingDate instanceof Date) {
    bkDate = bookingDate;
  } else return null;

  const today = new Date();
  today.setHours(0,0,0,0);
  bkDate.setHours(0,0,0,0);
  const diffMs = bkDate.getTime() - today.getTime();
  const daysDiff = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (daysDiff <= 0) return null;

  const candidates = arr.map(d => ({ name: d && d.name, days_before: Number(d && d.days_before || 0), discount_price: Number(d && d.discount_price || 0) })).filter(d => !isNaN(d.days_before) && d.days_before <= daysDiff);
  if (candidates.length === 0) return null;
  candidates.sort((a,b) => a.days_before - b.days_before || b.discount_price - a.discount_price);
  return candidates[0] || null;
}

function computeTotalPriceWithDiscount({ boatDoc, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax, bookingDate, discounts }) {
  const baseTotal = computeTotalPrice({ boatDoc, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax });
  const disc = findApplicableEarlyDiscount(discounts, bookingDate);
  if (!disc) return baseTotal;
  const boatPart = Number((boatDoc && (boatDoc.base_price || boatDoc.price)) || 0) * Number((slotObj && slotObj.multiplier) || 1) * Number(((getPlaceByName(placesMap, embark) && getPlaceByName(placesMap, embark).multiplier) || 1)) * Number(((getPlaceByName(placesMap, disembark) && getPlaceByName(placesMap, disembark).multiplier) || 1));
  const discountedBoat = Math.max(0, boatPart - Number(disc.discount_price || 0));
  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, embark), pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, disembark), pax);
  return discountedBoat + transferPart;
}

/**
 * Convert euros to integer cents (for Stripe).
 * @param {number} euros
 * @returns {number}
 */
function eurosToCents(euros) {
  return Math.round(Number(euros || 0) * 100);
}

module.exports = { getTransferPriceForPlace, getPlaceByName, computeTotalPrice, eurosToCents, findApplicableEarlyDiscount, computeTotalPriceWithDiscount };
