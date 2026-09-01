import { Redis } from '@upstash/redis';

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

const STORAGE_KEY = 'sai:neraca:data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const redis = getRedisClient();

  // GET: Public Read-Only data access
  if (req.method === 'GET') {
    try {
      if (!redis) {
        return res.status(200).json({
          source: 'local_fallback',
          message: 'Vercel KV not configured. Using client data.',
          data: null
        });
      }

      const stored = await redis.get(STORAGE_KEY);
      return res.status(200).json({
        success: true,
        source: 'vercel_kv',
        data: stored ? (typeof stored === 'string' ? JSON.parse(stored) : stored) : null
      });
    } catch (error) {
      console.error('Error fetching from Vercel KV:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST: Admin Only save/update
  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Akses ditolak: Anda harus login sebagai Admin untuk menyimpan data keuangan.'
        });
      }

      const { data, fileName } = req.body || {};
      if (!data) {
        return res.status(400).json({ success: false, message: 'Data neraca tidak boleh kosong' });
      }

      if (!redis) {
        return res.status(200).json({
          success: true,
          source: 'local_fallback',
          message: 'Data tersimpan di browser lokal.'
        });
      }

      const payload = {
        data,
        fileName: fileName || 'Laporan_Keuangan_PUK.xlsx',
        updatedAt: new Date().toISOString()
      };

      await redis.set(STORAGE_KEY, JSON.stringify(payload));

      return res.status(200).json({
        success: true,
        source: 'vercel_kv',
        message: 'Laporan keuangan berhasil disinkronkan ke Vercel KV Cloud Database',
        updatedAt: payload.updatedAt
      });
    } catch (error) {
      console.error('Error saving to Vercel KV:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE: Reset data (Admin Only)
  if (req.method === 'DELETE') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Akses ditolak: Diperlukan hak Admin' });
      }

      if (redis) {
        await redis.del(STORAGE_KEY);
      }

      return res.status(200).json({ success: true, message: 'Data neraca di cloud berhasil direset' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
