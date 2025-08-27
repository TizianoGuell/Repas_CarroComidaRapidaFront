import { state } from '../state.js';
import { money } from '../utils.js';

export default function dashboard(container) {
  const today = new Date().toISOString().slice(0, 10);
  const ventasHoy = state.ventas.filter(v => v.fechaISO.startsWith(today));
  const cantVentas = ventasHoy.length;
  const total = ventasHoy.reduce((s, v) => s + v.total, 0);
  const prodCount = {};
  state.venta_items.forEach(i => {
    const venta = state.ventas.find(v => v.id === i.venta_id);
    if (venta && venta.fechaISO.startsWith(today)) {
      prodCount[i.nombre] = (prodCount[i.nombre] || 0) + i.cantidad;
    }
  });
  const masVendido = Object.keys(prodCount).sort((a, b) => prodCount[b] - prodCount[a])[0] || 'N/A';

  container.innerHTML = `
    <h1>Dashboard</h1>
    <div class="kpis">
      <div class="card">Ventas del día: <strong>${cantVentas}</strong></div>
      <div class="card">Total del día: <strong>${money.format(total)}</strong></div>
      <div class="card">Producto más vendido: <strong>${masVendido}</strong></div>
    </div>
    <canvas id="chart" width="600" height="200"></canvas>
  `;

  const ctx = container.querySelector('#chart').getContext('2d');
  const horas = new Array(24).fill(0);
  ventasHoy.forEach(v => {
    const h = new Date(v.fechaISO).getHours();
    horas[h] += v.total;
  });
  const max = Math.max(...horas);
  const w = 600 / 24;
  ctx.fillStyle = '#c00000';
  horas.forEach((val, i) => {
    const h = max ? (val / max) * 200 : 0;
    ctx.fillRect(i * w, 200 - h, w - 1, h);
  });
}
