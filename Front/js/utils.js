export const electron = (typeof window !== 'undefined' && window.electronAPI) ? window.electronAPI : {
  printTicket: (html) => window.print(),
  printKitchen: (html) => window.print(),
  saveCSV: (csv, fileName = 'export.csv') => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  },
  getVersion: () => Promise.resolve('v1.0.0')
};

export const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9));
