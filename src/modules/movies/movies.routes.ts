import type { Router } from "express";
import { getMovieGenresController } from "./movies.controller";

export default (router: Router) => {
	/*
	 * GET route to fetch movies genre
	 * @route /api/v1/genre/movie
	 */
	router.get("/genre/movie", getMovieGenresController);
};