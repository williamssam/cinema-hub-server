import dayjs from "dayjs"
import type { NextFunction, Request, Response } from "express"
import { PAGE_SIZE } from "../../constants/api"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { sendMail } from "../../libs/mailer"
import type { QueryInput } from "../../libs/resuable-schema"
import { reservationCancellationMail } from "../../mails/reservation-cancellation"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateReservationInput,
	GetReservationInput,
} from "./reservations.schema"
import {
	createReservationTransaction,
	getAllReservations,
	getUserReservations,
} from "./reservations.service"

export const createReservationHandler = async (
	req: Request<unknown, unknown, CreateReservationInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { seat_number, showtime_id, user_id } = req.body

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
		const showtime =
			await sql`SELECT id, status FROM showtime where id = ${showtime_id}`
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

		// check if seat number has been taken
		const reserved_seat = await sql`SELECT seat_number FROM reservations`
		const seat_reserved = reserved_seat.some(
			seat => seat.seat_number === seat_number
		)
		if (seat_reserved) {
			throw new ApiError(
				"Seat is already reserved, please choose another one",
				HttpStatusCode.CONFLICT
			)
		}

		// block user from reserving seat if they have already have a reserved seat
		const user_reservations =
			await sql`SELECT id FROM reservations WHERE user_id = ${user_id}`
		if (user_reservations.length) {
			throw new ApiError(
				"You already have a reservation, please pay for it before it expires.",
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

		const reservation = await createReservationTransaction({
			showtime_id,
			seat_number,
			user_id,
		})
		if (!reservation) {
			throw new ApiError(
				"Failed to create reservation, please try again!",
				HttpStatusCode.BAD_REQUEST
			)
		}

		// TODO: generate payment link and send along for user to pay

		// Reservation if not paid in 20mins, expires and the seat becomes available

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message:
				"Reservation created successfully! Your reservation will be removed if not paid for within 15mins",
			data: {
				reservation: reservation?.reservation,
				payment_link: "",
			},
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
					'start_time', showtime.start_time,
					'end_time', showtime.end_time,
					'price', DIV(showtime.price, 100),
					'status', showtime.status,
					movies.id AS movie,
					'theatre_id', showtime.theatre_id
				) AS showtime,
				reservations.seat_number,
				reservations.status,
				reservations.created_at,
				reservations.updated_at
			FROM
				reservations
			JOIN
				showtime ON reservations.showtime_id = showtime.id
			JOIN
				movie ON showtime.movie_id = movie.id
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

export const cancelReservationHandler = async (
	req: Request<GetReservationInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const reservation =
			await sql`SELECT id, user_id, start_time, showtime.id AS showtime_id FROM reservations JOIN showtime ON reservations.showtime_id = showtime.id WHERE id = ${id}`

		if (!reservation.length) {
			throw new ApiError("Reservation does not exist", HttpStatusCode.NOT_FOUND)
		}

		const user =
			await sql`SELECT name, email FROM users WHERE id = ${reservation.at(0)?.user_id}`
		const showtime =
			await sql`SELECT movies.name as movie, showtime.start_time FROM showtime JOIN movies ON showtime.movie_id = movies.id WHERE id = ${reservation.at(0)?.showtime_id}`

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

// for user
export const getUserReservationsHandler = async (
	req: Request<unknown, unknown, unknown, QueryInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.payload
		const { page = 1, append_to_response } = req.query

		const reservations = await getUserReservations({ id: user.id })
		const count =
			await sql`SELECT COUNT(*) FROM reservations WHERE user_id = ${user.id}`
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

// for admin
export const getAllReservationsHandler = async (
	req: Request<unknown, unknown, unknown, QueryInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page = 1, append_to_response } = req.query

		const reservations = await getAllReservations({})
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

export const reservationStatsReportHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const stat = await sql`
			SELECT
				COUNT(*) AS total_reservations,
				COUNT(CASE WHEN status = 'confirmed' THEN 1 ELSE NULL END) AS confirmed_reservations,
				COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) AS completed_reservations
			FROM
				reservations
		`
		const total_reservations = stat.at(0)?.total_reservations
		const confirmed_reservations = stat.at(0)?.confirmed_reservations
		const completed_reservations = stat.at(0)?.completed_reservations

		return res.json(HttpStatusCode.OK).json({
			success: true,
			message: "Reservation stats fetched successfully",
			data: {
				total_reservations,
				confirmed_reservations,
				completed_reservations,
			},
		})
	} catch (error) {
		return next(error)
	}
}