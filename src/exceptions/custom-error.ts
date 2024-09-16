import { HttpStatusCode } from '../utils/status-codes'

// Note: Our custom error extends from Error, so we can throw this error as an exception.
export class CustomError extends Error {
	message: string
	success: boolean
	status: number
	stack?: string

	constructor(
		message: string,
		success = false,
		status: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
		stack?: string
	) {
		super(message)

		this.message = message
		this.success = success
		this.status = status
		this.stack = stack
	}
}

export type CustomErrorResponse = {
	message: string
	success: boolean
	status: boolean
	stack?: string
}
