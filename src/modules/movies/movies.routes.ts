import type { Router } from "express";
import { querySchema } from "../../libs/resuable-schema"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { ensureAdmin } from "../../middlewares/ensure-admin"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createMovieHandler,
	deleteMovieHandler,
	getAllMoviesHandler,
	getMovieGenresController,
	getMovieHandler,
	getMovieShowtimeHandler,
	updateMovieHandler,
} from "./movies.controller"
import {
	createMovieSchema,
	getMovieSchema,
	updateMovieSchema,
} from "./movies.schema"

export default (router: Router) => {
	/*
	 * GET route to fetch movies genre (both admins and users)
	 */
	router.get("/movies/genre", getMovieGenresController)

	/*
	 * GET route to fetch all movies (both admins and users)
	 */
	router.get("/movies", [deserializeUser, requireUser], getAllMoviesHandler)

	/*
	 * POST route to create a new movie (admins only)
	 */
	router.post(
		"/movies",
		[
			validateResource(createMovieSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		createMovieHandler
	)

	/*
	 * PUT route to update movie (admins only)
	 */
	router.put(
		"/movies/:id",
		[
			validateResource(updateMovieSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		updateMovieHandler
	)

	/*
	 * DELETE route to delete a movie (admins only)
	 */
	router.delete(
		"/movies/:id",
		[
			validateResource(getMovieSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		deleteMovieHandler
	)

	/*
	 * GET route to fetch movie (both admins and users)
	 */
	router.get(
		"/movies/:id",
		[validateResource(getMovieSchema), deserializeUser, requireUser],
		getMovieHandler
	)

	/*
	 * GET route to fetch movie showtime (upcoming) (both admins and users)
	 */
	router.get(
		"/movies/:id/showtime",
		[validateResource(querySchema), deserializeUser, requireUser],
		getMovieShowtimeHandler
	)
};