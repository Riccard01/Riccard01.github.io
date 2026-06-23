const admin = require('firebase-admin');
const https = require('https');

async function sendBookingConfirmationEmail({ db, bookingId, pendingData, intent }) {
  try {
    const hostingBase = process.env.GCLOUD_PROJECT ? `https://${process.env.GCLOUD_PROJECT}.web.app` : 'https://leggero-tours-gestionale.web.app';
    const PORTS = [
      { id: "porto_antico", mapsUrl: "https://maps.app.goo.gl/1KiRd4PbU27GshzT7" },
      { id: "recco", mapsUrl: "https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9" },
      { id: "portofino_extra_fee", mapsUrl: "https://maps.app.goo.gl/LrZCvqUgcyCTooV57" },
      { id: "camogli", mapsUrl: "https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8" },
      { id: "nervi", mapsUrl: "https://maps.app.goo.gl/XuiDvRzVVWZKnMNp8" },
      { id: "santa_margherita_ligure_extra_fee", mapsUrl: "https://maps.app.goo.gl/P8LV6Lk6X5GHpkNQ6" },
      { id: "rapallo_extra_fee", mapsUrl: "https://maps.google.com/?q=Porto+di+Recco" }
    ];

    const embarkVal = pendingData.customer?.embark;
    const embarkIdToMatch = String(embarkVal)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const { findPort } = require('./findPort');
    const port = await findPort(admin, embarkVal, PORTS);
    let slotName = "Tour";
    if (pendingData.slotKey) {
      try {
        const slotsRef = admin.firestore().doc('variables/boat_slots');
        const slotsSnap = await slotsRef.get();
        const slotsData = slotsSnap.exists ? slotsSnap.data() : null;
        let found = null;
        if (slotsData) {
          // If boat_slots stored as an array under a property like `items` or as a plain array
          if (Array.isArray(slotsData.items)) {
            found = slotsData.items.find(s => s.id === pendingData.slotKey || s.key === pendingData.slotKey);
          } else if (Array.isArray(slotsData)) {
            found = slotsData.find(s => s.id === pendingData.slotKey || s.key === pendingData.slotKey);
          } else {
            // If boat_slots stored as an object map, try direct key or search values
            if (slotsData[pendingData.slotKey]) found = slotsData[pendingData.slotKey];
            if (!found) {
              const values = Object.values(slotsData);
              found = values.find(s => s && (s.id === pendingData.slotKey || s.key === pendingData.slotKey || s.slug === pendingData.slotKey));
            }
          }
        }
        if (found && found.name) {
          slotName = found.name;
        } else {
          slotName = pendingData.slotKey.charAt(0).toUpperCase() + pendingData.slotKey.slice(1);
        }
      } catch (e) {
        console.warn('mailSender: failed to load boat_slots from Firestore', e);
        slotName = pendingData.slotKey.charAt(0).toUpperCase() + pendingData.slotKey.slice(1);
      }
    }
    // Check if image exists on hosting; fallback to default.jpg
    async function checkUrlExists(url, redirects = 0) {
      return new Promise((resolve) => {
        try {
          const req = https.request(url, { method: 'HEAD' }, (res) => {
            const code = res.statusCode || 0;
            if (code >= 200 && code < 300) return resolve(true);
            if (code >= 300 && code < 400 && res.headers && res.headers.location && redirects < 3) {
              const next = new URL(res.headers.location, url).toString();
              return resolve(checkUrlExists(next, redirects + 1));
            }
            return resolve(false);
          });
          req.on('error', () => resolve(false));
          req.end();
        } catch (e) {
          return resolve(false);
        }
      });
    }

    let imgUrl = `${hostingBase}/ports/${port.id}.jpg`;
    console.log('mailSender: checking image URL', imgUrl);
    try {
      const ok = await checkUrlExists(imgUrl);
      if (!ok) imgUrl = `${hostingBase}/ports/default.jpg`;
    } catch (e) {
      imgUrl = `${hostingBase}/ports/default.jpg`;
    }

    function capitalizeFirst(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }


    // Build email payload
    const emailPayload = {
      to: pendingData.customer?.email,
      message: {
        subject: `Leggero Tours - Booking Confirmation: ${capitalizeFirst(pendingData.boatId)}`,
        html: `
        <body style="background-color: #008FC9; font-family: 'Work Sans', sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fbfaff; border-radius: 16px; overflow: hidden; border: 1px solid #e1e7eb;">
            <img src="${imgUrl}" style="width: 100%; height: 260px; object-fit: cover;" />
            <div style="padding: 40px 32px;">
              <h1 style="font-family: 'Fraunces', serif; font-size: 38px; font-style: italic; color: #031824;">Booking confirmation!</h1>
              <p>Hi ${pendingData.customer?.fullName?.split(' ')[0] || 'Guest'}, and Thank You for choosing Leggero! Below you will find all the important details of your booking, keep this tight! For any questions, please call me anytime!</p>
              <div style="background: #ffffff; border: 1px solid #e1e7eb; padding: 24px; margin: 32px 0;">
                <p><strong>Boat:</strong> ${capitalizeFirst(pendingData.boatId)}</p>
                <p><strong>Date:</strong> ${new Date(pendingData.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p><strong>Slot:</strong> ${slotName}</p>
                <p><strong>Important notes you left:</strong> ${pendingData.customer?.notes || 'None'}</p>
                <p><strong>Taxi pickup:</strong> ${pendingData.customer?.arrangePickup ? 'Yes' : 'No'}</p>
                <p><strong>Taxi dropoff:</strong> ${pendingData.customer?.arrangeDropoff ? 'Yes' : 'No'}</p>
                <p><strong>Text Riccardo if you booked a taxi to arrange the location and time!</strong></p>
              </div>
              <a href="${port.mapsUrl}" style="background: #01091f; color: #ffffff; padding: 12px 28px; border-radius: 999px; text-decoration: none; display: inline-block;">View Port in Google Maps</a>
              <div style="margin-top: 48px;">
                <a href="https://wa.me/393463365699?text=Hi%20Riccardo" style="background: #25D366; color: #ffffff; padding: 12px 28px; border-radius: 999px; text-decoration: none; display: inline-block;">Chat with Captain Riccardo</a>
              </div>
            </div>
          </div>
        </body>`
      }
    };

    // Add to mail collection
    await db.collection('mail').add(emailPayload);

    return { ok: true };
  } catch (err) {
    console.error('sendBookingConfirmationEmail error:', err);
    throw err;
  }
}

module.exports = { sendBookingConfirmationEmail };
