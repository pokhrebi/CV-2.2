document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     MOBILE NAV TOGGLE
  ========================= */
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  /* =========================
     DARK MODE TOGGLE
  ========================= */
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  // Load saved theme OR system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* =========================
     PAGE TRANSITION TRIGGER
  ========================= */
  document.body.classList.add('page-loaded');

});
