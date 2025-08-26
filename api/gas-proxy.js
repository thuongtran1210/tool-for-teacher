// api/gas-proxy.js  (Vercel Serverless Function - Node runtime)
export default async function handler(req, res) {
  // CORS cho dev; khi lên prod nên giới hạn domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success:false, message:'Method not allowed' });

  const GAS_URL = process.env.GAS_URL; // set ở Vercel Dashboard
  if (!GAS_URL) return res.status(500).json({ success:false, message:'Missing GAS_URL env' });

  try {
    // Frontend sẽ gửi JSON: { action, code }
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(req.body || {})
    });

    const text = await r.text(); // giữ nguyên
    // Thử parse JSON, nếu fail thì trả text gốc
    try {
      const json = JSON.parse(text);
      return res.status(r.status).json(json);
    } catch {
      return res.status(r.status).send(text);
    }
  } catch (e) {
    return res.status(500).json({ success:false, message:String(e) });
  }
}
