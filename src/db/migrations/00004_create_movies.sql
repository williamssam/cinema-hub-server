CREATE TABLE IF NOT EXISTS movies (
	id SERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	slug TEXT UNIQUE,
	tagline TEXT NOT NULL,
	overview TEXT NOT NULL,
	original_language TEXT NOT NULL,
	homepage TEXT,
	runtime TEXT NOT NULL,
	director TEXT NOT NULL,
	release_date DATE NOT NULL,
	poster_image_url TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to set slug from name
CREATE OR REPLACE FUNCTION set_slug_from_name()
		RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS $$
BEGIN
	-- Concatenate movie id and slugify name to generate slugs
  NEW.slug := CONCAT(NEW.id, '-', slugify(NEW.title));
  RETURN NEW;
END
$$;


-- Trigger to set slug from name
CREATE TRIGGER generate_slug_from_name
BEFORE INSERT OR UPDATE ON movies
FOR EACH ROW
WHEN (NEW.title IS NOT NULL AND NEW.slug IS NULL)
EXECUTE PROCEDURE set_slug_from_name();
