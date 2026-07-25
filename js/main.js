import { supabase } from './supabaseClient.js';
import { renderHome } from './pages/home.js';
import { renderMenu } from './pages/menu.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { showToast } from './ui.js';

const routes = {
  '/index.html': renderHome,
  '/': renderHome,
  '/menu.html': renderMenu,
  '/about.html': renderAbout,
  '/contact.html': renderContact,
};

function currentPath() {
  const path = window.location.pathname;
  return routes[path] ? path : '/index.html';
}

function setActiveNav() {
  const page = currentPath().replace('/', '').replace('.html', '') || 'home';
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

function closeMobileNav() {
  const nav = document.getElementById('primaryNav');
  const toggle = document.getElementById('navToggle');
  nav.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

function bindShell() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') closeMobileNav();
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMobileNav();
  });

  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('year').textContent = new Date().getFullYear();
}

async function run() {
  bindShell();
  setActiveNav();
  const app = document.getElementById('app');
  const path = currentPath();
  const renderer = routes[path] || routes['/index.html'];
  try {
    await renderer(app, { supabase, showToast });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<section class="error-state"><h2>Something went wrong</h2><p>${err.message}</p></section>`;
  }
}

run();
