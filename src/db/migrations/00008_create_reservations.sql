CREATE TABLE IF NOT EXISTS reservations (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id),
	showtime_id INTEGER NOT NULL REFERENCES showtime(id),
	seat_number INTEGER UNIQUE NOT NULL,
	-- "pending": The reservation is awaiting confirmation or payment
	-- "confirmed": The reservation has been confirmed and payment has been made
	-- "cancelled": The reservation has been cancelled
	-- "expired": The reservation has expired
	-- "completed": The reservation has been used
	status VARCHAR(20) NOT NULL CHECK DEFAULT 'pending' (status IN ('pending', 'confirmed', 'cancelled', 'expired', 'completed')),
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
