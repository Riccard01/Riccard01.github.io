const admin = require('firebase-admin');
const { findPort } = require('../utils/findPort');

// Copy the same PORTS array used by mailSender
const PORTS = [
  { id: 'porto_antico', mapsUrl: 'https://maps.app.goo.gl/1KiRd4PbU27GshzT7' },
  { id: 'recco', mapsUrl: 'https://maps.app.goo.gl/y9Vd4XEkNfk1rzFZ9' },
  { id: 'portofino_extra_fee', mapsUrl: 'https://maps.app.goo.gl/LrZCvqUgcyCTooV57' },
  { id: 'camogli', mapsUrl: 'https://maps.app.goo.gl/nSBDUQtvk8TzoESQ8' },
  { id: 'nervi', mapsUrl: 'https://maps.google.com/?q=Porto+di+Recco' },
  { id: 'santa_margherita_ligure_extra_fee', mapsUrl: 'https://maps.google.com/?q=Porto+di+Recco' },
  { id: 'rapallo_extra_fee', mapsUrl: 'https://maps.google.com/?q=Porto+di+Recco' }
];

async function main() {
  const embarkVal = process.argv[2] || 'Porto Antico';

  if (!admin.apps.length) {
    // Initialize with projectId so emulator can be used via FIRESTORE_EMULATOR_HOST
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'demo-project' });
  }

  try {
    const port = await findPort(admin, embarkVal, PORTS);
    console.log('findPort result for', embarkVal, '\n', JSON.stringify(port, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
