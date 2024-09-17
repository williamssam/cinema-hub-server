import type { Router } from "express"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createTheatreHandler,
	deleteTheatreHandler,
	getAllTheatreHandler,
	getTheatreHandler,
	updateTheatreHandler,
} from "./theatres.controller"
import {
	createTheatreSchema,
	getTheatreSchema,
	updateTheatreSchema,
} from "./theatres.schema"

export default (router: Router) => {
	/*
	 * GET route to fetch all theatres
	 */
	router.get("/theatres", getAllTheatreHandler)

	/*
	 * POST route to create new theatre
	 */
	router.post(
		"/theatres",
		[validateResource(createTheatreSchema)],
		createTheatreHandler
	)

	/*
	 * PUT route to update existing theatre
	 */
	router.put(
		"/theatres/:id",
		[validateResource(updateTheatreSchema)],
		updateTheatreHandler
	)

	/*
	 * GET route to fetch theatre
	 */
	router.get(
		"/theatres/:id",
		[validateResource(getTheatreSchema)],
		getTheatreHandler
	)

	/*
	 * DELETE route to fetch theatre
	 */
	router.delete(
		"/theatres/:id",
		[validateResource(getTheatreSchema)],
		deleteTheatreHandler
	)
}