import type { Router } from "express"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	changePasswordHandler,
	createUserHandler,
	getCurrentUserHandler,
	getUserRolesHandler,
	loginHandler,
	refreshTokenHandler,
} from "./users.controller"
import {
	changePasswordSchema,
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
} from "./users.schema"

export default (router: Router) => {
	/*
	 * GET: Authenticate a user
	 */
	router.get("/auth/roles", getUserRolesHandler)

	/*
	 * POST: Register a new user
	 */
	router.post(
		"/auth/register",
		[validateResource(createUserSchema)],
		createUserHandler
	)

	/*
	 * POST: Authenticate a user
	 */
	router.post("/auth/login", [validateResource(loginSchema)], loginHandler)

	/*
	 * GET: Get authenticated user details
	 */
	router.get("/auth/me", [deserializeUser, requireUser], getCurrentUserHandler)

	/*
	 * GET: Authenticate a user
	 */
	router.get(
		"/auth/refresh-token",
		[validateResource(refreshTokenSchema)],
		refreshTokenHandler
	)

	/*
	 * PATCH: Update user password (after login)
	 */
	router.patch(
		"/auth/change-password",
		[deserializeUser, requireUser, validateResource(changePasswordSchema)],
		changePasswordHandler
	)
}
