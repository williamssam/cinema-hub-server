import type { Router } from "express";
import { validateResource } from "../../middlewares/validate-resource"
import {
	createMovieHandler,
	deleteMovieHandler,
	getAllMoviesHandler,
	getMovieGenresController,
	getMovieHandler,
	updateMovieHandler,
} from "./movies.controller"
import {
	createMovieSchema,
	getMovieSchema,
	updateMovieSchema,
} from "./movies.schema"

export default (router: Router) => {
	/*
	 * GET route to fetch movies genre
	 */
	router.get("/movies/genre", getMovieGenresController)

	/*
	 * GET route to fetch all movies
	 */
	router.get("/movies", getAllMoviesHandler)

	/*
	 * POST route to create a new movie
	 */
	router.post(
		"/movies",
		[validateResource(createMovieSchema)],
		createMovieHandler
	)

	/*
	 * PUT route to update movie
	 */
	router.put(
		"/movies/:id",
		[validateResource(updateMovieSchema)],
		updateMovieHandler
	)

	/*
	 * DELETE route to delete a movie
	 */
	router.delete(
		"/movies/:id",
		[validateResource(getMovieSchema)],
		deleteMovieHandler
	)

	/*
	 * GET route to fetch movie
	 */
	router.get("/movies/:id", [validateResource(getMovieSchema)], getMovieHandler)
};