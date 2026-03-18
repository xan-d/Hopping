const { Router } = require('express');
const { fetchMeta } = require('../services/metaService');

const router = Router();

router.post('/fetch-meta', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const meta = await fetchMeta(url);
    res.json(meta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

module.exports = router;
