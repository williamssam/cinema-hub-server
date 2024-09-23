import { z } from "zod"
import type { querySchema } from "../../libs/resuable-schema"


const TOTAL_SEAT_PER_THEATRE = 200

export const createTheatreSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Theatre name is required" }).trim(),
		capacity: z.coerce
			.number({ required_error: "Theatre capacity is required" })
			.positive("Theatre capacity can only be a positive number")
			.gte(10, "Theatre capacity cannot have less than 10 seats")
			.lte(
				TOTAL_SEAT_PER_THEATRE,
				`Theatre capacity cannot have more than ${TOTAL_SEAT_PER_THEATRE} seats`
			),
		seats_per_row: z.coerce
			.number({ required_error: "Seat rows is required" })
			.positive("Seat rows can only be a positive number")
			.gte(10, "Seat rows cannot be less than 10")
			.lte(20, "Seat rows cannot be more than 20"),
	}),
})

export const getTheatreSchema = z.object({
	params: z.object({
		id: z
			.string({ required_error: "Theatre ID is required" })
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Theatre ID can only be a number",
			}),
	}),
})

export const updateTheatreSchema = z.object({
	...createTheatreSchema.shape,
	...getTheatreSchema.shape,
})

export type CreateTheatreInput = z.infer<typeof createTheatreSchema>["body"]
export type GetTheatreInput = z.infer<typeof getTheatreSchema>["params"]
export type UpdateTheatreInput = z.infer<typeof updateTheatreSchema>
export type GetAllTheatreInput = z.infer<typeof querySchema>["query"]

