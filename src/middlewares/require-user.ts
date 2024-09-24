import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../exceptions/api-error"
import { HttpStatusCode } from "../utils/status-codes"


/**
 * Require that the user is authenticated. If the user is not authenticated, throw a 401 Unauthorized error.
 * @param req Request object
 * @param res Response object
 * @param next Next middleware function
 * @throws ApiError 401 Unauthorized if the user is not authenticated
 */
export const requireUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.payload

		if (!user) {
			throw new ApiError(
				"No active session, please login",
				HttpStatusCode.UNAUTHORIZED
			)
		}

		return next()
	} catch (error) {
		return next(error)
	}
}
