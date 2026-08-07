import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBoatSlots, boatSlotsReady, getPlaces, placesReady } from '../utils/databaseVariables';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getBoatsWithAvailability, fetchCaptainsMonthAvailability } from '../utils/boatHelper';

import Navbar from '../components/Navbar';
import aperitivo from '../assets/aperitivo.webp';
import sanfruImg from '../assets/sanfru.webp';
import puntaChiappaImg from '../assets/puntachiappa.webp';
import specialImg from '../assets/special.webp';
import marianaImg from '../assets/mariana.webp';
import guestsStepIcon from '../assets/guests_book.svg';
import clockStepIcon from '../assets/clock_book.svg';
import calendarStepIcon from '../assets/calendar_book.svg';
import portStepIcon from '../assets/port_book.svg';
import '../App.css';
import BoatCard from "../components/BoatCard";
import Transfer from '../components/Transfer';
import BookingForm from '../components/BookingForm';
import { trackWhatsAppClick } from '../utils/googleAdsConversions';
import { computeTotalPrice, eurosToCents, computeTotalPriceWithDiscount, computeComboTotalPrice, computeComboTotalPriceWithDiscount } from '../utils/priceCalculator';
import { getDiscounts, discountsReady, getFlags, flagsReady } from '../utils/databaseVariables';
import { getLocale } from '../utils/locale';
import { getBookingUi } from '../locales/bookingUi';
import { getWhatsAppUrl } from '../utils/whatsapp';
import {
  filterSlotsForExperience,
  getGuestLimitForExperience,
  isBoatCompatibleWithExperience,
  normalizeExperienceQuery,
  getRainbowTourSlotDisplayName,
  hasFixedBookingTime,
} from '../utils/experienceBookingConfig';

const DEFAULT_PORT_NAME = 'Porto Antico';

// Puoi aggiungere altre immagini se disponibili

import './Book.css';

function Book({ lang = 'en', setLang = () => {} }) {
  const dict = getLocale(lang);
  const ui = getBookingUi(lang);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedExperienceId = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    return normalizeExperienceQuery(params.get('exp'));
  }, [location.search]);

  const selectedExperience = useMemo(
    () => (dict?.experienceCarousel?.experiences || []).find((item) => item.id === selectedExperienceId) || null,
    [dict, selectedExperienceId]
  );

  const experienceIdByTitle = useMemo(() => {
    const map = {};
    (dict?.experienceCarousel?.experiences || []).forEach((item) => {
      map[item.title] = item.id;
    });
    return map;
  }, [dict]);

  const experienceVisualById = {
    '0': sanfruImg,
    '1': aperitivo,
    '2': marianaImg,
    '3': specialImg,
    '4': puntaChiappaImg,
  };

  const getSlotDisplayName = (slot) => {
    if (selectedExperienceId === '0') return getRainbowTourSlotDisplayName(lang, slot.key) || slot.displayName;
    if (selectedExperienceId === '4') return '17:00 - 22:00';
    return slot.displayName;
  };

  const [animate, setAnimate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Load cached slot objects synchronously from module-level cache
  const initialSlotObjects = filterSlotsForExperience(getBoatSlots(), selectedExperienceId);
  const initialTimeOptions = (initialSlotObjects && initialSlotObjects.length)
    ? initialSlotObjects.map(getSlotDisplayName)
    : [];

  const [selectedTime, setSelectedTime] = useState(initialTimeOptions.length === 1 ? initialTimeOptions[0] : "");
  const [timeOptions, setTimeOptions] = useState(initialTimeOptions);
  const [selectedPeople, setSelectedPeople] = useState(dict.book.guestOptions?.[3] || "4 people");
  // Which single booking question ('experience' | 'guests' | 'time' | 'date' | 'transfer') is currently focused
  const [focusStep, setFocusStep] = useState(() => (selectedExperienceId ? 'guests' : 'experience'));
  // State for form visibility
  const [showForm, setShowForm] = useState(false);
  // State for the final recap/summary step shown before the data form
  const [showRecap, setShowRecap] = useState(false);
  // State for payment confirmed
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  // State for Transfer Embark (populated from data in `variables/places`)
  const initialPlacesMap = getPlaces();
  const fallbackEmbarkOptions = [];
  const initialEmbarkOptions = (initialPlacesMap && Object.keys(initialPlacesMap).length)
    ? Object.keys(initialPlacesMap).map(k => initialPlacesMap[k] && initialPlacesMap[k].name).filter(Boolean)
    : fallbackEmbarkOptions;

  const portoKey = 'porto_antico';
  const portoObj = initialPlacesMap && initialPlacesMap[portoKey];
  const portoName = (portoObj && portoObj.name) || DEFAULT_PORT_NAME;

  const [embarkOptions, setEmbarkOptions] = useState(initialEmbarkOptions);
  const [selectedEmbark, setSelectedEmbark] = useState(portoName);
  const [arrangePickup, setArrangePickup] = useState(false);
  // State for Transfer Disembark
  const [selectedDisembark, setSelectedDisembark] = useState(portoName);
  const [arrangeDropoff, setArrangeDropoff] = useState(false);

  // load flags (cached) and keep local state
  const [flags, setFlags] = useState(getFlags());
  useEffect(() => {
    let mounted = true;
    flagsReady.then(() => { if (mounted) setFlags(getFlags()); }).catch(() => { });
    return () => { mounted = false; };
  }, []);

  // When the places document loads, update options (fetched once in module)
  useEffect(() => {
    let mounted = true;
    placesReady.then(() => {
      if (!mounted) return;
      const places = getPlaces() || {};
      const names = Object.keys(places).map(k => places[k] && places[k].name).filter(Boolean);
      if (names.length) {
        const defaultPortName = places.porto_antico?.name || DEFAULT_PORT_NAME;
        setEmbarkOptions(names);
        setSelectedEmbark(prev => (prev && names.includes(prev)) ? prev : defaultPortName);
        setSelectedDisembark(prev => (prev && names.includes(prev)) ? prev : defaultPortName);
      }
    }).catch(err => console.error('placesReady rejected', err));
    return () => { mounted = false; };
  }, []);
  // State for selected day for each visible boat
  const [selectedDates, setSelectedDates] = useState([null, null, null, null]);
  useEffect(() => {
    // Activate animation after mount
    const timeout = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const guestLimit = getGuestLimitForExperience(selectedExperienceId);
    if (!guestLimit) return;

    const options = dict.book.guestOptions || [];
    const cappedOptions = options.filter((option) => {
      const match = String(option).match(/(\d+)/);
      return match ? Number(match[1]) <= guestLimit : true;
    });
    const preferredOption = options.find((option) => {
      const match = String(option).match(/(\d+)/);
      return match ? Number(match[1]) === guestLimit : false;
    });
    const fallbackOption = cappedOptions[cappedOptions.length - 1] || options[0] || selectedPeople;

    if (preferredOption) {
      setSelectedPeople(preferredOption);
    } else if (fallbackOption) {
      setSelectedPeople(fallbackOption);
    }
  }, [dict.book.guestOptions, selectedExperienceId]);

  // Add page-specific class to body so Book styles are scoped
  useEffect(() => {
    document.body.classList.add('page-book');
    return () => { document.body.classList.remove('page-book'); };
  }, []);

  // PASTE THIS HERE FOR SAFARI:
  useEffect(() => {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    // Set luxury blue on entry (change to your preferred hex)
    metaTheme.setAttribute('content', '#0a2540'); 

    // Restore dark color when exiting the Book page
    return () => {
      if (metaTheme) metaTheme.setAttribute('content', '#011010');
    };
  }, []);


  // Note: data is fetched once in module `src/utils/boatSlots.js` on import
  // When the module fetch actually completes, update local state
  useEffect(() => {
    let mounted = true;

    const applySlotOptions = () => {
      if (!mounted) return;
      const slots = filterSlotsForExperience(getBoatSlots(), selectedExperienceId);
      const names = (slots && slots.length)
        ? slots.map(getSlotDisplayName)
        : [];
      if (names.length) {
        setTimeOptions(names);
        setSelectedTime(prev => names.length === 1 ? names[0] : ((prev && names.includes(prev)) ? prev : ""));
      }
    };

    applySlotOptions();
    boatSlotsReady.then(applySlotOptions).catch(err => {
      console.error('boatSlotsReady rejected', err);
    });

    return () => { mounted = false; };
  }, [selectedExperienceId, lang]);

  // Boats loaded from Firestore (fallback to local static if needed)
  const [boats, setBoats] = useState([]);
  const [boatMonthCache, setBoatMonthCache] = useState({}); // key: `${boatId}_${monthKey}` -> doc
  const [selectedCaptain, setSelectedCaptain] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snaps = await getDocs(collection(db, 'boats'));
        if (!mounted) return;
        const docs = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length) setBoats(docs);
      } catch (e) {
        console.error('Error loading boats from firestore', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Reset selectedDate delle altre barche quando cambia activeIndex
  useEffect(() => {
    setSelectedDates(dates => dates.map((d, i) => (i === activeIndex ? d : null)));
  }, [activeIndex]);
  // map displayName -> slot key for quick lookup of selected slot
  const displayNameToSlotKey = {};
  // Clear selected date for the active boat when the selected time/slot changes
  // and the previously selected date is no longer available for the new slot.
  useEffect(() => {
    try {
      const sel = selectedDates[activeIndex];
      if (!sel) return;
      const [y, m, d] = sel.split('-');
      const date = new Date(+y, +m - 1, +d);

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const dateStr = `${year}-${month}-${day}`;
      const monthKey = `${year}-${month}`;
      const boatEntry = visibleBoats[activeIndex];
      const constituentIds = getConstituentBoatIds(boatEntry);
      const allLoaded = constituentIds.every(id => Boolean(boatMonthCache[`${id}_${monthKey}`]));

      // If month data is not loaded yet, keep current selection until validation data arrives.
      if (!allLoaded) {
        return;
      }

      // If date has passed, clear
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (date <= today) {
        setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd));
        return;
      }

      const slotKey = displayNameToSlotKey[selectedTime] || null;
      if (slotKey) {
        const tt = slotTimetables[slotKey] && slotTimetables[slotKey].timetable;
        if (!tt) {
          setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd));
          return;
        }
        const startHourNum = parseInt(String(tt.start).split(':')[0], 10);
        const finishHourNum = parseInt(String(tt.finish).split(':')[0], 10);
        const ok = isHourRangeAvailableForBoatEntry(boatEntry, dateStr, monthKey, startHourNum, finishHourNum, boatMonthCache);
        if (!ok) {
          setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd));
        }
      }
    } catch {
      // on error be conservative and clear selection
      try { setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd)); } catch { }
    }
  }, [selectedTime, activeIndex, selectedDates, boatMonthCache, boats, selectedPeople, selectedExperienceId]);

  // Helpers to support "combined excursion" boat entries (two real boats booked together,
  // e.g. Gourmet Sunset Cruise + "Rossa" for up to 15 guests). A combo entry exposes
  // `isCombo: true` and `comboBoatIds: [id1, id2]`; availability must hold for BOTH boats.
  const getConstituentBoatIds = (boatEntry) => (
    boatEntry && boatEntry.isCombo && Array.isArray(boatEntry.comboBoatIds)
      ? boatEntry.comboBoatIds
      : [boatEntry && boatEntry.id]
  );

  const isHourRangeAvailableForBoatEntry = (boatEntry, dateStr, monthKey, startHourNum, finishHourNum, cache) => {
    const ids = getConstituentBoatIds(boatEntry);
    return ids.every((id) => {
      if (!id) return false;
      const boatMonthDoc = cache[`${id}_${monthKey}`] || null;
      if (!boatMonthDoc) return false;
      const dayMap = (boatMonthDoc.availability && boatMonthDoc.availability[dateStr]) || {};
      for (let h = startHourNum; h < finishHourNum; h++) {
        if (!dayMap[h]) return false;
      }
      return true;
    });
  };

  // prepare visible boats and helper values
  const match = String(selectedPeople).match(/(\d+)/);
  const ppl = match ? parseInt(match[1], 10) : 1;
  const slotObjects = getBoatSlots();
  const slotTimetables = {};
  (slotObjects || []).forEach(s => { if (s && s.key) slotTimetables[s.key] = s; });
  (slotObjects || []).forEach(s => {
    if (s && s.key) {
      const displayName = getSlotDisplayName(s);
      if (s.displayName) displayNameToSlotKey[s.displayName] = s.key;
      if (displayName) displayNameToSlotKey[displayName] = s.key;
    }
  });
  const pad = v => String(v).padStart(2, '0');

  const getExperiencePriority = (item) => {
    const label = String(item?.name || item?.title || item?.id || '').toLowerCase();
    if (label.includes('aperitivo') || label.includes('gourmet') || label.includes('sunset')) return 0;
    if (label.includes('rainbow')) return 1;
    return 2;
  };

  // Boats eligible to be paired for a combined excursion (e.g. Gourmet Sunset Cruise + "Rossa").
  // Falls back to any available boat for the Gourmet experience so a newly added boat works
  // even if its name/description doesn't literally match one of the configured keywords.
  const getComboCandidateBoats = (availableBoats, experienceId) => {
    if (!experienceId) return [];
    const strict = availableBoats.filter((boat) => isBoatCompatibleWithExperience(boat, experienceId));
    if (strict.length >= 2) return strict;
    if (experienceId === '1' && availableBoats.length >= 2) return availableBoats;
    return strict;
  };

  // Highest guest count actually bookable right now (single boat, or combo of two boats).
  const computeMaxSelectableGuests = (boatsList, experienceId) => {
    const availableBoats = (boatsList || []).filter((b) => b.available !== false);
    if (!availableBoats.length) return null;

    let maxCapacity = Math.max(...availableBoats.map((b) => Number(b.guests || b.capacity || 1)));

    const compatibleBoats = getComboCandidateBoats(availableBoats, experienceId);
    if (compatibleBoats.length >= 2) {
      const sorted = [...compatibleBoats].sort((a, b) => Number(b.guests || b.capacity || 0) - Number(a.guests || a.capacity || 0));
      const comboCapacity = Number(sorted[0].guests || sorted[0].capacity || 0) + Number(sorted[1].guests || sorted[1].capacity || 0);
      maxCapacity = Math.max(maxCapacity, comboCapacity);
    }

    return maxCapacity;
  };

  const visibleBoats = (boats && boats.length)
    ? (() => {
      const availableBoats = boats.filter(b => b.available !== false);
      const baseCandidates = availableBoats.filter(b => (b.guests || b.capacity || 1) >= ppl);
      const experienceCandidates = selectedExperienceId
        ? baseCandidates.filter((boat) => isBoatCompatibleWithExperience(boat, selectedExperienceId))
        : baseCandidates;

      if (experienceCandidates.length) {
        return experienceCandidates.sort((a, b) => getExperiencePriority(a) - getExperiencePriority(b));
      }

      // No single boat can host this many guests for the selected experience: try a
      // combined excursion using two boats (e.g. Gourmet Sunset Cruise + "Rossa", up to 15 guests).
      if (selectedExperienceId) {
        const compatibleBoats = getComboCandidateBoats(availableBoats, selectedExperienceId);
        if (compatibleBoats.length >= 2) {
          const sorted = [...compatibleBoats].sort((a, b) => Number(b.guests || b.capacity || 0) - Number(a.guests || a.capacity || 0));
          const [boatA, boatB] = sorted;
          const comboCapacity = Number(boatA.guests || boatA.capacity || 0) + Number(boatB.guests || boatB.capacity || 0);
          if (comboCapacity >= ppl) {
            return [{
              id: `combo_${boatA.id}_${boatB.id}`,
              name: `${boatA.name || boatA.id} + ${boatB.name || boatB.id}`,
              available: true,
              guests: comboCapacity,
              isCombo: true,
              comboBoatIds: [boatA.id, boatB.id],
              comboBoatNames: [boatA.name || boatA.id, boatB.name || boatB.id],
              comboBoats: [boatA, boatB],
            }];
          }
        }
      }

      return baseCandidates.sort((a, b) => {
        const pa = getExperiencePriority(a);
        const pb = getExperiencePriority(b);
        return pa - pb;
      });
    })()
    : [
    { id: 2, name: "Leggera", available: true, background: "#011010", guests: 4 },
  ];

  // If selected guests are above available capacity, auto-fallback to the highest valid option.
  useEffect(() => {
    if (!boats || !boats.length) return;

    const maxCapacity = computeMaxSelectableGuests(boats, selectedExperienceId);
    if (maxCapacity == null) return;

    const selectedCountMatch = String(selectedPeople).match(/(\d+)/);
    const selectedCount = selectedCountMatch ? Number(selectedCountMatch[1]) : 1;

    if (selectedCount <= maxCapacity) return;

    const options = dict.book.guestOptions || [];
    const fallback = [...options]
      .reverse()
      .find((option) => {
        const match = String(option).match(/(\d+)/);
        return match ? Number(match[1]) <= maxCapacity : false;
      });

    if (fallback && fallback !== selectedPeople) {
      setSelectedPeople(fallback);
    }
  }, [boats, selectedPeople, dict.book.guestOptions, selectedExperienceId]);

  // Ensure selectedDates array matches visibleBoats length
  useEffect(() => {
    setSelectedDates(prev => {
      const next = Array(visibleBoats.length).fill(null);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
      return next;
    });
  }, [visibleBoats.length]);

  // Prefetch current month availability so calendar dates become selectable without manual month navigation.
  useEffect(() => {
    let cancelled = false;

    async function prefetchCurrentMonth() {
      if (showForm) return;
      if (!visibleBoats.length) return;

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const hasAllVisibleBoats = visibleBoats.every((boat) => getConstituentBoatIds(boat).every((id) => Boolean(boatMonthCache[`${id}_${monthKey}`])));
      if (hasAllVisibleBoats) return;

      try {
        const boatsWithAvail = await getBoatsWithAvailability(monthKey);
        if (cancelled) return;
        setBoatMonthCache((prev) => {
          const next = { ...prev };
          (boatsWithAvail || []).forEach((boat) => {
            next[`${boat.id}_${monthKey}`] = boat;
          });
          return next;
        });
      } catch (e) {
        console.error('prefetch current month availability failed', e);
      }
    }

    prefetchCurrentMonth();
    return () => { cancelled = true; };
  }, [visibleBoats, boatMonthCache, showForm]);

  // determine disembark options depending on selected slot
  const specialSlotKeys = ['sunset_aperitivo', 'full_day_aperitivo', 'full_aperitivo'];
  const selectedSlotKey = displayNameToSlotKey[selectedTime] || null;
  // require both that the selected slot is one of the aperitivo slots
  // and that flags.block_aperitivo is true
  const isAperitivoSlot = specialSlotKeys.includes(selectedSlotKey) && (flags && flags.block_aperitivo === true);
  const disembarkOptions = isAperitivoSlot ? (portoName ? [portoName] : embarkOptions) : embarkOptions;

  // When switching to an aperitivo slot, force selectedDisembark to porto_antico if present
  useEffect(() => {
    if (isAperitivoSlot) {
      if (portoName) setSelectedDisembark(portoName);
    }
  }, [isAperitivoSlot, portoName]);

  // Compute selected captain based on availability and priority when booking form opens
  const [selectedSecondaryCaptain, setSelectedSecondaryCaptain] = useState(null);
  useEffect(() => {
    let mounted = true;

    async function pickCaptainForBoat(captainIds, date, slotKey) {
      const caps = Array.isArray(captainIds) ? captainIds : [];
      if (caps.length === 0) return null;

      try {
        const monthKey = date.slice(0, 7);
        const capsAvailMap = await fetchCaptainsMonthAvailability(caps.map(String), monthKey);

        const tt = slotTimetables[slotKey] && slotTimetables[slotKey].timetable ? slotTimetables[slotKey].timetable : null;
        let startHourNum = null;
        let finishHourNum = null;
        if (tt && tt.start && tt.finish) {
          startHourNum = parseInt(String(tt.start).split(':')[0], 10);
          finishHourNum = parseInt(String(tt.finish).split(':')[0], 10);
        }
        if (startHourNum === null || finishHourNum === null) {
          return caps[0] || null;
        }

        for (const cap of caps) {
          const capKey = String(cap);
          const capMap = capsAvailMap[capKey] || {};
          const dayMap = capMap[date] || {};
          let ok = true;
          for (let h = startHourNum; h < finishHourNum; h++) {
            const k1 = String(h);
            const k2 = String(h).padStart(2, '0');
            if (!(dayMap[k1] === true || dayMap[k2] === true)) { ok = false; break; }
          }
          if (ok) return cap;
        }
        return caps[0] || null;
      } catch {
        return caps[0] || null;
      }
    }

    async function computeCaptain() {
      // reset if no form or no boat/date/slot
      if (!showForm) {
        if (mounted) { setSelectedCaptain(null); setSelectedSecondaryCaptain(null); }
        return;
      }
      const boat = visibleBoats[activeIndex];
      const date = selectedDates[activeIndex];
      const slotKey = displayNameToSlotKey[selectedTime] || null;
      if (!boat || !date || !slotKey) {
        if (mounted) { setSelectedCaptain(null); setSelectedSecondaryCaptain(null); }
        return;
      }

      if (boat.isCombo && Array.isArray(boat.comboBoats) && boat.comboBoats.length === 2) {
        const [boatA, boatB] = boat.comboBoats;
        const [chosenA, chosenB] = await Promise.all([
          pickCaptainForBoat(boatA.captains, date, slotKey),
          pickCaptainForBoat(boatB.captains, date, slotKey),
        ]);
        if (mounted) {
          setSelectedCaptain(chosenA);
          setSelectedSecondaryCaptain(chosenB);
        }
        return;
      }

      const chosen = await pickCaptainForBoat(boat.captains, date, slotKey);
      if (mounted) {
        setSelectedCaptain(chosen);
        setSelectedSecondaryCaptain(null);
      }
    }

    computeCaptain();
    return () => { mounted = false; };
  }, [showForm, activeIndex, selectedDates, selectedTime, visibleBoats, slotTimetables]);

  // Price calculation
  const formatCurrency = v => `€${Number(v || 0).toFixed(2)}`;
  // load discounts (cached) and keep local state so UI re-renders when ready
  const [discounts, setDiscounts] = useState(getDiscounts());
  useEffect(() => {
    let mounted = true;
    discountsReady.then(() => { if (mounted) setDiscounts(getDiscounts()); }).catch(() => { });
    return () => { mounted = false; };
  }, []);

  // History management for booking steps (list -> transfer -> form)
  const lastPushedStep = useRef('list');
  useEffect(() => {
    try {
      window.history.replaceState({ bookingStep: 'list' }, '');
      lastPushedStep.current = 'list';
    } catch { }

    const onPop = (ev) => {
      const step = (ev.state && ev.state.bookingStep) || 'list';
      // If payment confirmed or we're on the post-confirmation state, go to home
      if (step === 'confirmed' || step === 'postconfirm') {
        try { window.location.href = '/'; } catch { }
        return;
      }
      setShowForm(step === 'form');
      setShowRecap(step === 'recap');
      lastPushedStep.current = step;
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Push state when the visible booking step changes
  useEffect(() => {
    const step = showForm ? 'form' : showRecap ? 'recap' : 'list';
    if (step !== lastPushedStep.current) {
      try {
        window.history.pushState({ bookingStep: step }, '');
        lastPushedStep.current = step;
      } catch { }
    }
  }, [showForm, showRecap]);

  useEffect(() => {
    if (showForm || showRecap) window.scrollTo(0, 0);
  }, [showForm, showRecap]);

  const activeBoatEntry = visibleBoats[activeIndex] || {};
  const isComboActive = Boolean(activeBoatEntry.isCombo);

  const computedTotal = isComboActive
    ? computeComboTotalPrice({
      boatDocs: activeBoatEntry.comboBoats || [],
      placesMap: getPlaces(),
      slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
      embark: selectedEmbark,
      disembark: selectedDisembark,
      arrangePickup,
      arrangeDropoff,
      numPax: ppl,
    })
    : computeTotalPrice({
      boatDoc: activeBoatEntry,
      placesMap: getPlaces(),
      slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
      embark: selectedEmbark,
      disembark: selectedDisembark,
      arrangePickup,
      arrangeDropoff,
      numPax: ppl,
    });
  const computedTotalStr = formatCurrency(computedTotal);
  // compute discounted total (if a date is selected and discounts exist)
  const selDateStr = selectedDates[activeIndex] || null;
  const discountedTotalVal = (discounts && selDateStr) ? (isComboActive
    ? computeComboTotalPriceWithDiscount({
      boatDocs: activeBoatEntry.comboBoats || [],
      placesMap: getPlaces(),
      slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
      embark: selectedEmbark,
      disembark: selectedDisembark,
      arrangePickup,
      arrangeDropoff,
      numPax: ppl,
      bookingDate: selDateStr,
      discounts,
    })
    : computeTotalPriceWithDiscount({
      boatDoc: activeBoatEntry,
      placesMap: getPlaces(),
      slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
      embark: selectedEmbark,
      disembark: selectedDisembark,
      arrangePickup,
      arrangeDropoff,
      numPax: ppl,
      bookingDate: selDateStr,
      discounts,
    })) : computedTotal;
  const discountedTotalStr = formatCurrency(discountedTotalVal);
  const discountedAmountCents = eurosToCents(discountedTotalVal);
  const formatBookingDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const dt = new Date(+y, +m - 1, +d);
      return dt.toLocaleDateString(dict.localeCode || 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  const guestOptionsList = dict.book.guestOptions || ["1 person", "2 people", "3 people", "4 people", "5 people", "6 people", "7 people"];
  const experienceGuestLimit = getGuestLimitForExperience(selectedExperienceId);
  const maxSelectableGuests = computeMaxSelectableGuests(boats, selectedExperienceId);
  const guestSelectionLimit = (() => {
    const limits = [experienceGuestLimit, maxSelectableGuests]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!limits.length) return null;
    return Math.min(...limits);
  })();
  const filteredGuestOptions = guestSelectionLimit != null
    ? guestOptionsList.filter((option) => {
      const countMatch = String(option).match(/(\d+)/);
      return countMatch ? Number(countMatch[1]) <= guestSelectionLimit : true;
    })
    : guestOptionsList;
  const guestIndex = Math.max(0, filteredGuestOptions.indexOf(selectedPeople));
  const nextGuestOption = filteredGuestOptions[Math.min(filteredGuestOptions.length - 1, guestIndex + 1)];
  const nextGuestCountMatch = nextGuestOption ? String(nextGuestOption).match(/(\d+)/) : null;
  const nextGuestCount = nextGuestCountMatch ? Number(nextGuestCountMatch[1]) : null;
  const guestIncrementDisabled = guestIndex >= filteredGuestOptions.length - 1
    || (guestSelectionLimit != null && nextGuestCount != null && nextGuestCount > guestSelectionLimit);
  const dateTabLabel = selectedDates[activeIndex]
    ? (() => {
      const [y, m, d] = selectedDates[activeIndex].split('-');
      return new Date(+y, +m - 1, +d).toLocaleDateString(dict.localeCode || 'en-US', { day: 'numeric', month: 'short' });
    })()
    : ui.select;

  // Steps of the single-focus wizard, used to drive the sliding progress indicator.
  // 'experience' only appears while no experience has been chosen yet.
  const fixedBookingTime = hasFixedBookingTime(selectedExperienceId);
  const selectionSteps = fixedBookingTime ? ['guests', 'date', 'transfer'] : ['guests', 'time', 'date', 'transfer'];
  const wizardSteps = selectedExperienceId ? selectionSteps : ['experience', ...selectionSteps];
  const wizardStepIndex = Math.max(0, wizardSteps.indexOf(focusStep));
  const goToNextWizardStep = (currentStep) => {
    const currentIndex = wizardSteps.indexOf(currentStep);
    const nextStep = wizardSteps[currentIndex + 1];
    if (nextStep) setFocusStep(nextStep);
  };
  const hasSelectedPorts = Boolean(selectedEmbark && selectedDisembark);
  // A step's tab can only be jumped to once a value has actually been chosen for it
  const wizardStepHasValue = {
    experience: Boolean(selectedExperienceId),
    guests: true,
    time: Boolean(selectedTime),
    date: Boolean(selectedDates[activeIndex]),
    transfer: hasSelectedPorts,
  };
  // Every other step stays locked until an experience has been picked
  const experiencePending = wizardSteps.includes('experience') && !selectedExperienceId;
  const cleanPortLabel = (name) => (name || '').replace(/Extra Fee/gi, '').replace(/\s*\([^)]*\)/g, '').trim();
  const transferTabLabel = (() => {
    const embark = cleanPortLabel(selectedEmbark);
    const disembark = cleanPortLabel(selectedDisembark);
    if (!embark && !disembark) return ui.select;
    return embark === disembark ? embark : `${embark} - ${disembark}`;
  })();

  const handleExperienceSelect = (title) => {
    const nextExperienceId = experienceIdByTitle[title];
    if (!nextExperienceId || nextExperienceId === selectedExperienceId) return;

    const params = new URLSearchParams(location.search || '');
    params.set('exp', nextExperienceId);
    navigate({ pathname: `/${lang}/book`, search: `?${params.toString()}` });

    // brief delay so the selected card's blink feedback is visible before advancing
    setTimeout(() => {
      setShowForm(false);
      setActiveIndex(0);
      setSelectedDates((dates) => dates.map(() => null));
      setFocusStep('guests');
    }, 500);
  };

  const handleBookingBack = () => {
    try {
      window.history.back();
    } catch {
      if (showForm) {
        setShowForm(false);
        setShowRecap(true);
      } else if (showRecap) {
        setShowRecap(false);
      }
    }
  };

  return (
    <>
      <h1 className="sr-only">{dict.book.pageHeading || 'Book your private boat tour'}</h1>
      {paymentConfirmed ? (
        <div className="booking-confirmation">
          <div className="confirmation-card">
            <div className="confirmation-content">
              <h2>{dict.book.confirmationTitle}</h2>
              <p className="conf-boat-name">{visibleBoats[activeIndex]?.name}</p>
              <p className="conf-details">
                <strong>{dict.book.confirmationDay}</strong> {formatBookingDate(selectedDates[activeIndex])}
                <br />
                <strong>{dict.book.confirmationTime}</strong> {selectedTime}
                <br />
                <strong>{dict.book.confirmationEmbark}</strong> {selectedEmbark}
              </p>
              <div className="conf-actions">
                <button
                  className="conf-home-btn"
                  onClick={() => { try { window.location.href = `/${lang}`; } catch { } }}
                >
                  {dict.book.backHome}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navbar lang={lang} setLang={setLang} />

          <section className={`ap-picker${selectedExperienceId ? ' is-hidden' : ''}`} aria-label={ui.chooseExperience}>
            <p className="ap-picker-eyebrow">{ui.experience}</p>
            <div className="ap-picker-row">
              {(dict?.experienceCarousel?.experiences || []).map((item) => {
                const isSelected = item.id === selectedExperienceId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`ap-picker-card${isSelected ? ' is-selected' : ''}`}
                    onClick={() => handleExperienceSelect(item.title)}
                    aria-pressed={isSelected}
                  >
                    <span className="ap-picker-media">
                      {experienceVisualById[item.id] ? (
                        <img src={experienceVisualById[item.id]} alt={item.title} loading="lazy" decoding="async" />
                      ) : null}
                    </span>
                    <span className="ap-picker-title">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button type="button" className="ap-call-banner" onClick={() => { trackWhatsAppClick(); window.location.href = getWhatsAppUrl(lang); }} aria-label={dict.book.callButtonAria}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5.24782 12.9815C4.63328 13.3779 3.90097 13.5507 3.17402 13.4708C2.44708 13.3908 1.76983 13.063 1.25617 12.5424L0.807105 12.1033C0.610232 11.9019 0.5 11.6315 0.5 11.3499C0.5 11.0683 0.610232 10.7978 0.807105 10.5965L2.71312 8.71037C2.91281 8.51413 3.18158 8.40417 3.46156 8.40417C3.74153 8.40417 4.01031 8.51413 4.20999 8.71037C4.41136 8.90725 4.6818 9.01748 4.96342 9.01748C5.24504 9.01748 5.51547 8.90725 5.71684 8.71037L8.71058 5.71663C8.81045 5.61821 8.88976 5.50092 8.94389 5.37158C8.99802 5.24224 9.0259 5.10342 9.0259 4.96321C9.0259 4.82299 8.99802 4.68418 8.94389 4.55483C8.88976 4.42549 8.81045 4.3082 8.71058 4.20978C8.51434 4.0101 8.40438 3.74132 8.40438 3.46135C8.40438 3.18137 8.51434 2.9126 8.71058 2.71291L10.6066 0.816871C10.808 0.619997 11.0784 0.509766 11.36 0.509766C11.6417 0.509766 11.9121 0.619997 12.1135 0.816871L12.5526 1.26594C13.0731 1.7796 13.4009 2.45685 13.4809 3.18379C13.5609 3.91074 13.3881 4.64305 12.9916 5.25759C10.9259 8.30196 8.29751 10.9236 5.24782 12.9815Z" fill="#ffffff" />
            </svg>
            <span className="ap-call-banner-text">{dict.book.callButtonLabel}</span>
          </button>

          {showForm ? (
            <BookingForm
              lang={lang}
              onSubmit={data => {
                // when payment is confirmed inside BookingForm, start confirmation flow
                try {
                  if (data && data.success) {
                    setPaymentConfirmed(true);



                    // mark the confirmed state and push a post-confirm state so back -> home
                    try { window.history.replaceState({ bookingStep: 'confirmed' }, ''); } catch { }
                    try { window.history.pushState({ bookingStep: 'postconfirm' }, ''); lastPushedStep.current = 'postconfirm'; } catch { }
                  }
                } catch { }
                // allow parent to handle submission as well
              }}
              onSlotUnavailableRetry={async () => {
                try {
                  // determine monthKey from selected date if available, otherwise current month
                  const selDate = selectedDates[activeIndex];
                  let monthKey;
                  if (selDate) monthKey = selDate.slice(0, 7);
                  else {
                    const now = new Date();
                    monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
                  }

                  // fetch fresh availability for all boats for that month and update cache
                  const boatsWithAvail = await getBoatsWithAvailability(monthKey);
                  setBoatMonthCache(prev => {
                    const next = { ...prev };
                    (boatsWithAvail || []).forEach(b => {
                      const cacheKey = `${b.id}_${monthKey}`;
                      next[cacheKey] = b;
                    });
                    return next;
                  });

                  // reset the date selected for the active boat so UI refreshes
                  setSelectedDates(dates => dates.map((d, i) => i === activeIndex ? null : d));
                } catch (e) {
                  console.error('retry fetch availability failed', e);
                } finally {
                  setShowForm(false);
                }
              }}
              boatId={isComboActive ? activeBoatEntry.comboBoatIds?.[0] : (visibleBoats[activeIndex] && visibleBoats[activeIndex].id)}
              date={selectedDates[activeIndex]}
              slotKey={displayNameToSlotKey[selectedTime]}
              startTime={slotTimetables[displayNameToSlotKey[selectedTime]]?.timetable?.start || null}
              endTime={slotTimetables[displayNameToSlotKey[selectedTime]]?.timetable?.finish || null}
              captainId={selectedCaptain}
              secondaryBoatId={isComboActive ? activeBoatEntry.comboBoatIds?.[1] : null}
              secondaryCaptainId={isComboActive ? selectedSecondaryCaptain : null}
              secondaryBoatName={isComboActive ? activeBoatEntry.comboBoatNames?.[1] : null}
              embark={selectedEmbark}
              disembark={selectedDisembark}
              arrangePickup={arrangePickup}
              arrangeDropoff={arrangeDropoff}
              numPax={ppl}
              amountCents={discountedAmountCents}
              onBack={handleBookingBack}
            />
          ) : showRecap ? (
            <div className="ap-recap" aria-label={dict.book.recapTitle}>
              <div className="ap-section-head">
                <h2>{dict.book.recapTitle}</h2>
                <p>{dict.book.recapSubtitle}</p>
              </div>
              <div className="ap-recap-card">
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapExperience}</span>
                  <span className="ap-recap-value">{selectedExperience?.title || visibleBoats[activeIndex]?.name || ''}</span>
                </div>
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapGuests}</span>
                  <span className="ap-recap-value">{selectedPeople}</span>
                </div>
                {isComboActive ? (
                  <div className="ap-recap-row">
                    <span className="ap-recap-label">{ui.boats}</span>
                    <span className="ap-recap-value">{(activeBoatEntry.comboBoatNames || []).join(' + ')}</span>
                  </div>
                ) : null}
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapTime}</span>
                  <span className="ap-recap-value">{selectedTime}</span>
                </div>
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapDate}</span>
                  <span className="ap-recap-value">{formatBookingDate(selectedDates[activeIndex])}</span>
                </div>
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapEmbark}</span>
                  <span className="ap-recap-value">{selectedEmbark}</span>
                </div>
                <div className="ap-recap-row">
                  <span className="ap-recap-label">{dict.book.recapDisembark}</span>
                  <span className="ap-recap-value">{selectedDisembark}</span>
                </div>
                {arrangePickup ? (
                  <div className="ap-recap-row">
                    <span className="ap-recap-label">{dict.book.recapPickup}</span>
                    <span className="ap-recap-value">{dict.transfer.yes}</span>
                  </div>
                ) : null}
                {arrangeDropoff ? (
                  <div className="ap-recap-row">
                    <span className="ap-recap-label">{dict.book.recapDropoff}</span>
                    <span className="ap-recap-value">{dict.transfer.yes}</span>
                  </div>
                ) : null}
                <div className="ap-recap-row ap-recap-row-total">
                  <span className="ap-recap-label">{dict.book.recapTotal}</span>
                  <span className="ap-recap-value">
                    {discountedTotalStr !== computedTotalStr ? (
                      <>
                        <span className="ap-price-old">{computedTotalStr}</span>
                        <span className="ap-price-now">{discountedTotalStr}</span>
                      </>
                    ) : (
                      <span className="ap-price-now">{computedTotalStr}</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="ap-recap-actions">
                <button type="button" className="ap-flow-back" onClick={handleBookingBack}>
                  {ui.back}
                </button>
                <button type="button" className="ap-flow-next" disabled={!hasSelectedPorts} onClick={() => { setShowRecap(false); setShowForm(true); }}>
                  {dict.book.recapConfirm}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="ap-availability" aria-label={ui.availabilityAria}>
                <div className="ap-section-head ap-section-head-with-price">
                  <div>
                    <h2>
                      {selectedExperience
                        ? ui.customizeExperience(selectedExperience.title)
                        : ui.filtersTitle}
                    </h2>
                    <p>
                      {selectedExperience
                        ? ui.forExperience(selectedExperience.title)
                        : ui.chooseStart}
                    </p>
                  </div>
                  {selectedExperience ? (
                    <div className="ap-price-tag">
                      {discountedTotalStr !== computedTotalStr ? (
                        <>
                          <span className="ap-price-old">{computedTotalStr}</span>
                          <span className="ap-price-now">{discountedTotalStr}</span>
                        </>
                      ) : (
                        <span className="ap-price-now">{computedTotalStr}</span>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="ap-flow-tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${wizardSteps.length}, 1fr)` }}>
                  {wizardSteps.map((step, i) => {
                    const tabMeta = {
                      experience: { label: ui.experience, value: selectedExperience?.title || ui.select },
                      guests: { label: ui.guests, value: selectedPeople, icon: guestsStepIcon },
                      time: { label: ui.time, value: selectedTime || ui.select, icon: clockStepIcon },
                      date: { label: ui.date, value: dateTabLabel, icon: calendarStepIcon },
                      transfer: { label: ui.ports, value: transferTabLabel, icon: portStepIcon },
                    }[step];
                    const stepState = i === wizardStepIndex ? 'is-active' : (i < wizardStepIndex ? 'is-done' : 'is-upcoming');
                    const isClickable = step === 'experience' || (!experiencePending && (wizardStepHasValue[step] || focusStep === step));
                    return (
                      <button
                        key={step}
                        type="button"
                        role="tab"
                        aria-selected={focusStep === step}
                        disabled={!isClickable}
                        className={`ap-flow-tab ${stepState}`}
                        onClick={() => setFocusStep(step)}
                      >
                        {tabMeta.icon ? <img className="ap-flow-tab-icon" src={tabMeta.icon} alt="" aria-hidden="true" /> : null}
                        <span className="ap-flow-tab-text">
                          <span className="ap-flow-tab-label">{tabMeta.label}</span>
                          <span className="ap-flow-tab-value">{tabMeta.value}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="ap-flow-progress" aria-hidden="true">
                  <span
                    className="ap-flow-progress-fill"
                    style={{ width: `${((wizardStepIndex + 1) / wizardSteps.length) * 100}%` }}
                  />
                </div>

                <div className="ap-flow-counter" aria-live="polite">
                  {wizardStepIndex + 1}/{wizardSteps.length}
                </div>

                {selectedExperience ? (
                  <aside className="ap-live-summary" aria-label={dict.book.recapTitle}>
                    <div className="ap-live-summary-main">
                      <strong>{selectedExperience.title}</strong>
                      <span>{selectedPeople}</span>
                      {selectedTime ? <span>{selectedTime}</span> : null}
                      {selectedDates[activeIndex] ? <span>{dateTabLabel}</span> : null}
                    </div>
                    <div className="ap-live-summary-price">
                      {discountedTotalStr !== computedTotalStr ? <small>{computedTotalStr}</small> : null}
                      <strong>{discountedTotalStr}</strong>
                    </div>
                  </aside>
                ) : null}

                <div className="ap-flow-panel">
                  {focusStep === 'experience' ? (
                    <div className="ap-flow-step">
                      <h3>{ui.chooseExperience}</h3>
                      <p className="ap-flow-step-subtitle">{ui.chooseExperienceHint}</p>
                    </div>
                  ) : null}

                  {focusStep === 'guests' ? (
                    <div className="ap-flow-step">
                      <h3>{ui.guestQuestion}</h3>
                      <div className="ap-guest-stepper">
                        <button
                          type="button"
                          className="ap-stepper-btn"
                          disabled={guestIndex <= 0}
                          onClick={() => setSelectedPeople(guestOptionsList[Math.max(0, guestIndex - 1)])}
                          aria-label={ui.decreaseGuests}
                        >
                          −
                        </button>
                        <span className="ap-stepper-value">{selectedPeople}</span>
                        <button
                          type="button"
                          className="ap-stepper-btn"
                          disabled={guestIncrementDisabled}
                          onClick={() => setSelectedPeople(guestOptionsList[Math.min(guestOptionsList.length - 1, guestIndex + 1)])}
                          aria-label={ui.increaseGuests}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="ap-flow-next" onClick={() => goToNextWizardStep('guests')}>
                        {ui.continue}
                      </button>
                    </div>
                  ) : null}

                  {focusStep === 'time' ? (
                    <div className="ap-flow-step">
                      <h3>{ui.chooseTime}</h3>
                      <div className="ap-time-options">
                        {timeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`ap-time-pill${selectedTime === option ? ' is-selected' : ''}`}
                            onClick={() => { setSelectedTime(option); setTimeout(() => setFocusStep('date'), 500); }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {selectedExperienceId === '0' && (timeOptions || []).some((option) => String(option).toLowerCase().includes('aperitivo')) ? (
                        <div className="ap-slot-callout" role="note" aria-live="polite">
                          <div className="ap-slot-callout-icon" aria-hidden="true">
                            <span />
                          </div>
                          <div className="ap-slot-callout-copy">
                            <strong>{ui.aperitivoCalloutTitle}</strong>
                            <p>{ui.aperitivoCalloutText}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {focusStep === 'date' ? (
                    visibleBoats.length === 0 ? (
                      <div className="ap-empty-inline" role="status" aria-live="polite">
                        <h3>{ui.noBoats}</h3>
                        <p>
                          {lang === 'it'
                            ? 'Prova a ridurre il numero di ospiti o cambia fascia oraria. Puoi anche rimuovere la preselezione esperienza.'
                            : 'Try lowering the number of guests or changing the time slot. You can also remove the experience preselection.'}
                        </p>
                        <div className="booking-empty-actions">
                          <button
                            type="button"
                            className="booking-empty-btn primary"
                            onClick={() => {
                              const defaultGuests = dict.book.guestOptions?.[3] || dict.book.guestOptions?.[0] || selectedPeople;
                              setSelectedPeople(defaultGuests);
                              if (timeOptions?.length) setSelectedTime(timeOptions[0]);
                              setFocusStep('guests');
                            }}
                          >
                            {ui.reset}
                          </button>
                          <button
                            type="button"
                            className="booking-empty-btn ghost"
                            onClick={() => navigate(`/${lang}/book`)}
                          >
                            {ui.showAll}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ap-flow-step">
                        <h3>{ui.chooseDate}</h3>
                        <div className="ap-discount-legend" role="note" aria-label={`★ ${ui.earlyBirdLegend}`}>
                          <span className="discount-seal ap-discount-legend-seal" aria-hidden="true">★</span>
                          <span>{ui.earlyBirdLegend}</span>
                        </div>
                        <div className="ap-boat-block">
                          {(() => {
                            const idx = activeIndex;
                            const boat = visibleBoats[idx];
                            if (!boat) return null;
                            return (
                              <div key={boat.id} className={`boat-card-animate${animate ? ' in' : ''}`}>
                                <BoatCard
                                  calendarProps={{
                                    lang,
                                    selectedDate: selectedDates[idx],
                                    onDateSelect: date => {
                                      const y = date.getFullYear();
                                      const m = String(date.getMonth() + 1).padStart(2, '0');
                                      const d = String(date.getDate()).padStart(2, '0');
                                      const dateStr = `${y}-${m}-${d}`;
                                      setSelectedDates(dates => dates.map((d, i) => i === idx ? dateStr : d));
                                    },
                                    onMonthChange: async (year, month) => {
                                      // reset other boats' selected dates
                                      setSelectedDates(dates => dates.map((d, i) => i === idx ? null : d));
                                      // Prefetch availability for ALL boats for this month and populate cache
                                      try {
                                        const monthKey = `${year}-${pad(month + 1)}`;
                                        // If we already have cached entries for this month, skip fetching
                                        const haveMonth = Object.keys(boatMonthCache || {}).some(k => k.endsWith(`_${monthKey}`));
                                        if (!haveMonth) {
                                          const boatsWithAvail = await getBoatsWithAvailability(monthKey);
                                          setBoatMonthCache(prev => {
                                            const next = { ...prev };
                                            (boatsWithAvail || []).forEach(b => {
                                              const cacheKey = `${b.id}_${monthKey}`;
                                              next[cacheKey] = b;
                                            });
                                            return next;
                                          });
                                        }
                                      } catch (e) {
                                        console.error('fetchBoatsMonth failed', e);
                                      }
                                    },
                                    isDateEnabled: (date) => {
                                      try {
                                        const year = date.getFullYear();
                                        const month = pad(date.getMonth() + 1);
                                        const day = pad(date.getDate());
                                        const dateStr = `${year}-${month}-${day}`;
                                        const monthKey = `${year}-${month}`;
                                        const constituentIds = getConstituentBoatIds(boat);
                                        const allLoaded = constituentIds.every(id => Boolean(boatMonthCache[`${id}_${monthKey}`]));

                                        // If we don't yet have data for this month, be pessimistic
                                        if (!allLoaded) return false;

                                        // Check if date has passed (today and earlier cannot be booked)
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date <= today) return false;

                                        // Determine selected slot key (if any)
                                        const slotKey = displayNameToSlotKey[selectedTime] || null;

                                        // If a specific slot is selected, prefer slot-level check
                                        if (slotKey) {
                                          const startHour = slotTimetables[slotKey]["timetable"]["start"].split(":")[0];
                                          const finishHour = slotTimetables[slotKey]["timetable"]["finish"].split(":")[0];
                                          const startHourNum = parseInt(startHour, 10);
                                          const finishHourNum = parseInt(finishHour, 10);
                                          return isHourRangeAvailableForBoatEntry(boat, dateStr, monthKey, startHourNum, finishHourNum, boatMonthCache);
                                          // If no explicit info for this slot, fall through to other heuristics
                                        }

                                        // No information for this day -> treat as unavailable
                                        return false;
                                      } catch {
                                        return false;
                                      }
                                    },
                                    discounts: discounts,
                                  }}
                                />
                              </div>
                            );
                          })()}
                        </div>
                        {selectedDates[activeIndex] ? (
                          <button type="button" className="ap-flow-next" onClick={() => setFocusStep('transfer')}>
                            {ui.continue}
                          </button>
                        ) : null}
                      </div>
                    )
                  ) : null}

                  {focusStep === 'transfer' ? (
                    <div className="ap-flow-step ap-transfer-step">
                      <h3>{ui.portsTitle}</h3>
                      <p className="ap-flow-step-subtitle">{ui.portsHint}</p>
                      <Transfer
                        lang={lang}
                        embarkOptions={embarkOptions}
                        selectedEmbark={selectedEmbark}
                        onEmbarkChange={setSelectedEmbark}
                        arrangePickup={arrangePickup}
                        onPickupChange={setArrangePickup}
                        embarkLabel={dict.book.transferEmbarkLabel}
                        pickupLabel={dict.book.transferPickupLabel}
                      />
                      <Transfer
                        lang={lang}
                        embarkOptions={disembarkOptions}
                        selectedEmbark={selectedDisembark}
                        onEmbarkChange={setSelectedDisembark}
                        arrangePickup={arrangeDropoff}
                        onPickupChange={setArrangeDropoff}
                        embarkLabel={dict.book.transferDisembarkLabel}
                        pickupLabel={dict.book.transferPickupLabel}
                        className="transfer-margin-bottom"
                      />
                      <button type="button" className="ap-flow-next" disabled={!hasSelectedPorts} onClick={() => setShowRecap(true)}>
                        {ui.review}
                      </button>
                    </div>
                  ) : null}
                </div>
                {wizardStepIndex > 0 ? (
                  <button
                    type="button"
                    className="ap-flow-back"
                    onClick={() => setFocusStep(wizardSteps[wizardStepIndex - 1])}
                  >
                    {ui.back}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Book
