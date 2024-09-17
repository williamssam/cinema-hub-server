import { z } from "zod"

export const createMovieSchema = z.object({
	body: z.object({
		title: z.string({ required_error: "Title is required" }).trim(),
		tagline: z.string({ required_error: "Tagline is required" }).trim(),
		overview: z.string({ required_error: "Overview is required" }).trim(),
		original_language: z
			.string({ required_error: "Language is required" })
			.trim(),
		poster_image_url: z
			.string({ required_error: "Poster image is required" })
			.url("Invalid URL")
			.trim(),
		homepage: z
			.string({ required_error: "Homepage is required" })
			.trim()
			.or(z.literal("")),
		genre_id: z
			.number({ required_error: "Genre is required" })
			.positive("Genre must be a positive number"),
		runtime: z.string({ required_error: "Runtime is required" }).trim(),
		director: z.string({ required_error: "Director is required" }).trim(),
		release_date: z.date({ required_error: "Release date is required" }),
	}),
})

export const getMovieSchema = z.object({
	params: z.object({
		id: z
			.string({ required_error: "Movie ID is required" })
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Movie ID can only be a number",
			}),
	}),
})

export const updateMovieSchema = z.object({
	...createMovieSchema.shape,
	...getMovieSchema.shape,
})

export type CreateMovieInput = z.infer<typeof createMovieSchema>["body"]
export type GetMovieInput = z.infer<typeof getMovieSchema>["params"]
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>