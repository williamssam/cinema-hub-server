import type { NextFunction, Request, Response } from "express"
import { nanoid } from "nanoid"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateTheatreInput,
	GetTheatreInput,
	UpdateTheatreInput,
} from "./theatres.schema"
import { getTheatreWithId } from "./theatres.service"

export const createTheatreHandler = async (
	req: Request<unknown, unknown, CreateTheatreInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { name, capacity } = req.body

		const data = await sql`SELECT name FROM theatres WHERE name = ${name}`
		if (!data.length) {
			throw new ApiError(
				"Theatre with name already exists!",
				HttpStatusCode.CONFLICT
			)
		}

		const room_id = `room_${nanoid(10)}`
		const theatre =
			await sql`INSERT INTO theatres (name, capacity, room_id) VALUES (${name}, ${capacity}, ${room_id}) RETURNING *`
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre created successfully!",
			data: theatre,
		})
	} catch (error) {
		return next(error)
	}
}

export const updateTheatreHandler = async (
	req: Request<
		UpdateTheatreInput["params"],
		unknown,
		UpdateTheatreInput["body"]
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { capacity, name } = req.body

		const data = await getTheatreWithId(id)
		if (!data.length) {
			throw new ApiError("Theatre does not exist!", HttpStatusCode.NOT_FOUND)
		}

		const theatre =
			await sql`UPDATE theatres SET name = ${name}, capacity = ${capacity} WHERE id = ${id} RETURNING *`
		if (!theatre.length) {
			throw new ApiError(
				"Error updating theatre, please try again later!",
				HttpStatusCode.NOT_FOUND
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre updated successfully!",
			data: theatre,
		})
	} catch (error) {
		return next(error)
	}
}

export const deleteTheatreHandler = async (
	req: Request<GetTheatreInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const data = await getTheatreWithId(id)
		if (!data.length) {
			throw new ApiError("Theatre does not exist!", HttpStatusCode.NOT_FOUND)
		}

		const theatre = await sql`DELETE FROM theatres WHERE id = ${id}`
		if (!theatre.length) {
			throw new ApiError(
				"Error deleting theatre, please try again later!",
				HttpStatusCode.NOT_FOUND
			)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre deleted successfully!",
		})
	} catch (error) {
		return next(error)
	}
}

export const getTheatreHandler = async (
	req: Request<GetTheatreInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const data = await getTheatreWithId(id)
		if (!data.length) {
			throw new ApiError("Theatre does not exist!", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre fetched successfully!",
			data: data[0],
		})
	} catch (error) {
		return next(error)
	}
}

export const getAllTheatreHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const theatre = await sql`SELECT * FROM theatres`

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatres fetched successfully!",
			data: theatre,
		})
	} catch (error) {
		return next(error)
	}
}