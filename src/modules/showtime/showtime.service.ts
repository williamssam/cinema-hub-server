import { sql } from "../../db"
import { joinMovieObject } from "../movies/movies.service"
import { joinTheatreObject } from "../theatres/theatres.service"

export const getShowtimeWithId = async (id: string) => {
	const data = await sql<
		{
			id: string
			movie_id: string
			theatre_id: string
			status: "pending" | "active" | "done" | "cancelled"
		}[]
	>`SELECT id, movie_id, theatre_id, status FROM showtime WHERE id = ${id}`
	return data
}

export const getShowtime = async ({
	id,
	append,
}: { id: string; append?: string }) => {
	const theatre = append?.includes("theatre")
	const movie = append?.includes("movie")

	const data = await sql`
		SELECT
			showtime.id,
			showtime.end_time,
			showtime.start_time,
			showtime.available_seats,
			(showtime.price / 100)::BIGINT AS price,
			showtime.status,
			${movie ? joinMovieObject() : sql`showtime.movie_id`},
			${theatre ? joinTheatreObject() : sql`showtime.theatre_id`},
			showtime.created_at,
			showtime.updated_at
		FROM
				showtime
		JOIN
			theatres ON showtime.theatre_id = theatres.id
		JOIN
			movies ON showtime.movie_id = movies.id
		WHERE
			showtime.id = ${id}
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

export const joinShowtimeObject = () => {
	return sql`
	JSONB_BUILD_OBJECT(
		'id', showtime.id,
		'start_time', showtime.start_time,
		'end_time', showtime.end_time,
		'price', DIV(showtime.price, 100),
		'status', showtime.status
		)
	AS showtime
	`
}