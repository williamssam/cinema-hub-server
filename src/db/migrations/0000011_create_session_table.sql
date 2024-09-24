-- Everytime you login, you create a new session with the current access_token and expires_at, this table is used to store them. if the access_token is expired, you need to login again to create a new session and delete the old session.
CREATE TABLE IF NOT EXISTS blacklists (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	access_token TEXT NOT NULL,
	expires_at BIGINT NOT NULL
)