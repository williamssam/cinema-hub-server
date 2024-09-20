import type { CreateUserInput } from "../users/users.schema"

interface Movies extends CreateUserInput {
	id: number
	created_at: Date
	updated_at: Date
}

type Genres = {
	id: number
	name: string
	created_at: Date
}

export type { Genres, Movies }

