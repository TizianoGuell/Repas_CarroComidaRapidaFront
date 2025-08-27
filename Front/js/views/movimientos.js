import { state, saveState } from '../state.js';
import { money, uid } from '../utils.js';

export default function movimientos(container) {
  const today = new Date().toISOString().slice(0, 10);
  let currentDate = today;

  function render() {
    container.innerHTML = `
      <h1>Movimientos de caja</h1>
      <form id="mov-form">
        <select name="tipo"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select>
        <select name="medio"><option value="efectivo">Efectivo</option><option value="debito">Débito</option><option value="transferencia">Transferencia</option></select>
        <input name="monto" type="number" min="0" required placeholder="Monto" />
        <input name="motivo" placeholder="Motivo" required />
        <input name="referencia" placeholder="Referencia" />
        <button type="submit">Agregar</button>
      </form>
      <table class="list"><thead><tr><th>Hora</th><th>Tipo</th><th>Medio</th><th>Monto</th><th>Motivo</th></tr></thead><tbody id="tbody"></tbody></table>
      <div id="totales"></div>
    `;
    container.querySelector('#mov-form').addEventListener('submit', submit);
    fill();
  }

  function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const mov = { id: uid(), fechaISO: new Date().toISOString(), tipo: data.tipo, medio: data.medio, monto: Number(data.monto), motivo: data.motivo, referencia: data.referencia };
    state.movimientos.push(mov);
    saveState('movimientos');
    e.target.reset();
    fill();
  }

  function fill() {
    const tbody = container.querySelector('#tbody');
    tbody.innerHTML = '';
    const movs = state.movimientos.filter(m => m.fechaISO.startsWith(currentDate));
    movs.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date(m.fechaISO).toLocaleTimeString()}</td><td>${m.tipo}</td><td>${m.medio}</td><td>${money.format(m.monto)}</td><td>${m.motivo}</td>`;
      tbody.appendChild(tr);
    });
    const totals = { efectivo: 0, debito: 0, transferencia: 0 };
    movs.forEach(m => { totals[m.medio] += m.tipo === 'ingreso' ? m.monto : -m.monto; });
    const ventasEfectivo = state.ventas.filter(v => v.fechaISO.startsWith(currentDate) && v.metodo_pago === 'efectivo').reduce((s, v) => s + v.total, 0);
    const saldo = (state.caja?.monto_inicial || 0) + ventasEfectivo + totals.efectivo;
    container.querySelector('#totales').innerHTML = `Saldo efectivo: <strong>${money.format(saldo)}</strong>`;
  }

  render();
}
