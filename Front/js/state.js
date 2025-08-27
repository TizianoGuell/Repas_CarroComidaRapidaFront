import { uid } from './utils.js';

export const state = {
  productos: [],
  ventas: [],
  venta_items: [],
  movimientos: [],
  caja: null,
  theme: 'light'
};

const KEYS = {
  productos: 'productos',
  ventas: 'ventas',
  venta_items: 'venta_items',
  movimientos: 'movimientos',
  caja: 'caja',
  theme: 'theme'
};

export function loadState() {
  Object.keys(KEYS).forEach(k => {
    const stored = localStorage.getItem(KEYS[k]);
    if (stored) state[k] = JSON.parse(stored);
  });
  if (!state.productos.length) seedProductos();
  if (!state.theme) state.theme = 'light';
}

export function saveState(key) {
  localStorage.setItem(KEYS[key], JSON.stringify(state[key]));
}

function seedProductos() {
  state.productos = [
    { id: uid(), nombre: 'Hamburguesa Simple', precio: 1500, categoria: 'Hamburguesas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Hamburguesa Doble', precio: 2000, categoria: 'Hamburguesas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Hamburguesa Veggie', precio: 1800, categoria: 'Hamburguesas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Papas Fritas', precio: 800, categoria: 'Guarniciones', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Papas con Cheddar', precio: 1200, categoria: 'Guarniciones', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Gaseosa', precio: 600, categoria: 'Bebidas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Agua', precio: 500, categoria: 'Bebidas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Cerveza', precio: 1000, categoria: 'Bebidas', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Helado', precio: 700, categoria: 'Postres', imagen: 'assets/products/placeholder.svg', activo: true },
    { id: uid(), nombre: 'Ensalada', precio: 900, categoria: 'Guarniciones', imagen: 'assets/products/placeholder.svg', activo: true }
  ];
  saveState('productos');
}

export function openCaja(monto) {
  state.caja = { fecha_aperturaISO: new Date().toISOString(), monto_inicial: Number(monto) };
  saveState('caja');
}

export function closeCaja(montoContado) {
  if (!state.caja) return;
  const ventasEfec = state.ventas.filter(v => v.metodo_pago === 'efectivo').reduce((s, v) => s + v.total, 0);
  const movs = state.movimientos.filter(m => m.medio === 'efectivo').reduce((s, m) => m.tipo === 'ingreso' ? s + m.monto : s - m.monto, 0);
  const saldo = (state.caja.monto_inicial || 0) + ventasEfec + movs;
  state.caja.fecha_cierreISO = new Date().toISOString();
  state.caja.monto_contado = Number(montoContado);
  state.caja.diferencia = Number(montoContado) - saldo;
  saveState('caja');
}
