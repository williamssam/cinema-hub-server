import type { NextFunction, Request, Response } from "express"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateMovieInput,
	GetMovieInput,
	UpdateMovieInput,
} from "./movies.schema"
import { getMovieGenres, getMovieWithId } from "./movies.service"

export const getMovieGenresController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const genres = await getMovieGenres()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie genres retrieved successfully!",
			data: genres,
		})
	} catch (error) {
		return next(error)
	}
}

export const createMovieHandler = async (
	req: Request<unknown, unknown, CreateMovieInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const payload = Object.values(req.body).join(", ")

		const movie =
			await sql`INSERT INTO movies (title, tagline, overview, original_language, homepage, imbd_url, genre_id, runtime, director, release_date, poster_image_url ) VALUES (${payload}) RETURNING *`

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: "Movie created successfully!",
			data: movie,
		})
	} catch (error) {
		return next(error)
	}
}

export const updateMovieHandler = async (
	req: Request<UpdateMovieInput["params"], unknown, UpdateMovieInput["body"]>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const payload = req.body

		const data = await getMovieWithId(id)
		if (!data.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const movie =
			await sql`UPDATE movies SET title = ${payload.title}, tagline = ${payload.tagline}, overview = ${payload.overview}, original_language = ${payload.original_language}, poster_image_url = ${payload.poster_image_url}, homepage = ${payload.homepage}, genre_id = ${payload.genre_id}, runtime = ${payload.runtime}, director = ${payload.director}, release_date = ${payload.release_date} WHERE id = ${id} RETURNING *`

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie updated successfully!",
			data: movie,
		})
	} catch (error) {
		return next(error)
	}
}

export const deleteMovieHandler = async (
	req: Request<GetMovieInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const data = await getMovieWithId(id)
		if (!data.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		await sql`DELETE FROM movies WHERE id = ${id}`
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie deleted successfully!",
		})
	} catch (error) {
		return next(error)
	}
}

export const getMovieHandler = async (
	req: Request<GetMovieInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const data = await getMovieWithId(id)
		if (!data.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie retrieved successfully!",
			data: data[0],
		})
	} catch (error) {
		return next(error)
	}
}

export const getAllMoviesHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const movies = await sql`SELECT * FROM movies`

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "All movies retrieved successfully!",
			data: movies,
		})
	} catch (error) {
		return next(error)
	}
}
