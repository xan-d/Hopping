-- USERS
CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- BOARDS (optional but useful)
CREATE TABLE Boards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ITEMS (aligned with your DML)
CREATE TABLE Items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  price DECIMAL,
  url TEXT,
  source_url TEXT,
  date_added TIMESTAMP DEFAULT NOW()
);