document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.cardcontainer');
  const cards = document.querySelectorAll('.card');

  const observerOptions = {
    root: container,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, observerOptions);

  cards.forEach(card => {
    observer.observe(card);
  });
});