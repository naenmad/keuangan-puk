// Serverless function for Admin Authentication in Neraca (Vercel API)
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

  try {
    const { password } = req.body || {};
    const expectedPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_NERACA || 'admin123';

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password wajib diisi' });
    }

    if (password === expectedPassword) {
      const tokenPayload = `admin_neraca_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const token = Buffer.from(tokenPayload).toString('base64');

      return res.status(200).json({
        success: true,
        message: 'Login berhasil sebagai Administrator Keuangan',
        token,
        role: 'admin',
        expiresIn: 86400 // 24 hours
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Password admin salah. Silakan periksa kembali.'
      });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
