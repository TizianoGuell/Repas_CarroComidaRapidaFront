import {getProductos, addProducto, updateProducto, removeProducto, addVenta} from '../state.js';
import {formatCurrency, printTicket} from '../utils.js';
import {showModal} from '../components/modal.js';

export default function vender(){
  const div = document.createElement('div');
  div.innerHTML = `
    <h1>Vender</h1>
    <div style="display:flex;gap:1rem;">
      <div style="flex:2;">
        <div style="display:flex;gap:.5rem;margin-bottom:.5rem;flex-wrap:wrap;">
          <input type="text" placeholder="Buscar" id="buscar-prod"/>
          <select id="filtro-cat">
            <option value="">Todas</option>
            <option>Hamburguesas</option>
            <option>Bebidas</option>
            <option>Guarniciones</option>
          </select>
          <button id="btn-add-prod">Agregar producto</button>
        </div>
        <div class="product-grid" id="grid-prod"></div>
      </div>
      <div style="flex:1;" class="cart" id="cart"></div>
    </div>
  `;
  const grid = div.querySelector('#grid-prod');
  const cartDiv = div.querySelector('#cart');
  let cart = [];

  function renderProductos(){
    const texto = div.querySelector('#buscar-prod').value.toLowerCase();
    const cat = div.querySelector('#filtro-cat').value;
    grid.innerHTML='';
    getProductos().filter(p=>p.nombre.toLowerCase().includes(texto) && (!cat || p.categoria===cat)).forEach(p=>{
       const card=document.createElement('div');
       card.className='product-card';
       card.style.position='relative';
       card.innerHTML=`<img src="${p.imagen}" alt=""><div class="name">${p.nombre}</div><div>${formatCurrency(p.precio)}</div>`;
       card.addEventListener('click',()=>addToCart(p));
       const edit=document.createElement('button'); edit.textContent='✎'; edit.style.position='absolute'; edit.style.top='2px'; edit.style.right='2px';
       edit.addEventListener('click',e=>{e.stopPropagation(); editarProducto(p);});
       const del=document.createElement('button'); del.textContent='🗑'; del.style.position='absolute'; del.style.bottom='2px'; del.style.right='2px';
       del.addEventListener('click',e=>{e.stopPropagation(); if(confirm('Eliminar producto?')){ removeProducto(p.id); renderProductos(); }});
       card.append(edit, del);
       grid.appendChild(card);
    });
  }

  function editarProducto(p){
    const form=document.createElement('form');
    form.innerHTML=`<label>Nombre<br><input name="nombre" value="${p.nombre}" required></label><br><label>Precio<br><input name="precio" type="number" min="0" step="0.01" value="${p.precio}" required></label><br><label>Categoría<br><input name="categoria" value="${p.categoria}" required></label><br><label>Imagen URL<br><input name="imagen" value="${p.imagen}"></label>`;
    showModal({title:'Editar producto',content:form,onConfirm:()=>{
       const fd=new FormData(form);
       updateProducto({id:p.id,nombre:fd.get('nombre'),precio:parseFloat(fd.get('precio')),categoria:fd.get('categoria'),imagen:fd.get('imagen'),activo:true});
       renderProductos();
    }});
  }

  function addToCart(prod){
     const existing = cart.find(i=>i.producto_id===prod.id);
     if(existing){ existing.cantidad++; existing.subtotal=existing.cantidad*existing.precio_unit; }
     else cart.push({producto_id:prod.id, nombre:prod.nombre, precio_unit:prod.precio, cantidad:1, subtotal:prod.precio});
     renderCart();
  }

  function renderCart(){
    cartDiv.innerHTML='<h3>Carrito</h3>';
    cart.forEach((item,idx)=>{
       const row=document.createElement('div'); row.className='cart-item';
       row.innerHTML=`<span>${item.nombre} (${formatCurrency(item.precio_unit)})</span><div><button data-action="-">-</button><span>${item.cantidad}</span><button data-action="+">+</button><button data-action="del">x</button></div>`;
       row.querySelector('[data-action="+"]').addEventListener('click',()=>{item.cantidad++;item.subtotal=item.cantidad*item.precio_unit;renderCart();});
       row.querySelector('[data-action="-"]').addEventListener('click',()=>{item.cantidad--;if(item.cantidad<=0) cart.splice(idx,1); else item.subtotal=item.cantidad*item.precio_unit;renderCart();});
       row.querySelector('[data-action="del"]').addEventListener('click',()=>{cart.splice(idx,1);renderCart();});
       cartDiv.appendChild(row);
    });
    const subtotal = cart.reduce((s,i)=>s+i.subtotal,0);
    const totalDiv=document.createElement('div'); totalDiv.className='cart-total'; totalDiv.textContent='Total: '+formatCurrency(subtotal); cartDiv.appendChild(totalDiv);
    const actions=document.createElement('div'); actions.innerHTML='<button id="btn-cobrar">Cobrar</button> <button id="btn-cancelar">Cancelar</button>'; cartDiv.appendChild(actions);
    cartDiv.querySelector('#btn-cancelar').addEventListener('click',()=>{cart=[];renderCart();});
    cartDiv.querySelector('#btn-cobrar').addEventListener('click', cobrar);
  }

  function cobrar(){
     if(cart.length===0) return;
     const form=document.createElement('form');
     form.innerHTML=`<label>Método de pago<select name="metodo"><option value="efectivo">Efectivo</option><option value="debito">Débito</option><option value="transferencia">Transferencia</option></select></label><br><label><input type="checkbox" name="comanda"> Imprimir comanda</label>`;
     showModal({title:'Cobro', content:form, onConfirm:()=>{
        const data=new FormData(form);
        const venta={fechaISO:new Date().toISOString(), subtotal:cart.reduce((s,i)=>s+i.subtotal,0), descuento:0,total:cart.reduce((s,i)=>s+i.subtotal,0), metodo_pago:data.get('metodo'), imprimir_comanda:data.get('comanda')==='on'};
        addVenta(venta, cart.map(i=>({...i})));
        const html = ticketHTML(venta,cart);
        printTicket(html);
        if(venta.imprimir_comanda) printTicket(html);
        cart=[]; renderCart();
     }});
  }

  function ticketHTML(venta,items){
     let html = `<h1>REPAS</h1><p>${new Date(venta.fechaISO).toLocaleString('es-AR')}</p><table style="width:100%;">`;
     items.forEach(i=>{html+=`<tr><td>${i.cantidad} x ${i.nombre}</td><td style="text-align:right;">${formatCurrency(i.subtotal)}</td></tr>`;});
     html+=`<tr><td>Total</td><td style="text-align:right;">${formatCurrency(venta.total)}</td></tr></table>`;
     return html;
  }

  div.querySelector('#buscar-prod').addEventListener('input',renderProductos);
  div.querySelector('#filtro-cat').addEventListener('change',renderProductos);
  div.querySelector('#btn-add-prod').addEventListener('click',()=>{
     const form=document.createElement('form');
     form.innerHTML=`<label>Nombre<br><input name="nombre" required></label><br><label>Precio<br><input name="precio" type="number" min="0" step="0.01" required></label><br><label>Categoría<br><input name="categoria" required></label><br><label>Imagen URL<br><input name="imagen"></label>`;
     showModal({title:'Agregar producto',content:form,onConfirm:()=>{
        const fd=new FormData(form);
        addProducto({nombre:fd.get('nombre'),precio:parseFloat(fd.get('precio')),categoria:fd.get('categoria'),imagen:fd.get('imagen')||'assets/hamburguesa.svg'});
        renderProductos();
     }});
  });

  renderProductos();
  renderCart();
  return div;
}
