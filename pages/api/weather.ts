export default async function handler(req, res) {
  // ... existing code ...

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json(data);
} 