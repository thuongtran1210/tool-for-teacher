export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success:false, message:'Method not allowed' });

  const GAS_URL = process.env.GAS_URL;
  if (!GAS_URL) return res.status(500).json({ success:false, message:'Missing GAS_URL env' });

  // đọc raw body
  let payload = {};
  try {
    const chunks = [];
    for await (const ch of req) chunks.push(ch);
    const raw = Buffer.concat(chunks).toString('utf8') || '{}';
    payload = JSON.parse(raw);
  } catch {
    return res.status(400).json({ success:false, message:'Invalid JSON body' });
  }

  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    try { return res.status(r.status).json(JSON.parse(text)); }
    catch { return res.status(r.status).send(text); }
  } catch (e) {
    return res.status(500).json({ success:false, message:String(e) });
  }
}
