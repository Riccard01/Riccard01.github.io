import { getBoatsWithAvailability } from './boatHelper';
import { boatSlotsReady, getBoatSlots } from './databaseVariables';
import { filterSlotsForExperience, isBoatCompatibleWithExperience } from './experienceBookingConfig';

const SEARCH_DAYS = 62;
const PREVIEW_EXPERIENCE_IDS = ['1', '4', '0'];
const CACHE_TTL_MS = 5 * 60 * 1000;
const FIXED_OPERATING_HOURS = {
  '4': { startHour: 17, finishHour: 22, displayTime: '17:00' },
};

let cachedPreviews = null;
let cachedAt = 0;
let pendingRequest = null;

function pad(value) {
  return String(value).padStart(2, '0');
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + amount);
  return next;
}

function getSlotHours(slot) {
  const start = slot?.timetable?.start;
  const finish = slot?.timetable?.finish;
  if (!start || !finish) return null;

  const startHour = Number.parseInt(String(start).split(':')[0], 10);
  const finishHour = Number.parseInt(String(finish).split(':')[0], 10);
  if (!Number.isFinite(startHour) || !Number.isFinite(finishHour) || finishHour <= startHour) return null;

  return {
    startHour,
    finishHour,
    displayTime: `${pad(startHour)}:${pad(String(start).split(':')[1] || 0)}`,
  };
}

function isSlotAvailable(boat, day, startHour, finishHour) {
  const dayMap = boat?.availability?.[day] || {};
  for (let hour = startHour; hour < finishHour; hour += 1) {
    if (dayMap[String(hour)] !== true && dayMap[pad(hour)] !== true) return false;
  }
  return true;
}

function findNextForExperience(experienceId, dates, boatsByMonth, slots, now) {
  const fixedHours = FIXED_OPERATING_HOURS[experienceId] || null;
  const compatibleSlots = filterSlotsForExperience(slots, experienceId)
    .map((slot) => ({ slot, hours: fixedHours || getSlotHours(slot) }))
    .filter((entry) => entry.hours)
    .sort((a, b) => a.hours.startHour - b.hours.startHour);

  for (let dayOffset = 0; dayOffset < dates.length; dayOffset += 1) {
    const date = dates[dayOffset];
    const day = dateKey(date);
    const availableBoats = (boatsByMonth[monthKey(date)] || [])
      .filter((boat) => boat?.raw?.available !== false);
    const strictBoats = availableBoats
      .filter((boat) => isBoatCompatibleWithExperience({ id: boat.id, ...boat.raw }, experienceId));

    for (const { hours } of compatibleSlots) {
      if (dayOffset === 0 && now.getHours() >= hours.startHour) continue;
      const strictMatch = strictBoats.some((boat) => isSlotAvailable(boat, day, hours.startHour, hours.finishHour));
      const fallbackMatch = availableBoats.some((boat) => isSlotAvailable(boat, day, hours.startHour, hours.finishHour));
      if (strictMatch || fallbackMatch) {
        return { dayOffset, date: day, time: hours.displayTime };
      }
    }
  }

  return null;
}

async function fetchExperienceAvailabilityPreviews(now) {
  await boatSlotsReady;
  const slots = getBoatSlots();
  if (!slots.length) return {};

  const dates = Array.from({ length: SEARCH_DAYS }, (_, index) => addDays(now, index));
  const months = [...new Set(dates.map(monthKey))];
  const monthResults = await Promise.all(months.map(async (key) => [key, await getBoatsWithAvailability(key)]));
  const boatsByMonth = Object.fromEntries(monthResults);

  return Object.fromEntries(
    PREVIEW_EXPERIENCE_IDS.map((experienceId) => [
      experienceId,
      findNextForExperience(experienceId, dates, boatsByMonth, slots, now),
    ]),
  );
}

export async function getExperienceAvailabilityPreviews(now = new Date()) {
  if (cachedPreviews && Date.now() - cachedAt < CACHE_TTL_MS) return cachedPreviews;
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetchExperienceAvailabilityPreviews(now)
    .then((previews) => {
      cachedPreviews = previews;
      cachedAt = Date.now();
      return previews;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}