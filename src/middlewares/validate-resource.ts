import type { NextFunction, Request, Response } from 'express'
import { type AnyZodObject, ZodError } from 'zod'
import { IS_DEV } from '../constants/config'
import { HttpStatusCode } from '../utils/status-codes'

/**
 * Validates the resource using the provided schema.
 */
export const validateResource =
	(schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			})
			next()
		} catch (error: any) {
			if (error instanceof ZodError) {
				const errorMessage = error.errors.map(err => ({
					message: err.message,
					path: err.path[1],
					...(IS_DEV && { code: err.code }),
				}))
				return res.status(HttpStatusCode.BAD_REQUEST).json({
					success: false,
					errors: errorMessage,
				})
			}

			return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error.errors)
		}
	}
