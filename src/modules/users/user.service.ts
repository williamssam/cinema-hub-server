import { sql } from "../../db";
import { ApiError } from "../../exceptions/api-error";
import { HttpStatusCode } from "../../utils/status-codes";

const getUserById = async ({ userId }: { userId: string }) => {
	const data = await sql`SELECT id FROM users WHERE id = ${userId}`;

	if (!data.length) {
		throw new ApiError("User not found", HttpStatusCode.NOT_FOUND);
	}

	return data;
};

const getUserByEmail = async ({ email }: { email: string }) => {
		const data = await sql`SELECT email FROM users WHERE email = ${email}`;
	}