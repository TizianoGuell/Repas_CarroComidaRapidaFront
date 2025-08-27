import { state, saveState } from '../state.js';
import { money, electron } from '../utils.js';
import modal from '../components/modal.js';

export default function historial(container) {
  const today = new Date().toISOString().slice(0, 10);
  let currentDate = today;

  function render() {
    container.innerHTML = `
      <h1>Historial</h1>
      <input type="date" id="fecha" value="${currentDate}"> <button id="export">Exportar CSV</button>
      <table class="list"><thead><tr><th>Hora</th><th>Método</th><th>Total</th><th></th></tr></thead><tbody id="tbody"></tbody></table>
    `;
    container.querySelector('#fecha').addEventListener('change', e => { currentDate = e.target.value; fill(); });
    container.querySelector('#export').addEventListener('click', exportCSV);
    fill();
  }

  function fill() {
    const tbody = container.querySelector('#tbody');
    tbody.innerHTML = '';
    const ventas = state.ventas.filter(v => v.fechaISO.startsWith(currentDate));
    ventas.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(v.fechaISO).toLocaleTimeString()}</td><td>${v.metodo_pago}</td><td>${money.format(v.total)}</td><td><button data-id="${v.id}">Ver</button><button data-del="${v.id}">X</button></td>`;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', () => viewVenta(btn.dataset.id)));
    tbody.querySelectorAll('button[data-del]').forEach(btn => btn.addEventListener('click', () => delVenta(btn.dataset.del)));
  }

  function viewVenta(id) {
    const venta = state.ventas.find(v => v.id === id);
    const items = state.venta_items.filter(i => i.venta_id === id);
    const html = `<h2>Venta ${id}</h2>${items.map(i => `${i.nombre} x${i.cantidad} - ${money.format(i.subtotal)}`).join('<br>')}<p>Total: ${money.format(venta.total)}</p><div class="actions"><button data-cancel>Cerrar</button></div>`;
    modal(html, {});
  }

  function delVenta(id) {
    if (!confirm('Eliminar venta?')) return;
    state.ventas = state.ventas.filter(v => v.id !== id);
    state.venta_items = state.venta_items.filter(i => i.venta_id !== id);
    saveState('ventas');
    saveState('venta_items');
    fill();
  }

  function exportCSV() {
    const ventas = state.ventas.filter(v => v.fechaISO.startsWith(currentDate));
    const lines = ['id,fechaISO,metodo_pago,total'];
    ventas.forEach(v => lines.push(`${v.id},${v.fechaISO},${v.metodo_pago},${v.total}`));
    electron.saveCSV(lines.join('\n'), `ventas-${currentDate}.csv`);
  }

  render();
}
