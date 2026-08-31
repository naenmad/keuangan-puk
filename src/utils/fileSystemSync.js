const STORAGE_KEY = 'neraca_puk_financial_data';

let activeFileName = 'Laporan_Keuangan_PUK.xlsx';

export function getActiveFileName() {
  return activeFileName;
}

export function setActiveFileName(name) {
  if (name) activeFileName = name;
}

/**
 * LocalStorage Session Persistence Helpers
 */
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
}
