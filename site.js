document.addEventListener('DOMContentLoaded', () => {

  document.body.classList.add('page-loaded');

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

});
