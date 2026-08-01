// NOTE: keep in sync with functions/utils/priceCalculator.js (CommonJS version).
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

  // No discounts applied here; use findApplicableEarlyDiscount to compute discount externally if needed

  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(embarkPlace, pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(disembarkPlace, pax);

  return boatPart + transferPart;
}

/**
 * Given a discounts document (variables/discounts) and a booking date (Date or YYYY-MM-DD string),
 * return the applicable early discount object or null.
 * Policy: choose the discount with the smallest `days_before` that is <= daysDiff (i.e. more specific wins).
 */
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

  // filter discounts that apply (days_before <= daysDiff)
  const candidates = arr.map(d => ({ name: d && d.name, days_before: Number(d && d.days_before || 0), discount_price: Number(d && d.discount_price || 0) })).filter(d => !isNaN(d.days_before) && d.days_before <= daysDiff);
  if (candidates.length === 0) return null;
  // pick smallest days_before (more specific). If tie, pick one with greater discount_price
  candidates.sort((a,b) => a.days_before - b.days_before || b.discount_price - a.discount_price);
  return candidates[0] || null;
}

/**
 * Compute total price with optional early-discount applied (discount_price subtracted from boat part).
 */
function computeTotalPriceWithDiscount({ boatDoc, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax, bookingDate, discounts }) {
  const baseTotal = computeTotalPrice({ boatDoc, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax });
  // Determine early discount applicable to bookingDate
  const disc = findApplicableEarlyDiscount(discounts, bookingDate);
  if (!disc) return baseTotal;
  const boatPart = Number((boatDoc && (boatDoc.base_price || boatDoc.price)) || 0) * Number((slotObj && slotObj.multiplier) || 1) * Number(((getPlaceByName(placesMap, embark) && getPlaceByName(placesMap, embark).multiplier) || 1)) * Number(((getPlaceByName(placesMap, disembark) && getPlaceByName(placesMap, disembark).multiplier) || 1));
  const discountedBoat = Math.max(0, boatPart - Number(disc.discount_price || 0));
  // compute transfer part
  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, embark), pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, disembark), pax);
  return discountedBoat + transferPart;
}

/**
 * Sum of a single boat's price contribution (base price * multipliers), no transfer.
 */
function computeBoatPricePart(boatDoc, placesMap, slotObj, embark, disembark) {
  const basePrice = Number((boatDoc && (boatDoc.base_price || boatDoc.price)) || 0);
  const embarkPlace = getPlaceByName(placesMap, embark);
  const disembarkPlace = getPlaceByName(placesMap, disembark);
  const embMult = Number((embarkPlace && embarkPlace.multiplier) || 1) || 1;
  const disembMult = Number((disembarkPlace && disembarkPlace.multiplier) || 1) || 1;
  const slotMult = Number((slotObj && slotObj.multiplier) || 1) || 1;
  return basePrice * embMult * disembMult * slotMult;
}

/**
 * Same as computeTotalPrice but for a combined excursion using multiple boats
 * (e.g. Gourmet Sunset Cruise combined outing). Each boat's price part is summed;
 * the transfer part (which depends on total passenger count, not per boat) is added once.
 * @param {Object} params
 * @param {Object[]} params.boatDocs - Array of boat documents to combine
 */
function computeComboTotalPrice({ boatDocs, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax }) {
  const boats = Array.isArray(boatDocs) ? boatDocs : [boatDocs];
  const boatsPart = boats.reduce((sum, b) => sum + computeBoatPricePart(b, placesMap, slotObj, embark, disembark), 0);

  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, embark), pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, disembark), pax);

  return boatsPart + transferPart;
}

/**
 * Combo version of computeTotalPriceWithDiscount: the early discount is applied once
 * to the sum of all boats' price parts.
 */
function computeComboTotalPriceWithDiscount({ boatDocs, placesMap, slotObj, embark, disembark, arrangePickup, arrangeDropoff, numPax, bookingDate, discounts }) {
  const boats = Array.isArray(boatDocs) ? boatDocs : [boatDocs];
  const boatsPart = boats.reduce((sum, b) => sum + computeBoatPricePart(b, placesMap, slotObj, embark, disembark), 0);
  const disc = findApplicableEarlyDiscount(discounts, bookingDate);
  const discountedBoatsPart = disc ? Math.max(0, boatsPart - Number(disc.discount_price || 0)) : boatsPart;

  const pax = Number(numPax) || 1;
  let transferPart = 0;
  if (arrangePickup) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, embark), pax);
  if (arrangeDropoff) transferPart += getTransferPriceForPlace(getPlaceByName(placesMap, disembark), pax);

  return discountedBoatsPart + transferPart;
}

/**
 * Convert euros to integer cents (for Stripe).
 * @param {number} euros
 * @returns {number}
 */
function eurosToCents(euros) {
  return Math.round(Number(euros || 0) * 100);
}

export { getTransferPriceForPlace, getPlaceByName, computeTotalPrice, eurosToCents, findApplicableEarlyDiscount, computeTotalPriceWithDiscount, computeComboTotalPrice, computeComboTotalPriceWithDiscount };
