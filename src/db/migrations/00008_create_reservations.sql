CREATE TABLE IF NOT EXISTS reservations (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id),
	showtime_id INTEGER NOT NULL REFERENCES showtime(id),
	seat_number VARCHAR(5) UNIQUE NOT NULL,
	-- "pending" will be automatically deleted after 15 mins
	-- "confirmed" is when user has paid for that seat
	-- "completed" is after showtime has passed
	status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to call the function before any update
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
