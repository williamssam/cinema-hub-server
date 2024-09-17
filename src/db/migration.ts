/*
 * @link https://github.com/jopicornell/postgres-shift/blob/feature/file-name-compatibility/index.js
 * @desc Converted this to typescript and added comments
 */
import fs from "node:fs";
import path from "node:path";
import type postgres from "postgres";

const join = path.join;

type Migration = {
	sql: postgres.Sql;
	path: string;
	before?: (migration: {
		path: string;
		migration_id: number;
		name: string;
	}) => void;
	after?: (migration: {
		path: string;
		migration_id: number;
		name: string;
	}) => void;
};

/**
 * Runs all the migrations needed to get the DB up to date.
 *
 * @param {Object} options - The options for the migration.
 * @param {import('postgres').Sql<{}>} sql - The SQL object to run the migrations.
 * @param {string} [path=join(process.cwd(), "migrations")] - The path to the migrations directory.
 * @param {(migration: { path: string; migration_id: number; name: string }) => void} [before] - A callback to run before each migration.
 * @param {(migration: { path: string; migration_id: number; name: string }) => void} [after] - A callback to run after each migration.
 * @returns {Promise<void>}
 */
export default async function migration({
	sql,
	path = join(process.cwd(), "migrations"),
	before,
	after,
}: Migration) {
	try {
		// Gets all the migrations that are in the migrations directory
		const migrations = fs
			.readdirSync(path)
			.filter(
				(x) =>
					// Check if the file is a directory or a file and if it matches the naming pattern
					(fs.statSync(join(path, x)).isDirectory() ||
						fs.statSync(join(path, x)).isFile()) &&
					x.match(/^[0-9]{5}_/),
			)
			.sort()
			// Maps each migration to an object with the path, migration_id, and name
			.map((x) => ({
				path: join(path, x),
				migration_id: Number.parseInt(x.slice(0, 5)),
				name: x.slice(6).replace(/-/g, " "),
			}));

		// Gets the last migration in the migrations array
		const latest = migrations[migrations.length - 1];

		if (latest.migration_id !== migrations.length) {
			// Checks if the migration_id of the last migration is equal to the number of migrations
			throw new Error("Inconsistency in migration numbering");
		}

		// Ensures that the migrations table exists in the DB
		await ensureMigrationsTable();

		// Gets the current migration from the migrations table in the DB
		const current = await getCurrentMigration();

		// Gets the migrations that need to be run
		const needed = migrations.slice(current ? current.id : 0);

		// Starts a transaction to run the migrations in
		return sql.begin(next);

		/**
		 * Runs each migration in the needed array.
		 */
		async function next(sql: postgres.Sql) {
			const current = needed.shift();
			if (!current) return;

			// Runs the before callback if it was provided
			before?.(current);

			// Runs the migration itself
			await run(sql, current);

			// Runs the after callback if it was provided
			after?.(current);

			// Runs the next migration in the needed array
			await next(sql);
		}

		/**
		 * Runs a single migration.
		 *
		 * @param {postgres.Sql} sql - The PostgreSQL client.
		 * @param {{ path: string; migration_id: number; name: string }} migration - The migration to run.
		 * @returns {Promise<void>}
		 */
		async function run(
			sql: postgres.Sql,
			{
				path,
				migration_id,
				name,
			}: { path: string; migration_id: number; name: string },
		): Promise<void> {
			// Checks if the path is a file or a directory
			if (fs.statSync(path).isFile()) {
				// If it's a file, it's a sql file, so run it
				path.endsWith(".sql")
					? await sql.file(path)
					: await import(path).then((x) => x.default(sql)); // eslint-disable-line
			} else if (fs.statSync(path).isDirectory()) {
				// If it's a directory, check if it has an index.sql file
				fs.existsSync(join(path, "index.sql")) &&
				!fs.existsSync(join(path, "index.js"))
					? await sql.file(join(path, "index.sql"))
					: await import(join(path, "index.js")).then((x) => x.default(sql)); // eslint-disable-line
			}

			// Inserts the migration into the migrations table
			await sql`
      insert into migrations (
        migration_id,
        name
      ) values (
        ${migration_id},
        ${name}
      )
    `;
		}

		/**
		 * Gets the current migration from the migrations table in the DB.
		 */
		function getCurrentMigration() {
			return sql`
      select migration_id as id from migrations
      order by migration_id desc
      limit 1
    `.then(([x]) => x);
		}

		/**
		 * Ensures that the migrations table exists in the DB.
		 */
		function ensureMigrationsTable() {
			return sql`
      select 'migrations'::regclass
    `.catch(
				(err) => sql`
      create table migrations (
        migration_id serial primary key,
        created_at timestamp with time zone not null default now(),
        name text
      )
    `,
			);
		}
	} catch (error) {
		console.error("migration error", error);
	}
}
