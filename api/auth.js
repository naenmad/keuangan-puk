import { Redis } from '@upstash/redis';

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

const PASSWORD_KEY = 'sai:admin:password';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const redis = getRedisClient();

  try {
    const { action, password, oldPassword, newPassword } = req.body || {};

    let currentPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_NERACA || 'admin123';
    if (redis) {
      const storedPw = await redis.get(PASSWORD_KEY);
      if (storedPw) {
        currentPassword = typeof storedPw === 'string' ? storedPw : String(storedPw);
      }
    }

    // 1. CHANGE PASSWORD ACTION
    if (action === 'change_password') {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Password lama dan password baru wajib diisi' });
      }

      if (oldPassword !== currentPassword) {
        return res.status(401).json({ success: false, message: 'Password lama salah' });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 4 karakter' });
      }

      if (redis) {
        await redis.set(PASSWORD_KEY, newPassword);
      }

      return res.status(200).json({
        success: true,
        message: 'Password admin berhasil diubah!'
      });
    }

    // 2. LOGIN ACTION (Default)
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password wajib diisi' });
    }

    if (password === currentPassword) {
      const tokenPayload = `admin_neraca_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const token = Buffer.from(tokenPayload).toString('base64');

      return res.status(200).json({
        success: true,
        message: 'Login berhasil sebagai Administrator Keuangan',
        token,
        role: 'admin',
        expiresIn: 86400
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password admin salah. Silakan coba lagi.'
      });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
