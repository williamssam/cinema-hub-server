import "dotenv/config"
import { fileURLToPath } from "node:url"
import postgres from "postgres"
import migration from "./migration.js"

const sql = postgres(process.env.DATABASE_URL)

const migrate = () => {
	const path = fileURLToPath(new URL("../db/migrations", import.meta.url))

	migration({ sql, path })
		.then(() => {
			console.log("DB migrations completed successfully")
		})
		.catch(err => {
			console.error("Error while migrating: ", err)
		})
		.finally(() => {
			sql.end()
			process.exit(1)
		})
}

migrate()
