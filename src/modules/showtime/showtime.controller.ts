import type { NextFunction, Request, Response } from "express"
import { PAGE_SIZE } from "../../constants/api"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import type { QueryInput } from "../../libs/resuable-schema"
import { HttpStatusCode } from "../../utils/status-codes"
import { getMovieWithId } from "../movies/movies.service"
import { getTheatreWithId } from "../theatres/theatres.service"
import type {
	CreateShowtimeInput,
	GetAllShowtimeInput,
	GetShowtimeInput,
	UpdateShowtimeInput,
	UpdateShowtimeStatusInput,
} from "./showtime.schema"
import { getShowtime, getShowtimeWithId } from "./showtime.service"

/**
 * @description Create a new showtime
 * @route POST /showtime
 * @param {CreateShowtimeInput} body - The showtime data
 * @returns {object} - The created showtime
 * @throws {ApiError} - If the movie or theatre does not exist
 * @throws {ApiError} - If the time slot is already booked for a show at this theatre
 * @throws {ApiError} - If the theatre is already in use
 * @throws {ApiError} - If something went wrong, please try again
 */
export const createShowtimeHandler = async (
	req: Request<unknown, unknown, CreateShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { end_time, movie_id, price, start_time, theatre_id } = req.body

		const movie = await getMovieWithId(String(movie_id))
		if (!movie.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const theatre = await getTheatreWithId(String(theatre_id))
		if (!theatre.length) {
			throw new ApiError("Theatre does not exist", HttpStatusCode.NOT_FOUND)
		}

		// check if there already a showtime set for that time at a particular theatre and status is not done or cancelled
		const show =
			await sql`SELECT * FROM showtime WHERE theatre_id = ${theatre_id} AND start_time >= ${start_time} AND end_time <= ${end_time} AND status != 'done' AND status != 'cancelled'`
		if (show.length) {
			throw new ApiError(
				"That time slot is already booked for a show at this theatre.",
				HttpStatusCode.CONFLICT
			)
		}

		const data =
			await sql`SELECT * FROM showtime WHERE theatre_id = ${theatre_id} AND status = 'active'`
		if (data.length) {
			throw new ApiError(
				"Theatre is already in use, please choose another.",
				HttpStatusCode.CONFLICT
			)
		}

		const available_seats = theatre.at(0)?.capacity
		const payload = { ...req.body, available_seats }

		const showtime = await sql`INSERT INTO showtime ${sql(payload)} RETURNING *`

		if (!showtime.length) {
			throw new ApiError(
				"Something went wrong, please try again",
				HttpStatusCode.INTERNAL_SERVER_ERROR
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime created successfully!",
			data: showtime,
		})
	} catch (error) {
		return next(error)
	}
}

export const updateShowtimeHandler = async (
	req: Request<
		UpdateShowtimeInput["params"],
		unknown,
		UpdateShowtimeInput["body"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { end_time, movie_id, price, start_time, theatre_id } = req.body

		const showtime = await getShowtimeWithId(id)
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		const movie = await getMovieWithId(movie_id.toString())
		if (!movie.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const theatre = await getTheatreWithId(theatre_id.toString())
		if (!theatre.length) {
			throw new ApiError("Theatre does not exist", HttpStatusCode.NOT_FOUND)
		}

		const data =
			await sql`UPDATE showtime SET movie_id = ${movie_id}, start_time = ${start_time}, end_time = ${end_time}, price = ${price}, theatre_id = ${theatre_id} WHERE id = ${id} RETURNING *`
		if (!data.length) {
			throw new ApiError(
				"Something went wrong, please try again",
				HttpStatusCode.INTERNAL_SERVER_ERROR
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime updated successfully!",
			data: data.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * Deletes a showtime with a given ID
 * @route DELETE /showtime/:id
 * @param {Request<GetShowtimeInput>} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @return {Promise<void>}
 */
export const deleteShowtimeHandler = async (
	req: Request<GetShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const showtime = await getShowtimeWithId(id)
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		await sql`DELETE FROM showtime WHERE id = ${id}`
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime deleted successfully!",
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description Fetch a single showtime with the given id
 * @route GET /showtime/:id
 * @param {string} id.path - The id of the showtime to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie' and 'theatre'
 * @returns {object} - The showtime with the given id, with the requested fields included
 * @throws {ApiError} - If the showtime does not exist
 */
export const getShowtimeHandler = async (
	req: Request<
		GetShowtimeInput,
		unknown,
		unknown,
		{ append_to_response: string }
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		// ?append_to_response=movie,theatre
		const { append_to_response } = req.query

		const showtime = await getShowtime({ id, append: append_to_response })
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime fetched successfully!",
			data: showtime.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description Fetch all showtime
 * @route GET /showtime
 * @param {number} [page.query] - The page number to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie' and 'theatre'
 * @returns {object} - The list of showtime, with the requested fields included, and pagination metadata
 * @throws {ApiError} - If the request fails
 */
export const getAllShowtimeHandler = async (
	req: Request<unknown, unknown, unknown, GetAllShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page = 1, append_to_response } = req.query
		const data = await getShowtime({ append: append_to_response })

		const count = await sql`SELECT COUNT(*) FROM showtime`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime fetched successfully!",
			data,
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
 * @description Update the status of a single showtime
 * @route PATCH /showtime/:id/status
 * @param {string} id.path - The id of the showtime to update
 * @param {UpdateShowtimeStatusInput["body"]} body
 * @returns {object} - The updated showtime with the new status
 * @throws {ApiError} - If the showtime does not exist, or if the request fails
 */
export const updateShowtimeStatusHandler = async (
	req: Request<
		UpdateShowtimeStatusInput["params"],
		unknown,
		UpdateShowtimeStatusInput["body"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { status } = req.body

		const showtime = await getShowtimeWithId(id)
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		const data =
			await sql`UPDATE showtime SET status = ${status} WHERE id = ${id} RETURNING *`
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime status updated successfully!",
			data: data.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

/**
 * @description Fetch all upcoming showtime
 * @route GET /showtime/upcoming
 * @param {number} [page.query] - The page number to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie' and 'theatre'
 * @returns {object} - The list of upcoming showtime, with the requested fields included, and pagination metadata
 * @throws {ApiError} - If the request fails
 */
export const getUpcomingShowtimeController = async (
	req: Request<unknown, unknown, unknown, QueryInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page, append_to_response } = req.query

		const movie = append_to_response?.includes("movie")
		const theatre = append_to_response?.includes("theatre")

		const showtime = await sql`
				SELECT
				showtime.id,
				showtime.end_time,
				showtime.start_time,
				showtime.available_seats,
				showtime.price / 100 as price,
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
					'room_id', theatres.room_id) AS theatre`
						: sql`showtime.theatre_id`
				},
				showtime.created_at,
				showtime.updated_at
			FROM
					showtime
			WHERE start_time >= NOW()
			JOIN
				theatres ON showtime.theatre_id = theatres.id
			JOIN
				movies ON showtime.movie_id = movies.id
			GROUP BY
				showtime.id, theatres.id, movies.id
			ORDER BY
				start_time ASC
		`
		const count =
			await sql`SELECT count(*) FROM showtime WHERE start_time >= NOW()`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime fetched successfully!",
			data: showtime,
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
 * @description Get the available seats of a single showtime
 * @route GET /showtime/:id/available-seats
 * @param {string} id.path - The id of the showtime to fetch
 * @returns {object} - The available seats of the showtime
 * @throws {ApiError} - If the showtime does not exist, or if the request fails
 */
export const getShowtimeAvailableSeatsHandler = async (
	req: Request<GetShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const showtime = await getShowtimeWithId(id)
		if (!showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		const data =
			await sql`SELECT available_seats FROM showtime WHERE id = ${id}`

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime available seats fetched successfully!",
			data: data.at(0),
		})
	} catch (error) {
		return next(error)
	}
}