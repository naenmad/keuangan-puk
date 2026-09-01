import { getAuthToken } from './auth';

const STORAGE_KEY = 'neraca_puk_financial_data';
const FILE_NAME_KEY = 'neraca_puk_filename_key';
const REDIS_KEY = 'sai:neraca:data';

// Upstash Direct REST Config (from import.meta.env)
const UPSTASH_URL = import.meta.env?.VITE_KV_REST_API_URL || 'https://cuddly-yak-216436.upstash.io';
const UPSTASH_TOKEN = import.meta.env?.VITE_KV_REST_API_TOKEN || 'gQAAAAAAA010AAIgcDIyNjc2MTM0NTNhZjk0MzYxOGVmMDI4MGU3NWIwYzgzYQ';
const UPSTASH_READ_TOKEN = import.meta.env?.VITE_KV_REST_API_READ_ONLY_TOKEN || UPSTASH_TOKEN;

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

// ===== CLOUD UPSTASH REDIS / VERCEL KV SYNC =====

export async function fetchFromCloudKV() {
  // 1. Try Vercel Serverless API first if available
  try {
    const res = await fetch('/api/neraca');
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        const payload = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        if (payload.data && Array.isArray(payload.data)) {
          saveToLocalStorage(payload.data);
          if (payload.fileName) setActiveFileName(payload.fileName);
          return payload;
        }
      }
    }
  } catch (e) {
    // API route not available in plain vite dev/preview
  }

  // 2. Direct Upstash REST API Fetch (Works everywhere across Laptop, HP, WiFi & Cloud!)
  try {
    if (UPSTASH_URL && UPSTASH_READ_TOKEN) {
      const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(REDIS_KEY)}`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_READ_TOKEN}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const payload = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (payload.data && Array.isArray(payload.data)) {
            saveToLocalStorage(payload.data);
            if (payload.fileName) setActiveFileName(payload.fileName);
            return payload;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Direct Upstash fetch error:', error);
  }

  return null;
}

export async function saveToCloudKV(data, fileName) {
  // Always save locally first
  saveToLocalStorage(data);
  if (fileName) setActiveFileName(fileName);

  const payload = {
    data,
    fileName: fileName || getActiveFileName(),
    updatedAt: new Date().toISOString()
  };

  const token = getAuthToken();
  if (!token) return { success: false, message: 'Harus login sebagai Admin untuk sinkronisasi ke cloud' };

  // 1. Try Vercel Serverless API first
  try {
    const res = await fetch('/api/neraca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data, fileName: fileName || activeFileName })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) return result;
    }
  } catch (e) {
    // Fallback to direct Upstash REST
  }

  // 2. Direct Upstash REST API Save
  try {
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(REDIS_KEY)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return { success: true, message: 'Data neraca berhasil disinkronkan ke Upstash Redis Cloud' };
      }
    }
  } catch (error) {
    console.error('Direct Upstash save error:', error);
  }

  return { success: false, message: 'Gagal sinkron ke Cloud Database' };
}

export async function deleteFromCloudKV() {
  clearLocalStorage();
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch(`${UPSTASH_URL}/del/${encodeURIComponent(REDIS_KEY)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
  } catch (e) {}
}
