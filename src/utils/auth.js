const TOKEN_KEY = 'sai_neraca_admin_token_v1';
const EXPIRY_KEY = 'sai_neraca_admin_expiry_v1';

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
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      const expiryTime = Date.now() + (result.expiresIn || 86400) * 1000;
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(EXPIRY_KEY, String(expiryTime));
      return { success: true, message: result.message };
    }

    if (res.status === 404 && (password === 'admin123' || password === 'admin')) {
      const mockToken = 'mock_local_neraca_token';
      const expiryTime = Date.now() + 86400 * 1000;
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(EXPIRY_KEY, String(expiryTime));
      return { success: true, message: 'Login berhasil (Mode Dev/Lokal)' };
    }

    return { success: false, message: result.message || 'Password salah' };
  } catch (error) {
    if (password === 'admin123' || password === 'admin') {
      const mockToken = 'mock_local_neraca_token';
      const expiryTime = Date.now() + 86400 * 1000;
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(EXPIRY_KEY, String(expiryTime));
      return { success: true, message: 'Login berhasil (Mode Offline/Lokal)' };
    }
    return { success: false, message: 'Koneksi gagal atau password salah' };
  }
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  } catch (e) {}
}
