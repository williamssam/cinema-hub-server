import dayjs from "dayjs"
import type { NextFunction, Request, Response } from "express"
import crypto from "node:crypto"
import { config } from "../../config/configuration"
import { PAGE_SIZE } from "../../constants/api"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { generatePaymentLink, generateSeatNumbers } from "../../libs/generate"
import { sendMail } from "../../libs/mailer"
import type { QueryInput } from "../../libs/resuable-schema"
import { reservationMail } from "../../mails/reservation"
import { reservationCancellationMail } from "../../mails/reservation-cancellation"
import type { TransactionConfirmationResponse } from "../../types/type"
import { HttpStatusCode } from "../../utils/status-codes"
import { joinMovieObject } from "../movies/movies.service"
import { joinShowtimeObject } from "../showtime/showtime.service"
import { joinTheatreObject } from "../theatres/theatres.service"
import type {
	CreateReservationInput,
	GetReservationInput,
	GetUserReservationsInput,
	UpdateReservationStatusInput,
} from "./reservations.schema"
import {
	createReservationTransaction,
	getAllReservations,
} from "./reservations.service"

/**
 * @description Create a reservation
 * @route POST /reservations
 * @param {string} seat_numbers.body - The seat numbers the user wants to reserve
 * @param {number} showtime_id.body - The id of the showtime the user wants to reserve
 * @param {number} user_id.body - The id of the user making the reservation
 */
export const createReservationHandler = async (
	req: Request<unknown, unknown, CreateReservationInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { seat_numbers, showtime_id, user_id } = req.body

		const user = await sql`SELECT id, role FROM users WHERE id = ${user_id}`
		if (!user.length) {
			throw new ApiError("User does not exist", HttpStatusCode.NOT_FOUND)
		}

		if (user.at(0)?.role !== "user") {
			throw new ApiError(
				"Only users can make reservations",
				HttpStatusCode.BAD_REQUEST
			)
		}

		// check if showtime exists
		const showtime = await sql`
				SELECT
					showtime.id, showtime.status, showtime.movie_id, showtime.theatre_id, showtime.start_time, showtime.price, showtime.showtime_ref, theatres.seats_per_row AS seats_per_row, theatres.capacity AS capacity
				FROM showtime
				JOIN theatres ON showtime.theatre_id = theatres.id
				WHERE showtime.id = ${showtime_id}`
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		// check if showtime is active
		if (showtime.at(0)?.status === "active") {
			throw new ApiError(
				"You cannot reserve a seat for an active showtime",
				HttpStatusCode.BAD_REQUEST
			)
		}

		if (showtime.at(0)?.status === "cancelled") {
			throw new ApiError(
				"You cannot reserve a seat for a cancelled showtime",
				HttpStatusCode.BAD_REQUEST
			)
		}

		if (showtime.at(0)?.status === "done") {
			throw new ApiError(
				"You cannot reserve a seat for a completed/expired showtime",
				HttpStatusCode.BAD_REQUEST
			)
		}

		// check to see if the seat number exists.
		const seats = generateSeatNumbers({
			totalSeats: showtime.at(0)?.capacity,
			seatsPerRow: showtime.at(0)?.seats_per_row,
		})
		for (const seat of seats) {
			if (!seat_numbers.includes(seat)) {
				throw new ApiError(
					"Seat number does not exist, please choose another one",
					HttpStatusCode.CONFLICT
				)
			}
		}

		// check if seat number has been taken
		const reserved_seat = await sql`SELECT seat_number FROM reservations`
		const seat_reserved = reserved_seat.filter(seat =>
			seat_numbers.includes(seat?.seat_number)
		)
		if (seat_reserved.length) {
			const seats = seat_reserved.map(seat => seat?.seat_number)
			throw new ApiError(
				`Seat "${seats.join(", ")}" is already reserved, please choose another one`,
				HttpStatusCode.CONFLICT
			)
		}

		// block user from making more than five reservations for a showtime
		const user_reservations =
			await sql`SELECT COUNT(*) AS total_reservations FROM reservations WHERE user_id = ${user_id} AND showtime_id = ${showtime_id}`
		if (user_reservations.at(0)?.total_reservations > 5) {
			throw new ApiError(
				"You already have five reservations for this showtime, you cannot make any more",
				HttpStatusCode.BAD_REQUEST
			)
		}

		// check if theatre has enough seats
		const showtime_seats =
			await sql`SELECT available_seats FROM showtime WHERE id = ${showtime_id}`
		if (showtime_seats.at(0)?.available_seats <= 0) {
			throw new ApiError(
				"Theatre is full, please choose another one",
				HttpStatusCode.BAD_REQUEST
			)
		}

		const data = await createReservationTransaction({
			showtime_id,
			seat_numbers,
			user_id,
		})
		if (!data) {
			throw new ApiError(
				"Failed to create reservation, please try again!",
				HttpStatusCode.BAD_REQUEST
			)
		}

		// const reservation = data.reservation
		const user_data =
			await sql`SELECT email, name FROM users WHERE id = ${user_id}`
		const movie =
			await sql`SELECT title FROM movies WHERE id = ${showtime?.at(0)?.movie_id}`
		const theatre =
			await sql`SELECT name FROM theatres WHERE id = ${showtime?.at(0)?.theatre_id}`

		// generate payment link and send along for user to pay
		const payment_data = await generatePaymentLink({
			amount: String(showtime?.at(0)?.price * seat_numbers.length),
			email: user_data.at(0)?.email,
			name: user_data.at(0)?.name,
			showtime_ref: showtime?.at(0)?.showtime_ref,
			seat_number: seat_numbers.join(". "),
			reservation_ids: data,
		})

		await sendMail({
			to: user_data.at(0)?.email,
			subject: "Reservation Confirmation",
			html: reservationMail({
				customer_name: user_data.at(0)?.name,
				start_time: showtime.at(0)?.start_time,
				seat_number: seat_numbers.join(". "),
				movie_title: movie.at(0)?.title,
				payment_link: payment_data?.data?.authorization_url || "",
				theatre: theatre.at(0)?.name,
			}),
		})

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message:
				"Reservation created successfully! Your reservation will be removed if not paid for within 20mins",
			data: {
				seat_numbers,
				showtime: showtime.at(0),
				payment: payment_data?.data,
			},
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description Cancel a reservation
 * @route DELETE /reservations/:id
 * @param {string} id.path - The id of the reservation to cancel
 */
export const cancelReservationHandler = async (
	req: Request<GetReservationInput["params"]>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const reservation = await sql`
				SELECT
					reservations.id, reservations.user_id,
					showtime.id AS showtime_id
				FROM reservations
				JOIN showtime ON reservations.showtime_id = showtime.id
				WHERE reservations.id = ${id}
			`

		if (!reservation.length) {
			throw new ApiError("Reservation does not exist", HttpStatusCode.NOT_FOUND)
		}

		const user =
			await sql`SELECT name, email FROM users WHERE id = ${reservation.at(0)?.user_id}`
		const showtime =
			await sql`SELECT movies.title as movie, showtime.start_time FROM showtime JOIN movies ON showtime.movie_id = movies.id WHERE showtime.id = ${reservation.at(0)?.showtime_id}`

		await sql`DELETE FROM reservations WHERE id = ${id}`
		await sendMail({
			to: user.at(0)?.email,
			subject: "Reservation Cancelled",
			html: reservationCancellationMail({
				customer_name: user.at(0)?.name,
				date: dayjs(reservation.at(0)?.start_time).format("DD-MM-YYYY"),
				movie_title: showtime.at(0)?.movie,
				time: dayjs(reservation.at(0)?.start_time).format("hh:mm A"),
			}),
		})
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation canceled successfully",
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description Fetch a reservation by id
 * @route GET /reservations/:id
 * @param {string} id.path - The id of the reservation to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie', 'showtime', and 'theatre'
 */
export const getReservationHandler = async (
	req: Request<
		GetReservationInput["params"],
		unknown,
		unknown,
		GetReservationInput["query"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { append_to_response } = req.query

		const movie = append_to_response?.includes("movie")
		const showtime = append_to_response?.includes("showtime")
		const theatre = append_to_response?.includes("theatre")

		const reservation = await sql`
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
			WHERE
				reservations.id = ${id}
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

/**
 * @description Fetch all reservations for a user
 * @route GET /users/:id/reservations
 * @param {number} [page.query] - The page number to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie' and 'theatre'
 */
export const getUserReservationsHandler = async (
	req: Request<
		GetUserReservationsInput["params"],
		unknown,
		unknown,
		GetUserReservationsInput["query"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { page = 1, append_to_response } = req.query

		const movie = append_to_response?.includes("movie")
		const showtime = append_to_response?.includes("showtime")
		const theatre = append_to_response?.includes("theatre")

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
			WHERE
				reservations.user_id = ${id}
			ORDER BY
				reservations.created_at DESC
		`

		const count =
			await sql`SELECT COUNT(*) FROM reservations WHERE user_id = ${id}`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "All reservations fetched successfully",
			data: reservations,
			meta: {
				page: page,
				per_page: PAGE_SIZE,
				total: Number(total),
				total_pages: Math.ceil(total / PAGE_SIZE) || 0,
			},
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description - Fetches all reservations
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware
 */
export const getAllReservationsHandler = async (
	req: Request<unknown, unknown, unknown, QueryInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page = 1, append_to_response } = req.query

		const movie = append_to_response?.includes("movie")
		const showtime = append_to_response?.includes("showtime")
		const theatre = append_to_response?.includes("theatre")

		const reservations = await getAllReservations({ movie, showtime, theatre })
		const count = await sql`SELECT COUNT(*) FROM reservations`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "All reservations fetched successfully",
			data: reservations,
			meta: {
				page: page,
				per_page: PAGE_SIZE,
				total: Number(total),
				total_pages: Math.ceil(total / PAGE_SIZE) || 0,
			},
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description - Updates the status of a reservation
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware
 */
export const updateReservationStatusHandler = async (
	req: Request<
		UpdateReservationStatusInput["params"],
		unknown,
		UpdateReservationStatusInput["body"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { status } = req.body

		const reservation = await sql`SELECT * FROM reservations WHERE id = ${id}`
		if (!reservation.length) {
			throw new ApiError("Reservation does not exist", HttpStatusCode.NOT_FOUND)
		}

		const updated_reservation =
			await sql`UPDATE reservations SET status = ${status} WHERE id = ${id} RETURNING *`
		if (!updated_reservation) {
			throw new ApiError(
				"Error updating reservation",
				HttpStatusCode.INTERNAL_SERVER_ERROR
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation status updated successfully",
			data: updated_reservation.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description This route returns a report of all reservations, including the total number of reservations, the number of confirmed reservations and the number of completed reservations
 * @route GET /reservations/report
 * @returns {object} - A JSON object with the reservation report
 * @returns {number} total_reservations - The total number of reservations
 * @returns {number} confirmed_reservations - The number of confirmed reservations
 * @returns {number} completed_reservations - The number of completed reservations
 */
export const reservationReportHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const stat = await sql`
			SELECT
				COUNT(*)::int AS total_reservations,
				COUNT(CASE WHEN reservations.status = 'confirmed' THEN 1 ELSE NULL END)::int AS confirmed_reservations,
				COUNT(CASE WHEN reservations.status = 'completed' THEN 1 ELSE NULL END)::int AS completed_reservations,
				showtime.price AS price
			FROM
				reservations
			JOIN
				showtime ON reservations.showtime_id = showtime.id
			GROUP BY
				showtime.price
		`

		const total_reservations = stat.at(0)?.total_reservations
		const confirmed_reservations = stat.at(0)?.confirmed_reservations
		const completed_reservations = stat.at(0)?.completed_reservations
		const total_revenue = stat.at(0)?.price * confirmed_reservations

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation report fetched successfully",
			data: {
				total_revenue,
				total_reservations,
				confirmed_reservations,
				completed_reservations,
			},
		})
	} catch (error) {
		return next(error)
	}
}

// specifically for paystack
export const verifyPaymentHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const hash = crypto
			.createHmac("sha512", config.PAYMENT_SECRET_KEY)
			.update(JSON.stringify(req.body))
			.digest("hex")

		if (hash !== req.headers["x-paystack-signature"]) {
			throw new ApiError("Invalid signature", HttpStatusCode.BAD_REQUEST)
		}

		const resp = req.body as TransactionConfirmationResponse

		if (resp.event === "charge.success" && resp.data.status === "success") {
			await sql`
				UPDATE
					reservations
				SET status = 'completed',
				SET payment_ref = ${resp.data.reference},
				SET paid_at = ${resp.data.paid_at}
				WHERE
					id IN (${resp.data.metadata?.reservation_ids})`

			// await sendMail({
			// 	to:
			// })
		}

		return res.send(HttpStatusCode.OK)
	} catch (error) {
		return next(error)
	}
}