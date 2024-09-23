namespace NodeJS {
  interface ProcessEnv {
			NODE_ENV: string
			PORT: string
			RATE_LIMIT_WINDOW_MS: string
			RATE_LIMIT_MAX_REQUESTS: string
			DATABASE_URL: string
			ACCESS_TOKEN_KEY: string
			REFRESH_TOKEN_KEY: string
			SMTP_HOST: string
			SMTP_USER: string
			SMTP_PASS: string
		}
}