import { sql } from "../../db"
import type { CreateMovieInput } from "./movies.schema"
import type { Genres, Movies } from "./movies.types"

export const getMovieGenres = async () => {
	const data = await sql<Genres[]>`SELECT id, name FROM genres`
	return data
}

export const getMovieWithId = async (id: string) => {
	const data = await sql`SELECT id FROM movies WHERE id = ${id}`
	return data
}

export const addMovieTransaction = async (payload: CreateMovieInput) => {
	const { genre_ids, ...rest } = payload

	const [movie] = await sql.begin(async sql => {
		const [movies] = await sql<Movies[]>`
			INSERT INTO movies ${sql(rest)} RETURNING *
		`

		// Map the genre ids and insert into link table
		for (let index = 0; index < genre_ids.length; index++) {
			const element = genre_ids[index]

			await sql`
				INSERT INTO movie_genres
					(movie_id, genre_id)
				VALUES
					(${movies.id}, ${element})
			`
		}

		return [movies]
	})

	return movie
}

export const updateMovieTransaction = async (
	payload: CreateMovieInput,
	id: string
) => {
	const { genre_ids, ...rest } = payload

	const [movie] = await sql.begin(async sql => {
		const [movie] = await sql<Movies[]>`
			UPDATE movies SET ${sql(rest)} WHERE id = ${id} RETURNING *
		`

		// Map the genre ids and insert into link table
		for (let index = 0; index < genre_ids.length; index++) {
			const element = genre_ids[index]

			await sql`
				UPDATE movie_genres SET genre_id = ${element} WHERE movie_id = ${id}
			`
		}

		return [movie]
	})

	return movie
}

/**
 * This function will return a list of movies, or a single movie if an ID is provided
 */
export const getMovie = async (id: string) => {
	const movie = sql`
			SELECT
					movies.id, movies.title, movies.tagline, movies.slug, movies.overview,
					movies.release_date, movies.poster_image_url, movies.homepage,
					movies.runtime, movies.director, movies.origin_country, movies.trailer_link,
					JSON_AGG(JSONB_BUILD_OBJECT('id', genres.id, 'name', genres.name)) AS genres,
					movies.created_at, movies.updated_at
			FROM
					movies
			JOIN
					movie_genres ON movies.id = movie_genres.movie_id
			JOIN
					genres ON movie_genres.genre_id = genres.id
			WHERE
					movies.id = ${id}
			GROUP BY
					movies.id
			ORDER BY
					movies.id DESC
		`
	return movie
}

export const totalMovies = async (id?: string) => {
	const count = await sql`
			SELECT COUNT(*) FROM
				movies
			${
				id
					? sql`
				JOIN
				movie_genres ON movies.id = movie_genres.movie_id
			JOIN
				genres ON movie_genres.genre_id = genres.id
			WHERE genres.id = ${id}`
					: sql``
			}
			`
	return count.at(0)?.count
}


export const joinMovieObject = () => {
	return sql`
	JSONB_BUILD_OBJECT(
		'id', movies.id,
		'title', movies.title,
		'tagline', movies.tagline,
		'overview', movies.overview,
		'runtime', movies.runtime,
		'original_language', movies.original_language,
		'poster_image_url', movies.poster_image_url,
		'release_date', movies.release_date,
		'director', movies.director
		)
	AS movie
	`
}



// export const getMovies = async ({ movieId }: { movieId?: string }) => {
// 	const movie = await sql`
// 				SELECT
// 					movies.id, movies.title, movies.tagline, movies.slug, movies.overview,
// 					movies.release_date, movies.poster_image_url, movies.homepage,
// 					movies.runtime, movies.director, JSON_AGG(JSONB_BUILD_OBJECT('id', genres.id, 'name', genres.name)) AS genres, movies.created_at, movies.updated_at
// 				FROM
// 						movies
// 				JOin
// 						movie_genres ON movies.id = movie_genres.movie_id
// 				JOIN
// 						genres ON movie_genres.genre_id = genres.id
// 				${movieId ? sql`WHERE movies.id = ${movieId}` : sql``}
// 				GROUP BY
// 						movies.id;
// 		`

// 	return movie
// }