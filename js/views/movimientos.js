import {getMovimientos, addMovimiento, calcularSaldoCaja} from '../state.js';
import {formatCurrency} from '../utils.js';

export default function movimientos(){
  const div = document.createElement('div');
  div.innerHTML=`
    <h1>Movimientos</h1>
    <form id="mov-form" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      <select name="tipo" required><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select>
      <select name="medio" required><option value="efectivo">Efectivo</option><option value="debito">Débito</option><option value="transferencia">Transferencia</option></select>
      <input name="monto" type="number" min="0" step="0.01" placeholder="Monto" required>
      <input name="motivo" placeholder="Motivo" required>
      <input name="referencia" placeholder="Referencia">
      <button type="submit">Agregar</button>
    </form>
    <button id="btn-cierre">Cerrar caja</button>
    <table class="table"><thead><tr><th>Hora</th><th>Tipo</th><th>Medio</th><th>Monto</th><th>Motivo</th></tr></thead><tbody></tbody></table>
    <div id="totales"></div>
  `;
  const tbody = div.querySelector('tbody');

  function render(){
     const fecha = new Date().toISOString().slice(0,10);
     tbody.innerHTML='';
     const movimientos = getMovimientos().filter(m=>m.fechaISO.slice(0,10)===fecha);
     movimientos.forEach(m=>{
       const tr=document.createElement('tr');
       tr.innerHTML=`<td>${new Date(m.fechaISO).toLocaleTimeString('es-AR')}</td><td>${m.tipo}</td><td>${m.medio}</td><td>${formatCurrency(m.monto)}</td><td>${m.motivo}</td>`;
       tbody.appendChild(tr);
     });
     div.querySelector('#totales').innerHTML = `Saldo efectivo: <strong>${formatCurrency(calcularSaldoCaja())}</strong>`;
  }

  div.querySelector('#mov-form').addEventListener('submit',e=>{
     e.preventDefault();
     const fd=new FormData(e.target);
     addMovimiento({fechaISO:new Date().toISOString(), tipo:fd.get('tipo'), medio:fd.get('medio'), monto:parseFloat(fd.get('monto')), motivo:fd.get('motivo'), referencia:fd.get('referencia')});
     e.target.reset();
     render();
  });

  div.querySelector('#btn-cierre').addEventListener('click',()=>import('../app.js').then(m=>m.solicitarCierre()));

  render();
  return div;
}
