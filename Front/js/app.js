import { state, loadState, saveState } from './state.js';
import { router } from './router.js';
import { electron } from './utils.js';

function initTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    saveState('theme');
  });
}

function initSidebar() {
  document.getElementById('sidebar').addEventListener('click', (e) => {
    if (e.target.matches('button[data-route]')) {
      location.hash = e.target.dataset.route;
    }
  });
}

function initClock() {
  const clock = document.getElementById('clock');
  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString();
  }, 1000);
}

function initVersion() {
  electron.getVersion().then(v => {
    document.getElementById('version').textContent = v;
  });
}

function initShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F1') { e.preventDefault(); location.hash = '#/dashboard'; }
    if (e.key === 'F2') { e.preventDefault(); location.hash = '#/vender'; }
    if (e.key === 'F3') { e.preventDefault(); location.hash = '#/historial'; }
    if (e.key === 'F4') { e.preventDefault(); location.hash = '#/movimientos'; }
    if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); location.hash = '#/vender'; }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTheme();
  initSidebar();
  initClock();
  initVersion();
  initShortcuts();
  router();
});
