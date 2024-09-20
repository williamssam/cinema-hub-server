import type { NextFunction, Request, Response } from "express";
import { config } from "../config/configuration"
import {
	CustomError,
	type CustomErrorResponse,
} from "../exceptions/custom-error";
import { HttpStatusCode } from "../utils/status-codes";
// import { IS_DEV } from '../utils/constant'

const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!(err instanceof CustomError)) {
		return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
			message: "Internal Server error. Something went wrong",
			success: false,
			...(config.environment.IS_DEV && { stack: err.stack }),
		})
	}

	const customError = err as CustomError;
	const response = {
		message: customError.message,
		success: false,
	} as CustomErrorResponse;

	// if (IS_DEV) {
	// 	response.stack = customError.stack
	// }

	res.status(customError.status).send(response);
	next();
};

export default errorHandler;
