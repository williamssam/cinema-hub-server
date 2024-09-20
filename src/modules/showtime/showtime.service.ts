import { sql } from "../../db"

export const getShowtimeWithId = async (id: string) => {
	const data = await sql`SELECT id FROM showtime WHERE id = ${id}`
	return data
}

export const getShowtimeDetails = (id?: string) => {
	const data = sql`
		SELECT
			end_time, start_time, price
		FROM
			showtime ${id ? sql`WHERE id = ${id}` : sql``}
		JOIN movie ON showtime.movie_id = movie.id
		JOIN theatre ON showtime.theatre_id = theatre.id
	`

	return data
}



