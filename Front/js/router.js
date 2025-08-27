import dashboard from './views/dashboard.js';
import vender from './views/vender.js';
import historial from './views/historial.js';
import movimientos from './views/movimientos.js';

const routes = {
  '#/dashboard': dashboard,
  '#/vender': vender,
  '#/historial': historial,
  '#/movimientos': movimientos
};

export function router() {
  const hash = location.hash || '#/dashboard';
  const view = routes[hash] || dashboard;
  const container = document.getElementById('view-container');
  container.innerHTML = '';
  view(container);
}

window.addEventListener('hashchange', router);
