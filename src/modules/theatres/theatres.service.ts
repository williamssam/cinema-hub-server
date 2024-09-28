import { sql } from "../../db"

export const getTheatreWithId = async (id: string) => {
	const data = await sql`SELECT id, capacity FROM theatres WHERE id = ${id}`
	return data
}

export const joinTheatreObject = () => {
	return sql`
	JSONB_BUILD_OBJECT(
		'id', theatres.id,
		'name', theatres.name,
		'capacity', theatres.capacity
		)
	AS theatre
	`
}