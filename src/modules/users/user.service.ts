import { sql } from "../../db"

export const getUserById = async ({ userId }: { userId: string }) => {
	const data = await sql`SELECT id FROM users WHERE id = ${userId}`
	return data
}

export const getUserByEmail = async ({ email }: { email: string }) => {
	const data = await sql`SELECT email FROM users WHERE email = ${email}`
	return data
}

export const joinUserObject = () => {
	return sql`
		JSONB_BUILD_OBJECT(
			'id', user.id,
			'email', users.email,
			'name', users.name,
			'role', users.role
		) AS customer
	`
}