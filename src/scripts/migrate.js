import { hash } from "@node-rs/argon2"
import "dotenv/config"
import { fileURLToPath } from "node:url"
import postgres from "postgres"
import migration from "./migration.js"

const sql = postgres(process.env.DATABASE_URL)

const migrate = () => {
	const path = fileURLToPath(new URL("../db/migrations", import.meta.url))

	migration({ sql, path })
		.then(async () => {
			const password_hash = await hash(process.env.ADMIN_PASSWORD, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1,
			})
			await sql`INSERT INTO users (email, name, password, role) VALUES (${process.env.ADMIN_EMAIL}, ${process.env.ADMIN_NAME}, ${password_hash}, 'admin')`

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
