import { state, saveState } from '../state.js';
import { money, uid, electron } from '../utils.js';
import modal from '../components/modal.js';

export default function vender(container) {
  let cart = [];

  function render() {
    container.innerHTML = `
      <h1>Vender</h1>
      <div class="vender-layout">
        <div class="productos">
          <input type="text" id="search" placeholder="Buscar" />
          <div class="grid" id="prod-grid"></div>
          <button id="add-product" class="secondary">Agregar producto</button>
        </div>
        <div class="cart">
          <h2>Carrito</h2>
          <div id="cart-items"></div>
          <div>Subtotal: <span id="subtotal">0</span></div>
          <div>Descuento: <input type="number" id="discount" min="0" value="0"/></div>
          <div>Total: <span id="total">0</span></div>
          <button id="checkout" class="primary">Cobrar</button>
          <button id="cancel" class="secondary">Cancelar</button>
        </div>
      </div>
    `;
    container.querySelector('#search').addEventListener('input', updateProducts);
    container.querySelector('#add-product').addEventListener('click', showProductModal);
    container.querySelector('#checkout').addEventListener('click', checkout);
    container.querySelector('#cancel').addEventListener('click', () => { cart = []; updateCart(); });
    updateProducts();
    updateCart();
  }

  function updateProducts() {
    const term = container.querySelector('#search').value.toLowerCase();
    const grid = container.querySelector('#prod-grid');
    grid.innerHTML = '';
    state.productos.filter(p => p.activo && p.nombre.toLowerCase().includes(term)).forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}"/><span>${p.nombre}</span><strong>${money.format(p.precio)}</strong>`;
      div.addEventListener('click', () => addToCart(p));
      grid.appendChild(div);
    });
  }

  function addToCart(prod) {
    const item = cart.find(i => i.id === prod.id);
    if (item) item.cantidad++;
    else cart.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
    updateCart();
  }

  function updateCart() {
    const cont = container.querySelector('#cart-items');
    cont.innerHTML = '';
    let subtotal = 0;
    cart.forEach((i, idx) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<span>${i.nombre} x${i.cantidad}</span><span>${money.format(i.precio * i.cantidad)}</span><div><button data-act="minus" data-idx="${idx}">-</button><button data-act="plus" data-idx="${idx}">+</button><button data-act="del" data-idx="${idx}">x</button></div>`;
      cont.appendChild(div);
      subtotal += i.precio * i.cantidad;
    });
    container.querySelector('#subtotal').textContent = money.format(subtotal);
    const descuento = Number(container.querySelector('#discount').value) || 0;
    container.querySelector('#total').textContent = money.format(subtotal - descuento);
    cont.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        if (btn.dataset.act === 'minus') { cart[idx].cantidad--; if (cart[idx].cantidad <= 0) cart.splice(idx, 1); }
        else if (btn.dataset.act === 'plus') { cart[idx].cantidad++; }
        else if (btn.dataset.act === 'del') { cart.splice(idx, 1); }
        updateCart();
      });
    });
  }

  function showProductModal() {
    const html = `
      <h2>Producto</h2>
      <form id="prod-form">
        <label>Nombre<input name="nombre" required></label>
        <label>Precio<input name="precio" type="number" min="0" required></label>
        <label>Categoría<input name="categoria" required></label>
        <label>Imagen URL<input name="imagen"></label>
        <div class="actions"><button type="submit" data-confirm class="primary">Guardar</button><button type="button" data-cancel class="secondary">Cancelar</button></div>
      </form>`;
    const m = modal(html, {});
    const form = document.getElementById('prod-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fdata = Object.fromEntries(new FormData(form).entries());
      const nuevo = { id: uid(), nombre: fdata.nombre, precio: Number(fdata.precio), categoria: fdata.categoria, imagen: fdata.imagen || 'assets/products/placeholder.svg', activo: true };
      state.productos.push(nuevo);
      saveState('productos');
      updateProducts();
      m.close();
    });
  }

  function checkout() {
    if (!cart.length) return;
    const html = `<h2>Cobro</h2>
      <form id="pay-form">
        <label>Método<select name="metodo"><option value="efectivo">Efectivo</option><option value="debito">Débito</option><option value="transferencia">Transferencia</option></select></label>
        <label><input type="checkbox" name="comanda"/> Imprimir comanda</label>
        <div class="actions"><button type="submit" data-confirm class="primary">Cobrar</button><button type="button" data-cancel class="secondary">Cancelar</button></div>
      </form>`;
    const m = modal(html, {});
    const form = document.getElementById('pay-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const subtotal = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);
      const descuento = Number(container.querySelector('#discount').value) || 0;
      const total = subtotal - descuento;
      const ventaId = uid();
      const venta = { id: ventaId, fechaISO: new Date().toISOString(), subtotal, descuento, total, metodo_pago: data.metodo, imprimir_comanda: !!data.comanda };
      const items = cart.map(it => ({ id: uid(), venta_id: ventaId, producto_id: it.id, nombre: it.nombre, precio_unit: it.precio, cantidad: it.cantidad, subtotal: it.precio * it.cantidad }));
      state.ventas.push(venta);
      state.venta_items.push(...items);
      saveState('ventas');
      saveState('venta_items');
      if (data.metodo === 'efectivo') {
        if (!state.caja) state.caja = { monto_inicial: 0, fecha_aperturaISO: new Date().toISOString() };
        state.caja.ventas_efectivo = (state.caja.ventas_efectivo || 0) + total;
        saveState('caja');
      }
      cart = [];
      updateCart();
      const ticketHtml = `<h1>REPAS</h1><p>${new Date().toLocaleString()}</p>${items.map(i => `${i.nombre} x${i.cantidad} - ${money.format(i.subtotal)}`).join('<br>')}<hr><strong>Total: ${money.format(total)}</strong>`;
      electron.printTicket(ticketHtml);
      if (data.comanda) {
        const comandaHtml = `<h1>Comanda</h1>${items.map(i => `${i.nombre} x${i.cantidad}`).join('<br>')}`;
        electron.printKitchen(comandaHtml);
      }
      m.close();
    });
  }

  render();
}
