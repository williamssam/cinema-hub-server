import { sql } from "../../db"

export const getTheatreWithId = async (id: string) => {
	const data = await sql`SELECT id FROM theatres WHERE id = ${id}`
	return data
}