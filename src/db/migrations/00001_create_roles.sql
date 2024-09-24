CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL CHECK (name IN ('user', 'admin', 'super-admin')),
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed the roles table
INSERT INTO roles (name) VALUES ('user'), ('admin'), ('super-admin')