const tourOptions = {
  experience: ["Wild Tour", "Rainbow Tour", "Gourmet Sunset Cruise"],
  slot: ["Tour Slot", "Full Day"],
  combo: ["Oh yeah!", "No combo"],
  groupType: ["Private", "Public"]
};

// Example: availabilityByMonth[month][day][slot]
const availabilityByMonth = {
  "2025-06": {
    "28": {
      wild: { max: 6, booked: 0, reserved: false },
      rainbow: { max: 6, booked: 3, reserved: false },
      sunset: { max: 8, booked: 0, reserved: false }
    },
    "29": {
      wild: { max: 6, booked: 6, reserved: true },
      rainbow: { max: 6, booked: 0, reserved: false },
      sunset: { max: 8, booked: 2, reserved: false }
    }
    // ...more days
  },
  "2025-07": {
    "01": {
      wild: { max: 6, booked: 0, reserved: false },
      rainbow: { max: 6, booked: 0, reserved: false },
      sunset: { max: 8, booked: 0, reserved: false }
    }
    // ...more days
  }
};

let selections = {
  experience: "",
  slot: "",
  combo: "",
  people: 2,
  groupType: "",
  date: ""
};

let fp; // flatpickr instance

$(document).ready(function () {
  populateDropdown("experience");
  updateUI();

  // Initialize flatpickr
  fp = flatpickr("#calendar", {
    inline: true,
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates, dateStr) {
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
      selections.date = availableDates[0] || "";
      if (fp) fp.setDate(selections.date, true); // update calendar UI
    }

    // Get slot availability for the selected date
    let slot1 = {}, slot2 = {}, slot3 = {};
    if (selections.date) {
      const [year, month, day] = selections.date.split("-");
      const monthKey = `${year}-${month}`;
      const dayKey = day.padStart(2, "0");
      const dayAvailability = availabilityByMonth[monthKey] && availabilityByMonth[monthKey][dayKey];
      if (dayAvailability) {
        slot1 = dayAvailability.wild || {};
        slot2 = dayAvailability.rainbow || {};
        slot3 = dayAvailability.sunset || {};
      }
    }

    // Group Type
    const $groupRow = $('.option-row[data-key="groupType"]');
    const $groupText = $groupRow.find('.option-value p').first();
    const $groupDD = $groupRow.find('.dropdown-content').empty();

    if (isGourmet) {
      if (slot3 && !slot3.reserved && slot3.booked < (slot3.max || 0)) {
        selections.groupType = "Public";
        $groupText.text("Public");
        $groupRow.addClass('locked');
      } else {
        selections.groupType = "Public";
        $groupText.text("Public");
        $groupRow.removeClass('locked');
        tourOptions.groupType.forEach(opt => {
          $groupDD.append(`<div class="dropdown-item">${opt}</div>`);
        });
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

      // Condition 1: Wild Tour and not Full Day
      if (selections.experience === "Wild Tour" && selections.slot !== "Full Day") {
        comboDisabled = true;
      }

      // Condition 2: Gourmet Sunset booked by someone
      if (slot3 && slot3.booked > 0) {
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

    const required = ['experience', 'people', 'groupType'];
    const extraRequired = [];

    if (!selections.experience.includes("Gourmet")) {
      extraRequired.push('slot', 'combo');
    }

    const allValid = [...required, ...extraRequired].every(k => selections[k]);
    $('#continueBtn').prop('disabled', !allValid);
  }

  function getAvailableDatesForSelection() {
    const { experience, slot, combo, people, groupType } = selections;
    if (!experience) return [];
    const slotMap = {
      "Wild Tour": "wild",
      "Rainbow Tour": "rainbow",
      "Gourmet Sunset Cruise": "sunset"
    };
    const slotKey = slotMap[experience];
    let availableDates = [];
    Object.entries(availabilityByMonth).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, slots]) => {
        const slotData = slots[slotKey];
        if (!slotData) return;
        // Apply your logic: reserved, booked, groupType, people, etc.
        if (!slotData.reserved && (slotData.max - slotData.booked) >= people) {
          availableDates.push(`${month}-${day.padStart(2, "0")}`);
        }
      });
    });
    return availableDates;
  }

  function updateCalendar() {
    if (!fp) return;
    const availableDates = getAvailableDatesForSelection();
    // Get all dates in the visible months, then disable those not in availableDates
    // But for simplicity, just disable all except availableDates
    fp.set('enable', availableDates);
    fp.set('disable', []); // Remove any previous disables
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