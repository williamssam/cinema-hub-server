import { z } from "zod"
import { querySchema } from "../../libs/resuable-schema"

export const createReservationSchema = z.object({
	body: z.object({
		user_id: z
			.number({
				required_error: "User ID is required",
			})
			.positive("User ID must be a positive number")
			.int("User ID must be a whole number"),
		showtime_id: z
			.number({
				required_error: "Showtime ID is required",
			})
			.positive("Showtime ID must be a positive number")
			.int("Showtime ID must be a whole number"),
		seat_numbers: z
			.string({ required_error: "Seat number is required" })
			.regex(
				/^[A-Z]{1,2}\d{3}$/,
				"Seat number must be in the format A001, A002, etc."
			)
			.array()
			.nonempty("Seat numbers cannot be empty")
			.max(5, "Cannot have more than 5 seat numbers"),
	}),
})

export const getReservationSchema = z.object({
	params: z.object({
		id: z
			.string({ required_error: "Reservation ID is required" })
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Reservation ID can only be a number",
			}),
	}),
	query: querySchema.shape.query.omit({ page: true }),
})

export const getUserReservationsSchema = z.object({
	params: z.object({
		id: z
			.string({ required_error: "User ID is required" })
			.refine(value => !Number.isNaN(Number(value)), {
				message: "User ID can only be a number",
			}),
	}),
	...querySchema.shape,
})

/*
	- Pending: The reservation is awaiting confirmation or payment or newly created
	- Confirmed: The reservation has been confirmed and payment has been made
	- Cancelled: The reservation has been cancelled
	- Expired: The reservation has expired i.e the showtime has passed and the reservation was not confirmed
	- Completed: The reservation has been completed i.e the showtime has passed and the reservation was confirmed
*/
export const getAllReservationsSchema = querySchema.extend({
	status: z.enum(
		["pending", "confirmed", "cancelled", "expired", "completed"],
		{
			required_error:
				"Status is required and must be one of the following: active, pending, cancelled or done",
		}
	),
})

export const updateReservationStatusSchema = z.object({
	...getReservationSchema.omit({ query: true }).shape,
	body: z.object({
		status: z.enum(["confirmed", "completed"], {
			required_error:
				"Status is required and must be one of the following: confirmed or completed",
		}),
	}),
})

export type CreateReservationInput = z.infer<
	typeof createReservationSchema
>["body"]
export type GetReservationInput = z.infer<typeof getReservationSchema>
export type GetAllReservationsInput = z.infer<typeof getAllReservationsSchema>
export type UpdateReservationStatusInput = z.infer<
	typeof updateReservationStatusSchema
>
export type GetUserReservationsInput = z.infer<typeof getUserReservationsSchema>