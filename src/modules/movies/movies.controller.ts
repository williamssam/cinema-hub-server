import type { NextFunction, Request, Response } from "express"
import { PAGE_SIZE } from "../../constants/api"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import type { QueryInput } from "../../libs/resuable-schema"
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

/**
 * @description Fetch all movie genres
 * @route GET /movies/genres
 * @returns {object} - The list of movie genres
 * @throws {ApiError} - If something went wrong, please try again
 */
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

/**
 * @description Create a new movie
 * @route POST /movies
 * @param {CreateMovieInput} body - The movie data
 * @returns {object} - The created movie
 * @throws {ApiError} - If the genre ID does not exist
 * @throws {ApiError} - If something went wrong, please try again
 */
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

/**
 * @description Update a movie with the given id
 * @route PUT /movies/:id
 * @param {string} id.path - The id of the movie to update
 * @param {CreateMovieInput} body - The movie data to update
 * @returns {object} - The updated movie
 * @throws {ApiError} - If the movie or genre does not exist
 * @throws {ApiError} - If something went wrong, please try again
 */
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

/**
 * @description Delete a single movie with the given id
 * @route DELETE /movies/:id
 * @param {string} id.path - The id of the movie to delete
 * @returns {object} - Success message
 * @throws {ApiError} - If the movie does not exist
 */
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

/**
 * @description Fetch a single movie with the given id
 * @route GET /movies/:id
 * @param {string} id.path - The id of the movie to fetch
 * @returns {object} - The movie with the given id
 * @throws {ApiError} - If the movie does not exist
 */
export const getMovieHandler = async (
	req: Request<GetMovieInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const movie = await getMovie(id)
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

/**
 * @description Fetch all upcoming showtimes for a movie
 * @route GET /movies/:id/showtime
 * @param {number} [page.query] - The page number to fetch
 * @param {string} [append_to_response.query] - A comma-separated list of fields to include in the response. Valid values are 'movie' and 'theatre'
 * @returns {object} - The list of showtime, with the requested fields included, and pagination metadata
 * @throws {ApiError} - If the request fails
 */
export const getMovieShowtimeController = async (
	req: Request<GetMovieInput, unknown, unknown, QueryInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { page = 1, append_to_response } = req.query

		const data = await getMovieWithId(id)
		if (!data.length) {
			throw new ApiError("Movie does not exist", HttpStatusCode.NOT_FOUND)
		}

		const movie = append_to_response?.includes("movie")
		const theatre = append_to_response?.includes("theatre")

		const showtime = await sql`
				SELECT
				showtime.id,
				showtime.end_time,
				showtime.start_time,
				showtime.available_seats,
				DIV(showtime.price, 100) as price,
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
				) AS theatre`
						: sql`showtime.theatre_id`
				},
				showtime.created_at,
				showtime.updated_at
			FROM
					showtime
			JOIN
				theatres ON showtime.theatre_id = theatres.id
			JOIN
				movies ON showtime.movie_id = movies.id
			WHERE
				movie_id = ${id} AND start_time >= NOW()
			GROUP BY
				showtime.id, theatres.id, movies.id
			ORDER BY
				start_time ASC
		`
		const count =
			await sql`SELECT COUNT(*) FROM showtime WHERE movie_id = ${id} AND start_time >= NOW()`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie showtime fetched successfully!",
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
