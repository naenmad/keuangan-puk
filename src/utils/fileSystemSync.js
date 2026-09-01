import { getAuthToken } from './auth';

const STORAGE_KEY = 'neraca_puk_financial_data';
const FILE_NAME_KEY = 'neraca_puk_filename_key';

let activeFileName = 'Laporan_Keuangan_PUK.xlsx';

export function getActiveFileName() {
  try {
    return localStorage.getItem(FILE_NAME_KEY) || activeFileName;
  } catch (e) {
    return activeFileName;
  }
}

export function setActiveFileName(name) {
  if (name) {
    activeFileName = name;
    try {
      localStorage.setItem(FILE_NAME_KEY, name);
    } catch (e) {}
  }
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
    localStorage.removeItem(FILE_NAME_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
}

// ===== CLOUD VERCEL KV SYNC HELPERS =====

export async function fetchFromCloudKV() {
  try {
    const res = await fetch('/api/neraca');
    if (!res.ok) return null;

    const result = await res.json();
    if (result.success && result.data) {
      const payload = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      if (payload.data && Array.isArray(payload.data)) {
        saveToLocalStorage(payload.data);
        if (payload.fileName) setActiveFileName(payload.fileName);
        return payload;
      }
    }
    return null;
  } catch (error) {
    console.log('Cloud KV not reachable or offline, using local storage cache.');
    return null;
  }
}

export async function saveToCloudKV(data, fileName) {
  saveToLocalStorage(data);
  if (fileName) setActiveFileName(fileName);

  const token = getAuthToken();
  if (!token) return { success: false, message: 'Harus login sebagai Admin untuk sinkronisasi ke cloud' };

  try {
    const res = await fetch('/api/neraca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data, fileName: fileName || activeFileName })
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Failed to sync Neraca to Vercel KV:', error);
    return { success: false, message: 'Gagal sinkron ke Cloud Database' };
  }
}

export async function deleteFromCloudKV() {
  clearLocalStorage();
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/neraca', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (e) {}
}
