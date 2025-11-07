export default function handler(req, res) {
  res.status(200).json({ ok: true, message: 'ping', timestamp: new Date().toISOString() });
}
