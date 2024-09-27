import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../exceptions/api-error"
import { HttpStatusCode } from "../utils/status-codes"


/**
 * This middleware is used to verify if the user is an admin.
 * If the user is not an admin, it throws a 403 Forbidden error.
 * If the user is an admin, it calls the next middleware.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware.
 */
export const ensureAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.payload

		if (user.role !== "admin") {
			throw new ApiError(
				"Access denied! Only admins can access this route",
				HttpStatusCode.FORBIDDEN
			)
		}

		return next()
	} catch (error) {
		return next(error)
	}
}