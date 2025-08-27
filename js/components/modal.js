// Componente modal reutilizable
export function showModal({title='', content='', onConfirm=()=>{}, onCancel=()=>{}, confirmText='Confirmar', cancelText='Cancelar'}){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML = `<header>${title}</header>`;
  const body = document.createElement('div');
  if(typeof content === 'string'){ body.innerHTML = content; } else { body.append(content); }
  box.appendChild(body);
  const actions = document.createElement('div');
  actions.className='modal-actions';
  const cancelBtn = document.createElement('button'); cancelBtn.textContent=cancelText;
  const okBtn = document.createElement('button'); okBtn.textContent=confirmText;
  actions.append(cancelBtn, okBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.getElementById('modal-root').appendChild(overlay);

  function close(){ overlay.remove(); document.removeEventListener('keydown', keyHandler); }
  function keyHandler(e){ if(e.key==='Escape'){ onCancel(); close(); } if(e.key==='Enter'){ onConfirm(); close(); } }
  document.addEventListener('keydown', keyHandler);
  cancelBtn.addEventListener('click', ()=>{ onCancel(); close(); });
  okBtn.addEventListener('click', ()=>{ onConfirm(); close(); });
  return {close};
}
