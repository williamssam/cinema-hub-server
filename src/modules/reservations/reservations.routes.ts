import type { Router } from "express"
import { querySchema } from "../../libs/resuable-schema"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { ensureAdmin } from "../../middlewares/ensure-admin"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	cancelReservationHandler,
	createReservationHandler,
	getAllReservationsHandler,
	getReservationHandler,
	getUserReservationsHandler,
	reservationReportHandler,
} from "./reservations.controller"
import {
	createReservationSchema,
	getReservationSchema,
	getUserReservationsSchema,
} from "./reservations.schema"

export default (router: Router) => {
	/*
	 * GET route to fetch all users reservations (users only)
	 */
	router.get(
		"/reservations",
		[validateResource(querySchema), deserializeUser, requireUser, ensureAdmin],
		getAllReservationsHandler
	)

	/*
	 * GET route to fetch all users reservations (users only)
	 */
	router.get(
		"/reservations/:id/user",
		[validateResource(getUserReservationsSchema), deserializeUser, requireUser],
		getUserReservationsHandler
	)

	/*
	 * GET route to fetch reservation reports
	 */
	router.get(
		"/reservations/report",
		[deserializeUser, requireUser, ensureAdmin],
		reservationReportHandler
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
	 * DELETE route to cancel a reservation
	 */
	router.delete(
		"/reservations/:id/cancel",
		[validateResource(getReservationSchema), deserializeUser, requireUser],
		cancelReservationHandler
	)
}
