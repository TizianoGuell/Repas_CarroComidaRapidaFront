export default function modal(contentHTML, callbacks = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-content">${contentHTML}</div>`;
  document.body.appendChild(overlay);

  const confirm = overlay.querySelector('[data-confirm]');
  const cancel = overlay.querySelector('[data-cancel]');

  function close() {
    overlay.remove();
    document.removeEventListener('keydown', keyHandler);
  }

  function keyHandler(e) {
    if (e.key === 'Escape') { callbacks.onCancel && callbacks.onCancel(); close(); }
    if (e.key === 'Enter') { callbacks.onConfirm && callbacks.onConfirm(); close(); }
  }
  document.addEventListener('keydown', keyHandler);

  confirm && confirm.addEventListener('click', () => { callbacks.onConfirm && callbacks.onConfirm(); close(); });
  cancel && cancel.addEventListener('click', () => { callbacks.onCancel && callbacks.onCancel(); close(); });

  return { close };
}
