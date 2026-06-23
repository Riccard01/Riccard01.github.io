import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Normalize a captain availability cell to boolean.
 * Accepts either a string ("available"), a nested object { availability: 'available' },
 * or a boolean. Anything that equals 'available' (case-sensitive) becomes true.
 */
function _isAvailableCell(val) {
  if (val === true) return true;
  if (typeof val === 'string') return val === 'available';
  if (val && typeof val === 'object') {
    if (typeof val.availability === 'string') return val.availability === 'available';
    if (typeof val.available === 'boolean') return !!val.available;
  }
  return false;
}

/**
 * Fetch all boats from `boats` collection.
 * Each boat doc is expected to contain at least `captains` (array of ids), `name`, `guests`.
 */
export async function fetchAllBoats() {
  const col = collection(db, 'boats');
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
}

/**
 * For an array of captain ids, fetch the month document for each captain
 * located at `captains/{capId}/months/{monthKey}` and return a map:
 * { [capId]: { [day]: { [timeKey]: boolean } } }
 */
export async function fetchCaptainsMonthAvailability(captainIds = [], monthKey) {
  const result = {};
  if (!Array.isArray(captainIds) || captainIds.length === 0) return result;

  const promises = captainIds.map(async (capId) => {
    try {
      const ref = doc(db, 'captains', String(capId), 'months', monthKey);
      const snap = await getDoc(ref);
      if (!snap.exists()) return { id: capId, availability: {} };
      const data = snap.data() || {};
      // Data expected shape: { availability: { '2026-04-22': { '9': 'available', '14': 'unavailable' }, ... } }
      const raw = data.availability || {};
      const normalized = {};
      for (const [day, timesMap] of Object.entries(raw)) {
        if (!timesMap || typeof timesMap !== 'object') continue;
        normalized[day] = {};
        for (const [timeKey, cell] of Object.entries(timesMap)) {
          normalized[day][timeKey] = _isAvailableCell(cell);
        }
      }
      return { id: capId, availability: normalized };
    } catch (e) {
      return { id: capId, availability: {} };
    }
  });

  const items = await Promise.all(promises);
  items.forEach(it => { result[it.id] = it.availability || {}; });
  return result;
}

/**
 * Fetch a boat's month document and return the merged `unavailable`/`unusable`
 * map as { [day]: { [timeKey]: boolean } } where `true` means unavailable.
 * If either map marks a cell as true, the cell is considered unavailable.
 */
export async function fetchBoatMonthUnavailable(boatId, monthKey) {
  try {
    const ref = doc(db, 'boats', String(boatId), 'months', monthKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return {};
    const data = snap.data() || {};
    const rawA = data.unavailable || {};
    const rawB = data.unusable || {};
    const normalized = {};

    const days = new Set([...Object.keys(rawA || {}), ...Object.keys(rawB || {})]);
    for (const day of days) {
      const timesA = rawA && rawA[day] && typeof rawA[day] === 'object' ? rawA[day] : {};
      const timesB = rawB && rawB[day] && typeof rawB[day] === 'object' ? rawB[day] : {};
      const timeKeys = new Set([...Object.keys(timesA), ...Object.keys(timesB)]);
      if (timeKeys.size === 0) continue;
      normalized[day] = {};
      for (const timeKey of timeKeys) {
        const aVal = timesA.hasOwnProperty(timeKey) ? timesA[timeKey] : null;
        const bVal = timesB.hasOwnProperty(timeKey) ? timesB[timeKey] : null;
        normalized[day][timeKey] = !!aVal || !!bVal;
      }
    }

    // Expand adjacent hours so calendar blocks adjacent slot boundaries too
    return expandBoatUnavailableMap(normalized);
  } catch (e) {
    return {};
  }
}

// Expand boat unavailable map to include adjacent hours (previous and next)
// This mirrors server-side adjacency logic so calendar slot checks match backend.
function expandBoatUnavailableMap(unavailableMap = {}) {
  const out = {};
  for (const [day, times] of Object.entries(unavailableMap)) {
    out[day] = out[day] || {};
    const numericSet = new Set();
    for (const [tk, val] of Object.entries(times)) {
      if (val === true) {
        const n = parseInt(tk, 10);
        if (!Number.isNaN(n) && Number.isFinite(n)) {
          numericSet.add(n);
          if (n - 1 >= 0) numericSet.add(n - 1);
          if (n + 1 <= 23) numericSet.add(n + 1);
        }
      }
    }
    for (const n of numericSet) {
      const k1 = String(n);
      const k2 = String(n).padStart(2, '0');
      out[day][k1] = true;
      out[day][k2] = true;
    }
  }
  return out;
}

/**
 * Overlay boat-level `unavailable` map onto an availability map produced
 * from captains by forcing cells to `false` where the boat marks them
 * unavailable. If the boat unavailable map contains a day/time not present
 * in `availabilityMap`, that cell is added as `false` (unavailable).
 */
export function applyBoatUnavailableMap(availabilityMap = {}, boatUnavailable = {}) {
  // Shallow copy structure
  const out = {};
  // Start from existing availability cells
  for (const [day, times] of Object.entries(availabilityMap)) {
    out[day] = {};
    for (const [timeKey, isAvail] of Object.entries(times)) {
      const boatUnavail = boatUnavailable[day] && boatUnavailable[day][timeKey] === true;
      out[day][timeKey] = !!isAvail && !boatUnavail;
    }
  }
  // Also ensure any boat-unavailable cells that weren't present are reflected as false
  for (const [day, times] of Object.entries(boatUnavailable)) {
    if (!out[day]) out[day] = {};
    for (const [timeKey, isUnavail] of Object.entries(times)) {
      if (isUnavail === true) {
        out[day][timeKey] = false;
      } else {
        // if boat explicitly marks this time as available (false/null) and
        // there was no captain availability, do not set to true here — keep
        // existing value or leave undefined. We only enforce unavailability.
        if (out[day][timeKey] === undefined) {
          // keep as-is (undefined) — callers expect availability map to
          // include only explicit availability in many cases
        }
      }
    }
  }
  return out;
}

/**
 * Merge captains availability into a boat availability map by OR-ing.
 * Returns { [day]: { [timeKey]: boolean } }
 */
export function mergeCaptainsToBoatAvailability(captainsAvailMap = {}, boatCaptains = []) {
  // If boat has no captains, treat as fully available (caller can change behavior if desired)
  if (!Array.isArray(boatCaptains) || boatCaptains.length === 0) return {};

  const boatMap = {};
  for (const capId of boatCaptains) {
    const capAvail = captainsAvailMap[capId] || {};
    for (const [day, times] of Object.entries(capAvail)) {
      if (!boatMap[day]) boatMap[day] = {};
      for (const [timeKey, isAvail] of Object.entries(times)) {
        // OR semantics: if any captain has true for the cell, boat cell is true
        boatMap[day][timeKey] = !!(boatMap[day][timeKey] || isAvail);
      }
    }
  }
  return boatMap;
}

/**
 * Return per-day boolean availability for a boat: a day is available if
 * at least one time slot is available for that day.
 * Returns { [day]: boolean }
 */
export function boatDayAvailabilityFromMap(dayMap = {}) {
  const out = {};
  for (const [day, times] of Object.entries(dayMap)) {
    out[day] = Object.values(times).some(v => !!v);
  }
  return out;
}

/**
 * High level: fetch all boats and compute their availability for the given monthKey.
 * Returns an array of boats with an added `availability` field (day->time->boolean)
 * and `dayAvailability` (day->boolean) to help calendar UIs.
 */
export async function getBoatsWithAvailability(monthKey) {
  // 1) fetch boats
  const boats = await fetchAllBoats();

  // 2) collect unique captain ids used by boats
  const captainSet = new Set();
  for (const b of boats) {
    const caps = Array.isArray(b.captains) ? b.captains : [];
    caps.forEach(c => captainSet.add(String(c)));
  }
  const captainIds = Array.from(captainSet);

  // 3) fetch all captains' month availability in one batch
  const captainsAvailMap = await fetchCaptainsMonthAvailability(captainIds, monthKey);

  // 4) compute boat availability by OR-ing captains and overlaying boat-level unavailable
  const enrichedPromises = boats.map(async (b) => {
    const caps = Array.isArray(b.captains) ? b.captains.map(String) : [];
    const availFromCaptains = mergeCaptainsToBoatAvailability(captainsAvailMap, caps);
    const boatUnavailable = await fetchBoatMonthUnavailable(b.id, monthKey);
    const availability = applyBoatUnavailableMap(availFromCaptains, boatUnavailable);
    const dayAvailability = Object.keys(availability).length === 0
      ? {} // keep empty so caller can decide fallback
      : boatDayAvailabilityFromMap(availability);
    return { id: b.id, name: b.name || null, guests: b.guests || null, captains: caps, availability, dayAvailability, raw: b };
  });

  const enriched = await Promise.all(enrichedPromises);
  return enriched;
}

/**
 * Convenience: compute availability for a single boat id for a month.
 */
export async function getBoatAvailabilityForMonth(boatId, monthKey) {
  try {
    const ref = doc(db, 'boats', String(boatId));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const boat = { id: snap.id, ...(snap.data() || {}) };
    const caps = Array.isArray(boat.captains) ? boat.captains.map(String) : [];
    const captainsAvailMap = await fetchCaptainsMonthAvailability(caps, monthKey);
    const availFromCaptains = mergeCaptainsToBoatAvailability(captainsAvailMap, caps);
    const boatUnavailable = await fetchBoatMonthUnavailable(boatId, monthKey);
    const availability = applyBoatUnavailableMap(availFromCaptains, boatUnavailable);
    const dayAvailability = Object.keys(availability).length === 0 ? {} : boatDayAvailabilityFromMap(availability);
    return { id: boat.id, name: boat.name || null, guests: boat.guests || null, captains: caps, availability, dayAvailability, raw: boat };
  } catch (e) {
    return null;
  }
}

export default {
  fetchAllBoats,
  fetchCaptainsMonthAvailability,
  fetchBoatMonthUnavailable,
  mergeCaptainsToBoatAvailability,
  boatDayAvailabilityFromMap,
  getBoatsWithAvailability,
  getBoatAvailabilityForMonth,
  applyBoatUnavailableMap,
};
