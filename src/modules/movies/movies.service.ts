import { sql } from "../../db"
import type { Genres } from "./movies.types"

const getMovieGenres = async () => {
	const data = await sql<Genres[]>`SELECT id, name FROM genres`
	return data
}

const getMovieWithId = async (id: string) => {
	const data = await sql`SELECT id FROM movies WHERE id = ${id}`
	return data
}

export { getMovieGenres, getMovieWithId }

