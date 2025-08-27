import dashboard from './views/dashboard.js';
import vender from './views/vender.js';
import historial from './views/historial.js';
import movimientos from './views/movimientos.js';

const routes = {dashboard, vender, historial, movimientos};

export function router(){
  const hash = location.hash.slice(1) || 'dashboard';
  const view = routes[hash] || dashboard;
  const app = document.getElementById('app');
  app.innerHTML='';
  app.appendChild(view());
  app.focus();
}

window.addEventListener('hashchange', router);
