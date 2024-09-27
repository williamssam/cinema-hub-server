import type { Router } from "express"
import { querySchema } from "../../libs/resuable-schema"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { ensureAdmin } from "../../middlewares/ensure-admin"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	cancelReservationHandler,
	createReservationHandler,
	getReservationHandler,
	getUserReservationsHandler,
} from "./reservations.controller"
import {
	createReservationSchema,
	getReservationSchema,
} from "./reservations.schema"
import { getAllReservations } from "./reservations.service"

export default (router: Router) => {
	/*
	 * GET route to fetch all users reservations (users only)
	 */
	router.get(
		"/reservations",
		[validateResource(querySchema), deserializeUser, requireUser],
		getUserReservationsHandler
	)

		/*
	 * GET route to fetch all users reservations (users only)
	 */
	router.get(
		"/reservations/all",
		[validateResource(querySchema), deserializeUser, requireUser, ensureAdmin],
		getAllReservations
	)

	/*
	 * GET route to fetch a single reservation
	 */
	router.get(
		"/reservations/:id",
		[validateResource(getReservationSchema), deserializeUser, requireUser],
		getReservationHandler
	)

	/*
	 * POST route to create a reservation
	 */
	router.post(
		"/reservations",
		[validateResource(createReservationSchema), deserializeUser, requireUser],
		createReservationHandler
	)

	/*
	 * PATCH route to cancel a reservation
	 */
	router.patch(
		"/reservations/:id",
		[validateResource(getReservationSchema), deserializeUser, requireUser],
		cancelReservationHandler
	)
}