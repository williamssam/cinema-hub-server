import postgres from "postgres";
import { config } from "../config/configuration";

export const sql = postgres(config.DATABASE_URL);