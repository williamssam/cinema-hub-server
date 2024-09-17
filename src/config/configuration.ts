import "dotenv/config";

export const config = {
	PORT: Number(process.env.PORT) ?? 8080,
	RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS),
	RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS),
	DATABASE_URL: process.env.DATABASE_URL,
	environment: {
		IS_DEV: process.env.NODE_ENV === "development",
		IS_PROD: process.env.NODE_ENV === "production",
	},
};
