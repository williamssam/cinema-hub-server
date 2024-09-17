import type { NextFunction, Request, Response } from "express"
import { HttpStatusCode } from "../../utils/status-codes"
import { getMovieGenres } from "./movies.service"

export const getMovieGenresController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const genres = await getMovieGenres()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Movie genres retrieved successfully!",
			data: genres,
		})
	} catch (error) {
		return next(error)
	}
}
