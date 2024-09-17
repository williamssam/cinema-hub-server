import type { NextFunction, Request, Response } from "express"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import {
	hashPassword,
	signAccessJWT,
	signRefreshJWT,
	verifyAccessJWT,
	verifyHashedPassword,
	verifyRefreshJWT,
} from "./users.methods"
import type {
	CreateUserInput,
	LoginInput,
	RefreshTokenInput,
} from "./users.schema"
import type { User } from "./users.type"

export const createUserHandler = async (
	req: Request<unknown, unknown, CreateUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, name, password, role } = req.body

		// Check if user with this email exits
		const data = await sql`SELECT email FROM users WHERE email = ${email}`
		if (data.length) {
			throw new ApiError(
				"User with this email already exists",
				HttpStatusCode.CONFLICT
			)
		}

		// Hash password
		const password_hash = await hashPassword({ user_password: password })
		const user = await sql`
				INSERT INTO users
					(email, name, password, role)
				VALUES
					(${email}, ${name}, ${password_hash}, ${role})
				RETURNING id, email, name
			`

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: "User created successfully!",
			data: user,
		})
	} catch (error) {
		return next(error)
	}
}

export const loginHandler = async (
	req: Request<unknown, unknown, LoginInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body

		const user = await sql<
			User[]
		>`SELECT id, email, password FROM users WHERE email = ${email}`
		if (!user.length) {
			throw new ApiError(
				"Invalid email address or password",
				HttpStatusCode.CONFLICT
			)
		}

		const isValidPassword = await verifyHashedPassword({
			password_hash: user[0]?.password,
			user_password: password,
		})
		if (!isValidPassword) {
			throw new ApiError(
				"Invalid email address or password",
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// @ts-expect-error
		const { password: user_password, ...rest } = user.at(0)
		const access_token = signAccessJWT({ user: rest })
		const refresh_token = signRefreshJWT({ id: rest.id })

		if (refresh_token) {
			//  FIXME: hash the refresh token before storing in DB
			await sql`INSERT INTO users (refresh_token) VALUES (${refresh_token})`
		}

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: "User logged in successfully!",
			data: {
				user: rest,
				access_token,
				refresh_token,
			},
		})
	} catch (error) {
		return next(error)
	}
}

export const getCurrentUserHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.user
		res.status(HttpStatusCode.OK).json({
			success: true,
			message: "User fetched successfully",
			data: user,
		})
	} catch (error) {
		next(error)
	}
}

export const refreshTokenHandler = async (
	req: Request<unknown, unknown, RefreshTokenInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { refresh_token } = req.body

		const token = req.headers.authorization?.split(" ")[1]
		if (!token) {
			throw new ApiError("Access token not found!", HttpStatusCode.BAD_REQUEST)
		}

		const data = await verifyAccessJWT(token, {
			ignoreExpiration: true,
		})
		if (!data.is_valid) {
			throw new ApiError(
				"Invalid or expired access token, please login again!",
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const payload = await verifyRefreshJWT(refresh_token)
		if (!payload?.is_valid) {
			throw new ApiError(
				"Invalid or expired refresh token, please login again!",
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// @ts-expect-error
		const id = payload?.decoded?.id
		const user = await sql<
			Omit<User, "password">[]
		>`SELECT id, refresh_token, name, email FROM users WHERE id = ${id}`
		if (!user.length) {
			throw new ApiError("User does not exist!", HttpStatusCode.NOT_FOUND)
		}

		if (refresh_token !== user.at(0)?.refresh_token) {
			throw new ApiError("Invalid refresh token", HttpStatusCode.BAD_REQUEST)
		}

		// @ts-expect-error
		const { refresh_token: refreshToken, ...rest } = user.at(0)
		const access_token = signAccessJWT({ user: rest })
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Access token generated successfully!",
			data: {
				access_token,
				refresh_token,
			},
		})
	} catch (error) {
		return next(error)
	}
}
