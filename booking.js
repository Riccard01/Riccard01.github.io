const tourOptions = {
  experience: ["Wild Tour", "Rainbow Tour", "Gourmet Sunset Cruise"],
  slot: ["Tour Slot", "Full Day"],
  combo: ["Oh yeah!", "No combo"],
  groupType: ["Private", "Public"]
};

const currentDateAvailability = {
  slot1: { max: 6, booked: 0, reserved: false },   // Wild Tour
  slot2: { max: 6, booked: 0, reserved: false },  // Rainbow Tour
  slot3: { max: 8, booked: 2, reserved: false }   // Gourmet Sunset
};

let selections = {
  experience: "",
  slot: "",
  combo: "",
  people: 2,
  groupType: ""
};

$(document).ready(function () {
  populateDropdown("experience");
  updateUI();

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
  });

  // Close dropdowns when clicking outside
  $(document).on('click', () => $('.option-row').removeClass('dropdown-open'));

  function populateDropdown(key) {
    const $row = $(`.option-row[data-key="${key}"]`);
    const $dropdown = $row.find('.dropdown-content');
    $dropdown.empty();

    // Use availability constraints if needed
    if (key === "experience") {
      tourOptions.experience.forEach((exp, i) => {
        const slotKey = `slot${i + 1}`;
        const slot = currentDateAvailability[slotKey];
        const isAvailable = !slot.reserved;
        if (isAvailable) $dropdown.append(`<div class="dropdown-item">${exp}</div>`);
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
    const slot1 = currentDateAvailability.slot1;
    const slot2 = currentDateAvailability.slot2;
    const slot3 = currentDateAvailability.slot3;

    // Group Type
    const $groupRow = $('.option-row[data-key="groupType"]');
    const $groupText = $groupRow.find('.option-value p').first();
    const $groupDD = $groupRow.find('.dropdown-content').empty();

    if (isGourmet) {
      if (!slot3.reserved && slot3.booked < slot3.max) {
        selections.groupType = "Public";
        $groupText.text("Public");
        $groupRow.addClass('locked');
      } else {
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
      if (slot1.reserved || slot2.reserved) {
        selections.slot = tourOptions.slot[0];
        $slotRow.find('.option-value p').first().text(selections.slot);
        $slotRow.addClass('locked');
        $slotDD.append(`<div class="dropdown-item disabled">${tourOptions.slot[0]}</div>`);
      } else {
        const slotOptions = [];
        const relaxAvailable = !(slot1.reserved && slot1.booked >= slot1.max);
        const fullDayAvailable = relaxAvailable && !(slot2.reserved && slot2.booked >= slot2.max);

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
      if (slot3.booked > 0) {
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
      maxPeople = selections.groupType === "Public" ? (slot3.max - slot3.booked) : 8;
      $peopleSubtitle.text(`People (Max ${maxPeople} left)`);
    } else {
      $peopleSubtitle.text("People");
    }

    for (let i = 1; i <= maxPeople; i++) {
      $peopleDD.append(`<div class="dropdown-item">${i}</div>`);
    }

    if (selections.people > maxPeople) {
      selections.people = maxPeople;
      $peopleText.text(maxPeople);
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
  }
});
