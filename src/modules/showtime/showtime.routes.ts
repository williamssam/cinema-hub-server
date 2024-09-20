import type { Router } from "express"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createShowtimeHandler,
	deleteShowtimeHandler,
	getAllShowtimeHandler,
	getShowtimeHandler,
	updateShowtimeHandler,
} from "./showtime.controller"
import {
	createShowtimeSchema,
	getShowtimeSchema,
	updateShowtimeSchema,
} from "./showtime.schema"

export default (router: Router) => {
	/*
	 * POST route to create new showtime (admins)
	 */
	router.get(
		"/showtime",
		[validateResource(createShowtimeSchema)],
		createShowtimeHandler
	)

	/*
	 * PUT route to update showtime (admins)
	 */
	router.put(
		"/showtime",
		[validateResource(updateShowtimeSchema)],
		updateShowtimeHandler
	)

	/*
	 * DELETE route to delete showtime (admins)
	 */
	router.delete(
		"/showtime/:id",
		[validateResource(getShowtimeSchema)],
		deleteShowtimeHandler
	)

	/*
	 * GET route to fetch showtime
	 */
	router.delete(
		"/showtime/:id",
		[validateResource(getShowtimeSchema)],
		getShowtimeHandler
	)

	/*
	 * GET route to fetch all showtime
	 */
	router.get("/showtime", getAllShowtimeHandler)
}