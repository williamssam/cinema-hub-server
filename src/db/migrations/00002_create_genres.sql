-- Create the genres table
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert data into the genres table
INSERT INTO genres (name)
VALUES
    ('Action'),
    ('Comedy'),
    ('Drama'),
    ('Fantasy'),
    ('Horror'),
    ('Romance'),
    ('Science Fiction'),
    ('Thriller'),
    ('Western'),
    ('Musical'),
    ('War'),
    ('Animation'),
    ('Crime'),
    ('Adventure')
ON CONFLICT (name) DO NOTHING
RETURNING *;
