-- USERS CRUD

CREATE OR REPLACE FUNCTION create_user(_username VARCHAR, _email VARCHAR, _password_hash VARCHAR)
RETURNS INTEGER AS $$
DECLARE _id INTEGER;
BEGIN
  INSERT INTO Users (username, email, password_hash)
  VALUES (_username, _email, _password_hash)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_by_id(_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR, created_at TIMESTAMP) AS $$
BEGIN
  RETURN QUERY
  SELECT id, username, email, created_at
  FROM Users WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_email(_id INTEGER, _email VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE Users SET email = _email WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_user(_id INTEGER)
RETURNS VOID AS $$
BEGIN
  DELETE FROM Users WHERE id = _id;
END;
$$ LANGUAGE plpgsql;


-- ITEMS CRUD

CREATE OR REPLACE FUNCTION create_item(_user_id INTEGER, _name VARCHAR, _price DECIMAL, _url VARCHAR, _source_url VARCHAR, _image VARCHAR DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE _id INTEGER;
BEGIN
  INSERT INTO Items (user_id, name, price, url, source_url, image)
  VALUES (_user_id, _name, _price, _url, _source_url, _image)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_item_by_id(_id INTEGER)
RETURNS TABLE(id INTEGER, user_id INTEGER, name VARCHAR, price DECIMAL, date_added TIMESTAMP, url VARCHAR, source_url VARCHAR, image VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT id, user_id, name, price, date_added, url, source_url, image
  FROM Items WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_item_price(_id INTEGER, _price DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE Items SET price = _price WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_item(_id INTEGER)
RETURNS VOID AS $$
BEGIN
  DELETE FROM Items WHERE id = _id;
END;
$$ LANGUAGE plpgsql;