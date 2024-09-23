import { z } from "zod"

export const querySchema = z.object({
	query: z.object({
		page: z.coerce
			.number({ required_error: "Page is required" })
			.positive("Page can only be a positive number")
			.gte(1, "Page cannot be less than one")
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Page can only be a number",
			})
			.catch(1),
		append_to_response: z.string().optional(),
	}),
})

export type QueryInput = z.infer<typeof querySchema>["query"]