import {getVentas, getVentaItems, removeVenta} from '../state.js';
import {formatCurrency, exportCSV, toDateInputValue} from '../utils.js';
import {showModal} from '../components/modal.js';

export default function historial(){
  const div = document.createElement('div');
  const hoy = new Date();
  div.innerHTML = `
    <h1>Historial</h1>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem;">
      <input type="date" id="filtro-fecha" value="${toDateInputValue(hoy)}">
      <input type="text" id="buscar-id" placeholder="Buscar por id">
      <button id="btn-export">Exportar CSV</button>
    </div>
    <table class="table" id="tabla-ventas">
      <thead><tr><th>Hora</th><th>Método</th><th>Total</th><th></th></tr></thead>
      <tbody></tbody>
    </table>
  `;
  const tbody = div.querySelector('tbody');

  function render(){
     const fecha = div.querySelector('#filtro-fecha').value;
     const search = div.querySelector('#buscar-id').value;
     tbody.innerHTML='';
     getVentas().filter(v=>v.fechaISO.slice(0,10)===fecha && (!search || v.id.includes(search))).forEach(v=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${new Date(v.fechaISO).toLocaleTimeString('es-AR')}</td><td>${v.metodo_pago}</td><td>${formatCurrency(v.total)}</td><td><button data-ver>Ver</button> <button data-del>Eliminar</button></td>`;
        tr.querySelector('[data-ver]').addEventListener('click',()=>mostrarVenta(v));
        tr.querySelector('[data-del]').addEventListener('click',()=>{ if(confirm('Eliminar venta?')){ removeVenta(v.id); render(); } });
        tbody.appendChild(tr);
     });
  }

  function mostrarVenta(v){
     const items = getVentaItems(v.id);
     let html = `<p>ID: ${v.id}</p><p>${new Date(v.fechaISO).toLocaleString('es-AR')}</p><table class="table"><tr><th>Producto</th><th>Cant</th><th>Subtotal</th></tr>`;
     items.forEach(i=>{ html+=`<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>${formatCurrency(i.subtotal)}</td></tr>`; });
     html+=`<tr><td colspan="2">Total</td><td>${formatCurrency(v.total)}</td></tr></table>`;
     showModal({title:'Venta',content:html,confirmText:'Cerrar',cancelText:'Eliminar',onCancel:()=>{ if(confirm('Eliminar venta?')){ removeVenta(v.id); render(); }} });
  }

  div.querySelector('#filtro-fecha').addEventListener('change',render);
  div.querySelector('#buscar-id').addEventListener('input',render);
  div.querySelector('#btn-export').addEventListener('click',()=>{
    const fecha=div.querySelector('#filtro-fecha').value;
    const rows=[[ 'id','fecha','metodo','total']];
    getVentas().filter(v=>v.fechaISO.slice(0,10)===fecha).forEach(v=>rows.push([v.id,v.fechaISO,v.metodo_pago,v.total]));
    exportCSV('ventas_'+fecha+'.csv', rows);
  });

  render();
  return div;
}
