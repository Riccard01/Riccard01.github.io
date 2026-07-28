import { useState, useEffect, useRef } from 'react';
import { getBoatSlots, boatSlotsReady, getPlaces, placesReady } from '../utils/databaseVariables';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getBoatsWithAvailability, fetchCaptainsMonthAvailability } from '../utils/boatHelper';

import Navbar from '../components/Navbar';
import Calendar from '../components/Calendar';
import aperitivo from '../assets/aperitivo.webp';
import leggera from '../assets/leggera.webp';
import '../App.css';
import BoatCard from "../components/BoatCard";
import DropDown from "../components/DropDown";
import service from "../assets/service.svg";
import guests from "../assets/guests.svg";
import Transfer from '../components/Transfer';
import BookingFooter from '../components/BookingFooter';
import BookingForm from '../components/BookingForm';
import maestrale from '../assets/leggera.webp'
import francy from '../assets/leggera.webp'
import allegra from '../assets/leggera.webp'
import { computeTotalPrice, eurosToCents, computeTotalPriceWithDiscount } from '../utils/priceCalculator';
import { getDiscounts, discountsReady, getFlags, flagsReady } from '../utils/databaseVariables';

// Puoi aggiungere altre immagini se disponibili

import './Book.css';

function Book() {
  const [animate, setAnimate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Load cached slot objects synchronously from module-level cache
  const initialSlotObjects = getBoatSlots();
  const initialTimeOptions = (initialSlotObjects && initialSlotObjects.length)
    ? initialSlotObjects.map(s => s.displayName)
    : [];

  const [selectedTime, setSelectedTime] = useState(initialTimeOptions[0]);
  const [timeOptions, setTimeOptions] = useState(initialTimeOptions);
  const [selectedPeople, setSelectedPeople] = useState("4 people");
  // State for transfer visibility
  const [showTransfer, setShowTransfer] = useState(false);
  // State for form visibility
  const [showForm, setShowForm] = useState(false);
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
  const portoName = portoObj && portoObj.name;

  const [embarkOptions, setEmbarkOptions] = useState(initialEmbarkOptions);
  const [selectedEmbark, setSelectedEmbark] = useState(portoName || initialEmbarkOptions[0] || "");
  const [arrangePickup, setArrangePickup] = useState(false);
  // State for Transfer Disembark
  const [selectedDisembark, setSelectedDisembark] = useState(portoName || initialEmbarkOptions[0] || "");
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
        setEmbarkOptions(names);
        const porto = places[portoKey] && places[portoKey].name;
        setSelectedEmbark(prev => (prev && names.includes(prev)) ? prev : (porto || names[0]));
        setSelectedDisembark(prev => (prev && names.includes(prev)) ? prev : (porto || names[0]));
      }
    }).catch(err => console.error('placesReady rejected', err));
    return () => { mounted = false; };
  }, []);
  // State for selected day for each visible boat
  const [selectedDates, setSelectedDates] = useState([null, null, null, null]);
  const bookRef = useRef(null);
  useEffect(() => {
    // Activate animation after mount
    const timeout = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  // Add page-specific class to body so Book styles are scoped
  useEffect(() => {
    document.body.classList.add('page-book');
    return () => { document.body.classList.remove('page-book'); };
  }, []);

// Sync Safari theme and body background with Summary opening
  useEffect(() => {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }

    // Check if there's a selected date for the active boat (Summary visible)
    const isSummaryVisible = !!selectedDates[activeIndex];

    if (isSummaryVisible) {
      // When the summary APPEARS: all luxury blue
      metaTheme.setAttribute('content', '#031824'); 
      document.body.style.backgroundColor = '#031824';
    } else {
      // When the summary DISAPPEARS: restore base dark colors
      metaTheme.setAttribute('content', '#FBFAFF'); 
      document.body.style.backgroundColor = '#FBFAFF'; 
    }

    // Safety: if the user leaves the page, reset everything
    return () => {
      if (metaTheme) metaTheme.setAttribute('content', '#FBFAFF');
      document.body.style.backgroundColor = '';
    };
  }, [selectedDates, activeIndex]);

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
    boatSlotsReady.then(() => {
      if (!mounted) return;
      const slots = getBoatSlots();
      const names = (slots && slots.length) ? slots.map(s => s.displayName) : [];
      if (names.length) {
        setTimeOptions(names);
        setSelectedTime(prev => (prev && names.includes(prev)) ? prev : names[0]);
      }
    }).catch(err => {
      console.error('boatSlotsReady rejected', err);
    });
    return () => { mounted = false; };
  }, []);

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

  // Pagination handling: update active index based on scroll
  useEffect(() => {
    const el = bookRef.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children);
      const scrollLeft = el.scrollLeft;
      const elWidth = el.offsetWidth;
      let minDiff = Infinity;
      let idx = 0;
      children.forEach((child, i) => {
        const childRect = child.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const diff = Math.abs(childRect.left - elRect.left);
        if (diff < minDiff) {
          minDiff = diff;
          idx = i;
        }
      });
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // trigger iniziale
    onScroll();
    return () => { if (el) el.removeEventListener('scroll', onScroll); };
  }, [boats, showForm, showTransfer, animate]);

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
      const boatId = visibleBoats[activeIndex] && visibleBoats[activeIndex].id;
      const cacheKey = `${boatId}_${monthKey}`;
      const boatMonthDoc = boatMonthCache[cacheKey] || null;

      // If we don't have month data yet, treat as unavailable and clear
      if (!boatMonthDoc) {
        setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd));
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
        const dayMap = (boatMonthDoc.availability && boatMonthDoc.availability[dateStr]) || {};
        let ok = true;
        for (let h = startHourNum; h < finishHourNum; h++) {
          if (!dayMap[h]) { ok = false; break; }
        }
        if (!ok) {
          setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd));
        }
      }
    } catch (e) {
      // on error be conservative and clear selection
      try { setSelectedDates(dates => dates.map((dd, i) => i === activeIndex ? null : dd)); } catch (_) { }
    }
  }, [displayNameToSlotKey]);

  // prepare visible boats and helper values
  const match = String(selectedPeople).match(/(\d+)/);
  const ppl = match ? parseInt(match[1], 10) : 1;
  const slotObjects = getBoatSlots();
  const slotTimetables = {};
  (slotObjects || []).forEach(s => { if (s && s.key) slotTimetables[s.key] = s; });
  (slotObjects || []).forEach(s => { if (s && s.key && s.displayName) displayNameToSlotKey[s.displayName] = s.key; });
  const pad = v => String(v).padStart(2, '0');
  const localImages = {
    Maestrale: maestrale,
    Leggera: leggera,
    Libeccio: aperitivo,
    Francy: francy,
    Allegra: allegra
  };

  const visibleBoats = (boats && boats.length) ? boats.filter(b => (b.guests || b.capacity || 1) >= ppl && (b.available !== false)) : [
    { id: 2, name: "Leggera", image: leggera, available: true, background: "#011010", guests: 4 },
  ];

  // Ensure selectedDates array matches visibleBoats length
  useEffect(() => {
    setSelectedDates(prev => {
      const next = Array(visibleBoats.length).fill(null);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
      return next;
    });
  }, [visibleBoats.length]);

  // determine disembark options depending on selected slot
  const specialSlotKeys = ['sunset_aperitivo', 'full_day_aperitivo'];
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
  useEffect(() => {
    let mounted = true;
    async function computeCaptain() {
      // reset if no form or no boat/date/slot
      if (!showForm) {
        if (mounted) setSelectedCaptain(null);
        return;
      }
      const boat = visibleBoats[activeIndex];
      const date = selectedDates[activeIndex];
      const slotKey = displayNameToSlotKey[selectedTime] || null;
      if (!boat || !date || !slotKey) {
        if (mounted) setSelectedCaptain(null);
        return;
      }

      try {
        const monthKey = date.slice(0, 7);
        const caps = Array.isArray(boat.captains) ? boat.captains : [];
        if (caps.length === 0) {
          if (mounted) setSelectedCaptain(null);
          return;
        }

        const capsAvailMap = await fetchCaptainsMonthAvailability(caps.map(String), monthKey);

        // derive slot hours from slotTimetables
        const tt = slotTimetables[slotKey] && slotTimetables[slotKey].timetable ? slotTimetables[slotKey].timetable : null;
        let startHourNum = null;
        let finishHourNum = null;
        if (tt && tt.start && tt.finish) {
          startHourNum = parseInt(String(tt.start).split(':')[0], 10);
          finishHourNum = parseInt(String(tt.finish).split(':')[0], 10);
        }
        // fallback: require availability check to pass at least for some hour (conservative)
        if (startHourNum === null || finishHourNum === null) {
          if (mounted) setSelectedCaptain(caps[0] || null);
          return;
        }

        // iterate captains in priority order (array order) and pick first that is available for all hours
        let chosen = null;
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
          if (ok) { chosen = cap; break; }
        }

        if (!chosen) chosen = caps[0] || null;
        if (mounted) setSelectedCaptain(chosen);
      } catch (e) {
        if (mounted) setSelectedCaptain(boat.captains && boat.captains[0] ? boat.captains[0] : null);
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
    } catch (e) { }

    const onPop = (ev) => {
      const step = (ev.state && ev.state.bookingStep) || 'list';
      // If payment confirmed or we're on the post-confirmation state, go to home
      if (step === 'confirmed' || step === 'postconfirm') {
        try { window.location.href = '/'; } catch (e) { }
        return;
      }
      if (step === 'list') {
        setShowForm(false);
        setShowTransfer(false);
      } else if (step === 'transfer') {
        setShowForm(false);
        setShowTransfer(true);
      } else if (step === 'form') {
        setShowForm(true);
        setShowTransfer(false);
      }
      lastPushedStep.current = step;
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Push state when the visible booking step changes
  useEffect(() => {
    const step = showForm ? 'form' : (showTransfer ? 'transfer' : 'list');
    if (step !== lastPushedStep.current) {
      try {
        window.history.pushState({ bookingStep: step }, '');
        lastPushedStep.current = step;
      } catch (e) { }
    }
  }, [showTransfer, showForm]);

  const computedTotal = computeTotalPrice({
    boatDoc: visibleBoats[activeIndex] || {},
    placesMap: getPlaces(),
    slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
    embark: selectedEmbark,
    disembark: selectedDisembark,
    arrangePickup,
    arrangeDropoff,
    numPax: ppl,
  });
  const computedTotalStr = formatCurrency(computedTotal);
  const computedAmountCents = eurosToCents(computedTotal);
  // compute discounted total (if a date is selected and discounts exist)
  const selDateStr = selectedDates[activeIndex] || null;
  const discountedTotalVal = (discounts && selDateStr) ? computeTotalPriceWithDiscount({
    boatDoc: visibleBoats[activeIndex] || {},
    placesMap: getPlaces(),
    slotObj: slotTimetables[displayNameToSlotKey[selectedTime]] || null,
    embark: selectedEmbark,
    disembark: selectedDisembark,
    arrangePickup,
    arrangeDropoff,
    numPax: ppl,
    bookingDate: selDateStr,
    discounts,
  }) : computedTotal;
  const discountedTotalStr = formatCurrency(discountedTotalVal);
  const discountedAmountCents = eurosToCents(discountedTotalVal);
  const formatBookingDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const dt = new Date(+y, +m - 1, +d);
      return dt.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateStr; }
  };

  return (
    <>
      {paymentConfirmed ? (
        <div className="booking-confirmation">
          <div className="confirmation-card">
            <div className="confirmation-content">
              <h2>Prenotazione confermata</h2>
              <p className="conf-boat-name">{visibleBoats[activeIndex]?.name}</p>
              <p className="conf-details">
                <strong>Giorno:</strong> {formatBookingDate(selectedDates[activeIndex])}
                <br />
                <strong>Ora:</strong> {selectedTime}
                <br />
                <strong>Imbarco:</strong> {selectedEmbark}
              </p>
              <div className="conf-actions">
                <button
                  className="conf-home-btn"
                  onClick={() => { try { window.location.href = '/'; } catch (e) { } }}
                >
                  Torna alla home
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {(showTransfer || showForm) && !paymentConfirmed && (
            <div className="booking-topbar">
              <button
                className="booking-back-arrow"
                onClick={() => { try { window.history.back(); } catch (e) { } }}
                aria-label="Indietro"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          {/* <Navbar /> */}
          {showForm ? (
            <BookingForm
              onSubmit={data => {
                // when payment is confirmed inside BookingForm, start confirmation flow
                try {
                  if (data && data.success) {
                    setPaymentConfirmed(true);

                    // AGGIUNGI QUESTA RIGA PER GOOGLE ADS:
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'conversion', {
                        'send_to': 'AW-18340336234/FOTtCPyloNQcEOqkralE'
                      });
                    }

                    // mark the confirmed state and push a post-confirm state so back -> home
                    try { window.history.replaceState({ bookingStep: 'confirmed' }, ''); } catch (e) { }
                    try { window.history.pushState({ bookingStep: 'postconfirm' }, ''); lastPushedStep.current = 'postconfirm'; } catch (e) { }
                  }
                } catch (e) { }
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
                  setShowTransfer(false);
                }
              }}
              boatId={visibleBoats[activeIndex] && visibleBoats[activeIndex].id}
              date={selectedDates[activeIndex]}
              slotKey={displayNameToSlotKey[selectedTime]}
              startTime={slotTimetables[displayNameToSlotKey[selectedTime]]?.timetable?.start || null}
              endTime={slotTimetables[displayNameToSlotKey[selectedTime]]?.timetable?.finish || null}
              captainId={selectedCaptain}
              embark={selectedEmbark}
              disembark={selectedDisembark}
              arrangePickup={arrangePickup}
              arrangeDropoff={arrangeDropoff}
              numPax={ppl}
              amountCents={discountedAmountCents}
            />
          ) : showTransfer ? (
            <div className="transfer-page-wrapper" style={{ paddingBottom: '180px' }}>
              {/* Transfer Imbarco */}
              <Transfer
                embarkOptions={embarkOptions}
                selectedEmbark={selectedEmbark}
                onEmbarkChange={setSelectedEmbark}
                arrangePickup={arrangePickup}
                onPickupChange={setArrangePickup}
                embarkLabel="Imbarco"
                pickupLabel="Richiedi private transfer fino al porto"
              />
              {/* Transfer Sbarco */}
              <Transfer
                embarkOptions={disembarkOptions}
                selectedEmbark={selectedDisembark}
                onEmbarkChange={setSelectedDisembark}
                arrangePickup={arrangeDropoff}
                onPickupChange={setArrangeDropoff}
                embarkLabel="Sbarco"
                pickupLabel="Richiedi private transfer fino al porto"
                className="transfer-margin-bottom"
              />
              <BookingFooter
                total={computedTotalStr}
                originalTotal={computedTotalStr}
                discountedTotal={discountedTotalStr}
                showButton={false}
                showTransferButton={true}
                onTransferClick={() => setShowForm(true)}

                // AGGIUNGI QUESTE RIGHE QUI SOTTO: GEMINI
                selectedBoatName={visibleBoats[activeIndex]?.name}
                selectedSlot={selectedTime}
                selectedDate={selectedDates[activeIndex]}
                selectedGuests={selectedPeople}

                // AGGIUNGI QUESTE DUE RIGHE QUI:
                arrangePickup={arrangePickup}
                arrangeDropoff={arrangeDropoff}

                // AGGIUNGI QUESTE DUE RIGHE:
                selectedEmbark={selectedEmbark}
                selectedDisembark={selectedDisembark}

                boatImage={visibleBoats[activeIndex]?.image || localImages[visibleBoats[activeIndex]?.name]}

              />
            </div>
          ) : (
            <>
              {/* <div className="available-days-label">{availableDays} soluzioni disponibili</div> */}
              <div className="book-dropdowns-wrapper">
                <div className="dropdown-orari-flex">
                  <DropDown
                    text="Orario"
                    value={selectedTime}
                    options={timeOptions}
                    onChange={setSelectedTime}
                    width="100%"
                  />
                </div>
                <div className="dropdown-persone-fit">
                  <DropDown
                    text="Guests"
                    value={selectedPeople}
                    options={["1 person", "2 people", "3 people", "4 people", "5 people", "6 people", "7 people"]}
                    onChange={setSelectedPeople}
                    width="fit-content"
                  />
                </div>
              </div>
              <div className="cta">{visibleBoats.length} solutions for the selected filters.</div>
              <div
                ref={bookRef}
                className={`book${!animate ? ' animating' : ''}`}
                style={!animate ? { overflowX: 'visible' } : {}}
              >
                {visibleBoats.map((boat, idx) => (
                  <div
                    key={boat.id}
                    className="book-card-wrapper book-card-slide"
                  >
                    <div className={`boat-card-animate${animate ? ' in' : ''}`}>
                      <BoatCard
                        name={boat.name}
                        image={boat.image || localImages[boat.name]}
                        background={boat.background || "#011010"}
                        calendarProps={{
                          selectedDate: selectedDates[idx],
                          onDateSelect: date => {
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${y}-${m}-${d}`;
                            setSelectedDates(dates => dates.map((d, i) => i === idx ? dateStr : d));
                          },
                          onSelectBoat: () => setShowTransfer(true),
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
                              const cacheKey = `${boat.id}_${monthKey}`;
                              const boatMonthDoc = boatMonthCache[cacheKey] || null;

                              // If we don't yet have data for this month, be pessimistic
                              if (!boatMonthDoc) return false;

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
                                const dayMap = boatMonthDoc.availability || {};
                                const times = dayMap[dateStr] || {};
                                // Check if any hour between start and finish is not available
                                const startHourNum = parseInt(startHour, 10);
                                const finishHourNum = parseInt(finishHour, 10);
                                for (let h = startHourNum; h < finishHourNum; h++) {
                                  if (!times[h]) return false;
                                }
                                return true;
                                // If no explicit info for this slot, fall through to other heuristics
                              }

                              // No information for this day -> treat as unavailable
                              return false;
                            } catch (e) {
                              return false;
                            }
                          },
                          discounts: discounts,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination dots */}
              <div className="book-pagination">
                {visibleBoats.map((boat, idx) => (
                  <span
                    key={boat.id}
                    className={`book-dot${activeIndex === idx ? ' active' : ''}`}
                  />
                ))}
              </div>
{/* SHOW THE FOOTER WITH SUMMARY ONLY IF DAY IS SELECTED */}
{/* WRAPPER WITH SLIDEDOWN ANIMATION */}
              <div className={`booking-footer-slide-wrapper ${selectedDates[activeIndex] ? 'visible' : ''}`}>
                <BookingFooter
                  total={computedTotalStr}
                  originalTotal={computedTotalStr}
                  discountedTotal={discountedTotalStr}
                  buttonLabel="Proceed to Checkout"
                  buttonDisabled={false}
                  onButtonClick={() => setShowTransfer(true)}
                  showButton={true}
                  showTransferButton={false}
                  selectedBoatName={visibleBoats[activeIndex]?.name}
                  selectedSlot={selectedTime}
                  selectedDate={selectedDates[activeIndex]}
                  selectedGuests={selectedPeople}
                  boatImage={visibleBoats[activeIndex]?.image || localImages[visibleBoats[activeIndex]?.name]}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Book
