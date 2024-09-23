import { sql } from "../../db"

export const getShowtimeWithId = async (id: string) => {
	const data = await sql<
		{ id: string; movie_id: string; theatre_id: string }[]
	>`SELECT id, movie_id, theatre_id FROM showtime WHERE id = ${id}`
	return data
}

export const getShowtime = async ({
	id,
	append,
}: { id?: string; append?: string }) => {
	const theatre = append?.includes("theatre")
	const movie = append?.includes("movie")

	const data = await sql`
		SELECT
			showtime.id,
			showtime.end_time,
			showtime.start_time,
			showtime.available_seats,
			(showtime.price / 100)::integer as price,
			showtime.status,
			${
				movie
					? sql`JSONB_BUILD_OBJECT(
				'id', movies.id,
				'title', movies.title,
				'overview', movies.overview,
				'poster_image_url',
				movies.poster_image_url,
				'runtime', movies.runtime) AS movie`
					: sql`showtime.movie_id`
			},
			${
				theatre
					? sql`JSONB_BUILD_OBJECT(
				'id', theatres.id,
				'name', theatres.name,
				'capacity', theatres.capacity,
				'seats_per_row', theatres.seats_per_row,
				'room_id', theatres.room_id) AS theatre`
					: sql`showtime.theatre_id`
			},
			showtime.created_at,
			showtime.updated_at
		FROM
				showtime
		JOIN
			theatres ON showtime.theatre_id = theatres.id
		JOIN
			movies ON showtime.movie_id = movies.id
		${id ? sql`WHERE showtime.id = ${id}` : sql``}
		GROUP BY
			showtime.id, theatres.id, movies.id
		ORDER BY
			showtime.id DESC
		`

	return data
}

// export const getShowtimeDetails = ({append}: {append?: string}) => {
// 	const data = sql`
// 		SELECT
// 			showtime.id, showtime.end_time, showtime.start_time, showtime.price, showtime.movie_id, showtime.theatre_id
// 		FROM
// 			showtime
// 		LEFT JOIN
// 			movies ON showtime.movie_id = movies.id
// 		LEFT JOIN
// 			theatres ON showtime.theatre_id = theatres.id
// 	`

// 	return data
// }

/**
 * Fetches the active showtime of a given theatre_id, given that the end_time is
 * less than or equal to the current time and the start_time is greater than or
 * equal to the current time.
 *
 * @param {number} theatre_id - id of the theatre
 */
export const getActiveShowtimeWithTheatreId = (theatre_id: number) => {
	const data = sql`
		SELECT
			end_time, start_time, price
		FROM
			showtime
		WHERE
			theatre_id = ${theatre_id} AND status = 'active' AND end_time <= NOW() AND start_time >= NOW()
	`

	return data
}
