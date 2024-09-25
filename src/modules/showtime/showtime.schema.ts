import dayjs from "dayjs"
import { z } from "zod"
import { querySchema } from "../../libs/resuable-schema"

export const createShowtimeSchema = z.object({
	body: z
		.object({
			movie_id: z
				.number({ required_error: "Movie ID is required" })
				.positive("Movie ID must be a positive number"),
			theatre_id: z
				.number({ required_error: "Theatre ID is required" })
				.positive("Theatre ID must be a positive number"),
			start_time: z
				.string()
				.datetime("Start date and time is required")
				.refine(val => dayjs().isBefore(dayjs(val)), {
					message: "Start date and time cannot be in the past",
				}),
			end_time: z
				.string()
				.datetime("End date and time is required")
				.refine(val => dayjs().isBefore(dayjs(val)), {
					message: "End date and time cannot be in the past",
				}),
			price: z.coerce
				.number({
					required_error: "Price is required",
					description: "We only allow cents",
				})
				.positive("Price must be a positive number")
				.int("Price must be an integer"),
		})
		.superRefine((val, ctx) => {
			if (dayjs(val.start_time).isAfter(dayjs(val.end_time))) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "End date cannot be before start date",
				})
			}
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

export const updateShowtimeStatusSchema = z.object({
	...getShowtimeSchema.shape,
	body: z.object({
		status: z.enum(["active", "done", "cancelled", "pending"], {
			required_error:
				"Status is required and must be one of the following: active, pending, cancelled or done",
		}),
	}),
})

export const getAllShowtimeSchema = querySchema.shape.query.extend({
	append_to_response: z.string().optional(),
})

export type CreateShowtimeInput = z.infer<typeof createShowtimeSchema>["body"]
export type GetShowtimeInput = z.infer<typeof getShowtimeSchema>["params"]
export type UpdateShowtimeInput = z.infer<typeof updateShowtimeSchema>
export type UpdateShowtimeStatusInput = z.infer<
	typeof updateShowtimeStatusSchema
>
export type GetAllShowtimeInput = z.infer<typeof getAllShowtimeSchema>
