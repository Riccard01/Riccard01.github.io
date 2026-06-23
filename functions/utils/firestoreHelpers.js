import { doc, setDoc, onSnapshot, serverTimestamp, collection, deleteDoc, getDocs, updateDoc, arrayRemove, query, where } from "firebase/firestore";
import { db } from "../firebase";

export function monthDocRef(captainId, monthKey) {
  return doc(db, "captains", captainId, "months", monthKey);
}

export function subscribeMonthAvailability(captainId, monthKey, onChange) {
  const ref = monthDocRef(captainId, monthKey);
  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() || {};
    const availability = data.availability || {};
    onChange(availability);
  });
  return unsub;
}

export async function saveMonthAvailability(captainId, monthKey, daysMap, editorId) {
  const ref = monthDocRef(captainId, monthKey);
  const payload = {
    availability: daysMap,
    updatedAt: serverTimestamp(),
    editorId: editorId || null,
  };

  await setDoc(ref, payload, { merge: true });
}

// Boat month helpers
export function boatMonthDocRef(boatId, monthKey) {
  return doc(db, "boats", boatId, "months", monthKey);
}

export function subscribeBoatMonth(boatId, monthKey, onChange) {
  const ref = boatMonthDocRef(boatId, monthKey);
  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() || {};
    onChange(data);
  });
  return unsub;
}

export async function saveBoatMonth(boatId, monthKey, payload, editorId) {
  const ref = boatMonthDocRef(boatId, monthKey);
  const base = { updatedAt: serverTimestamp(), editorId: editorId || null };
  await setDoc(ref, { ...payload, ...base }, { merge: true });
}

// Subscribe to captains / boats collections
export function subscribeCaptains(onChange) {
  const col = collection(db, "captains");
  const unsub = onSnapshot(col, (snap) => {
    const items = [];
    snap.forEach(d => {
      items.push({ id: d.id, ...(d.data() || {}) });
    });
    onChange(items);
  });
  return unsub;
}

export function subscribeBoats(onChange) {
  const col = collection(db, "boats");
  const unsub = onSnapshot(col, (snap) => {
    const items = [];
    snap.forEach(d => {
      items.push({ id: d.id, ...(d.data() || {}) });
    });
    onChange(items);
  });
  return unsub;
}

// Create a captain document with a provided id
export async function createCaptain(id, payload) {
  if (!id) throw new Error('Invalid id');
  const ref = doc(db, 'captains', id);
  const data = { ...(payload || {}), updatedAt: serverTimestamp() };
  await setDoc(ref, data, { merge: true });
}

// Delete a captain document by id
export async function deleteCaptain(id) {
  if (!id) throw new Error('Invalid id');
  // Check captain months for any 'booked' availability from today onwards
  const monthsCol = collection(db, 'captains', id, 'months');
  const snap = await getDocs(monthsCol);

  // format local date YYYY-MM-DD
  function localDateKey(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const todayKey = localDateKey(new Date());

  for (const d of snap.docs) {
    const data = d.data() || {};
    const availability = data.availability || {};
    for (const dateKey of Object.keys(availability)) {
      // only consider today and future dates
      if (dateKey >= todayKey) {
        const dayMap = availability[dateKey] || {};
        for (const hourKey of Object.keys(dayMap)) {
          const raw = dayMap[hourKey];
          const status = (typeof raw === 'string') ? raw : (raw && raw.availability) || null;
          if (status === 'booked') {
            const err = new Error('HAS_FUTURE_BOOKINGS');
            throw err;
          }
        }
      }
    }
  }

  // Remove captain id from any boat's `captains` array
  try {
    const q = query(collection(db, 'boats'), where('captains', 'array-contains', id));
    const boatsSnap = await getDocs(q);
    for (const b of boatsSnap.docs) {
      const boatRef = doc(db, 'boats', b.id);
      await updateDoc(boatRef, { captains: arrayRemove(id) });
    }
  } catch (e) {
    // non-fatal: log and continue to delete captain
    console.error('Error removing captain from boats:', e);
  }

  const ref = doc(db, 'captains', id);
  await deleteDoc(ref);
}
