import type { Response } from "express";

export const apiResponse = <T extends object>(
	message: string,
	status: number,
	data: T,
	res?: Response,
) => {
	return res?.status(status).json({
		success: true,
		message,
		data,
	});
};