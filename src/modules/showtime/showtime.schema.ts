import { z } from "zod"

export const createShowtimeSchema = z.object({
	body: z.object({
		movie_id: z
			.number({ required_error: "Genre is required" })
			.positive("Genre must be a positive number"),
		theatre_id: z
			.number({ required_error: "Genre is required" })
			.positive("Genre must be a positive number"),
		start_time: z.date({ required_error: "Start date and time is required" }),
		end_time: z.date({ required_error: "End date and time is required" }),
		price: z
			.number({
				required_error: "Price is required",
				description: "We only allow cents",
			})
			.positive("Price must be a positive number"),
	}),
})

export const getShowtimeSchema = z.object({
	params: z.object({
		id: z
			.string({ required_error: "Showtime ID is required" })
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Showtime ID can only be a number",
			}),
	}),
})

export const updateShowtimeSchema = z.object({
	...createShowtimeSchema.shape,
	...getShowtimeSchema.shape,
})

export type CreateShowtimeInput = z.infer<typeof createShowtimeSchema>["body"]
export type GetShowtimeInput = z.infer<typeof getShowtimeSchema>["params"]
export type UpdateShowtimeInput = z.infer<typeof updateShowtimeSchema>
