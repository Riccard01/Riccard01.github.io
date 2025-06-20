// filters.js

document.addEventListener('DOMContentLoaded', () => {
  const btnMain      = document.querySelector('.wrapper-filter .first');
  const btnSpecial   = document.querySelector('.wrapper-filter .second');
  const mainCards    = document.querySelector('.cardcontainer:not(#special)');
  const specialCards = document.getElementById('special');

  function activateMain() {
    btnMain.classList.add('active');
    btnSpecial.classList.remove('active');
    mainCards.style.display    = 'flex';
    specialCards.style.display = 'none';
  }

  function activateSpecial() {
    btnSpecial.classList.add('active');
    btnMain.classList.remove('active');
    mainCards.style.display    = 'none';
    specialCards.style.display = 'flex';
  }

  // inizializza con Main attivo
  activateMain();

  // click sui bottoni
  btnMain.addEventListener('click', activateMain);
  btnSpecial.addEventListener('click', activateSpecial);
});
