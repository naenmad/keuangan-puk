const TOKEN_KEY = 'sai_neraca_admin_token_v1';
const EXPIRY_KEY = 'sai_neraca_admin_expiry_v1';
const LOCAL_PW_KEY = 'sai_neraca_local_pw_v1';
const PASSWORD_REDIS_KEY = 'sai:admin:password';

const UPSTASH_URL = import.meta.env?.VITE_KV_REST_API_URL || 'https://cuddly-yak-216436.upstash.io';
const UPSTASH_TOKEN = import.meta.env?.VITE_KV_REST_API_TOKEN || 'gQAAAAAAA010AAIgcDIyNjc2MTM0NTNhZjk0MzYxOGVmMDI4MGU3NWIwYzgzYQ';

function sanitizePassword(raw) {
  if (!raw) return null;
  let str = String(raw).trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      str = JSON.parse(str);
    } catch (e) {}
  }
  return str;
}

export function getAuthToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);

    if (!token || !expiry) return null;

    if (Date.now() > Number(expiry)) {
      logoutAdmin();
      return null;
    }

    return token;
  } catch (e) {
    return null;
  }
}

export function isAdminUser() {
  return getAuthToken() !== null;
}

export async function loginAdmin(password) {
  const inputPassword = String(password || '').trim();

  // 1. Try Vercel Serverless API first
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password: inputPassword })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        const expiryTime = Date.now() + (result.expiresIn || 86400) * 1000;
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(EXPIRY_KEY, String(expiryTime));
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Password salah' };
      }
    }
  } catch (e) {}

  // 2. Direct Upstash REST API Check (Single source of truth)
  try {
    let cloudPassword = null;
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(PASSWORD_REDIS_KEY)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result !== null && json.result !== undefined) {
          cloudPassword = sanitizePassword(json.result);
        }
      }
    }

    const localPw = sanitizePassword(localStorage.getItem(LOCAL_PW_KEY));
    const validPassword = cloudPassword || localPw || 'admin123';

    if (inputPassword === validPassword) {
      const mockToken = `admin_neraca_${Date.now()}`;
      const expiryTime = Date.now() + 86400 * 1000;
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(EXPIRY_KEY, String(expiryTime));
      return { success: true, message: 'Login berhasil sebagai Administrator Keuangan' };
    }

    return { success: false, message: 'Password admin salah. Silakan coba lagi.' };
  } catch (error) {
    const localPw = sanitizePassword(localStorage.getItem(LOCAL_PW_KEY)) || 'admin123';
    if (inputPassword === localPw) {
      const mockToken = `admin_neraca_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + 86400 * 1000));
      return { success: true, message: 'Login berhasil' };
    }
    return { success: false, message: 'Password admin salah' };
  }
}

export async function changeAdminPassword(oldPassword, newPassword) {
  const inputOld = String(oldPassword || '').trim();
  const inputNew = String(newPassword || '').trim();

  if (!inputNew || inputNew.length < 4) {
    return { success: false, message: 'Password baru minimal 4 karakter' };
  }

  // 1. Try Vercel Serverless API
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', oldPassword: inputOld, newPassword: inputNew })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        localStorage.setItem(LOCAL_PW_KEY, inputNew);
        return { success: true, message: 'Password admin berhasil diubah!' };
      } else {
        return { success: false, message: result.message || 'Gagal mengubah password' };
      }
    }
  } catch (e) {}

  // 2. Direct Upstash REST API Update
  try {
    let cloudPassword = null;
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      const getRes = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(PASSWORD_REDIS_KEY)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
      });
      if (getRes.ok) {
        const json = await getRes.json();
        if (json && json.result !== null && json.result !== undefined) {
          cloudPassword = sanitizePassword(json.result);
        }
      }
    }

    const currentPw = cloudPassword || sanitizePassword(localStorage.getItem(LOCAL_PW_KEY)) || 'admin123';
    if (inputOld !== currentPw) {
      return { success: false, message: 'Password lama tidak sesuai' };
    }

    // Save strictly to Upstash
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(PASSWORD_REDIS_KEY)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputNew)
      });
    }

    localStorage.setItem(LOCAL_PW_KEY, inputNew);
    return { success: true, message: 'Password admin berhasil diperbarui di Cloud Database!' };
  } catch (error) {
    return { success: false, message: 'Gagal memperbarui password di cloud database' };
  }
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  } catch (e) {}
}
