CREATE TABLE IF NOT EXISTS movies (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	tagline TEXT NOT NULL,
	overview TEXT NOT NULL,
	original_language TEXT NOT NULL,
	homepage TEXT,
	genre_id INTEGER NOT NULL REFERENCES genres(id),
	runtime TEXT NOT NULL,
	director TEXT NOT NULL,
	release_date DATE NOT NULL,
	poster_image_url TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)