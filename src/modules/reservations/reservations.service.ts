import { sql } from "../../db"

export const getUserReservations = async ({ id }: { id: string }) => {
	const reservation = await sql`
				SELECT
					reservations.id,
					reservations.seat_number,
					reservations.status,
					JSONB_BUILD_OBJECT(
						'id', showtime.id,
						'movie_id', showtime.movie_id,
						'theatre_id', showtime.theatre_id,
						'start_time', showtime.start_time,
						'end_time', showtime.end_time,
						'price', showtime.price
					) AS showtime,
					reservations.created_at,
					reservations.updated_at
				FROM
					reservations
				JOIN
					showtime ON reservations.showtime_id = showtime.id
				WHERE
					reservations.user_id = ${id}
				ORDER BY
					reservations.created_at DESC
		`
	return reservation
}

// for admins
export const getAllReservations = async ({
	showtime_id,
}: { showtime_id?: string }) => {
	const reservations = await sql`
				SELECT
					reservations.id,
					reservations.seat_number,
					reservations.status,
					JSONB_BUILD_OBJECT(
						'id', user.id,
						'email', users.email,
						'name', users.name,
						'role', users.role
					) AS customer,
					JSONB_BUILD_OBJECT(
						'id', showtime.id,
						'movie_id', showtime.movie_id, 'theatre_id', showtime.theatre_id, 'start_time', showtime.start_time, 'end_time', showtime.end_time,
						'price', showtime.price
					) AS showtime,
					reservations.created_at,
					reservations.updated_at
				FROM
					reservations
				JOIN
					showtime ON reservations.showtime_id = showtime.id
				JOIN
					users on reservations.user_id = users.id
				${showtime_id ? sql`WHERE showtime.id = ${showtime_id}` : sql``}
				ORDER BY
					reservations.created_at DESC
		`
	return reservations
}

type ReservationPayload = {
	showtime_id: number
	seat_number: string
	user_id: number
}
export const createReservationTransaction = async (
	payload: ReservationPayload
) => {
	const reservation = await sql.begin(async sql => {
		const [reservation] =
			await sql`INSERT INTO reservations ${sql(payload)} RETURNING showtime_id, seat_number, status, created_at, updated_at`
		const [showtime] =
			await sql`UPDATE showtime SET available_seats = available_seats - 1 WHERE id = ${payload.showtime_id} RETURNING *`
		return { reservation, showtime }
	})

	return reservation
}