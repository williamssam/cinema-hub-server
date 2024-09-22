import type { NextFunction, Request, Response } from "express"
import { PAGE_SIZE } from "../../constants/api"
import { sql } from "../../db"
import { ApiError } from "../../exceptions/api-error"
import { generateCustomId } from "../../libs/generate"
import { HttpStatusCode } from "../../utils/status-codes"
import type {
	CreateTheatreInput,
	GetAllTheatreInput,
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
		if (data.length) {
			throw new ApiError("Theatre already exists!", HttpStatusCode.CONFLICT)
		}

		const room_id = generateCustomId()
		const theatre =
			await sql`INSERT INTO theatres (name, capacity, room_id) VALUES (${name}, ${capacity}, ${room_id}) RETURNING *`
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre created successfully!",
			data: theatre.at(0),
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
			data: theatre.at(0),
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

		await sql`DELETE FROM theatres WHERE id = ${id}`

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

		const data =
			await sql`SELECT id, name, capacity, room_id FROM theatres WHERE id = ${id}`
		if (!data.length) {
			throw new ApiError("Theatre does not exist!", HttpStatusCode.NOT_FOUND)
		}

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatre fetched successfully!",
			data: data.at(0),
		})
	} catch (error) {
		return next(error)
	}
}

export const getAllTheatreHandler = async (
	req: Request<unknown, unknown, unknown, GetAllTheatreInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page = 1 } = req.query
		const theatre = await sql`SELECT id, name, capacity, room_id FROM theatres`

		const count = await sql`SELECT COUNT(*) FROM theatres`
		const total = count.at(0)?.count

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: "Theatres fetched successfully!",
			data: theatre,
			meta: {
				page: page,
				per_page: PAGE_SIZE,
				total: Number(total),
				total_pages: Math.ceil(total / PAGE_SIZE) || 0,
			},
		})
	} catch (error) {
		return next(error)
	}
}