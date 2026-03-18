const { Router } = require('express');
const pool = require('../db');

const router = Router();

// Create Item
router.post('/items', async (req, res) => {
  const { user_id, name, price, url, source_url, image } = req.body;

  if (!user_id || !name || !price) {
    return res.status(400).json({ error: 'Missing required fields: user_id, name, price' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Items (user_id, name, price, url, source_url, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, name, price, url || null, source_url || null, image || null]
    );
    res.status(201).json({ success: true, id: result.rows[0].id, message: 'Item created' });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: err.message || 'Failed to create item' });
  }
});

// Get Item by ID
router.get('/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM get_item_by_id($1)', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Items for a User
router.get('/users/:user_id/items', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM Items WHERE user_id = $1 ORDER BY date_added DESC',
      [user_id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Item Price
router.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (!price) {
    return res.status(400).json({ error: 'Missing price' });
  }

  try {
    await pool.query('SELECT update_item_price($1, $2)', [id, price]);
    res.json({ success: true, message: 'Item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Item
router.delete('/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('SELECT delete_item($1)', [id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
