import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Cached boat slots (same shape as previous module)
let cachedSlots = [];

// Cached places: mapping placeId -> placeObject (each field in the 'places' doc)
let cachedPlaces = {};
// Cached discounts document
let cachedDiscounts = {};
// Cached flags document
let cachedFlags = {};

// Fetch boat_slots once at module import and cache the full slot objects
const boatInit = (async () => {
  try {
    const ref = doc(db, 'variables', 'boat_slots');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() || {};
      const slots = Object.entries(data).map(([key, val]) => ({ key, ...val }));
      if (slots.length) cachedSlots = slots;
    }
  } catch (err) {
    console.error('Error fetching boat_slots:', err);
  }
})();

// Fetch places once at module import and cache the map of places
const placesInit = (async () => {
  try {
    const ref = doc(db, 'variables', 'places');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      cachedPlaces = snap.data() || {};
    }
  } catch (err) {
    console.error('Error fetching places:', err);
  }
})();

// Fetch discounts once at module import and cache
const discountsInit = (async () => {
  try {
    const ref = doc(db, 'variables', 'discounts');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      cachedDiscounts = snap.data() || {};
    }
  } catch (err) {
    console.error('Error fetching discounts:', err);
  }
})();

// Fetch flags once at module import and cache
const flagsInit = (async () => {
  try {
    const ref = doc(db, 'variables', 'flags');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      cachedFlags = snap.data() || {};
    }
  } catch (err) {
    console.error('Error fetching flags:', err);
  }
})();

export function getBoatSlots() {
  return cachedSlots;
}

export const boatSlotsReady = boatInit;

export function getPlaces() {
  return cachedPlaces;
}

export const placesReady = placesInit;

export function getDiscounts() {
  return cachedDiscounts;
}

export const discountsReady = discountsInit;

export function getFlags() {
  return cachedFlags;
}

export const flagsReady = flagsInit;

export default getBoatSlots;
