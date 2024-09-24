import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../exceptions/api-error"
import { HttpStatusCode } from "../utils/status-codes"

/**
 * This middleware is used to verify the user role and make sure that the user
 * accessing the route is an admin. If the user is not an admin, it throws an
 * ApiError with a 403 status code.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware.
 */
export const authorizeUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.payload

		if (req.route.includes("admin") && user.role.name !== "admin") {
			throw new ApiError(
				"You do not have access to this route, only admins can access this route",
				HttpStatusCode.FORBIDDEN
			)
		}

		return next()
	} catch (error) {
		return next(error)
	}
}