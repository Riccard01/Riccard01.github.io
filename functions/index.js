//firebase deploy --only functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripePkg = require('stripe');
const express = require('express');
const bodyParser = require('body-parser');
const { createBoatBooking, removeBoatBooking, checkSlotAvailable } = require('./utils/boatHelpers');
const { computeTotalPrice, computeTotalPriceWithDiscount, computeComboTotalPriceWithDiscount, findApplicableEarlyDiscount, eurosToCents, getPlaceByName, getTransferPriceForPlace } = require('./utils/priceCalculator');
const { sendBookingConfirmationEmail } = require('./utils/mailSender');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');

// Define secrets (must be bound to functions that need them)
const stripeSecretParam = defineSecret('STRIPE_SECRET');
const stripeWebhookSecretParam = defineSecret('STRIPE_WEBHOOK_SECRET');

admin.initializeApp();

function setCorsHeaders(res, origin) {
  const allowOrigin = origin || '*';
  res.set('Access-Control-Allow-Origin', allowOrigin);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // If you need to support credentials (cookies) set below and use exact origin (not '*'):
  // res.set('Access-Control-Allow-Credentials', 'true');
}

exports.manageCaptainUser = onRequest(async (req, res) => {
  try {
    const origin = req.get('Origin') || req.get('origin');
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      setCorsHeaders(res, origin);
      return res.status(204).send('');
    }

    // Set CORS on real responses
    setCorsHeaders(res, origin);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    // Extract token from Authorization header
    const authHeader = (req.headers.authorization || '') + '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;
    if (!idToken) return res.status(401).json({ error: { message: 'Must be authenticated', status: 'UNAUTHENTICATED' } });

    // Verify token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error('verifyIdToken failed', err);
      return res.status(401).json({ error: { message: 'Invalid or expired token', status: 'UNAUTHENTICATED' } });
    }

    if (!decoded.admin) {
      return res.status(403).json({ error: { message: 'Admin privileges required', status: 'PERMISSION_DENIED' } });
    }

    const payload = (req.body && req.body.data) ? req.body.data : req.body;
    const { captainId, email, password } = payload || {};
    if (!captainId || !email) {
      return res.status(400).json({ error: { message: 'Missing captainId or email', status: 'INVALID_ARGUMENT' } });
    }

    // Create or update user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      if (password) await admin.auth().updateUser(userRecord.uid, { password });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || (err.message && err.message.includes('user-not-found'))) {
        const createParams = { email, emailVerified: false };
        if (password) createParams.password = password;
        userRecord = await admin.auth().createUser(createParams);
      } else {
        console.error('getUserByEmail error', err);
        return res.status(500).json({ error: { message: 'Auth lookup error', status: 'INTERNAL' } });
      }
    }

    // Write mapping in Firestore
    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.doc(`captains/${captainId}`).set({ authEmail: email, updatedAt: now }, { merge: true });
    await db.doc(`captainEmails/${captainId}`).set({ email, captainId, updatedAt: now }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error('manageCaptainUser unexpected error', err);
    setCorsHeaders(res, req.get('Origin') || req.get('origin'));
    return res.status(500).json({ error: { message: 'Internal error', status: 'INTERNAL' } });
  }
});

// FUNZIONE PER CREARE UN PAYMENT INTENT (Stripe Elements)
exports.createPaymentIntent = onCall({ secrets: [stripeSecretParam] }, async (req) => {
  // Diagnostic logs: print raw payload and auth
  const data = req.data;
  console.log('createPaymentIntent called - raw data:', data);
  const effectiveAuth = req.auth || (data && data.auth) || null;
  console.log('createPaymentIntent called - auth:', effectiveAuth ? { uid: effectiveAuth.uid } : null);

  // Normalize payload: some clients may wrap under data
  const payload = (data && data.data) ? data.data : data;
  console.log('createPaymentIntent normalized payload:', payload);

  const { boatId, startTime, endTime, date, slotKey, captainId, title, notes, boatName,
    fullName, countryCode, phone, email, conciergeCode, embark, disembark, arrangePickup, arrangeDropoff, numPax,
    secondaryBoatId, secondaryCaptainId, secondaryBoatName } = payload || {};
  const db = admin.firestore();
  const normalizedConciergeCode = typeof conciergeCode === 'string'
    ? conciergeCode.trim().toUpperCase().slice(0, 40) || null
    : null;

  // Log parsed param types for easier debugging
  console.log('createPaymentIntent parsed params', {
    boatId, boatIdType: typeof boatId,
    date, dateType: Object.prototype.toString.call(date),
    slotKey, slotKeyType: typeof slotKey,
    captainId, captainIdType: typeof captainId,
    numPax, numPaxType: typeof numPax
  });

  const missing = [];
  if (!boatId) missing.push('boatId');
  if (!date) missing.push('date');
  if (!slotKey) missing.push('slotKey');
  if (missing.length) {
    console.error('createPaymentIntent - missing required booking parameters:', missing, 'raw data:', payload);
    throw new HttpsError('invalid-argument', `Missing required booking parameters: ${missing.join(', ')}`);
  }

  try {
    const bookingId = `b_${Date.now()}`;
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 60 * 1000);

    // Fetch slot timetables from Firestore so hours are computed correctly
    let slotTimetables = null;
    try {
      const slotsSnap = await db.collection('variables').doc('boat_slots').get();
      if (slotsSnap.exists) {
        const slotsData = slotsSnap.data() || {};
        slotTimetables = slotsData;
      }
    } catch (e) {
      console.warn('createPaymentIntent: could not fetch slot timetables, falling back to static mapping', e);
    }

    // Fetch boat doc and places for server-side authoritative price computation
    let boatDoc = null;
    try {
      const boatSnap = await db.collection('boats').doc(String(boatId)).get();
      if (boatSnap.exists) boatDoc = boatSnap.data();
    } catch (e) {
      console.warn('createPaymentIntent: could not fetch boat doc for price computation', e);
    }

    // Optional second boat for combined excursions (e.g. Gourmet Sunset Cruise with >7 guests)
    let secondaryBoatDoc = null;
    if (secondaryBoatId) {
      try {
        const secondarySnap = await db.collection('boats').doc(String(secondaryBoatId)).get();
        if (secondarySnap.exists) secondaryBoatDoc = secondarySnap.data();
      } catch (e) {
        console.warn('createPaymentIntent: could not fetch secondary boat doc for price computation', e);
      }
      if (!secondaryBoatDoc) {
        console.error('createPaymentIntent: secondaryBoatId provided but boat doc not found', secondaryBoatId);
        throw new HttpsError('invalid-argument', 'Secondary boat not found');
      }
    }

    let serverPlacesMap = null;
    try {
      const placesSnap = await db.collection('variables').doc('places').get();
      if (placesSnap.exists) serverPlacesMap = placesSnap.data();
    } catch (e) {
      console.warn('createPaymentIntent: could not fetch places for price computation', e);
    }

    // Fetch discounts doc for server-side discount computation
    let serverDiscounts = null;
    try {
      const discountsSnap = await db.collection('variables').doc('discounts').get();
      if (discountsSnap.exists) serverDiscounts = discountsSnap.data() || null;
    } catch (e) {
      console.warn('createPaymentIntent: could not fetch discounts doc', e);
    }

    // Compute the authoritative price server-side; never trust the client-supplied amount
    const parsedNumPax = Math.max(1, parseInt(numPax, 10) || 1);
    let serverAmountCents;
    if (boatDoc && serverPlacesMap) {
      const priceParams = {
        placesMap: serverPlacesMap,
        slotObj: (slotTimetables && slotTimetables[slotKey]) || null,
        embark: embark || null,
        disembark: disembark || null,
        arrangePickup: !!arrangePickup,
        arrangeDropoff: !!arrangeDropoff,
        numPax: parsedNumPax,
        bookingDate: date,
        discounts: serverDiscounts,
      };
      const totalEuros = secondaryBoatDoc
        ? computeComboTotalPriceWithDiscount({ ...priceParams, boatDocs: [boatDoc, secondaryBoatDoc] })
        : computeTotalPriceWithDiscount({ ...priceParams, boatDoc });
      serverAmountCents = eurosToCents(totalEuros);
      console.log('createPaymentIntent server-computed price', { totalEuros, serverAmountCents, isCombo: !!secondaryBoatDoc });
    } else {
      // Could not fetch pricing data; reject rather than silently charging wrong amount
      console.error('createPaymentIntent: unable to compute server-side price (boat or places doc missing)');
      throw new HttpsError('internal', 'Unable to compute booking price. Please try again.');
    }

    // Derive startTime / endTime from the slot timetable (prefer server-fetched over client-supplied)
    let resolvedStartTime = startTime || null;
    let resolvedEndTime = endTime || null;
    if (slotTimetables && slotTimetables[slotKey]) {
      const tt = slotTimetables[slotKey];
      resolvedStartTime = (tt.timetable && tt.timetable.start) || tt.start || tt.from || startTime || null;
      resolvedEndTime = (tt.timetable && tt.timetable.finish) || tt.finish || tt.to || endTime || null;
    }

    // Verify the slot is still available before reserving it and charging the customer
    const slotStillAvailable = await checkSlotAvailable({
      db,
      boatId: String(boatId),
      date,
      slotKey,
      captainId: captainId || null,
      slotTimetables,
    });
    if (!slotStillAvailable) {
      console.warn('createPaymentIntent: slot no longer available', { boatId, date, slotKey });
      throw new HttpsError('already-exists', 'slot_unavailable');
    }

    // For combined excursions, the paired boat must also be free for the same slot
    if (secondaryBoatId) {
      const secondarySlotStillAvailable = await checkSlotAvailable({
        db,
        boatId: String(secondaryBoatId),
        date,
        slotKey,
        captainId: secondaryCaptainId || null,
        slotTimetables,
      });
      if (!secondarySlotStillAvailable) {
        console.warn('createPaymentIntent: secondary boat slot no longer available', { secondaryBoatId, date, slotKey });
        throw new HttpsError('already-exists', 'slot_unavailable');
      }
    }

    // compute a default title: boatName - clientName - startTime (if not provided)
    const boatDisplayName = boatName || (boatDoc && (boatDoc.name || boatDoc.title)) || null;
    const computedTitleParts = [];
    if (boatDisplayName) computedTitleParts.push(boatDisplayName);
    if (fullName) computedTitleParts.push(fullName);
    if (resolvedStartTime) computedTitleParts.push(resolvedStartTime);
    const computedTitle = computedTitleParts.length > 0 ? computedTitleParts.join(' - ') : null;


    // Add booking to boat and captain months (store rich metadata for pending state)
    await createBoatBooking({
      bookingId,
      boatId,
      date,
      slotKey,
      captainId,
      title: title || computedTitle || null,
      // notes moved into customer
      boatName: boatDisplayName,
      status: 'pending',
      expiresAt,
      editorId: effectiveAuth ? effectiveAuth.uid : null,
      slotTimetables,
      customer: {
        fullName: fullName || null,
        phone: (countryCode || '') + (phone || ''),
        email: email || null,
        notes: notes || null,
        conciergeCode: normalizedConciergeCode,
        embark: embark || null,
        disembark: disembark || null,
        arrangePickup: !!arrangePickup,
        arrangeDropoff: !!arrangeDropoff,
        numPax: parsedNumPax,
      },
      startTime: resolvedStartTime,
      endTime: resolvedEndTime,
      amountCents: serverAmountCents,
      // attach discount metadata if applicable
      discounts: (serverDiscounts ? { early_discount: findApplicableEarlyDiscount(serverDiscounts, date) } : null),
      paymentIntentId: null,
      comboPeerBoatId: secondaryBoatId || null,
    });

    // For combined excursions, also reserve the paired boat with the same slot/date.
    // The combined price already includes both boats, so the secondary record's amountCents
    // is left null (informational only) to avoid implying it was charged independently.
    if (secondaryBoatId) {
      await createBoatBooking({
        bookingId,
        boatId: secondaryBoatId,
        date,
        slotKey,
        captainId: secondaryCaptainId || null,
        title: title || computedTitle || null,
        boatName: secondaryBoatName || (secondaryBoatDoc && (secondaryBoatDoc.name || secondaryBoatDoc.title)) || null,
        status: 'pending',
        expiresAt,
        editorId: effectiveAuth ? effectiveAuth.uid : null,
        slotTimetables,
        customer: {
          fullName: fullName || null,
          phone: (countryCode || '') + (phone || ''),
          email: email || null,
          notes: notes || null,
          conciergeCode: normalizedConciergeCode,
          embark: embark || null,
          disembark: disembark || null,
          arrangePickup: !!arrangePickup,
          arrangeDropoff: !!arrangeDropoff,
          numPax: parsedNumPax,
        },
        startTime: resolvedStartTime,
        endTime: resolvedEndTime,
        amountCents: null,
        discounts: (serverDiscounts ? { early_discount: findApplicableEarlyDiscount(serverDiscounts, date) } : null),
        paymentIntentId: null,
        comboPeerBoatId: boatId,
      });
    }

    // Store booking data in pending_bookings only (no separate bookings collection)
    await db.collection('pending_bookings').doc(bookingId).set({
      bookingId,
      boatId,
      title: title || computedTitle || null,
      startTime: resolvedStartTime,
      endTime: resolvedEndTime,
      date,
      slotKey,
      captainId,
      status: 'pending',
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      customer: {
        fullName: fullName || null,
        phone: (countryCode || '') + (phone || ''),
        email: email || null,
        notes: notes || null,
        conciergeCode: normalizedConciergeCode,
        embark: embark || null,
        disembark: disembark || null,
        arrangePickup: !!arrangePickup,
        arrangeDropoff: !!arrangeDropoff,
        numPax: parsedNumPax,
      },
      amountCents: serverAmountCents,
      discounts: (serverDiscounts ? { early_discount: findApplicableEarlyDiscount(serverDiscounts, date) } : null),
      secondaryBoatId: secondaryBoatId || null,
      secondaryCaptainId: secondaryCaptainId || null,
      secondaryBoatName: secondaryBoatName || null,
    });

    let pendingData = {
      bookingId,
      boatId,
      title: title || computedTitle || null,
      startTime: resolvedStartTime,
      endTime: resolvedEndTime,
      date,
      slotKey,
      captainId,
      status: 'pending',
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      customer: {
        fullName: fullName || null,
        phone: (countryCode || '') + (phone || ''),
        email: email || null,
        notes: notes || null,
        conciergeCode: normalizedConciergeCode,
        embark: embark || null,
        disembark: disembark || null,
        arrangePickup: !!arrangePickup,
        arrangeDropoff: !!arrangeDropoff,
        numPax: parsedNumPax,
      },
      amountCents: serverAmountCents,
      discounts: (serverDiscounts ? { early_discount: findApplicableEarlyDiscount(serverDiscounts, date) } : null),
      secondaryBoatId: secondaryBoatId || null,
      secondaryCaptainId: secondaryCaptainId || null,
      secondaryBoatName: secondaryBoatName || null,
    };

    // Create PaymentIntent for Stripe Elements
    // Read secret via param binding (available as environment variable and via .value())
    const stripeClientKey = process.env.STRIPE_SECRET || (stripeSecretParam && stripeSecretParam.value && stripeSecretParam.value());
    console.log('createPaymentIntent stripe key present:', !!stripeClientKey);
    if (!stripeClientKey) {
      console.error('createPaymentIntent - stripe secret missing in env');
      throw new HttpsError('failed-precondition', 'Stripe secret not configured.');
    }
    const stripeClient = stripePkg(stripeClientKey);

    // Use the server-computed price; the client-supplied amountCents is intentionally ignored
    const amount = serverAmountCents;

    const intent = await stripeClient.paymentIntents.create({
      amount,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        bookingId,
        conciergeCode: normalizedConciergeCode || '',
      },
      description: `Prenotazione barca ${boatId} (${bookingId})`
    });

    // Save PaymentIntent id in pending_bookings
    await db.collection('pending_bookings').doc(bookingId).update({ paymentIntentId: intent.id });

    // Also annotate the boat/month booking with the paymentIntentId & amount for easier lookup
    try {
      const monthKey = String(date).slice(0, 7);
      const boatMonthRef = db.collection('boats').doc(String(boatId)).collection('months').doc(monthKey);
      // Try update using field paths (interprets dots as nested fields)
      try {
        await boatMonthRef.update({
          [`bookings.${date}.${slotKey}.paymentIntentId`]: intent.id,
          [`bookings.${date}.${slotKey}.amountCents`]: serverAmountCents,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (updErr) {
        // If update fails (e.g. doc doesn't exist), create nested structure with merge
        const nested = {
          bookings: {
            [date]: {
              [slotKey]: {
                paymentIntentId: intent.id,
                amountCents: serverAmountCents,
              }
            }
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await boatMonthRef.set(nested, { merge: true });
      }
    } catch (e) {
      console.warn('createPaymentIntent: unable to patch boat month with paymentIntentId', e);
    }

    // Same annotation for the paired boat in a combined excursion
    if (secondaryBoatId) {
      try {
        const monthKey = String(date).slice(0, 7);
        const secondaryBoatMonthRef = db.collection('boats').doc(String(secondaryBoatId)).collection('months').doc(monthKey);
        try {
          await secondaryBoatMonthRef.update({
            [`bookings.${date}.${slotKey}.paymentIntentId`]: intent.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (updErr) {
          const nested = {
            bookings: {
              [date]: {
                [slotKey]: {
                  paymentIntentId: intent.id,
                }
              }
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          await secondaryBoatMonthRef.set(nested, { merge: true });
        }
      } catch (e) {
        console.warn('createPaymentIntent: unable to patch secondary boat month with paymentIntentId', e);
      }
    }

    console.log('createPaymentIntent succeeded', { bookingId, paymentIntentId: intent.id });
    return { clientSecret: intent.client_secret, paymentIntentId: intent.id, bookingId };
  } catch (err) {
    // Re-throw HttpsError instances as-is so specific codes reach the client
    if (err instanceof HttpsError) throw err;
    console.error('createPaymentIntent error', err, 'incoming data:', data);
    // Surface a generic internal error to the client while keeping details in logs
    throw new HttpsError('internal', 'Internal error creating payment intent. Check function logs for details.');
  }
});

// Callable function to cancel a pending booking immediately (regardless of expiry)
// Expects { bookingId, email } in req.data. Allows cancellation if caller provides the
// same customer email that was used to create the pending booking, or if the caller
// is an admin (has admin custom claim).
exports.cancelPendingBooking = onCall(async (req) => {
  const data = req.data || {};
  const bookingId = data.bookingId;
  const callerAuth = req.auth || null;
  const callerIsAdmin = !!(callerAuth && callerAuth.token && callerAuth.token.admin);
  const email = data.email || null;

  if (!bookingId) {
    throw new HttpsError('invalid-argument', 'bookingId is required');
  }

  const db = admin.firestore();
  try {
    const pendingRef = db.collection('pending_bookings').doc(bookingId);
    const pendingSnap = await pendingRef.get();
    if (!pendingSnap.exists) {
      return { ok: true, message: 'pending booking not found' };
    }
    const pending = pendingSnap.data() || {};

    // Authorization: allow if admin, or if provided email matches the pending booking customer
    const pendingEmail = (pending.customer && pending.customer.email) || null;
    if (!callerIsAdmin) {
      if (!email || !pendingEmail || String(email).toLowerCase() !== String(pendingEmail).toLowerCase()) {
        throw new HttpsError('permission-denied', 'Not authorized to cancel this booking');
      }
    }

    const { boatId, date, slotKey, captainId, secondaryBoatId, secondaryCaptainId } = pending;

    // Try to read slot timetables for consistent removal behavior
    let slotTimetables = null;
    try {
      const slotsSnap = await db.collection('variables').doc('boat_slots').get();
      if (slotsSnap.exists) slotTimetables = slotsSnap.data() || null;
    } catch (e) {
      console.warn('cancelPendingBooking: could not fetch slot timetables', e);
    }

    // Remove booking references from boat and captain months if present
    try {
      if (boatId && date && slotKey) {
        await removeBoatBooking({ boatId, date, slotKey, slotTimetables, captainId: captainId || null, editorId: (callerAuth && callerAuth.uid) || 'system' });
      }
    } catch (e) {
      console.error('cancelPendingBooking: removeBoatBooking failed', e);
    }

    // Also release the paired boat for combined excursions
    try {
      if (secondaryBoatId && date && slotKey) {
        await removeBoatBooking({ boatId: secondaryBoatId, date, slotKey, slotTimetables, captainId: secondaryCaptainId || null, editorId: (callerAuth && callerAuth.uid) || 'system' });
      }
    } catch (e) {
      console.error('cancelPendingBooking: removeBoatBooking failed for secondary boat', e);
    }

    // Delete pending_bookings doc
    try {
      await pendingRef.delete();
    } catch (e) {
      console.error('cancelPendingBooking: failed to delete pending booking', e);
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error('cancelPendingBooking unexpected error', err);
    throw new HttpsError('internal', 'Internal error cancelling pending booking');
  }
});






























// WEBHOOK STRIPE
const app = express();

// Rete di sicurezza per catturare i byte grezzi prima che Firebase o Express li trasformino
app.use((req, res, next) => {
  if (req.rawBody) {
    req.body = req.rawBody; // Forza l'uso dei byte nativi stoccati da Firebase
  }
  next();
});

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || (stripeWebhookSecretParam && stripeWebhookSecretParam.value && stripeWebhookSecretParam.value());

  if (!stripeWebhookSecret) {
    console.error('Stripe webhook secret is not set.');
    return res.status(500).send('Webhook secret not configured.');
  }

  const stripe = stripePkg(process.env.STRIPE_SECRET || (stripeSecretParam && stripeSecretParam.value && stripeSecretParam.value()) || '');

  let event;
  try {
    const rawBody = req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err && err.message ? err.message : err);
    return res.status(400).send(`Webhook Error: ${err && err.message ? err.message : String(err)}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const bookingId = intent.metadata && intent.metadata.bookingId;
    if (bookingId) {
      try {
        const db = admin.firestore();
        const pendingRef = db.collection('pending_bookings').doc(bookingId);
        const pendingSnap = await pendingRef.get();
        if (pendingSnap.exists) {
          const pendingData = pendingSnap.data() || {};
          const { boatId, date, slotKey, secondaryBoatId } = pendingData;
          if (boatId && date && slotKey) {
            try {
              const monthKey = String(date).slice(0, 7);
              const boatMonthRef = db.collection('boats').doc(String(boatId)).collection('months').doc(monthKey);
              const updateObj = {};
              updateObj[`bookings.${date}.${slotKey}.status`] = 'confirmed';
              updateObj[`bookings.${date}.${slotKey}.paymentConfirmedAt`] = admin.firestore.FieldValue.serverTimestamp();
              updateObj.updatedAt = admin.firestore.FieldValue.serverTimestamp();
              await boatMonthRef.update(updateObj);
            } catch (err) {
              const monthKey = String(date).slice(0, 7);
              const boatMonthRef = db.collection('boats').doc(String(boatId)).collection('months').doc(monthKey);
              const nested = { bookings: { [date]: { [slotKey]: { status: 'confirmed', paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp() } } }, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
              await boatMonthRef.set(nested, { merge: true });
            }

            // Mirror the confirmation onto the paired boat for combined excursions
            if (secondaryBoatId) {
              try {
                const monthKey = String(date).slice(0, 7);
                const secondaryBoatMonthRef = db.collection('boats').doc(String(secondaryBoatId)).collection('months').doc(monthKey);
                const updateObj = {};
                updateObj[`bookings.${date}.${slotKey}.status`] = 'confirmed';
                updateObj[`bookings.${date}.${slotKey}.paymentConfirmedAt`] = admin.firestore.FieldValue.serverTimestamp();
                updateObj.updatedAt = admin.firestore.FieldValue.serverTimestamp();
                await secondaryBoatMonthRef.update(updateObj);
              } catch (err) {
                try {
                  const monthKey = String(date).slice(0, 7);
                  const secondaryBoatMonthRef = db.collection('boats').doc(String(secondaryBoatId)).collection('months').doc(monthKey);
                  const nested = { bookings: { [date]: { [slotKey]: { status: 'confirmed', paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp() } } }, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
                  await secondaryBoatMonthRef.set(nested, { merge: true });
                } catch (e2) {
                  console.error('Webhook: failed to confirm secondary boat booking', e2);
                }
              }
            }

            // --- TUA LOGICA ORIGINALE PREZZI/INVOICE ---
            try {
              let slotsSnap = await db.collection('variables').doc('boat_slots').get();
              let placesSnap = await db.collection('variables').doc('places').get();
              let boatSnap = await db.collection('boats').doc(String(boatId)).get();
              let slotTimetables = slotsSnap.exists ? slotsSnap.data() : null;
              let placesMap = placesSnap.exists ? placesSnap.data() : null;
              let boatDoc = boatSnap.exists ? boatSnap.data() : null;

              const starthour = pendingData.startTime || (slotTimetables?.[slotKey]?.start || null);
              const endhour = pendingData.endTime || (slotTimetables?.[slotKey]?.finish || null);
              const totalPaidCents = Number(intent.amount_received || intent.amount || 0);
              const embark = pendingData.customer?.embark || null;
              const disembark = pendingData.customer?.disembark || null;
              const embarkPlace = getPlaceByName(placesMap, embark);
              const disembarkPlace = getPlaceByName(placesMap, disembark);

              const invoiceEntry = {
                bookingId, slot: slotKey, starthour, endhour, totalPriceCents: totalPaidCents,
                paymentIntentId: intent.id, boatId: String(boatId), customer: pendingData.customer || null,
                harboursMultiplier: [Number(embarkPlace?.multiplier || 1), Number(disembarkPlace?.multiplier || 1)],
                basePriceCents: Math.round(Number(boatDoc?.base_price || boatDoc?.price || 0) * 100),
                secondaryBoatId: secondaryBoatId || null,
              };

              const invoiceRef = db.collection('invoices').doc(String(date).slice(0, 7));
              await invoiceRef.set({ updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
              await invoiceRef.update({ [date]: admin.firestore.FieldValue.arrayUnion(invoiceEntry) });
            } catch (invErr) { console.error('Invoice error:', invErr); }
          }

          // Delegate email sending to utils/mailSender
          try {
            await sendBookingConfirmationEmail({ db, bookingId, pendingData, intent });
          } catch (mailErr) {
            console.error('Webhook: sendBookingConfirmationEmail failed', mailErr);
          }

          // Delete pending booking document
          try {
            await db.collection('pending_bookings').doc(String(bookingId)).delete();
          } catch (delErr) {
            console.warn('mailSender: failed to delete pending booking', bookingId, delErr);
          }
        }
      } catch (e) { console.error('Webhook critical error:', e); }
    }
  }
  res.json({ received: true });
});

exports.stripeWebhook = onRequest({ secrets: [stripeSecretParam, stripeWebhookSecretParam] }, app);
















// FUNZIONE PER PULIRE PRENOTAZIONI SCADUTE
exports.cleanExpiredBookings = onSchedule('every 5 minutes', async () => {
  const now = admin.firestore.Timestamp.now();
  const db = admin.firestore();
  const snapshot = await db
    .collection('pending_bookings')
    .where('status', '==', 'pending')
    .where('expiresAt', '<', now)
    .get();
  console.log('cleanExpiredBookings: found expired pending_bookings count=', snapshot.size);

  // Try to read slot timetables so hours mapping is consistent with creation
  let slotTimetables = null;
  try {
    const slotsSnap = await db.collection('variables').doc('boat_slots').get();
    if (slotsSnap.exists) slotTimetables = slotsSnap.data() || null;
  } catch (e) {
    console.warn('cleanExpiredBookings: could not fetch slot timetables', e);
  }

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() || {};
    const bookingId = docSnap.id;
    const { boatId, date, slotKey, captainId, secondaryBoatId, secondaryCaptainId } = data;

    console.log('cleanExpiredBookings: processing', { bookingId, boatId, date, slotKey, captainId, secondaryBoatId, secondaryCaptainId });

    // Remove booking references from boat and (optionally) captain months
    try {
      if (boatId && date && slotKey) {
        await removeBoatBooking({ boatId, date, slotKey, slotTimetables, captainId: captainId || null, editorId: 'system' });
        console.log('cleanExpiredBookings: removed references from boat/captain months for', bookingId);
      } else {
        console.warn('cleanExpiredBookings: missing boatId/date/slotKey, skipping removeBoatBooking for', bookingId);
      }
    } catch (e) {
      console.error('cleanExpiredBookings: Error removing booking from boat/captain months for', bookingId, e);
    }

    // Also release the paired boat for combined excursions
    try {
      if (secondaryBoatId && date && slotKey) {
        await removeBoatBooking({ boatId: secondaryBoatId, date, slotKey, slotTimetables, captainId: secondaryCaptainId || null, editorId: 'system' });
        console.log('cleanExpiredBookings: removed references from secondary boat/captain months for', bookingId);
      }
    } catch (e) {
      console.error('cleanExpiredBookings: Error removing booking from secondary boat/captain months for', bookingId, e);
    }

    // Remove from pending_bookings
    try {
      await db.collection('pending_bookings').doc(bookingId).delete();
      console.log('cleanExpiredBookings: deleted pending_bookings doc', bookingId);
    } catch (e) {
      console.error('cleanExpiredBookings: Error deleting pending_bookings for', bookingId, e);
    }
  }
});