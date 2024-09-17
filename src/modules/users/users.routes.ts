import type { Router } from "express"
import { deserializeUser } from "../../middlewares/deserialize-user"
import { requireUser } from "../../middlewares/require-user"
import { validateResource } from "../../middlewares/validate-resource"
import {
	createUserHandler,
	getCurrentUserHandler,
	loginHandler,
	refreshTokenHandler,
} from "./users.controller"
import {
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
} from "./users.schema"

export default (router: Router) => {
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
}
