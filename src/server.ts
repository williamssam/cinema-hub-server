import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { config } from "./config/configuration";
import { sql } from "./db";
import migration from "./db/migration";
import errorHandler from "./middlewares/error-handler";
import { rateLimiter } from "./middlewares/rate-limiter";
import { corsOptions } from "./utils/cors-options";
import { log } from "./utils/logger";

const app = express();

// <-- MIDDLEWARES -->
app.use(
	cors({
		origin: corsOptions,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(compression())
app.use(helmet());
app.use(cookieParser());
app.use(rateLimiter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
	const path = fileURLToPath(new URL("./db/migrations", import.meta.url));

	migration({ sql, path })
		.then(() => {
			log.info("DB migrations completed successfully");
			log.info(`Server is running on port 'http://localhost:${config.PORT}'`);
		})
		.catch((err) => {
			console.error("Failed", err);
			process.exit(1);
		});
});
