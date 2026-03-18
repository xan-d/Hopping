const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err.message,
      database: 'disconnected',
    });
  }
});

module.exports = router;
