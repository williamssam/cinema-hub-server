import type { Router } from "express"
import { querySchema } from "../../libs/resuable-schema"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createShowtimeHandler,
	deleteShowtimeHandler,
	getAllShowtimeHandler,
	getShowtimeAvailableSeatsHandler,
	getShowtimeHandler,
	getUpcomingShowtimeController,
	updateShowtimeHandler,
	updateShowtimeStatusHandler,
} from "./showtime.controller"
import {
	createShowtimeSchema,
	getShowtimeSchema,
	updateShowtimeSchema,
	updateShowtimeStatusSchema,
} from "./showtime.schema"

export default (router: Router) => {
	/*
	 * GET route to fetch all showtime (both admins and users)
	 */
	router.get("/showtime", getAllShowtimeHandler)

	/*
	 * POST route to create new showtime (admins)
	 */
	router.post(
		"/showtime",
		[validateResource(createShowtimeSchema)],
		createShowtimeHandler
	)

	/*
	 * PUT route to update showtime (admins)
	 */
	router.put(
		"/showtime/:id",
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
	 * GET route to fetch showtime (both admins and users)
	 */
	router.get(
		"/showtime/:id",
		[validateResource(getShowtimeSchema)],
		getShowtimeHandler
	)

	/*
	 * PATCH route to update showtime status (admin)
	 */
	router.patch(
		"/showtime/:id",
		[validateResource(updateShowtimeStatusSchema)],
		updateShowtimeStatusHandler
	)

	/*
	 * GET route to get showtime available seats (might change this to return array of seats)
	 */
	router.get(
		"/showtime/:id/seats",
		[validateResource(getShowtimeSchema)],
		getShowtimeAvailableSeatsHandler
	)

	/*
	 * GET route to get upcoming showtime (users)
	 */
	router.get(
		"/showtime/upcoming",
		[validateResource(querySchema)],
		getUpcomingShowtimeController
	)
}