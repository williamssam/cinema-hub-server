namespace NodeJS {
  interface ProcessEnv {
			NODE_ENV: string;
			PORT: string;
			RATE_LIMIT_WINDOW_MS: string;
			RATE_LIMIT_MAX_REQUESTS: string;
			DATABASE_URL: string;
		}
}