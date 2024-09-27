CREATE TABLE IF NOT EXISTS theatres (
	id SERIAL PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	capacity INTEGER NOT NULL CHECK (capacity >= 10 AND capacity <= 200),
	seats_per_row INTEGER NOT NULL CHECK (seats_per_row >= 10 AND seats_per_row <= 20),
	room_id TEXT UNIQUE NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to call the function before any update
CREATE TRIGGER update_theatres_updated_at
BEFORE UPDATE ON theatres
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();