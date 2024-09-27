import type { Router } from "express"
import { querySchema } from "../../libs/resuable-schema"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { ensureAdmin } from "../../middlewares/ensure-admin"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createShowtimeHandler,
	deleteShowtimeHandler,
	getAllShowtimeHandler,
	getShowtimeAvailableSeatsHandler,
	getShowtimeHandler,
	getShowtimeReservations,
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
	router.get("/showtime", [deserializeUser, requireUser], getAllShowtimeHandler)

	/*
	 * POST route to create new showtime (admins)
	 */
	router.post(
		"/showtime",
		[
			validateResource(createShowtimeSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		createShowtimeHandler
	)

	/*
	 * PUT route to update showtime (admins)
	 */
	router.put(
		"/showtime/:id",
		[
			validateResource(updateShowtimeSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		updateShowtimeHandler
	)

	/*
	 * DELETE route to delete showtime (admins)
	 */
	router.delete(
		"/showtime/:id",
		[
			validateResource(getShowtimeSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		deleteShowtimeHandler
	)

	/*
	 * GET route to fetch showtime (both admins and users)
	 */
	router.get(
		"/showtime/:id",
		[validateResource(getShowtimeSchema), deserializeUser, requireUser],
		getShowtimeHandler
	)

	/*
	 * PATCH route to update showtime status (admin)
	 */
	router.patch(
		"/showtime/:id",
		[
			validateResource(updateShowtimeStatusSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		updateShowtimeStatusHandler
	)

	/*
	 * GET route to get showtime available seats)
	 */
	router.get(
		"/showtime/:id/seats",
		[validateResource(getShowtimeSchema), deserializeUser, requireUser],
		getShowtimeAvailableSeatsHandler
	)

	/*
	 * GET route to get showtime reservations
	 */
	router.get(
		"/showtime/:id/seats",
		[
			validateResource(getShowtimeSchema),
			deserializeUser,
			requireUser,
			ensureAdmin,
		],
		getShowtimeReservations
	)


	/*
	 * GET route to get upcoming showtime (users)
	 */
	router.get(
		"/showtime/upcoming",
		[validateResource(querySchema), deserializeUser, requireUser],
		getUpcomingShowtimeController
	)
}