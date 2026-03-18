const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  // Connect to the default 'postgres' database to create hopping DB and user
  const admin = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'X4nd3r2!0',
    database: 'postgres',
  });

  try {
    await admin.connect();
    console.log('Connected to postgres database.');

    // Create user if not exists
    const userCheck = await admin.query(
      "SELECT 1 FROM pg_roles WHERE rolname='hopping_user'"
    );
    if (userCheck.rowCount === 0) {
      await admin.query(
        "CREATE USER hopping_user WITH PASSWORD 'hopping_password'"
      );
      console.log('Created user hopping_user.');
    } else {
      console.log('User hopping_user already exists.');
    }

    // Create database if not exists
    const dbCheck = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname='hopping'"
    );
    if (dbCheck.rowCount === 0) {
      await admin.query('CREATE DATABASE hopping OWNER hopping_user');
      console.log('Created database hopping.');
    } else {
      console.log('Database hopping already exists.');
    }

    // Grant privileges
    await admin.query('GRANT ALL PRIVILEGES ON DATABASE hopping TO hopping_user');
    console.log('Granted privileges on hopping to hopping_user.');
  } finally {
    await admin.end();
  }

  // Now connect to the hopping database to create tables and functions
  const hopping = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'X4nd3r2!0',
    database: 'hopping',
  });

  try {
    await hopping.connect();
    console.log('Connected to hopping database.');

    // Grant schema privileges so hopping_user can create/use tables
    await hopping.query('GRANT ALL ON SCHEMA public TO hopping_user');

    // Run DDL
    const ddl = fs.readFileSync(path.join(__dirname, 'ddl.sql'), 'utf8');
    await hopping.query(ddl);
    console.log('DDL executed — tables created.');

    // Grant table privileges to hopping_user
    await hopping.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hopping_user');
    await hopping.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hopping_user');

    // Run DML (functions)
    const dml = fs.readFileSync(path.join(__dirname, 'dml.sql'), 'utf8');
    await hopping.query(dml);
    console.log('DML executed — functions created.');

    // Grant function execute privileges
    await hopping.query('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO hopping_user');

    // Insert a default user so user_id=1 works
    const existingUser = await hopping.query('SELECT 1 FROM Users WHERE id = 1');
    if (existingUser.rowCount === 0) {
      await hopping.query(
        "INSERT INTO Users (username, email, password_hash) VALUES ('default', 'default@hopping.app', 'placeholder') ON CONFLICT DO NOTHING"
      );
      console.log('Inserted default user (id=1).');
    } else {
      console.log('Default user already exists.');
    }

    console.log('\nSetup complete! Your hopping database is ready.');
  } finally {
    await hopping.end();
  }
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  console.error(
    '\nIf the password is wrong, edit the "password" fields in setup-db.js to match your local postgres password.'
  );
  process.exit(1);
});
