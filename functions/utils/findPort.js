const findPort = async (admin, embarkVal, PORTS) => {
  const embarkIdToMatch = String(embarkVal || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  let port = { id: embarkIdToMatch || 'porto_antico', mapsUrl: null };
  try {
    const placesRef = admin.firestore().doc('variables/places');
    const placesSnap = await placesRef.get();
    const placesData = placesSnap.exists ? placesSnap.data() : null;
    let found = null;
    if (placesData) {
      if (Array.isArray(placesData.items)) {
        found = placesData.items.find(p => p && (p.id === embarkIdToMatch || p.key === embarkIdToMatch || p.slug === embarkIdToMatch));
      } else if (Array.isArray(placesData)) {
        found = placesData.find(p => p && (p.id === embarkIdToMatch || p.key === embarkIdToMatch || p.slug === embarkIdToMatch));
      } else {
        if (placesData[embarkIdToMatch]) found = placesData[embarkIdToMatch];
        if (!found) {
          const values = Object.values(placesData);
          found = values.find(p => p && (p.id === embarkIdToMatch || p.key === embarkIdToMatch || p.slug === embarkIdToMatch));
        }
      }
    }

    const mapsEntry = PORTS.find(p => p.id === (found && found.id) || p.id === embarkIdToMatch);
    if (found) {
      port = Object.assign({}, found);
      if (mapsEntry && mapsEntry.mapsUrl) port.mapsUrl = mapsEntry.mapsUrl;
    } else if (mapsEntry) {
      port = { id: mapsEntry.id, mapsUrl: mapsEntry.mapsUrl };
    } else {
      port = { id: embarkIdToMatch || 'porto_antico', mapsUrl: PORTS[0].mapsUrl };
    }
  } catch (e) {
    console.warn('findPort: failed to load variables/places from Firestore', e);
    const fallback = PORTS.find(p => p.id === embarkIdToMatch) || PORTS[0];
    port = { id: fallback.id, mapsUrl: fallback.mapsUrl };
  }

  return port;
};

module.exports = { findPort };
