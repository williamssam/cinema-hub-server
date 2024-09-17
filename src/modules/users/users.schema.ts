import { z } from "zod"

export const createUserSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Name is required" }).trim(),
		email: z
			.string({ required_error: "Email is required" })
			.email("Invalid email address")
			.toLowerCase()
			.trim(),
		password: z
			.string({ required_error: "Password is required" })
			.min(6, "Password too short - should be 6 characters minimum")
			.max(30, "Password too long - should be 30 characters maximum")
			.trim(),
		role: z
			.enum(["user", "admin", "super-admin"], {
				errorMap: () => ({ message: "Invalid role" }),
			})
			.catch("user"),
	}),
})

export const loginSchema = z.object({
	body: z.object({
		email: z
			.string({
				required_error: "Email is required",
			})
			.email("Invalid email address")
			.toLowerCase()
			.trim(),
		password: z
			.string({
				required_error: "Password is required",
			})
			.min(6, "Password must be at least 6 characters long")
			.trim(),
	}),
})

export const refreshTokenSchema = z.object({
	body: z.object({
		refresh_token: z.string({
			required_error: "Refresh token is required",
		}),
	}),
})

export type CreateUserInput = z.TypeOf<typeof createUserSchema>["body"]
// export type VerifyUserInput = z.TypeOf<typeof verifyUserSchema>["body"];
// export type ChangePasswordInput = z.TypeOf<typeof changePasswordSchema>["body"];
// export type ForgotPasswordInput = z.TypeOf<typeof forgotPasswordSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"]
export type UpdateUserInput = Omit<
	z.TypeOf<typeof createUserSchema>["body"],
	"password"
>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"]
