// Scrolls all .cards-container elements to center their content horizontally on load (for horizontal carousels)
function centerCardsContainer() {
  document.querySelectorAll('.cards-container').forEach(container => {
    // Only run on mobile
    if (window.innerWidth <= 700) {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      if (scrollWidth > clientWidth) {
        // Center the scroll position
        container.scrollLeft = (scrollWidth - clientWidth) / 2;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', centerCardsContainer);

// Debounce resize and only re-center if width changes
let lastWidth = window.innerWidth;
let resizeTimeout;
window.addEventListener('resize', function() {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      centerCardsContainer();
    }
  }, 150);
});
