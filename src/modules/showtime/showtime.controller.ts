import type { NextFunction, Request, Response } from "express"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import { getMovieWithId } from "../movies/movies.service"
import { getTheatreWithId } from "../theatres/theatres.service"
import type {
	CreateShowtimeInput,
	GetShowtimeInput,
	UpdateShowtimeInput,
} from "./showtime.schema"
import { getShowtimeDetails, getShowtimeWithId } from "./showtime.service"

export const createShowtimeHandler = async (
	req: Request<unknown, unknown, CreateShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { end_time, movie_id, price, start_time, theatre_id } = req.body

		const movie = await getMovieWithId(movie_id.toString())
		if (!movie.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const theatre = await getTheatreWithId(theatre_id.toString())
		if (!theatre.length) {
			throw new ApiError("Theatre does not exist", HttpStatusCode.NOT_FOUND)
		}

		const showtime =
			await sql`INSERT INTO showtime (movie_id, start_time, end_time, price, theatre_id) VALUES (${movie_id}, ${end_time}, ${start_time}, ${price}, ${theatre_id}) RETURNING *`
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
		if (showtime.length) {
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
			message: "Showtime created successfully!",
			data,
		})
	} catch (error) {
		return next(error)
	}
}

export const deleteShowtimeHandler = async (
	req: Request<GetShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const showtime = await getShowtimeWithId(id)
		if (showtime.length) {
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

export const getShowtimeHandler = async (
	req: Request<GetShowtimeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const showtime = await getShowtimeWithId(id)
		if (showtime.length) {
			throw new ApiError("Showtime does not exist", HttpStatusCode.NOT_FOUND)
		}

		const data = await getShowtimeDetails(id)
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime fetched successfully!",
			data,
		})
	} catch (error) {
		return next(error)
	}
}

export const getAllShowtimeHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = await getShowtimeDetails()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Showtime fetched successfully!",
			data,
		})
	} catch (error) {
		return error
	}
}