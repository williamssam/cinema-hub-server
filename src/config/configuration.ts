import "dotenv/config";

export const config = {
	PORT: Number(process.env.PORT) ?? 8080,
	API_PREFIX: "/api/v1",
	RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS),
	RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS),
	DATABASE_URL: process.env.DATABASE_URL,
	IS_DEV: process.env.NODE_ENV === "development",
	IS_PROD: process.env.NODE_ENV === "production",
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_USERNAME: process.env.SMTP_USER,
	SMTP_PASSWORD: process.env.SMTP_PASS,
	access_token: {
		key: process.env.ACCESS_TOKEN_KEY,
		expires_in: process.env.ACCESS_TOKEN_KEY_EXPIRES_IN,
	},
	refresh_token: {
		key: process.env.REFRESH_TOKEN_KEY,
		expires_in: process.env.REFRESH_TOKEN_KEY_EXPIRES_IN,
	},
}
