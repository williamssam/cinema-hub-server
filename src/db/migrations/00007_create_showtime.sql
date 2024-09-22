CREATE TABLE IF NOT EXISTS showtime (
	id SERIAL PRIMARY KEY,
	movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
	theatre_id INTEGER NOT NULL REFERENCES theatres(id),
	-- This contain both the date and time of the show
	start_time TIMESTAMPTZ NOT NULL,
	-- This contain both the date and time of the show
	end_time TIMESTAMPTZ NOT NULL,
	price INTEGER NOT NULL,
	-- inactive if the showtime is not active, active if the showtime is active, done if the showtime is over, cancelled if the showtime is cancelled
	status TEXT DEFAULT 'inactive' NOT NULL CHECK (status IN ('inactive', 'active', 'done', 'cancelled')),
	available_seats INTEGER NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)