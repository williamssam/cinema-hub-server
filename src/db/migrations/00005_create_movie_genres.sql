-- movie genre link table: This creates a many to many relationship between both movie and genre
CREATE TABLE IF NOT EXISTS movie_genres (
	id SERIAL PRIMARY KEY,
	movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
	genre_id INT REFERENCES genres(id),
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to call the function before any update
CREATE TRIGGER update_movie_genres_updated_at
BEFORE UPDATE ON movie_genres
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
