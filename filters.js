// filters.js
document.addEventListener('DOMContentLoaded', () => {
  const btnMain      = document.querySelector('.wrapper-filter .first');
  const btnSpecial   = document.querySelector('.wrapper-filter .second');
  const mainCards    = document.querySelector('.cardcontainer:not(#special)');
  const specialCards = document.getElementById('special');

  // stato corrente: 'main' o 'special'
  let currentActive = 'main';

  function styleActive(btn) {
    btn.style.backgroundColor          = '#04081B';
    btn.querySelector('p').style.color = '#FFF';
  }
  function styleInactive(btn) {
    btn.style.backgroundColor          = '#FFF';
    btn.querySelector('p').style.color = '#C2C2C2';
  }

  function activateMain() {
    currentActive = 'main';
    styleActive(btnMain);
    styleInactive(btnSpecial);
    mainCards.style.display    = 'flex';
    specialCards.style.display = 'none';
  }

  function activateSpecial() {
    currentActive = 'special';
    styleActive(btnSpecial);
    styleInactive(btnMain);
    mainCards.style.display    = 'none';
    specialCards.style.display = 'flex';
  }

  // inizializza con Main attivo
  activateMain();

  // click sui bottoni
  btnMain.addEventListener('click',    activateMain);
  btnSpecial.addEventListener('click', activateSpecial);
  
  // RIMOSSI gli event listener hover che cambiavano i colori
});
