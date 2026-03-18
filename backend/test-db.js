require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    // Check tables exist
    const tables = await pool.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'"
    );
    console.log('Tables:', tables.rows.map(r => r.tablename));

    // Check users
    const users = await pool.query('SELECT * FROM Users');
    console.log('Users:', users.rows);

    // Insert test item
    const item = await pool.query(
      "INSERT INTO Items (user_id, name, price, url) VALUES (1, 'Test Sneakers', 99.99, 'https://example.com/shoes') RETURNING *"
    );
    console.log('Created item:', item.rows[0]);

    // Query all items
    const items = await pool.query('SELECT * FROM Items');
    console.log('All items:', items.rows);

    // Clean up test item
    await pool.query('DELETE FROM Items WHERE name = $1', ['Test Sneakers']);
    console.log('Test item cleaned up.');
    console.log('\nAll good! Database is working correctly.');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

test();
