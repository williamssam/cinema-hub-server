import type { Router } from "express"
import { authorizeUser } from "../../middlewares/authorize-user"
import { deserializeUser } from "../../middlewares/deserialize-user"
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
		"/admin/theatres",
		[
			validateResource(createTheatreSchema),
			deserializeUser,
			requireUser,
			authorizeUser,
		],
		createTheatreHandler
	)

	/*
	 * PUT route to update existing theatre
	 */
	router.put(
		"/admin/theatres/:id",
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
		"/admin/theatres/:id",
		[
			validateResource(getTheatreSchema),
			deserializeUser,
			requireUser,
			authorizeUser,
		],
		deleteTheatreHandler
	)
}