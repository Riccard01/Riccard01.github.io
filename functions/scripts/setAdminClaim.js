// functions/scripts/setAdminClaim.js
const fs = require('fs');
const path = require('path');
const child = require('child_process');

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.error('firebase-admin non installato. Esegui `npm install firebase-admin` nella cartella functions.');
  process.exit(1);
}

async function initAdmin() {
  // 1) Try local serviceAccountKey.json (functions/serviceAccountKey.json)
  const localKey = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (fs.existsSync(localKey)) {
    const serviceAccount = require(localKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
    });
    console.log('Initialized admin from local serviceAccountKey.json');
    return;
  }

  // 2) If not present, try to read gcloud config project and set env var for project id
  try {
    const proj = child.execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
    if (proj && proj !== '(unset)') {
      process.env.GOOGLE_CLOUD_PROJECT = proj;
      process.env.GCLOUD_PROJECT = proj;
      console.log('Set GOOGLE_CLOUD_PROJECT from gcloud config:', proj);
    }
  } catch (e) {
    // ignore - gcloud may not be installed
  }

  // 3) Initialize using ADC (requires gcloud ADC or GOOGLE_APPLICATION_CREDENTIALS env set)
  try {
    admin.initializeApp();
    console.log('Initialized admin using Application Default Credentials (ADC).');
    return;
  } catch (e) {
    console.error('Failed to initialize admin with ADC:', e && e.message ? e.message : e);
    throw e;
  }
}

async function setAdminClaim(uid) {
  try {
    await initAdmin();
  } catch (e) {
    console.error('Initialization failed. See suggestions in script header.');
    process.exit(1);
  }

  if (!uid) {
    console.error('Usage: node setAdminClaim.js <UID>');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('admin claim set for', uid);
    process.exit(0);
  } catch (err) {
    console.error('error setting claim', err);
    process.exit(1);
  }
}

const uid = process.argv[2];
setAdminClaim(uid);