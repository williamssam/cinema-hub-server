import { z } from "zod"

export const createMovieSchema = z.object({
	body: z.object({
		title: z
			.string({ required_error: "Title is required" })
			.min(1, "Title is required")
			.trim(),
		tagline: z
			.string({ required_error: "Tagline is required" })
			.min(1, "Tagline is required")
			.trim(),
		overview: z
			.string({ required_error: "Overview is required" })
			.min(1, "Overview is required")
			.trim(),
		original_language: z
			.string({ required_error: "Language is required" })
			.min(1, "Language is required")
			.trim(),
		poster_image_url: z
			.string({ required_error: "Poster image is required" })
			.min(1, "Poster image is required")
			.url("Invalid URL")
			.trim(),
		homepage: z
			.string({ required_error: "Homepage is required" })
			.min(1, "Homepage is required")
			.trim()
			.optional(),
		genre_ids: z.array(
			z
				.number({ required_error: "Genre is required" })
				.positive("Genre must be a positive number"),
			{
				errorMap: () => ({ message: "Genre should be an array of genre ids" }),
			}
		),
		runtime: z
			.string({ required_error: "Runtime is required" })
			.min(1, "Runtime is required")
			.trim(),
		director: z
			.string({ required_error: "Director is required" })
			.min(1, "Directors Name is required")
			.trim(),
		release_date: z
			.string({ required_error: "Release date is required" })
			.date("Invalid date format, please use yyyy-mm-dd format")
			.trim(),
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

// http://localhost:3000/movies?page=1&genre=1
export const getAllMoviesSchema = z.object({
	query: z.object({
		page: z.coerce
			.string({ required_error: "Page is required" })
			.min(1, "Page is required")
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Page can only be a number",
			})
			.catch("1"),
		genre: z.coerce
			.string({ required_error: "Genre ID is required" })
			.min(1, "Genre ID is required")
			.refine(value => !Number.isNaN(Number(value)), {
				message: "Genre ID can only be a number",
			})
			.optional(),
	}),
})

export type CreateMovieInput = z.infer<typeof createMovieSchema>["body"]
export type GetMovieInput = z.infer<typeof getMovieSchema>["params"]
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>
export type GetAllMoviesInput = z.infer<typeof getAllMoviesSchema>["query"]