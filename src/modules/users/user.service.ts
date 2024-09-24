import { sql } from "../../db"

export const getUserById = async ({ userId }: { userId: string }) => {
	const data = await sql`SELECT id FROM users WHERE id = ${userId}`
	return data
}

export const getUserByEmail = async ({ email }: { email: string }) => {
	const data = await sql`SELECT email FROM users WHERE email = ${email}`
	return data
}