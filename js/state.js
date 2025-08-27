import {generateId} from './utils.js';

const STORAGE_KEY = 'repas_state';
let state;

function seedProducts(){
  return [
    {id:generateId('p'), nombre:'Hamburguesa Clásica', precio:1500, categoria:'Hamburguesas', imagen:'assets/hamburguesa.svg', activo:true},
    {id:generateId('p'), nombre:'Hamburguesa Doble', precio:2000, categoria:'Hamburguesas', imagen:'assets/hamburguesa.svg', activo:true},
    {id:generateId('p'), nombre:'Cheeseburger', precio:1700, categoria:'Hamburguesas', imagen:'assets/hamburguesa.svg', activo:true},
    {id:generateId('p'), nombre:'Agua', precio:600, categoria:'Bebidas', imagen:'assets/bebida.svg', activo:true},
    {id:generateId('p'), nombre:'Gaseosa', precio:800, categoria:'Bebidas', imagen:'assets/bebida.svg', activo:true},
    {id:generateId('p'), nombre:'Cerveza', precio:1200, categoria:'Bebidas', imagen:'assets/bebida.svg', activo:true},
    {id:generateId('p'), nombre:'Papas Fritas', precio:900, categoria:'Guarniciones', imagen:'assets/guarnicion.svg', activo:true},
    {id:generateId('p'), nombre:'Aros de Cebolla', precio:1000, categoria:'Guarniciones', imagen:'assets/guarnicion.svg', activo:true},
    {id:generateId('p'), nombre:'Ensalada', precio:1100, categoria:'Guarniciones', imagen:'assets/guarnicion.svg', activo:true},
    {id:generateId('p'), nombre:'Limonada', precio:700, categoria:'Bebidas', imagen:'assets/bebida.svg', activo:true}
  ];
}

function load(){
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(data){
    state = data;
  }else{
    state = {productos:seedProducts(), ventas:[], venta_items:[], movimientos:[], caja:null, theme:'light'};
    save();
  }
}

export function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function init(){
  load();
  return state;
}

export function getProductos(){
  return state.productos.filter(p=>p.activo!==false);
}
export function addProducto(prod){
  prod.id = generateId('p');
  prod.activo = true;
  state.productos.push(prod);
  save();
}
export function updateProducto(prod){
  const idx = state.productos.findIndex(p=>p.id===prod.id);
  if(idx>-1){ state.productos[idx]=prod; save(); }
}
export function removeProducto(id){
  state.productos = state.productos.filter(p=>p.id!==id);
  save();
}

export function addVenta(venta, items){
  venta.id = generateId('v');
  state.ventas.push(venta);
  items.forEach(it=>{ it.id = generateId('vi'); it.venta_id = venta.id; state.venta_items.push(it); });
  save();
}
export function getVentas(){ return state.ventas; }
export function getVentaItems(venta_id){ return state.venta_items.filter(i=>i.venta_id===venta_id); }
export function removeVenta(id){
  state.ventas = state.ventas.filter(v=>v.id!==id);
  state.venta_items = state.venta_items.filter(i=>i.venta_id!==id);
  save();
}

export function addMovimiento(mov){ mov.id=generateId('m'); state.movimientos.push(mov); save(); }
export function getMovimientos(){ return state.movimientos; }

export function openCaja(monto){ state.caja={fecha_aperturaISO:new Date().toISOString(), monto_inicial:monto}; save(); }
export function closeCaja(montoContado){
  const saldo = calcularSaldoCaja();
  state.caja.fecha_cierreISO=new Date().toISOString();
  state.caja.monto_contado=montoContado;
  state.caja.diferencia=montoContado - saldo;
  save();
}
export function cajaAbierta(){ return state.caja && !state.caja.fecha_cierreISO; }
export function getCaja(){ return state.caja; }

export function ventasDelDia(){
  const hoy = new Date().toISOString().slice(0,10);
  return state.ventas.filter(v=>v.fechaISO.slice(0,10)===hoy);
}
export function totalDelDia(){
  return ventasDelDia().reduce((s,v)=>s+v.total,0);
}
export function productoMasVendido(){
  const items = ventasDelDia().flatMap(v=>getVentaItems(v.id));
  if(items.length===0) return 'N/A';
  const tot = {};
  items.forEach(i=>{ tot[i.nombre]=(tot[i.nombre]||0)+i.cantidad; });
  return Object.entries(tot).sort((a,b)=>b[1]-a[1])[0][0];
}
export function ventasPorHora(){
  const arr = Array(24).fill(0);
  ventasDelDia().forEach(v=>{ const h=new Date(v.fechaISO).getHours(); arr[h]+=v.total; });
  return arr;
}

export function calcularSaldoCaja(){
  if(!state.caja) return 0;
  const apertura = state.caja.monto_inicial;
  const ventasEfe = state.ventas.filter(v=>v.metodo_pago==='efectivo').reduce((s,v)=>s+v.total,0);
  const ingresosEfe = state.movimientos.filter(m=>m.tipo==='ingreso' && m.medio==='efectivo').reduce((s,m)=>s+m.monto,0);
  const egresosEfe = state.movimientos.filter(m=>m.tipo==='egreso' && m.medio==='efectivo').reduce((s,m)=>s+m.monto,0);
  return apertura + ventasEfe + ingresosEfe - egresosEfe;
}

export function setTheme(t){ state.theme=t; save(); }
export function getTheme(){ return state.theme || 'light'; }
