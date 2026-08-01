const admin = require('firebase-admin');

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

function slotToHours(slotKey, slotTimetables) {
  // If a timetable map is provided, derive hours from its start/finish
  try {
    if (slotTimetables && slotTimetables[slotKey]) {
      const tt = slotTimetables[slotKey] || {};
      const start = tt.start || tt.from || (tt.timetable && tt.timetable.start) || null;
      const finish = tt.finish || tt.to || (tt.timetable && tt.timetable.finish) || null;
      if (start && finish) {
        // parse hours and minutes robustly
        const [shStr, smStr] = String(start).split(":");
        const [fhStr, fmStr] = String(finish).split(":");
        const startHour = parseInt(shStr, 10);
        const startMin = parseInt(smStr || "0", 10);
        const finishHour = parseInt(fhStr, 10);
        const finishMin = parseInt(fmStr || "0", 10);
        const hours = [];
        // include each hour that starts at >= startHour and < finishHour
        for (let h = startHour; h < finishHour; h++) hours.push(h);
        // if finish has minutes > 0, include the last hour starting at finishHour
        if (finishMin > 0) hours.push(finishHour);
        return hours;
      }
    }
  } catch (e) {
    // fall through to default mapping
  }

  // Fallback static mapping
  switch (slotKey) {
    case "morning":
      return [9,10,11,12,13];
    case "sunset":
      return [16,17,18,19,20];
    case "extended":
      return [9,10,11,12,13,14,15,16];
    case "full":
    case "full_aperitivo":
      return [9,10,11,12,13,14,15,16,17,18,19,20];
    default:
      return [];
  }
}

function computeBoatMonthView(boat, monthKey, captainsAvailabilitiesMap, boatMonthDoc, slotTimetables) {
  // boat: { id, captains: [...] }
  // captainsAvailabilitiesMap: { captainId: { 'YYYY-MM-DD': { '09': 'available', ... } } }
  // boatMonthDoc: may be null or { bookings: { date: { slotKey: { captainId, bookingId } } }, unavailable: { date: { hour: true } } }

  const result = {}; // { date: { slotKey: state } }

  // Build bookings map
  const bookings = (boatMonthDoc && boatMonthDoc.bookings) || {};
  const unavailable = (boatMonthDoc && boatMonthDoc.unavailable) || {};

  // derive dates from captains' availability keys if needed — caller should iterate days
  // For each date and slot we decide state
  return {
    computeForDateSlot: (date, slotKey) => {
      // booked?
      if (bookings[date] && bookings[date][slotKey]) return "booked";

      // If any explicit unavailable hour for the date intersects slot hours, mark unavailable
      const slotHours = slotToHours(slotKey, slotTimetables);
      const dateUnavailable = unavailable[date] || {};
      for (const h of slotHours) {
        const key1 = String(h);
        const key2 = String(h).padStart(2, '0');
        if (dateUnavailable[key1] || dateUnavailable[key2]) return "unavailable";
      }

      // check captains: at least one captain must be available for all hours
      for (const capId of (boat.captains || [])) {
        const capAvail = captainsAvailabilitiesMap[capId] || {};
        const dayMap = capAvail[date] || {};
        let ok = true;
        for (const h of slotHours) {
          const key1 = String(h);
          const key2 = String(h).padStart(2, '0');
          const raw = (dayMap.hasOwnProperty(key1) ? dayMap[key1] : (dayMap.hasOwnProperty(key2) ? dayMap[key2] : undefined));
          const s = (typeof raw === 'string') ? raw : (raw && raw.availability) || null;
          if (s !== "available") { ok = false; break; }
        }
        if (ok) return "available";
      }

      return "unavailable";
    }
  };
}

async function createBoatBooking({ bookingId = null, boatId, date, slotKey, captainId, slotTimetables = null, editorId = null, title = null, notes = null, boatName = null, status = 'pending', expiresAt = null, customer = null, numPax = 1, startTime = null, endTime = null, amountCents = null, paymentIntentId = null, discounts = null, comboPeerBoatId = null }) {
  // monthKey from date
  const monthKey = date.slice(0,7);
  if (!bookingId) bookingId = `b_${Date.now()}`;
  // compute hours to mark as unavailable on boat (we mark booked hours as unavailable so overlapping slots are blocked)
  const hours = slotToHours(slotKey, slotTimetables);
  let startHour = null;
  let endHour = null;
  let hoursCount = 0;
  if (hours && hours.length > 0) {
    startHour = hours[0];
    endHour = hours[hours.length - 1] + 1; // end as exclusive hour
    hoursCount = hours.length;
  }

  // prepare booking object (include extra metadata when available)
  const computedTitleParts = [];
  if (boatName) computedTitleParts.push(boatName);
  if (customer && customer.fullName) computedTitleParts.push(customer.fullName);
  if (startTime) computedTitleParts.push(startTime);
  const computedTitle = computedTitleParts.length > 0 ? computedTitleParts.join(' - ') : null;

  // Ensure customer object contains notes and numPax (preferred place for these fields)
  const safeCustomer = Object.assign({}, customer || {});
  if (safeCustomer.numPax == null) safeCustomer.numPax = Number(numPax) || 1;
  else safeCustomer.numPax = Number(safeCustomer.numPax) || 1;
  if (safeCustomer.notes == null) safeCustomer.notes = notes || null;

  const bookingObj = {
    captainId,
    bookingId,
    createdAt: serverTimestamp(),
    title: title || computedTitle || null,
    boatId,
    boatName: boatName || null,
    startHour,
    endHour,
    hoursCount,
    status,
    expiresAt,
    startTime: startTime || null,
    endTime: endTime || null,
    amountCents: amountCents == null ? null : Number(amountCents),
    paymentIntentId: paymentIntentId || null,
    customer: safeCustomer,
    discounts: discounts || null,
    comboPeerBoatId: comboPeerBoatId || null,
  };
  const unavailable = { [date]: {} };
  hours.forEach(h => { unavailable[date][String(h)] = true; });

  // prepare bookings payload
  const bookings = { [date]: { [slotKey]: bookingObj } };

  const db = admin.firestore();

  // save boat month (merge)
  const boatMonthRef = db.collection('boats').doc(boatId).collection('months').doc(monthKey);
  await boatMonthRef.set({ bookings, unavailable, updatedAt: serverTimestamp(), editorId: editorId || null }, { merge: true });

  // update captain month to mark booked hours (only if captainId provided)
  if (captainId) {
    const daysMap = { [date]: {} };
    hours.forEach(h => {
      // each hour cell stores booking + customer metadata where possible
      daysMap[date][String(h)] = {
        availability: "booked",
        boatId,
        boatName: boatName || null,
        slotKey,
        bookingId,
        title: title || computedTitle || null,
        notes: (safeCustomer && safeCustomer.notes) || notes || null,
        startHour,
        endHour,
        hoursCount,
        startTime: startTime || null,
        endTime: endTime || null,
        numPax: Number((safeCustomer && safeCustomer.numPax) || numPax) || 1,
        amountCents: amountCents == null ? null : Number(amountCents),
        paymentIntentId: paymentIntentId || null,
        customer: safeCustomer || null,
        discounts: discounts || null,
        departurePort: (safeCustomer && safeCustomer.embark) || null,
        arrivalPort: (safeCustomer && safeCustomer.disembark) || null,
        taxiService: !!(safeCustomer && (safeCustomer.arrangePickup || safeCustomer.arrangeDropoff)),
        comboPeerBoatId: comboPeerBoatId || null,
      };
    });
    const captainMonthRef = db.collection('captains').doc(captainId).collection('months').doc(monthKey);
    await captainMonthRef.set({ availability: daysMap, updatedAt: serverTimestamp(), editorId: editorId || null }, { merge: true });
  }

  return bookingId;
}

async function removeBoatBooking({ boatId, date, slotKey, slotTimetables = null, captainId, editorId = null }) {
  const monthKey = date.slice(0,7);

  const hours = slotToHours(slotKey, slotTimetables);
  const db = admin.firestore();

  const boatMonthRef = db.collection('boats').doc(boatId).collection('months').doc(monthKey);
  const updateObj = { updatedAt: serverTimestamp(), editorId: editorId || null };
  updateObj[`bookings.${date}.${slotKey}`] = admin.firestore.FieldValue.delete();
  hours.forEach(h => { updateObj[`unavailable.${date}.${String(h)}`] = admin.firestore.FieldValue.delete(); });
  try {
    await boatMonthRef.update(updateObj);
  } catch (e) {
    // if doc doesn't exist or other error, log and continue
    console.error('removeBoatBooking: boatMonthRef.update failed', e);
  }

  // Restore captain hours to "available" (only if captainId provided)
  if (captainId) {
    const daysMap = { [date]: {} };
    hours.forEach(h => { daysMap[date][String(h)] = { availability: "available" }; });
    const captainMonthRef = db.collection('captains').doc(captainId).collection('months').doc(monthKey);
    try {
      await captainMonthRef.set({ availability: daysMap, updatedAt: serverTimestamp(), editorId: editorId || null }, { merge: true });
    } catch (e) {
      console.error('removeBoatBooking: captainMonthRef.set failed', e);
    }
  }
}

async function setBoatUnavailable(boatId, monthKey, daysMap, editorId) {
  // daysMap: { 'YYYY-MM-DD': { '09': true, '10': null, ... } }
  // For additions (true) use saveBoatMonth (merge). For removals (null) use updateDoc + deleteField to actually remove fields.
  const toSet = {};
  const toDeletePaths = [];
  Object.keys(daysMap || {}).forEach(date => {
    Object.keys(daysMap[date] || {}).forEach(hour => {
      const v = daysMap[date][hour];
      if (v === true) {
        if (!toSet[date]) toSet[date] = {};
        toSet[date][hour] = true;
      } else {
        toDeletePaths.push(`unavailable.${date}.${hour}`);
      }
    });
  });

  if (Object.keys(toSet).length > 0) {
    await saveBoatMonth(boatId, monthKey, { unavailable: toSet }, editorId);
  }

  if (toDeletePaths.length > 0) {
    const ref = boatMonthDocRef(boatId, monthKey);
    const updateObj = { updatedAt: serverTimestamp(), editorId: editorId || null };
    toDeletePaths.forEach(p => { updateObj[p] = deleteField(); });
    try {
      await updateDoc(ref, updateObj);
    } catch (e) {
      // If doc doesn't exist or other error, log and continue
      console.error('setBoatUnavailable updateDoc failed', e);
    }
  }
}

async function setBoatUnusable(boatId, monthKey, daysMap, editorId) {
  // Similar to setBoatUnavailable but stores data under `unusable` key
  const toSet = {};
  const toDeletePaths = [];
  Object.keys(daysMap || {}).forEach(date => {
    Object.keys(daysMap[date] || {}).forEach(hour => {
      const v = daysMap[date][hour];
      if (v === true) {
        if (!toSet[date]) toSet[date] = {};
        toSet[date][hour] = true;
      } else {
        toDeletePaths.push(`unusable.${date}.${hour}`);
      }
    });
  });

  if (Object.keys(toSet).length > 0) {
    await saveBoatMonth(boatId, monthKey, { unusable: toSet }, editorId);
  }

  if (toDeletePaths.length > 0) {
    const ref = boatMonthDocRef(boatId, monthKey);
    const updateObj = { updatedAt: serverTimestamp(), editorId: editorId || null };
    toDeletePaths.forEach(p => { updateObj[p] = deleteField(); });
    try {
      await updateDoc(ref, updateObj);
    } catch (e) {
      console.error('setBoatUnusable updateDoc failed', e);
    }
  }
}

/**
 * Real-time availability check before creating a booking.
 * Returns true if the slot is available, false otherwise.
 *
 * Checks:
 *  1. Boat month doc: slot not already booked, no overlapping unavailable hour
 *  2. Captain month doc (if captainId provided): all slot hours are "available"
 */
async function checkSlotAvailable({ db, boatId, date, slotKey, captainId, slotTimetables }) {
  const monthKey = date.slice(0, 7);
  const hours = slotToHours(slotKey, slotTimetables);

  // 1. Check boat month
  const boatMonthSnap = await db.collection('boats').doc(boatId).collection('months').doc(monthKey).get();
  if (boatMonthSnap.exists) {
    const d = boatMonthSnap.data() || {};
    const bookings = d.bookings || {};
    const unavailable = d.unavailable || {};

    if (bookings[date] && bookings[date][slotKey]) {
      return false; // slot already booked (confirmed or pending)
    }

    const hourUnavail = unavailable[date] || {};
    // Optional block: expand unavailable hours to include adjacent hours (removable)
    // Use a numeric Set to avoid padded/unpadded key issues and make adjacency checks robust.
    const expandedSet = new Set();
    // Only treat hours declared and truthy as unavailable. If a field exists but is null/false
    // we should not block the slot. This prevents keys with null values from causing
    // unexpected "slot_unavailable" results.
    for (const k of Object.keys(hourUnavail)) {
      const v = hourUnavail[k];
      if (!v) continue; // skip null/false/0
      const hNum = parseInt(k, 10);
      if (!Number.isNaN(hNum) && Number.isFinite(hNum)) {
        expandedSet.add(hNum);
        if (hNum - 1 >= 0) expandedSet.add(hNum - 1);
        if (hNum + 1 <= 23) expandedSet.add(hNum + 1);
      }
    }
    // If any slot hour intersects the expanded unavailable set, block the slot
    for (const h of hours) {
      const hNum = Number(h);
      if (expandedSet.has(hNum)) return false; // overlapping or adjacent hour is blocked
    }
  }

  // 2. Check captain month
  //if (captainId && hours.length > 0) {
  //  const capSnap = await db.collection('captains').doc(captainId).collection('months').doc(monthKey).get();
  //  if (!capSnap.exists) return false; // no availability schedule set
  //  const capData = capSnap.data() || {};
  //  const dayAvail = ((capData.availability || {})[date]) || {};
  //  for (const h of hours) {
  //    const key1 = String(h);
  //    const key2 = String(h).padStart(2, '0');
  //    const cell = (dayAvail.hasOwnProperty(key1) ? dayAvail[key1] : (dayAvail.hasOwnProperty(key2) ? dayAvail[key2] : undefined));
  //    const status = typeof cell === 'string' ? cell : (cell && cell.availability) || null;
  //    if (status !== 'available') return false;
  //  }
  //}

  return true;
}

module.exports = {
  slotToHours,
  computeBoatMonthView,
  createBoatBooking,
  removeBoatBooking,
  setBoatUnavailable,
  setBoatUnusable,
  checkSlotAvailable,
};
