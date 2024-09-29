import { sql } from "../../db"
import { joinMovieObject } from "../movies/movies.service"
import { joinShowtimeObject } from "../showtime/showtime.service"
import type { Showtime } from "../showtime/showtime.type"
import { joinTheatreObject } from "../theatres/theatres.service"
import type { Reservation } from "./reservations.types"

// for admins
export const getAllReservations = async ({
	showtime_id,
	showtime,
	movie,
	theatre,
}: {
	showtime_id?: string
	showtime?: boolean
	movie?: boolean
	theatre?: boolean
}) => {
	const reservations = await sql`
			SELECT
				reservations.seat_number,
				reservations.status,
				${showtime ? joinShowtimeObject() : sql`reservations.showtime_id`},
				${movie ? joinMovieObject() : sql`showtime.movie_id`},
				${theatre ? joinTheatreObject() : sql`showtime.theatre_id`},
				reservations.created_at,
				reservations.updated_at
			FROM
				reservations
			JOIN
				showtime ON reservations.showtime_id = showtime.id
			JOIN
				movies ON showtime.movie_id = movies.id
			JOIN
				theatres ON showtime.theatre_id = theatres.id
			${showtime_id ? sql`WHERE showtime.id = ${showtime_id}` : sql``}
			ORDER BY
				reservations.created_at DESC
		`
	return reservations
}

type ReservationPayload = {
	showtime_id: number
	seat_numbers: string[]
	user_id: number
}
export const createReservationTransaction = async (
	payload: ReservationPayload
) => {

	return await sql.begin(async sql => {
		const ids: number[] = []

		for (const seat_number of payload.seat_numbers) {
			const [reservation] = await sql<Reservation[]>`INSERT INTO
					reservations (showtime_id, seat_number, user_id)
				VALUES
					(${payload.showtime_id}, ${seat_number}, ${payload.user_id})
				RETURNING
					id`

			await sql<
				Showtime[]
			>`UPDATE showtime SET available_seats = available_seats - 1 WHERE id = ${payload.showtime_id} RETURNING *`

			ids.push(reservation.id)
		}

		return ids
	})
}
