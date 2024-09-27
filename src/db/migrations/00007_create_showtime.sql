CREATE TABLE IF NOT EXISTS showtime (
	id SERIAL PRIMARY KEY,
	movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
	theatre_id INTEGER NOT NULL REFERENCES theatres(id),
	-- This contain both the date and time of the show
	start_time TIMESTAMPTZ NOT NULL,
	-- This contain both the date and time of the show
	end_time TIMESTAMPTZ NOT NULL,
	price INTEGER NOT NULL CHECK (price > 0),
	-- pending if the showtime is not active, active if the showtime is active, done if the showtime is over, cancelled if the showtime is cancelled
	status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'active', 'done', 'cancelled')),
	available_seats INTEGER NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to call the function before any update
CREATE TRIGGER update_showtime_updated_at
BEFORE UPDATE ON showtime
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();