import {router} from './router.js';
import {init, cajaAbierta, openCaja, setTheme, getTheme, calcularSaldoCaja} from './state.js';
import {showModal} from './components/modal.js';
import {toDateInputValue, formatCurrency} from './utils.js';

init();

// tema
function applyTheme(){ document.body.dataset.theme = getTheme(); }
applyTheme();
document.getElementById('toggle-theme').addEventListener('click', ()=>{
  const theme = getTheme()==='dark'?'light':'dark';
  setTheme(theme);
  applyTheme();
});

// reloj
function updateClock(){
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('es-AR');
}
setInterval(updateClock,1000); updateClock();

// router inicial
router();

// atajos de teclado
window.addEventListener('keydown', e=>{
  if(e.ctrlKey && e.key==='n'){ location.hash='#vender'; }
  if(e.key==='F1'){ e.preventDefault(); location.hash='#dashboard'; }
  if(e.key==='F2'){ e.preventDefault(); location.hash='#vender'; }
  if(e.key==='F3'){ e.preventDefault(); location.hash='#historial'; }
  if(e.key==='F4'){ e.preventDefault(); location.hash='#movimientos'; }
});

// apertura de caja si no abierta
if(!cajaAbierta()){
  const form = document.createElement('form');
  form.innerHTML = `<label>Monto inicial:<br><input type="number" min="0" step="0.01" required></label>`;
  showModal({title:'Apertura de caja', content:form, onConfirm:()=>{
    const monto = parseFloat(form.querySelector('input').value)||0;
    openCaja(monto); router();
  }});
}

export function solicitarCierre(){
  const form = document.createElement('form');
  form.innerHTML = `<p>Saldo teórico: <strong>${formatCurrency(calcularSaldoCaja())}</strong></p><label>Monto contado:<br><input type="number" min="0" step="0.01" required></label>`;
  showModal({title:'Cierre de caja', content:form, onConfirm:()=>{
    const monto = parseFloat(form.querySelector('input').value)||0;
    import('./state.js').then(m=>m.closeCaja(monto));
  }});
}
