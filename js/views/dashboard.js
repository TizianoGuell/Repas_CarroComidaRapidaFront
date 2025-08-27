import {ventasDelDia, totalDelDia, productoMasVendido, ventasPorHora} from '../state.js';
import {formatCurrency} from '../utils.js';

export default function dashboard(){
  const div = document.createElement('div');
  const ventas = ventasDelDia();
  div.innerHTML = `
    <h1>Dashboard</h1>
    <div class="kpis" style="display:flex;gap:1rem;flex-wrap:wrap;">
      <div class="card">Ventas del día: <strong>${ventas.length}</strong></div>
      <div class="card">Total del día: <strong>${formatCurrency(totalDelDia())}</strong></div>
      <div class="card">Producto más vendido: <strong>${productoMasVendido()}</strong></div>
    </div>
    <canvas id="ventas-horas" width="600" height="120"></canvas>
  `;
  const canvas = div.querySelector('#ventas-horas');
  const ctx = canvas.getContext('2d');
  const data = ventasPorHora();
  const max = Math.max(...data, 10);
  const w = canvas.width, h=canvas.height;
  const barWidth = w/data.length;
  ctx.fillStyle = '#e63946';
  data.forEach((v,i)=>{ const barHeight = (v/max)*h; ctx.fillRect(i*barWidth, h-barHeight, barWidth-2, barHeight); });
  return div;
}
