import type { NextFunction, Request, Response } from "express"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateReservationInput,
	GetReservationInput,
} from "./reservations.schema"

export const createReservationHandler = async (
	req: Request<unknown, unknown, CreateReservationInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { seat_number, showtime_id, user_id } = req.body

		// check if user exists
		const user = await sql`SELECT id FROM users where id = ${user_id}`
		if (!user.length) {
			throw new ApiError("User does not exist", HttpStatusCode.NOT_FOUND)
		}

		// check if showtime exists
		const showtime =
			await sql`SELECT id FROM showtime where id = ${showtime_id}`
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		// check if seat number is valid

		// check if seat is available
		const seat =
			await sql`SELECT id FROM seat where seat_number = ${seat_number} and showtime_id = ${showtime_id}`
		if (!seat.length) {
			throw new ApiError(
				"Seat is already reserved, please choose another seat",
				HttpStatusCode.NOT_FOUND
			)
		}

		const reservation =
			await sql`INSERT INTO reservations ${sql(req.body)} RETURNING *`

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation for seat created successfully",
			data: reservation,
		})
	} catch (error) {
		return next(error)
	}
}

export const getReservationHandler = async (
	req: Request<GetReservationInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const reservation = await sql`
			SELECT
				JSONB_BUILD_OBJECT(
					'id', showtime.id,
				) AS showtime,
				reservations.seat_number,
				reservations.status,
				reservations.created_at,
				reservations.updated_at
			FROM
				reservations
			WHERE
				id = ${id}
		`
		if (!reservation.length) {
			throw new ApiError("Reservation does not exist", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation fetched successfully",
			data: reservation.at(0),
		})
	} catch (error) {
		return next(error)
	}
}