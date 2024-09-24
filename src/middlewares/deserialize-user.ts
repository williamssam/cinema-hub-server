import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../exceptions/api-error"
import { verifyAccessJWT } from "../modules/users/users.methods"
import { HttpStatusCode } from "../utils/status-codes"


/**
 * This middleware is used to verify the access token and deserialize the user.
 * This middleware verifies the access token and adds the user to the request object.
 * If the access token is invalid or expired, it throws an ApiError.
 * If the access token is valid, it adds the user to the request object and calls the next middleware.
 * This middleware is used in the auth route to verify the access token and deserialize the user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware.
 */
export const deserializeUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const has_header = req.headers.authorization
		if (!has_header?.startsWith("Bearer ")) {
			throw new ApiError(
				"No access token found, make sure to add Bearer in your request header",
				HttpStatusCode.NOT_FOUND
			)
		}

		const access_token = req.headers.authorization?.split(" ")[1]
		if (!access_token) {
			throw new ApiError("Access token not found!", HttpStatusCode.NOT_FOUND)
		}

		const payload = await verifyAccessJWT(access_token)
		if (!payload?.is_valid) {
			throw new ApiError(
				"Invalid or expired access token!",
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// check if the access token is in the blacklist
		// const is_blacklisted = await redis.get(access_token)
		// if (is_blacklisted) {
		// 	throw new ApiError(
		// 		"Access token is blacklisted, please login again!",
		// 		HttpStatusCode.UNAUTHORIZED
		// 	)
		// }

		if (payload?.decoded) {
			res.locals.payload = payload?.decoded
			return next()
		}

		return next()
	} catch (error) {
		return next(error)
	}
}
