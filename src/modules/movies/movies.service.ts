import { sql } from "../../db";
import type { Genres } from "./movies.types";

const getMovieGenres = async () => {
	const data = await sql<Genres[]>`SELECT id, name FROM genres`;
	return data;
};

export { getMovieGenres };

