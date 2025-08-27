// Utilidades generales
export const formatCurrency = (v) => new Intl.NumberFormat('es-AR', {style:'currency', currency:'ARS'}).format(v);

export const generateId = (prefix='id') => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export function exportCSV(filename, rows) {
  const csv = rows.map(r => r.map(field => '"' + String(field).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function printTicket(html) {
  const area = document.getElementById('print-area');
  area.innerHTML = html;
  setTimeout(() => window.print(), 100);
}

export function toDateInputValue(date){
  return date.toISOString().split('T')[0];
}
