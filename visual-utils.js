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

// Center cards only the first time a .cards-container becomes visible
document.querySelectorAll('.cards-container').forEach(container => {
  let wasHidden = getComputedStyle(container).display === 'none';
  if (wasHidden) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style' &&
          getComputedStyle(container).display !== 'none' &&
          wasHidden
        ) {
          centerCardsContainer();
          wasHidden = false;
          observer.disconnect();
        }
      });
    });
    observer.observe(container, { attributes: true, attributeFilter: ['style'] });
  }
});

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
