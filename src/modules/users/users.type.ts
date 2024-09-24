
export type Role = {
	id: number
	name: string
}
type User = {
	id: number
	email: string
	name: string
	password: string
	refresh_token: string
	role: Role
}

type JWTPayload = {
	payload: {
		user: User
		iat: number
		exp: number
	}
}

export type { JWTPayload, User }

