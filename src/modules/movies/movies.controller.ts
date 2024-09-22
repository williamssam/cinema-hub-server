import type { NextFunction, Request, Response } from "express"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateMovieInput,
	GetAllMoviesInput,
	GetMovieInput,
	UpdateMovieInput,
} from "./movies.schema"
import {
	addMovieTransaction,
	getMovie,
	getMovieGenres,
	getMovieWithId,
	getMovies,
	totalMovies,
	updateMovieTransaction,
} from "./movies.service"

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
		const { genre_ids } = req.body

		const genre = await sql`SELECT id FROM genres WHERE id IN ${sql(genre_ids)}`
		if (!genre) {
			throw new ApiError("Genre ID does not exist", HttpStatusCode.NOT_FOUND)
		}

		const movie = await addMovieTransaction(req.body)
		if (!movie) {
			throw new ApiError(
				"Error creating movie, please try again",
				HttpStatusCode.INTERNAL_SERVER_ERROR
			)
		}

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: "Movie added successfully!",
			data: {
				...movie,
				genre_ids,
			},
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
		const { genre_ids } = req.body

		const data = await getMovieWithId(id)
		if (!data.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const genre = await sql`SELECT id FROM genres WHERE id IN ${sql(genre_ids)}`
		if (!genre) {
			// FIXME: Tell the user the ID that does not exist
			throw new ApiError("Genre IDs does not exist", HttpStatusCode.NOT_FOUND)
		}

		const movie = await updateMovieTransaction(req.body, id)
		if (!movie) {
			throw new ApiError(
				"Error updating movie, please try again",
				HttpStatusCode.INTERNAL_SERVER_ERROR
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie updated successfully!",
			data: {
				...movie,
				genre_ids,
			},
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

		const movie = await getMovie({ movieId: id })
		if (!movie.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie retrieved successfully!",
			data: movie.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

// FIXME: Add pagination
export const getAllMoviesHandler = async (
	req: Request<unknown, unknown, unknown, GetAllMoviesInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		// url: http://localhost:3000/movies?page=1&genre=1
		const { page: requested_page, genre } = req.query

		const page = Number(requested_page) || 1
		const limit = 20

		const movies = await getMovies({
			genreId: genre,
			limit,
		})
		const total = await totalMovies(genre)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "All movies retrieved successfully!",
			data: movies,
			meta: {
				page: page,
				per_page: limit,
				total: Number(total),
				total_pages: Math.ceil(total / limit) || 1,
			},
		})
	} catch (error) {
		return next(error)
	}
}
