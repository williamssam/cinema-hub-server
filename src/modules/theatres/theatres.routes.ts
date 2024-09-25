import type { Router } from "express"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { ensureAdmin } from "../../middlewares/ensure-admin"
import { requireUser } from "../../middlewares/require-user"
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
	router.get("/theatres", [deserializeUser, requireUser], getAllTheatreHandler)

	/*
	 * POST route to create new theatre
	 */
	router.post(
		"/theatres",
		[
			validateResource(createTheatreSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
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
		[
			validateResource(getTheatreSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		deleteTheatreHandler
	)
}