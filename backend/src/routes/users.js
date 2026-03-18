const { Router } = require('express');
const pool = require('../db');

const router = Router();

// Create User
router.post('/users', async (req, res) => {
  const { username, email, password_hash } = req.body;

  if (!username || !email || !password_hash) {
    return res.status(400).json({ error: 'Missing required fields: username, email, password_hash' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, password_hash]
    );
    res.status(201).json({ success: true, id: result.rows[0].id, message: 'User created' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// Get User by ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM get_user_by_id($1)', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update User Email
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    await pool.query('SELECT update_user_email($1, $2)', [id, email]);
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('SELECT delete_user($1)', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
