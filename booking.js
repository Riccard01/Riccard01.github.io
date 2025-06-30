const CONSTANTS = {
  tourOptions: {
    experience: ["Wild Tour", "Rainbow Tour", "Gourmet Sunset Cruise"],
    slot: ["Tour Slot", "Full Day"],
    combo: ["Oh yeah! (extended to midnight)", "No combo"],
    groupType: ["Private", "Public"]
  },
  texts: {
    people: "People",
    peopleMax: (max) => `People (Max ${max} left for this date)`,
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

function fetchAvailability() {
  // Replace with your actual web app URL
  const url = 'https://script.google.com/macros/s/AKfycbxqflPM2CFlCqX3NifNslG5Bp-8aEVq2WmPQpsQ33JkA9elgg3N0pJ2k1RCGQeCsBYY/exec';
  return $.getJSON(url).then(data => {
    availabilityByMonth = data;
    console.log("Availability data loaded:", availabilityByMonth);
  });
}

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

$(document).ready(function () {
  document.getElementById('continueBtn').disabled = true;
  // Show loading in calendar section
  $('#calendar').html(`<div id="calendar-loading" style="text-align:center;padding:0.6em;">${CONSTANTS.texts.loading}</div>`);
  $('#options-div').css("display", "none"); // Hide options until loaded
  fetchAvailability().then(() => {
    $('#calendar-loading').remove();
    $('#options-div').css("display", "block");
    populateDropdown("experience");
    updateUI();
    updateCalendar();
  });

  // Initialize flatpickr
  fp = flatpickr("#calendar", {
    inline: true,
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
      if (isSettingDate) return; // Prevent recursion
      selections.date = dateStr;
      updateUI(); // Update UI when calendar changes
      // Ensure continue button is disabled if date is cleared
      document.getElementById('continueBtn').disabled = !dateStr;
    }
  });

  $('#continueBtn').on('click', function () {
    $('#step-1').hide();
    $('#step-2').show();
    updateSummaryAndPrice();
  });

  $('#backBtn').on('click', function () {
    $('#step-2').hide();
    $('#step-1').show();
  });

  $('#bookBtn').on('click', function () {
    sendBookingToSpreadsheet();
  });

  // Toggle dropdowns
  $('.option-row').on('click', function (e) {
    e.stopPropagation();
    if ($(this).hasClass('locked')) return;
    $('.option-row').not(this).removeClass('dropdown-open');
    $(this).toggleClass('dropdown-open');
  });

  // Handle dropdown selection
  $('.dropdown-content').on('click', '.dropdown-item', function (e) {
    e.stopPropagation();
    const $item = $(this);
    const key = $item.closest('.option-row').data('key');
    let value = $item.text();
    // If slot, strip time in parentheses
    if (key === "slot") {
      value = value.split(' (')[0];
    }
    selections[key] = value;
    $item.closest('.option-row').find('.option-value p').first().text($item.text());
    $('.option-row').removeClass('dropdown-open');
    // If combo is being selected and the date is not available for it, clear the date but keep combo
    const availableDates = getAvailableDatesForSelection();
    if (!availableDates.includes(selections.date)) {
      if (key === 'combo' && value === CONSTANTS.tourOptions.combo[0]) { // Oh yeah! (extended to midnight)
        selections.date = "";
        if (fp) fp.clear();
      } else if (key !== 'combo') {
        selections.date = "";
        if (fp) fp.clear();
      }
    }
    updateUI();
    updateCalendar();
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

    // Ensure a valid date is selected for the current experience
    const availableDates = getAvailableDatesForSelection();
    if (!selections.date || !availableDates.includes(selections.date)) {
      const newDate = availableDates[0] || "";
      if (fp && selections.date !== newDate) {
        isSettingDate = true;
        selections.date = newDate;
        fp.setDate(selections.date, true); // update calendar UI
        isSettingDate = false;
      }
    }

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

    if (isGourmet) {
      // If sunset slot is not booked or reserved, allow both Private and Public
      if (sunset && (sunset.booked === 0) && !sunset.reserved) {
        $groupRow.removeClass('locked');
        $groupDD.empty();
        CONSTANTS.tourOptions.groupType.forEach(opt => {
          $groupDD.append(`<div class="dropdown-item">${opt}</div>`);
        });
        // Always default to Public when switching to Gourmet
        if (prevExperience !== CONSTANTS.tourOptions.experience[2] || !CONSTANTS.tourOptions.groupType.includes(selections.groupType)) {
          selections.groupType = "Public";
        }
        $groupText.text(selections.groupType);
      } else {
        // If sunset slot is booked or reserved, only Public is allowed
        selections.groupType = "Public";
        $groupText.text("Public");
        $groupRow.addClass('locked');
        $groupDD.empty();
        $groupDD.append('<div class="dropdown-item disabled">Public</div>');
      }
    } else {
      selections.groupType = "Private";
      $groupText.text("Private");
      $groupRow.addClass('locked');
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
      if (selections.experience === CONSTANTS.tourOptions.experience[1]) { // Rainbow Tour
        selections.slot = CONSTANTS.tourOptions.slot[0];
        $slotRow.find('.option-value p').first().text(`${CONSTANTS.tourOptions.slot[0]} (${CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]]})`);
        $slotRow.addClass('locked');
        $slotDD.append(`<div class="dropdown-item disabled">${CONSTANTS.tourOptions.slot[0]} (${CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]]})</div>`);
      } else if ((wild && wild.reserved) || (rainbow && rainbow.reserved)) {
        let slotText = CONSTANTS.tourOptions.slot[0];
        let slotTime = '';
        if (selections.experience === CONSTANTS.tourOptions.experience[0]) slotTime = CONSTANTS.texts.slotTimes["Tour Slot"];
        if (selections.experience === CONSTANTS.tourOptions.experience[1]) slotTime = CONSTANTS.texts.slotTimes[CONSTANTS.tourOptions.experience[1]];
        $slotRow.find('.option-value p').first().text(`${slotText} (${slotTime})`);
        $slotRow.addClass('locked');
        $slotDD.append(`<div class="dropdown-item disabled">${slotText} (${slotTime})</div>`);
        selections.slot = CONSTANTS.tourOptions.slot[0];
      } else {
        // Fix: Determine slot availability for Wild Tour
        let slotOptions = [];
        if (selections.experience === CONSTANTS.tourOptions.experience[0]) { // Wild Tour
          // Tour Slot (wild only)
          const wildAvailable = wild && !wild.reserved && (wild.max - wild.booked) >= selections.people;
          if (wildAvailable) slotOptions.push({ label: CONSTANTS.tourOptions.slot[0], time: CONSTANTS.texts.slotTimes["Tour Slot"] });
          // Full Day (wild + rainbow)
          const fullDayAvailable = wild && rainbow && !wild.reserved && !rainbow.reserved && (wild.max - wild.booked) >= selections.people && (rainbow.max - rainbow.booked) >= selections.people;
          if (fullDayAvailable) slotOptions.push({ label: CONSTANTS.tourOptions.slot[1], time: CONSTANTS.texts.slotTimes["Full Day"] });
        } else {
          // For other experiences, fallback to previous logic
          const relaxAvailable = wild && !(wild.reserved && wild.booked >= (wild.max || 0));
          const fullDayAvailable = relaxAvailable && rainbow && !(rainbow.reserved && rainbow.booked >= (rainbow.max || 0));
          if (relaxAvailable) slotOptions.push({ label: CONSTANTS.tourOptions.slot[0], time: CONSTANTS.texts.slotTimes["Tour Slot"] });
          if (fullDayAvailable) slotOptions.push({ label: CONSTANTS.tourOptions.slot[1], time: CONSTANTS.texts.slotTimes["Full Day"] });
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
    if (comboDisabled && selections.combo !== CONSTANTS.tourOptions.combo[0]) {
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
      maxPeople = selections.groupType === CONSTANTS.tourOptions.groupType[1] && sunset ? ((sunset.max || 0) - (sunset.booked || 0)) : 8;
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
    let slotsUsed = [];
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

    console.log("Slots used:", slotsUsed);

    // At the end, check if continue button should be enabled
    const required = ['experience', 'people', 'groupType'];
    const extraRequired = [];
    if (!selections.experience.includes("Gourmet")) {
      extraRequired.push('slot', 'combo');
    }

    // --- Live Price Update for Step 1 ---
    let basePrice = 100;
    if (selections.experience === CONSTANTS.tourOptions.experience[2]) basePrice = 150;
    const totalPrice = basePrice * selections.people;
    $('#step1-price').text(`${CONSTANTS.texts.summary.price} ${totalPrice.toFixed(2)}`);
  }

  function getAvailableDatesForSelection() {
    const { experience, slot, combo, people, groupType } = selections;
    if (!experience) return [];
    let availableDates = [];
    Object.entries(availabilityByMonth).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, slots]) => {
        // Readable slot access
        const wild = slots.wild || {};
        const rainbow = slots.rainbow || {};
        const sunset = slots.sunset || {};
        let valid = true;
        // Experience logic
        if (experience === "Wild Tour") {
          // Full Day uses both wild and rainbow
          if (slot === "Full Day") {
            if (wild.reserved || rainbow.reserved) valid = false;
            if ((wild.max - wild.booked) < people || (rainbow.max - rainbow.booked) < people) valid = false;
          } else {
            if (wild.reserved) valid = false;
            if ((wild.max - wild.booked) < people) valid = false;
          }
          // Combo logic: if sunset is reserved, combo cannot be done
          if (combo === "Oh yeah! (extended to midnight)" && sunset.reserved) valid = false;
        } else if (experience === "Rainbow Tour") {
          if (rainbow.reserved) valid = false;
          if ((rainbow.max - rainbow.booked) < people) valid = false;
          // Combo logic: if sunset is reserved, combo cannot be done
          if (combo === "Oh yeah! (extended to midnight)" && sunset.reserved) valid = false;
        } else if (experience === "Gourmet Sunset Cruise") {
          if (sunset.reserved) valid = false;
          if ((sunset.max - sunset.booked) < people) valid = false;
        }
        if (valid) availableDates.push(`${month}-${day.padStart(2, "0")}`);
      });
    });
    return availableDates;
  }

  function updateCalendar() {
    if (!fp) return;
    const availableDates = getAvailableDatesForSelection();
    fp.set('enable', availableDates);
  }

  // Initial calendar update
  updateCalendar();

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
    console.log("Final booking data:", formData);
  });
});

function updateSummaryAndPrice() {
  $('#summary-experience').text(selections.experience || "-");
  $('#summary-slot').text(selections.slot || "-");
  $('#summary-combo').text(selections.combo || "-");
  $('#summary-people').text(selections.people || "-");
  $('#summary-groupType').text(selections.groupType || "-");
  $('#summary-date').text(new Date(selections.date).toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) || "-");

  // Nascondi slot e combo se Gourmet
  const isGourmet = selections.experience === CONSTANTS.tourOptions.experience[2];
  $('#summary-slot-container').toggle(!isGourmet);
  $('#summary-combo-container').toggle(!isGourmet);
  $('#summary-slot-container').toggle(!((selections.experience == CONSTANTS.tourOptions.experience[0] && selections.slot == CONSTANTS.tourOptions.slot[1]) || selections.experience != CONSTANTS.tourOptions.experience[1]));

  // Calcolo prezzo (base di esempio, poi lo cambi tu)
  let basePrice = 100;
  if (isGourmet) basePrice = 150;
  const totalPrice = basePrice * selections.people;
  $('#summary-price').text(`${CONSTANTS.texts.summary.price} ${totalPrice.toFixed(2)}`);
}

function getPricePerPerson() {
  // You can customize these values
  const { experience, groupType } = selections;
  if (experience === "Gourmet Sunset Cruise") {
    return groupType === "Private" ? 100 : 70;
  }
  return 50; // Default price for non-gourmet
}

function sendBookingToSpreadsheet() {
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
  });

  // Compose the note: user notes + HTML summary (or link)
  let noteField = notes;
  noteField += `\n\n---\nBooking summary HTML below:\n` + summaryHtml;

  // Prepare booking data for spreadsheet (matching Apps Script expectations)
  const bookingData = {
    data: selections.date, // date string
    tour: selections.experience, // tour name
    nome: name + (surname ? (" " + surname) : ""),
    email: email,
    persone: selections.people,
    privato: selections.groupType === "Private" ? "Sì" : "No",
    note: noteField
  };

  // Send booking data to proxy endpoint
  $.ajax({
    url: "http://localhost:3001/api/proxy",
    method: "POST",
    data: bookingData,
    success: function (response) {
      alert("Prenotazione inviata!\n\nRiceverai una mail di conferma a breve.");
      // Optionally, open the summary in a new tab for the user
      const win = window.open('', '_blank');
      win.document.write(summaryHtml);
      win.document.close();
    },
    error: function (xhr, status, error) {
      alert("Errore nell'invio della prenotazione: " + error);
    }
  });
}

// Helper to generate the HTML summary as a string (copied from createSummaryHTMLPage, but returns string)
function createSummaryHTMLString({ name, surname, email, phone, notes, isGourmet, timeStr }) {
  // Meeting point explanation (customize as needed)
  const meetingPoint = `
    <strong>Meeting Point:</strong> <br>
    <span style="color:#2a5d8f;">Porto di Genova, Molo vecchio</span><br>
    Please arrive at least 10 minutes before departure.<br>
    Look for the leggeroTOURS flag near the docked boats.
  `;

  // Booking summary rows
  const summaryRows = [
    { label: CONSTANTS.texts.summary.experience, value: selections.experience },
    !isGourmet && { label: CONSTANTS.texts.summary.slot, value: selections.slot },
    !isGourmet && { label: CONSTANTS.texts.summary.combo, value: selections.combo },
    { label: CONSTANTS.texts.summary.people, value: selections.people },
    { label: CONSTANTS.texts.summary.groupType, value: selections.groupType },
    { label: CONSTANTS.texts.summary.date, value: new Date(selections.date).toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) },
    { label: "Time", value: timeStr },
    { label: CONSTANTS.texts.summary.price, value: $('#summary-price').text() }
  ].filter(Boolean);

  // Buyer details rows
  const buyerRows = [
    { label: "Name", value: name },
    { label: "Surname", value: surname },
    { label: "Email", value: email },
    { label: "Phone", value: phone },
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

  // Contact LeggeroTOURS section
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
  return html;
}