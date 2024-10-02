import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/configuration";
import errorHandler from "./middlewares/error-handler";
import { rateLimiter } from "./middlewares/rate-limiter";
import router from "./router";
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
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(rateLimiter);

app.use("/api/v1", router());
app.use(errorHandler)

app.listen(config.PORT, async () => {
	log.info(`Server is running on port 'http://localhost:${config.PORT}'`);
});
