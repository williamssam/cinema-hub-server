-- movie genre link table: This creates a many to many relationship between both movie and genre
CREATE TABLE IF NOT EXISTS movie_genres (
	id SERIAL PRIMARY KEY,
	movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
	genre_id INT REFERENCES genres(id)
)
