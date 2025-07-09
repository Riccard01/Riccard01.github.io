let CONSTANTS = {
  tourOptions: {
    experience: ["Wild Tour", "Rainbow Tour", "Gourmet Sunset Cruise"],
    slot: ["Tour Slot", "Full Day"],
    combo: ["Oh yeah! (extended to midnight)", "No combo"],
    groupType: ["Private", "Shared"]
  },
  texts: {
    people: "People",
    peopleMax: (max) => `People`,
    slotTimes: {
      "Tour Slot": "9am - 1.30pm",
      "Full Day": "9am - 6pm",
      "Rainbow Tour": "2pm - 6pm",
      "Gourmet Sunset Cruise": "6.30pm - midnight"
    },
    summary: {
      experience: "Experience",
      slot: "Slot",
      combo: "Combo",
      people: "People",
      groupType: "Group Type",
      date: "Date",
      price: "€"
    },
    loading: 'Loading available dates...'
  }
};

// Example: availabilityByMonth[month][day][slot]
let availabilityByMonth = {}; // Will be filled from Google Sheets
let eventDates = [];
let tourDetailsRetrived = {};

function fetchAvailability() {
  // Replace with your actual web app URL
  const url = 'https://script.google.com/macros/s/AKfycbxpmQJL8PSFWv1YlRhQFT7DoF5GMmzUJZ4wvSiUnswkDzkRJglVf0UYs6mC7nB1zT-1cA/exec';
  return $.getJSON(url).then(data => {
    availabilityByMonth = data.availability;
    tourDetailsRetrived = data.tours;
    CONSTANTS.texts.slotTimes = {
      "Tour Slot": `${tourDetailsRetrived["Wild Tour (private)"].orarioInizio} - ${tourDetailsRetrived["Wild Tour (private)"].orarioFine}`,
      "Full Day": `${tourDetailsRetrived["Full Day (private)"].orarioInizio} - ${tourDetailsRetrived["Full Day (private)"].orarioFine}`,
      "Rainbow Tour": `${tourDetailsRetrived["Rainbow Tour (private)"].orarioInizio} - ${tourDetailsRetrived["Rainbow Tour (private)"].orarioFine}`,
      "Gourmet Sunset Cruise": `${tourDetailsRetrived["Gourmet Sunset Cruise (private)"].orarioInizio} - ${tourDetailsRetrived["Gourmet Sunset Cruise (private)"].orarioFine}`
    }
  });
}

let slotsUsed = [];

let selections = {
  experience: "",
  slot: "",
  combo: "",
  people: 2,
  groupType: "",
  date: ""
};

let fp; // flatpickr instance
let isSettingDate = false; // Add this at the top, after let fp;
let lastViewedMonth = null; // Track the last viewed month in flatpickr

$(document).ready(function () {

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // --- Add loading overlay HTML and CSS ---
  if ($('#loading-overlay').length === 0) {
    $('body').append(`
      <div id="loading-overlay" style="display:none;position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;background:rgba(42,93,143,0.18);backdrop-filter:blur(1.5px);display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;display:flex;flex-direction:column;align-items:center;">
          <div class="spinner" style="margin-bottom:18px;width:48px;height:48px;border:6px solid #eaf4fb;border-top:6px solid #2a5d8f;border-radius:50%;animation:spin 1s linear infinite;"></div>
          <div style="color:#2a5d8f;font-size:1.25em;font-weight:600;letter-spacing:0.5px;">${CONSTANTS.texts.loading}</div>
        </div>
      </div>
    `);
    // Spinner animation CSS
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  function showLoadingOverlay() {
    $('#loading-overlay').fadeIn(150);
  }
  function hideLoadingOverlay() {
    $('#loading-overlay').fadeOut(150);
  }

  function showFakeLoadingOverlay(t = 100) {
    showLoadingOverlay();
    setTimeout(hideLoadingOverlay, t);
  }

  document.getElementById('continueBtn').disabled = true;
  // Show loading overlay
  showLoadingOverlay();
  $('#options-div').css("display", "none"); // Hide options until loaded
  fetchAvailability().then(() => {
    $('#options-div').css("display", "block");
    populateDropdown("experience");
    // Ensure the visible value matches the selection from the URL
    $(".option-row[data-key='experience'] .option-value p").first().text(selections.experience);
    updateUI();
    // Set eventDates for sunset logic
    updateEventDates();
    // Initialize flatpickr only after data is loaded and calendar is ready
    fp = flatpickr("#calendar-input", {
      inline: true,
      appendTo: document.getElementById('calendar'),
      minDate: "today",
      dateFormat: "Y-m-d",
      onReady: function (selectedDates, dateStr, instance) {
        const calendarContainer = instance.calendarContainer;
        const monthNav = calendarContainer.querySelector(".flatpickr-months");
        const monthElement = $("select.flatpickr-monthDropdown-months")[0];
        if (!monthElement) return;

        // Get month name
        const monthNames = instance.l10n.months.longhand;
        const currentMonthName = monthNames[monthElement.selectedIndex];
        const currentYear = instance.currentYear;

        // Create left-aligned span for month and year
        const label = document.createElement("span");
        label.className = "flatpickr-month-name";
        label.textContent = `${currentMonthName} ${currentYear}`;
        instance._customMonthSpan = label;

        // Create new layout container
        const navWrapper = document.createElement("div");
        navWrapper.className = "custom-month-nav";

        const left = document.createElement("div");
        left.className = "custom-month-year-label";
        left.appendChild(label);

        const right = document.createElement("div");
        right.className = "custom-arrows-container";

        const prevArrow = monthNav.querySelector(".flatpickr-prev-month");
        const nextArrow = monthNav.querySelector(".flatpickr-next-month");
        right.appendChild(prevArrow);
        right.appendChild(nextArrow);

        navWrapper.appendChild(left);
        navWrapper.appendChild(right);

        // Clear old nav and insert new
        monthNav.innerHTML = "";
        monthNav.appendChild(navWrapper);
      },

      onMonthChange: function (selectedDates, dateStr, instance) {
        lastViewedMonth = new Date(instance.currentYear, instance.currentMonth, 1);
        updateMonthYearLabel(instance);
      },

      onYearChange: function (selectedDates, dateStr, instance) {
        lastViewedMonth = new Date(instance.currentYear, instance.currentMonth, 1);
        updateMonthYearLabel(instance);
      },

      onChange: function (selectedDates, dateStr) {
        if (isSettingDate) return;
        selections.date = dateStr;
        if (selectedDates && selectedDates.length > 0) {
          lastViewedMonth = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1);
        }
        updateUI();
        document.getElementById('continueBtn').disabled = !dateStr;
      },

      onDayCreate: function (dObj, dStr, fp, dayElem) {
        const date = dayElem.dateObj;
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() + 1);
        const yyyyMMdd = prevDate.toISOString().split("T")[0];
        if (eventDates.includes(yyyyMMdd)) {
          const icon = document.createElement("span");
          icon.classList.add("event-icon");
          icon.innerHTML = `<img src="assets/icons/locked.svg" alt="" />`;
          dayElem.appendChild(icon);
        }
        updateMonthYearLabel(fp);
      }
    });

    // Helper to update month/year text
    function updateMonthYearLabel(instance) {
      if (instance._customMonthSpan) {
        const monthNames = instance.l10n.months.longhand;
        const month = monthNames[instance.currentMonth];
        const year = instance.currentYear;
        instance._customMonthSpan.textContent = `${month} ${year}`;
      }
    }

    updateCalendar();
    updateUI();
    // Hide loading overlay
    hideLoadingOverlay();
  });

  // --- Set experience from URL if present ---
  function getExperienceFromURL() {
    const params = new URLSearchParams(window.location.search);
    const exp = (params.get('experience') || '').toLowerCase();
    if (exp === 'wild') return CONSTANTS.tourOptions.experience[0];
    if (exp === 'rainbow') {
      selections.combo = CONSTANTS.tourOptions.combo[1];
      return CONSTANTS.tourOptions.experience[1];
    }
    if (exp === 'sunset') return CONSTANTS.tourOptions.experience[2];
    return CONSTANTS.tourOptions.experience[0]; // default
  }
  selections.experience = getExperienceFromURL();

  $('#continueBtn').on('click', function () {
    $('#step-1').hide();
    $('#step-2').show();
    updateSummaryAndPrice();
  });

  $('#backBtn').on('click', function () {
    $('#step-2').hide();
    $('#step-1').show();
  });

  let paypalRendered = false;

  $('#bookBtn').on('click', function () {
    $('#paypal-overlay').show();

    const bookingData = {
      mode: 'createOrder',
      tour: selections.experience,     // e.g. "Wild Tour"
      persone: selections.people,      // e.g. 3
      privato: selections.groupType == "Private" ? "Sì" : "No",
      data: selections.date,
      note: selections.note || ""
    };
    
    // Prevent multiple renders
    if (paypalRendered) return;

    fetch('https://script.google.com/macros/s/AKfycbxpmQJL8PSFWv1YlRhQFT7DoF5GMmzUJZ4wvSiUnswkDzkRJglVf0UYs6mC7nB1zT-1cA/exec', {
      method: 'POST',
      body: new URLSearchParams(bookingData)
    })
      .then(res => res.json())
      .then(data => {
        if (!data.orderId) {
          throw new Error(`No PayPal order ID returned (${data.error})`);
        }

        paypalRendered = true;

        paypal.Buttons({
          style: {
            layout: 'vertical'
          },
          createOrder: function () {
            return data.orderId; // use server-created order ID
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              completePaymentInformation(data.orderID);
              $('#paypal-overlay').hide();
            });
          },
          onCancel: function () {
            $('#paypal-overlay').hide();
          },
          onError: function (err) {
            console.error('Payment error', err);
            $('#paypal-overlay').hide();
          }
        }).render('#paypal-button-wrapper');
      })
      .catch(err => {
        console.error("Failed to create PayPal order:", err);
        $('#paypal-overlay').hide();
      });
  });

  // Close on X click
  $('#paypal-close').on('click', function () {
    $('#paypal-overlay').hide();
  });

  // Toggle dropdowns
  $('.option-row').on('click', function (e) {
    if (!isMobile) {
      e.stopPropagation();
      if ($(this).hasClass('locked')) return;

      $('.option-row').not(this).removeClass('dropdown-open');
      $(this).toggleClass('dropdown-open');
    }
  });

  $('.native-overlay-select').on('focus click', function () {

    const $select = $(this);
    const $row = $select.closest('.option-row');
    const $dropdownItems = $row.find('.dropdown-content .dropdown-item');

    // Clear and repopulate the select
    $select.empty();

    $dropdownItems.each(function () {
      const text = $(this).text().trim();
      $select.append(`<option value="${text}">${text}</option>`);
      const $row = $select.closest('.option-row');
      const currentText = $row.find('.option-value p').text().trim();

      const indexToSelect = $select.find('option').toArray().findIndex(opt => opt.text === currentText);

      if (indexToSelect >= 0) {
        $select[0].selectedIndex = indexToSelect;
      };
    });
  });


  if (!isMobile) {
    $('.native-overlay-select').css('pointer-events', 'none');
  }

  // Handle dropdown selection
  $('.dropdown-content').on('click', '.dropdown-item', function (e) {
    e.stopPropagation();
    handleDropdownSelection($(this).closest('.option-row'), $(this).text());
  });

  $('.native-overlay-select').on('change', function () {
    handleDropdownSelection($(this).closest('.option-row'), $(this).val());
  });


  function handleDropdownSelection($row, value) {
    const key = $row.data('key');

    showFakeLoadingOverlay();

    if (key === "slot") {
      value = value.split(' (')[0];
    }

    selections[key] = value;
    $row.find('.option-value p').first().text(value);
    $('.option-row').removeClass('dropdown-open');

    const availableDates = getAvailableDatesForSelection();
    if (!availableDates.includes(selections.date)) {
      if (key === 'combo' && value === CONSTANTS.tourOptions.combo[0]) {
        selections.date = "";
        if (fp) fp.clear();
      } else if (key !== 'combo') {
        selections.date = "";
        if (fp) fp.clear();
      }
    }

    updateUI();
    updateCalendar();
  }


  // Remove ?experience from URL if user changes experience manually
  $(".option-row[data-key='experience'] .dropdown-content").on('click', '.dropdown-item', function () {
    selections.combo = CONSTANTS.tourOptions.combo[1];
    const url = new URL(window.location.href);
    if (url.searchParams.has('experience')) {
      url.searchParams.delete('experience');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  });

  // Close dropdowns when clicking outside
  $(document).on('click', () => $('.option-row').removeClass('dropdown-open'));

  function populateDropdown(key) {
    const $row = $(`.option-row[data-key="${key}"]`);
    const $dropdown = $row.find('.dropdown-content');
    $dropdown.empty();
    CONSTANTS.tourOptions[key].forEach(opt => {
      $dropdown.append(`<div class="dropdown-item">${opt}</div>`);
    });
    // Set default if not valid
    if (!CONSTANTS.tourOptions[key].includes(selections[key])) {
      selections[key] = CONSTANTS.tourOptions[key][0] || "";
      $row.find('.option-value p').first().text(selections[key]);
    }
  }

  let prevExperience = selections.experience;
  function updateUI() {
    const isGourmet = selections.experience === CONSTANTS.tourOptions.experience[2];

    // Get slot availability for the selected date
    let wild = {}, rainbow = {}, sunset = {};
    if (selections.date) {
      const [year, month, day] = selections.date.split("-");
      const monthKey = `${year}-${month}`;
      const dayKey = day.padStart(2, "0");
      const dayAvailability = availabilityByMonth[monthKey] && availabilityByMonth[monthKey][dayKey];
      if (dayAvailability) {
        wild = dayAvailability.wild || {};
        rainbow = dayAvailability.rainbow || {};
        sunset = dayAvailability.sunset || {};
      }
    }

    // Group Type
    const $groupRow = $('.option-row[data-key="groupType"]');
    const $groupText = $groupRow.find('.option-value p').first();
    const $groupDD = $groupRow.find('.dropdown-content').empty();
    const $groupIcon = $groupRow.find('.option-subtitle img');

    // Determine if group type should be locked to Private
    let lockGroupType = false;
    let allowShared = false;
    if (isGourmet) {
      allowShared = true;
    } else if (
      (selections.experience === CONSTANTS.tourOptions.experience[0] || // Wild Tour
        selections.experience === CONSTANTS.tourOptions.experience[1])   // Rainbow Tour
    ) {
      // If Full Day or Combo is selected, lock to Private
      if (
        selections.slot === CONSTANTS.tourOptions.slot[1] || // Full Day
        selections.combo === CONSTANTS.tourOptions.combo[0]   // Oh yeah! (extended to midnight)
      ) {
        lockGroupType = true;
      } else {
        allowShared = true;
      }
    }

    if (allowShared) {
      $groupRow.removeClass('locked');
      $groupDD.empty();
      CONSTANTS.tourOptions.groupType.forEach(opt => {
        $groupDD.append(`<div class="dropdown-item">${opt}</div>`);
      });
      // Default groupType based on experience change
      if (prevExperience !== selections.experience) {
        if (selections.experience === CONSTANTS.tourOptions.experience[2]) { // Gourmet Sunset Cruise
          selections.groupType = "Shared";
        } else {
          selections.groupType = "Private";
        }
      } else if (!CONSTANTS.tourOptions.groupType.includes(selections.groupType)) {
        selections.groupType = "Private";
      }
      $groupText.text(selections.groupType);
    } else {
      selections.groupType = "Private";
      $groupText.text("Private");
      $groupRow.addClass('locked');
    }
    // Cambia icona lock/unlock in base al tipo di gruppo
    if ($groupIcon.length) {
      if (selections.groupType === "Private") {
        $groupIcon.attr('src', 'assets/icons/locked.svg');
        $groupIcon.attr('alt', 'Locked');
      } else {
        $groupIcon.attr('src', 'assets/icons/unlocked.svg');
        $groupIcon.attr('alt', 'Unlocked');
      }
    }
    prevExperience = selections.experience;

    // Slot + Combo visibility
    const $slotRow = $('.option-row[data-key="slot"]');
    const $slotDD = $slotRow.find('.dropdown-content').empty();
    const $comboRow = $('.option-row[data-key="combo"]');
    $slotRow.toggle(!isGourmet);
    $comboRow.toggle(!isGourmet);

    if (!isGourmet) {
      // Lock slot dropdown if Rainbow Tour is selected
      if (selections.experience === CONSTANTS.tourOptions.experience[1] || selections.experience === CONSTANTS.tourOptions.experience[2]) { // Rainbow Tour
        selections.slot = CONSTANTS.tourOptions.slot[0];
        $slotRow.find('.option-value p').first().text(`${CONSTANTS.tourOptions.slot[0]} (${CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]]})`);
        $slotRow.addClass('locked');
        $slotDD.append(`<div class="dropdown-item disabled">${CONSTANTS.tourOptions.slot[0]} (${CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]]})</div>`);
      } else {
        // Fix: Determine slot availability for Wild Tour
        let slotOptions = [];
        if (selections.experience === CONSTANTS.tourOptions.experience[0]) { // Wild Tour
          slotOptions.push({ label: CONSTANTS.tourOptions.slot[0], time: CONSTANTS.texts.slotTimes["Tour Slot"] });
          slotOptions.push({ label: CONSTANTS.tourOptions.slot[1], time: CONSTANTS.texts.slotTimes["Full Day"] });
        } else {
          slotOptions.push({ label: CONSTANTS.tourOptions.slot[0], time: CONSTANTS.texts.slotTimes["Tour Slot"] });
        }

        slotOptions.forEach(opt => {
          $slotDD.append(`<div class="dropdown-item">${opt.label} (${opt.time})</div>`);
        });

        // Update visible value with time
        let selectedOpt = slotOptions.find(opt => opt.label === selections.slot);
        if (!selectedOpt) {
          selectedOpt = slotOptions[0];
          selections.slot = selectedOpt ? selectedOpt.label : "";
        }
        if (selectedOpt) {
          $slotRow.find('.option-value p').first().text(`${selectedOpt.label} (${selectedOpt.time})`);
        }

        // Only lock if there is one or zero options
        if (slotOptions.length <= 1) {
          $slotRow.addClass('locked');
        } else {
          $slotRow.removeClass('locked');
        }
      }
    } else {
      // Gourmet Sunset Cruise
      $slotRow.show(); // Always show slot row for Gourmet
      $slotRow.find('.option-value p').first().text(CONSTANTS.tourOptions.slot[0] + ' (' + CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[2]] + ')');
      $slotRow.addClass('locked');
      $slotDD.empty();
      $slotDD.append(`<div class="dropdown-item disabled">${CONSTANTS.tourOptions.slot[0]} (${CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[2]]})</div>`);
    }

    // Combo
    const $comboDD = $comboRow.find('.dropdown-content').empty();
    let comboDisabled = false;

    // Combo should only be disabled if not slot 2 (Full Day), not Oh yeah! (extended to midnight) selected, and not Rainbow Tour
    // Otherwise, always allow clicking Oh yeah! (extended to midnight) to clear the date
    if (
      !(selections.slot === CONSTANTS.tourOptions.slot[1]) && // Not Full Day
      !(selections.combo === CONSTANTS.tourOptions.combo[0]) && // Not Oh yeah! (extended to midnight)
      !(selections.experience === CONSTANTS.tourOptions.experience[1]) // Not Rainbow Tour
    ) {
      // Only disable if sunset is reserved or booked
      if (sunset && (sunset.reserved || sunset.booked > 0)) {
        comboDisabled = true;
      }
      // Also disable for Wild Tour and not Full Day
      if (
        selections.experience === CONSTANTS.tourOptions.experience[0] &&
        selections.slot !== CONSTANTS.tourOptions.slot[1]
      ) {
        comboDisabled = true;
      }
    }

    CONSTANTS.tourOptions.combo.forEach(opt => {
      const disabled = comboDisabled && opt === CONSTANTS.tourOptions.combo[0] ? ' disabled' : '';
      $comboDD.append(`<div class="dropdown-item${disabled}">${opt}</div>`);
    });

    // Only auto-select No combo if combo is actually disabled and Oh yeah! (extended to midnight) is not selected
    if ((comboDisabled && selections.combo !== CONSTANTS.tourOptions.combo[0]) || selections.experience === CONSTANTS.tourOptions.experience[0] && selections.slot === CONSTANTS.tourOptions.slot[0]) {
      selections.combo = CONSTANTS.tourOptions.combo[1];
      $comboRow.addClass('locked');
    } else {
      $comboRow.removeClass('locked');
    }

    // Update visible value
    $comboRow.find('.option-value p').first().text(selections.combo);

    // People max
    const $peopleRow = $('.option-row[data-key="people"]');
    const $peopleDD = $peopleRow.find('.dropdown-content').empty();
    const $peopleText = $peopleRow.find('.option-value p').first();
    const $peopleSubtitle = $peopleRow.find('.option-subtitle p');

    let maxPeople = 6;
    if (isGourmet) {
      maxPeople = 6;
      $peopleSubtitle.text(CONSTANTS.texts.peopleMax(maxPeople));
    } else {
      $peopleSubtitle.text(CONSTANTS.texts.people);
    }

    for (let i = 1; i <= maxPeople; i++) {
      $peopleDD.append(`<div class="dropdown-item">${i}</div>`);
    }

    if (selections.people > maxPeople) {
      selections.people = maxPeople;
      $peopleText.text(maxPeople);
    } else if (selections.people < 1) {
      selections.people = Math.min(2, maxPeople);
      $peopleText.text(selections.people);
    } else {
      $peopleText.text(selections.people);
    }

    // Slot usage
    if (selections.experience === CONSTANTS.tourOptions.experience[0]) { // Wild Tour
      slotsUsed = [1];
      if (selections.slot === CONSTANTS.tourOptions.slot[1]) { // Full Day
        slotsUsed.push(2);
      }
      if (selections.combo === CONSTANTS.tourOptions.combo[0]) { // Oh yeah! (extended to midnight)
        slotsUsed.push(3);
      }
    } else if (selections.experience === CONSTANTS.tourOptions.experience[1]) { // Rainbow Tour
      slotsUsed = [2];
      if (selections.combo === CONSTANTS.tourOptions.combo[0]) {
        slotsUsed.push(3);
      }
    } else if (selections.experience === CONSTANTS.tourOptions.experience[2]) { // Gourmet Sunset Cruise
      slotsUsed = [3];
    }


    // At the end, check if continue button should be enabled
    const required = ['experience', 'people', 'groupType'];
    const extraRequired = [];
    if (!selections.experience.includes("Gourmet")) {
      extraRequired.push('slot', 'combo');
    }

    // --- Live Price Update for Step 1 ---
    let tourKey = selections.experience;
    // Handle Combo for Rainbow Tour (private only)
    if (
      selections.experience === CONSTANTS.tourOptions.experience[1] && // Rainbow Tour
      selections.combo === CONSTANTS.tourOptions.combo[0] && // Oh yeah! (extended)
      selections.groupType === "Private"
    ) {
      tourKey = "Rainbow + Combo";
    }
    // Handle Luxury Day (Wild Tour + Full Day + Combo, always private)
    if (
      selections.experience === CONSTANTS.tourOptions.experience[0] && // Wild Tour
      selections.slot === CONSTANTS.tourOptions.slot[1] && // Full Day
      selections.combo === CONSTANTS.tourOptions.combo[0]
    ) {
      tourKey = "Luxury Day";
    }
    if (
      selections.experience === CONSTANTS.tourOptions.experience[0] && // Wild Tour
      selections.slot === CONSTANTS.tourOptions.slot[1] && // Full Day
      selections.combo === CONSTANTS.tourOptions.combo[1]
    ) {
      tourKey = "Full Day";
    }
    // Add group type suffix
    if (selections.groupType === "Shared") {
      tourKey += " (shared, prezzo a persona)";
    } else {
      tourKey += " (private)";
    }

    const tour = tourDetailsRetrived?.[tourKey];
    let basePrice = tour?.prezzo || 0;
    const isPerPerson = selections.groupType === "Shared" && tourKey.includes("shared");
    const totalPrice = isPerPerson ? basePrice * selections.people : basePrice;

    $('#step1-price').text(`${CONSTANTS.texts.summary.price} ${totalPrice.toFixed(2)}`);
  }

  // Helper: get ISO week string (YYYY-Www)
  function getISOWeek(dateStr) {
    const date = new Date(dateStr);
    const dayNum = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - dayNum);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
  }

  function getAvailableDatesForSelection() {
    const { experience, slot, combo, people, groupType } = selections;
    if (!experience) return [];
    let availableDates = [];
    // Shared logic for all experiences, now per week
    if (groupType === "Shared") {
      const weeks = {};
      Object.entries(availabilityByMonth).forEach(([month, days]) => {
        Object.entries(days).forEach(([day, slots]) => {
          let slotObj;
          if (experience === CONSTANTS.tourOptions.experience[0]) slotObj = slots.wild || {};
          else if (experience === CONSTANTS.tourOptions.experience[1]) slotObj = slots.rainbow || {};
          else if (experience === CONSTANTS.tourOptions.experience[2]) slotObj = slots.sunset || {};
          else slotObj = {};
          const dateStr = `${month}-${day.padStart(2, "0")}`;
          const weekKey = getISOWeek(dateStr);
          if (!weeks[weekKey]) weeks[weekKey] = { preferred: [], fallback: [] };
          if (
            !slotObj.reserved &&
            slotObj.booked > 0 &&
            (slotObj.max - slotObj.booked) >= people
          ) {
            weeks[weekKey].preferred.push(dateStr);
          } else if (
            !slotObj.reserved &&
            slotObj.booked === 0
          ) {
            weeks[weekKey].fallback.push(dateStr);
          }
        });
      });
      Object.values(weeks).forEach(({ preferred, fallback }) => {
        if (preferred.length > 0) {
          availableDates.push(...preferred);
        } else {
          availableDates.push(...fallback);
        }
      });
      return availableDates;
    }
    // --- NEW LOGIC: Gourmet Sunset Cruise, Private ---
    if (
      experience === CONSTANTS.tourOptions.experience[2] &&
      groupType === "Private"
    ) {
      Object.entries(availabilityByMonth).forEach(([month, days]) => {
        Object.entries(days).forEach(([day, slots]) => {
          const sunset = slots.sunset || {};
          // Exclude if already booked (regardless of reserved)
          if (sunset.booked > 0) return;
          if (sunset.reserved) return;
          if ((sunset.max - sunset.booked) < people) return;
          availableDates.push(`${month}-${day.padStart(2, "0")}`);
        });
      });
      return availableDates;
    }
    Object.entries(availabilityByMonth).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, slots]) => {
        let valid = true;
        for (const slotNum of slotsUsed) {
          let slotObj;
          if (slotNum === 1) slotObj = slots.wild || {};
          else if (slotNum === 2) slotObj = slots.rainbow || {};
          else if (slotNum === 3) slotObj = slots.sunset || {};
          if (slotObj.reserved) { valid = false; break; }
          if (slotObj.booked > 0) { valid = false; break; }
          if ((slotObj.max - slotObj.booked) < people) { valid = false; break; }
        }
        if (valid) availableDates.push(`${month}-${day.padStart(2, "0")}`);
      });
    });
    return availableDates;
  }

  function updateEventDates() {
    eventDates = [];
    if (selections.groupType === "Shared") {
      const weeks = {};
      Object.entries(availabilityByMonth).forEach(([month, days]) => {
        Object.entries(days).forEach(([day, slots]) => {
          let slotObj;
          if (selections.experience === CONSTANTS.tourOptions.experience[0]) slotObj = slots.wild || {};
          else if (selections.experience === CONSTANTS.tourOptions.experience[1]) slotObj = slots.rainbow || {};
          else if (selections.experience === CONSTANTS.tourOptions.experience[2]) slotObj = slots.sunset || {};
          else slotObj = {};
          const dateStr = `${month}-${day.padStart(2, "0")}`;
          const weekKey = getISOWeek(dateStr);
          if (!weeks[weekKey]) weeks[weekKey] = { preferred: [], fallback: [] };
          if (
            !slotObj.reserved &&
            slotObj.booked > 0 &&
            (slotObj.max - slotObj.booked) >= selections.people
          ) {
            weeks[weekKey].preferred.push(dateStr);
          } else if (
            !slotObj.reserved &&
            slotObj.booked === 0
          ) {
            weeks[weekKey].fallback.push(dateStr);
          }
        });
      });
      Object.values(weeks).forEach(({ preferred, fallback }) => {
        if (preferred.length > 0) {
          eventDates.push(...fallback);
        }
      });
    } else if (selections.experience === CONSTANTS.tourOptions.experience[2] && selections.groupType === "Private") {
      // --- NEW LOGIC: Private, do not show icon for booked or reserved ---
      eventDates = [];
    }
  }

  function updateCalendar() {
    if (!fp || typeof fp.set !== 'function') return;
    updateEventDates();
    let availableDates = getAvailableDatesForSelection();

    // Prevent selecting today if slot start time already passed
    if (availableDates.includes(flatpickr.formatDate(new Date(), 'Y-m-d'))) {
      // Get slot start time string
      let slotTimeStr = '';
      if (selections.experience && selections.experience.includes('Gourmet')) {
        slotTimeStr = CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[2]];
      } else if (selections.experience === CONSTANTS.tourOptions.experience[1]) {
        slotTimeStr = CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]];
      } else if (selections.slot && CONSTANTS.texts.slotTimes[selections.slot]) {
        slotTimeStr = CONSTANTS.texts.slotTimes[selections.slot];
      }
      // Parse start time (assume format like '9am - 1.30pm' or '14:00 - 18:00')
      let startTime = null;
      if (slotTimeStr) {
        let match = slotTimeStr.match(/(\d{1,2})([:\.]\d{2})?\s*(am|pm)?/i);
        if (match) {
          let hour = parseInt(match[1], 10);
          let min = match[2] ? parseInt(match[2].replace(/[:\.]/, ''), 10) : 0;
          let ampm = match[3] ? match[3].toLowerCase() : '';
          if (ampm === 'pm' && hour < 12) hour += 12;
          if (ampm === 'am' && hour === 12) hour = 0;
          startTime = new Date();
          startTime.setHours(hour, min, 0, 0);
        }
      }
      if (startTime && new Date() > startTime) {
        // Remove today from availableDates
        const todayStr = flatpickr.formatDate(new Date(), 'Y-m-d');
        availableDates = availableDates.filter(d => d !== todayStr);
      }
    }

    fp.set('enable', availableDates);
    // If date is cleared, keep calendar on last viewed month
    if (!selections.date && lastViewedMonth) {
      fp.jumpToDate(lastViewedMonth, true);
    }
  }

  // --- Validation for Book Button ---
  function validateBookingForm() {
    const name = $('#input-name').val().trim();
    const surname = $('#input-surname').val().trim();
    const email = $('#input-email').val().trim();
    const confirmEmail = $('#input-email-confirm').val().trim();
    const phonePrefix = $('#input-phone-prefix').val();
    const phone = $('#input-phone').val().trim();
    let valid = true;

    // Reset error messages
    $('#email-error').text("");
    $('#confirm-email-error').text("");
    $('#phone-error').text("");

    // Name and surname required
    if (!name || !surname) valid = false;
    // Email required and valid
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      valid = false;
      if (email) {
        $('#email-error').text('Invalid email format');
      } else {
        $('#email-error').text('Email is required');
      }
    }
    // Confirm email matches
    if (email !== confirmEmail) {
      valid = false;
      if (confirmEmail) {
        $('#confirm-email-error').text('Emails do not match');
      } else {
        $('#confirm-email-error').text('Please confirm your email');
      }
    }
    // Phone required and valid (basic international format, min 6 digits)
    if (!/^\d{6,}$/.test(phone.replace(/\D/g, ''))) {
      valid = false;
      if (phone) {
        $('#phone-error').text('Invalid phone number');
      } else {
        $('#phone-error').text('Phone number is required');
      }
    }
    if (!phonePrefix) valid = false;
    // Booking selections required
    if (!selections.experience || !selections.people || !selections.groupType || !selections.date) valid = false;
    if (!selections.experience.includes("Gourmet") && (!selections.slot || !selections.combo)) valid = false;
    // Enable/disable Book button
    $('#bookBtn').prop('disabled', !valid);
    return valid;
  }

  // Attach validation to all relevant fields
  $('#input-name, #input-surname, #input-email, #input-email-confirm, #input-phone, #input-phone-prefix').on('input change', validateBookingForm);
  $('#input-notes').on('input change', validateBookingForm);
  $(document).on('change', validateBookingForm);

  // Also validate on booking selection changes
  $(document).on('change', '.option-row', validateBookingForm);

  // Initial validation
  setTimeout(validateBookingForm, 500);

  // --- Update bookingForm submit to use prefix ---
  $('#bookingForm').on('submit', function (e) {
    e.preventDefault();
    if (!validateBookingForm()) return;
    const formData = {
      ...selections,
      name: this.name.value,
      surname: this.surname.value,
      phone: $('#input-phone-prefix').val() + $('#input-phone').val().replace(/\D/g, ''),
      email: this.email.value,
      notes: this.notes.value
    };
  });
});

function updateSummaryAndPrice() {
  // Update the summary UI
  $('#summary-experience').text(selections.experience || "-");
  $('#summary-slot').text(selections.slot || "-");
  $('#summary-combo').text(selections.combo || "-");
  $('#summary-people').text(selections.people || "-");
  $('#summary-groupType').text(selections.groupType || "-");
  $('#summary-date').text(
    selections.date
      ? new Date(selections.date).toLocaleDateString(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      : "-"
  );

  // Determine if current selection is for a Gourmet tour
  const isGourmet = selections.experience === CONSTANTS.tourOptions.experience[2]; // "Gourmet Sunset Cruise"

  // Hide slot and combo containers accordingly
  $('#summary-slot-container').toggle(
    !(isGourmet || (
      selections.experience === CONSTANTS.tourOptions.experience[0] && // "Wild Tour"
      selections.slot === CONSTANTS.tourOptions.slot[1] // "Full Day"
    ) || selections.experience !== CONSTANTS.tourOptions.experience[1]) // not "Rainbow Tour"
  );
  $('#summary-combo-container').toggle(!isGourmet);

  // Calculate price based on selected tour name and number of people
  let tourKey = selections.experience;
  if (selections.combo && selections.combo.includes("Oh yeah")) {
    tourKey += " + Combo";
  }
  // Always add group type suffix for Shared
  if (selections.groupType === "Shared") {
    tourKey += " (shared, prezzo a persona)";
  } else {
    tourKey += " (private)";
  }

  const tour = tourDetailsRetrived?.[tourKey];
  let basePrice = tour?.prezzo || 0;
  const isPerPerson = selections.groupType === "Shared" && tourKey.includes("shared");

  const totalPrice = isPerPerson ? basePrice * selections.people : basePrice;

  $('#summary-price').text(`${CONSTANTS.texts.summary.price} ${totalPrice.toFixed(2)}`);
}

function completePaymentInformation(orderId) {
  // Buyer details
  const name = $('#input-name').val().trim();
  const surname = $('#input-surname').val().trim();
  const email = $('#input-email').val().trim();
  const phone = $('#input-phone-prefix').val() + $('#input-phone').val().replace(/\D/g, '');
  const notes = $('#input-notes').val().trim();

  const isGourmet = selections.experience === CONSTANTS.tourOptions.experience[2];

  // Get time string
  let timeStr = "";
  if (isGourmet) {
    timeStr = CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[2]];
  } else if (selections.experience === CONSTANTS.tourOptions.experience[1]) {
    timeStr = CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]];
  } else if (selections.slot && CONSTANTS.texts.slotTimes[selections.slot]) {
    timeStr = CONSTANTS.texts.slotTimes[selections.slot];
  }

  // HTML summary (as before)
  const summaryHtml = createSummaryHTMLString({
    name, surname, email, phone, notes, isGourmet, timeStr
  }, orderId);

  // Compose the note: user notes + HTML summary (or link)
  let noteField = notes;
  noteField += `Booking summary HTML: ` + summaryHtml;

  let tourToPass;
  if (slotsUsed.length === 3 && slotsUsed[0] === 1 && slotsUsed[1] === 2 && slotsUsed[2] === 3) {
    tourToPass = "Luxury Day";
  } else if (slotsUsed.length === 2 && slotsUsed[0] === 2 && slotsUsed[1] === 3) {
    tourToPass = "Sunset Day";
  } else if (slotsUsed.length === 2 && slotsUsed[0] === 1 && slotsUsed[1] === 2) {
    tourToPass = "Full Day";
  } else {
    tourToPass = selections.experience; // Default to experience name
  }

  // Prepare booking data for spreadsheet (matching Apps Script expectations)
  const bookingData = {
    mode: "saveBooking",
    data: selections.date, // date string
    tour: tourToPass, // tour name
    nome: name + (surname ? (" " + surname) : ""),
    email: email,
    persone: selections.people,
    privato: selections.groupType === "Private" ? "Sì" : "No",
    note: noteField
  };

  function showLoadingOverlay() {
    $('#loading-overlay').fadeIn(150);
  }
  function hideLoadingOverlay() {
    $('#loading-overlay').fadeOut(150);
  }

  function showFakeLoadingOverlay(t = 100) {
    showLoadingOverlay();
    setTimeout(hideLoadingOverlay, t);
  }

  showFakeLoadingOverlay(2500);

  // Send booking data to proxy endpoint
  $.ajax({
    url: "https://script.google.com/macros/s/AKfycbxpmQJL8PSFWv1YlRhQFT7DoF5GMmzUJZ4wvSiUnswkDzkRJglVf0UYs6mC7nB1zT-1cA/exec",
    method: "POST",
    data: bookingData,
    success: function (response) {
      sendConfirmationEmailWithEmailJS(summaryHtml, email);
    },
    error: function (xhr, status, error) {
      alert("Errore nell'invio della prenotazione: " + error);
    }
  });
}

// Send confirmation email using EmailJS
function sendConfirmationEmailWithEmailJS(htmlContent, recipientEmail) {
  // Replace these with your EmailJS credentials
  const serviceID = 'service_nuyv4ei';
  const templateID = 'template_zsc2c0t';

  // Sanitize HTML for EmailJS: remove problematic template delimiters and invisible chars
  let safeHtmlContent = htmlContent
    .replace(/\u2028|\u2029/g, '') // Remove line/paragraph separators
    .replace(/\u200B/g, '') // Remove zero-width space
    .replace(/\{\{/g, '{ {') // Avoid EmailJS template parsing
    .replace(/\}\}/g, '} }')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Remove any script tags for safety
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, ''); // Remove iframes for safety

  // You can pass variables to your template as needed
  const templateParams = {
    to_email: recipientEmail,
    message_html: safeHtmlContent,
    subject: 'Conferma Prenotazione leggeroTOURS',
    from_name: 'leggeroTOURS',
    reply_to: 'leggerotours@gmail.com'
  };

  if (typeof emailjs === 'undefined') {
    console.log("gay")
    return;
  }

  emailjs.send(serviceID, templateID, templateParams)
    .then(function(response) {
      alert("Prenotazione inviata!\n\nRiceverai una mail di conferma a breve.");
      showBookingSummaryModal(htmlContent);
    }, function(error) {
      console.error('Errore invio email:', error);
    });
}

// Show booking summary in a modal/overlay
function showBookingSummaryModal(html) {
  localStorage.setItem('bookingSummaryModalHtml', html);
  location.href = "index.html";
}

// Helper to generate the HTML summary as a string (copied from createSummaryHTMLPage, but returns string)
function createSummaryHTMLString({ name, surname, email, phone, notes, isGourmet, timeStr }, orderId) {
  const meetingPoint = `
    <strong>Meeting Point:</strong> <br>
    <span style="color:#2a5d8f;">Porto di Genova, Molo vecchio</span><br>
    Please arrive at least 10 minutes before departure.<br>
    Look for the leggeroTOURS flag near the docked boats.
  `;

  // --- Determine tourKey just like in pricing ---
  let tourKey = selections.experience;
  if (selections.combo && selections.combo.includes("Oh yeah")) {
    tourKey += " + Combo";
  }
  if (selections.groupType === "Public" && tourKey === "Gourmet Sunset Cruise") {
    tourKey += " (shared, prezzo a persona)";
  } else {
    tourKey += " (private)";
  }

  const tour = tourDetailsRetrived?.[tourKey];
  const orarioInizio = tour?.orarioInizio || "-";
  const orarioFine = tour?.orarioFine || "-";

  const summaryRows = [
    { label: CONSTANTS.texts.summary.experience, value: selections.experience },
    !isGourmet && { label: CONSTANTS.texts.summary.slot, value: selections.slot },
    !isGourmet && { label: CONSTANTS.texts.summary.combo, value: selections.combo },
    { label: CONSTANTS.texts.summary.people, value: selections.people },
    { label: CONSTANTS.texts.summary.groupType, value: selections.groupType },
    { label: CONSTANTS.texts.summary.date, value: new Date(selections.date).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) },
    { label: "Start Time", value: orarioInizio },               // <--- Added
    { label: "Finish Time", value: orarioFine },               // <--- Added
    { label: "Time", value: timeStr },
    { label: CONSTANTS.texts.summary.price, value: $('#summary-price').text() }
  ].filter(Boolean);

  const buyerRows = [
    { label: "Name", value: name },
    { label: "Surname", value: surname },
    { label: "Email", value: email },
    { label: "Phone", value: phone },
    { label: "Order ID", value: orderId },
    notes && { label: "Notes", value: notes }
  ].filter(Boolean);

  const summaryTable = summaryRows.map(row =>
    `<tr>
      <td style="padding:8px 16px;font-weight:bold;color:#333;">${row.label}</td>
      <td style="padding:8px 16px;color:#444;">${row.value}</td>
    </tr>`
  ).join('');

  const buyerTable = buyerRows.map(row =>
    `<tr>
      <td style="padding:8px 16px;font-weight:bold;color:#333;">${row.label}</td>
      <td style="padding:8px 16px;color:#444;">${row.value}</td>
    </tr>`
  ).join('');

  const contactSection = `
    <div class="section-title">Contact LeggeroTOURS</div>
    <div class="contact-info">
      <div style="margin-bottom:6px;">
        <strong>Email:</strong>
        <a href="mailto:info@leggerotours.com" style="color:#2a5d8f;text-decoration:none;">info@leggerotours.com</a>
      </div>
      <div style="margin-bottom:6px;">
        <strong>Phone/WhatsApp:</strong>
        <a href="tel:+393331234567" style="color:#2a5d8f;text-decoration:none;">+39 333 1234567</a>
      </div>
      <div>
        <strong>Website:</strong>
        <a href="https://leggerotours.com" target="_blank" style="color:#2a5d8f;text-decoration:none;">leggerotours.com</a>
      </div>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Your Booking Summary</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7f7f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 520px;
          margin: 40px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 32px 24px;
        }
        h2 {
          text-align: center;
          color: #2a5d8f;
          margin-bottom: 24px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        tr:nth-child(even) {
          background: #f2f6fa;
        }
        td {
          font-size: 1.05em;
        }
        .footer {
          text-align: center;
          color: #888;
          font-size: 0.95em;
          margin-top: 18px;
        }
        .paid-badge {
          display: inline-block;
          background: #4caf50;
          color: #fff;
          font-weight: bold;
          padding: 6px 18px;
          border-radius: 18px;
          font-size: 1.1em;
          margin-bottom: 18px;
          letter-spacing: 1px;
        }
        .meeting-point {
          background: #eaf4fb;
          border-left: 4px solid #2a5d8f;
          padding: 12px 18px;
          margin-bottom: 20px;
          font-size: 1.04em;
        }
        .section-title {
          color: #2a5d8f;
          font-size: 1.08em;
          margin: 18px 0 8px 0;
          font-weight: bold;
        }
        .contact-info {
          background: #f8fafc;
          border-left: 4px solid #2a5d8f;
          padding: 12px 18px;
          margin-bottom: 20px;
          font-size: 1.04em;
        }
        .contact-info a {
          color: #2a5d8f;
          text-decoration: none;
        }
        .contact-info a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="paid-badge">PAID</div>
        <h2>Booking Summary</h2>
        <div class="meeting-point">${meetingPoint}</div>
        ${contactSection}
        <div class="section-title">Tour Details</div>
        <table>
          ${summaryTable}
        </table>
        <div class="section-title">Your Details</div>
        <table>
          ${buyerTable}
        </table>
        <div class="footer">
          Thank you for booking with leggeroTOURS!<br>
          We look forward to welcoming you on board.
        </div>
      </div>
    </body>
    </html>
  `;

  return html.replace(/\n/g, "");
}
