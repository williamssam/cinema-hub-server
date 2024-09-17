
type User = {
	id: number
	email: string
	name: string
	password: string
	refresh_token: string
	role: "user" | "admin" | "super-admin"
}

export type { User }

