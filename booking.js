const tourOptions = {
  experience: ["Wild Tour", "Rainbow Tour", "Gourmet Sunset Cruise"],
  slot: ["Tour Slot", "Full Day"],
  combo: ["Oh yeah!", "No combo"],
  groupType: ["Private", "Public"]
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
  fetchAvailability().then(() => {
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
    selections[key] = $item.text();
    $item.closest('.option-row').find('.option-value p').first().text(selections[key]);
    $('.option-row').removeClass('dropdown-open');
    // If filters change, and the date is no longer available, deselect it
    const availableDates = getAvailableDatesForSelection();
    if (!availableDates.includes(selections.date)) {
      selections.date = "";
      if (fp) fp.clear();
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

    if (key === "experience") {
      tourOptions.experience.forEach((exp) => {
        $dropdown.append(`<div class="dropdown-item">${exp}</div>`);
      });
      const valid = $dropdown.find('.dropdown-item').toArray().map(el => el.textContent);
      if (!valid.includes(selections.experience)) {
        selections.experience = valid[0] || "";
        $row.find('.option-value p').first().text(selections.experience);
      }
    } else {
      tourOptions[key].forEach(opt => {
        $dropdown.append(`<div class="dropdown-item">${opt}</div>`);
      });
    }
  }

  function updateUI() {
    const isGourmet = selections.experience === "Gourmet Sunset Cruise";

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
      // If sunset slot is not booked by anyone, allow both Private and Public
      if (slot3 && (slot3.booked === 0)) {
        $groupRow.removeClass('locked');
        $groupDD.empty();
        tourOptions.groupType.forEach(opt => {
          $groupDD.append(`<div class="dropdown-item">${opt}</div>`);
        });
        // Keep current selection if valid, otherwise default to Public
        if (!tourOptions.groupType.includes(selections.groupType)) {
          selections.groupType = "Public";
          $groupText.text("Public");
        } else {
          $groupText.text(selections.groupType);
        }
      } else {
        // If sunset slot is booked, only Public is allowed
        selections.groupType = "Public";
        $groupText.text("Public");
        $groupRow.addClass('locked');
      }
    } else {
      selections.groupType = "Private";
      $groupText.text("Private");
      $groupRow.addClass('locked');
    }

    // Slot + Combo visibility
    const $slotRow = $('.option-row[data-key="slot"]');
    const $slotDD = $slotRow.find('.dropdown-content').empty();
    const $comboRow = $('.option-row[data-key="combo"]');
    $slotRow.toggle(!isGourmet);
    $comboRow.toggle(!isGourmet);

    if (!isGourmet) {
      // Lock slot dropdown if Wild Tour or Rainbow Tour is reserved
      if ((slot1 && slot1.reserved) || (slot2 && slot2.reserved)) {
        selections.slot = tourOptions.slot[0];
        $slotRow.find('.option-value p').first().text(selections.slot);
        $slotRow.addClass('locked');
        $slotDD.append(`<div class="dropdown-item disabled">${tourOptions.slot[0]}</div>`);
      } else {
        const slotOptions = [];
        const relaxAvailable = slot1 && !(slot1.reserved && slot1.booked >= (slot1.max || 0));
        const fullDayAvailable = relaxAvailable && slot2 && !(slot2.reserved && slot2.booked >= (slot2.max || 0));

        if (relaxAvailable) slotOptions.push(tourOptions.slot[0]);
        if (fullDayAvailable) slotOptions.push(tourOptions.slot[1]);

        slotOptions.forEach(opt => {
          $slotDD.append(`<div class="dropdown-item${slotOptions.length === 1 ? ' disabled' : ''}">${opt}</div>`);
        });

        if (!slotOptions.includes(selections.slot)) {
          selections.slot = slotOptions[0] || "";
          $slotRow.find('.option-value p').first().text(selections.slot);
        }

        if (slotOptions.length === 1) {
          $slotRow.addClass('locked');
        } else {
          $slotRow.removeClass('locked');
        }
      }

      const $comboDD = $comboRow.find('.dropdown-content').empty();
      let comboDisabled = false;

      if (sunset && sunset.reserved) {
        comboDisabled = true;
      }
      // Condition 1: Wild Tour and not Full Day
      if (selections.experience === "Wild Tour" && selections.slot !== "Full Day") {
        comboDisabled = true;
      }
      // Condition 2: Gourmet Sunset booked by someone
      if (sunset && sunset.booked > 0) {
        comboDisabled = true;
      }

      tourOptions.combo.forEach(opt => {
        const disabled = comboDisabled && opt === "Oh yeah!" ? ' disabled' : '';
        $comboDD.append(`<div class="dropdown-item${disabled}">${opt}</div>`);
      });

      // Auto-select "No combo" if combo is disabled
      if (comboDisabled) {
        selections.combo = "No combo";
        $comboRow.addClass('locked');
      } else {
        $comboRow.removeClass('locked');
      }

      // Update visible value
      $comboRow.find('.option-value p').first().text(selections.combo);
    }

    // People max
    const $peopleRow = $('.option-row[data-key="people"]');
    const $peopleDD = $peopleRow.find('.dropdown-content').empty();
    const $peopleText = $peopleRow.find('.option-value p').first();
    const $peopleSubtitle = $peopleRow.find('.option-subtitle p');

    let maxPeople = 6;
    if (isGourmet) {
      console.log(slot3)
      maxPeople = selections.groupType === "Public" && slot3 ? ((slot3.max || 0) - (slot3.booked || 0)) : 8;
      $peopleSubtitle.text(`People (Max ${maxPeople} left for this date)`);
    } else {
      $peopleSubtitle.text("People");
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
    if (isGourmet) {
      slotsUsed = [3];
    } else if (selections.slot === tourOptions.slot[0]) {
      slotsUsed = [1];
    } else if (selections.slot === tourOptions.slot[1]) {
      slotsUsed = [1, 2];
    }
    if (selections.combo === tourOptions.combo[0] && !isGourmet) {
      slotsUsed = [2, 3];
    }

    console.log("Slots used:", slotsUsed);

    // At the end, check if continue button should be enabled
    const required = ['experience', 'people', 'groupType'];
    const extraRequired = [];
    if (!selections.experience.includes("Gourmet")) {
      extraRequired.push('slot', 'combo');
    }
    const allValid = [...required, ...extraRequired].every(k => selections[k]);
    // Only enable continue if a date is selected and all filters are valid
    $('#continueBtn').prop('disabled', !(allValid && selections.date));
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
          if (combo === "Oh yeah!" && sunset.reserved) valid = false;
        } else if (experience === "Rainbow Tour") {
          if (rainbow.reserved) valid = false;
          if ((rainbow.max - rainbow.booked) < people) valid = false;
          // Combo logic: if sunset is reserved, combo cannot be done
          if (combo === "Oh yeah!" && sunset.reserved) valid = false;
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
});

function updateSummaryAndPrice() {
  $('#summary-experience').text(selections.experience || "-");
  $('#summary-slot').text(selections.slot || "-");
  $('#summary-combo').text(selections.combo || "-");
  $('#summary-people').text(selections.people || "-");
  $('#summary-groupType').text(selections.groupType || "-");
  $('#summary-date').text(selections.date || "-");

  // Nascondi slot e combo se Gourmet
  const isGourmet = selections.experience === "Gourmet Sunset Cruise";
  $('#summary-slot-container').toggle(!isGourmet);
  $('#summary-combo-container').toggle(!isGourmet);
  $('#summary-slot-container').toggle(!((selections.experience == "Wild Tour" && selections.slot == "Full Day") || selections.experience != "Rainbow Tour"));

  // Calcolo prezzo (base di esempio, poi lo cambi tu)
  let basePrice = 100;
  if (isGourmet) basePrice = 150;
  const totalPrice = basePrice * selections.people;
  $('#summary-price').text(`€ ${totalPrice.toFixed(2)}`);
}

function getPricePerPerson() {
  // You can customize these values
  const { experience, groupType } = selections;
  if (experience === "Gourmet Sunset Cruise") {
    return groupType === "Private" ? 100 : 70;
  }
  return 50; // Default price for non-gourmet
}

$('#bookingForm').on('submit', function (e) {
  e.preventDefault();

  const formData = {
    ...selections,
    name: this.name.value,
    surname: this.surname.value,
    phone: this.phone.value,
    email: this.email.value,
    notes: this.notes.value
  };

  console.log("Final booking data:", formData);
});