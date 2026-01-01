const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

navToggle.onclick = () => nav.classList.toggle('open');

// Dark mode
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;

themeToggle.onclick = () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
};
