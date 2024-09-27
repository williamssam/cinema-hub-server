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
		role: z.enum(["user", "admin"], {
			required_error: "Role is required. Must be user or admin",
		}),
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

export const updateUserSchema = z.object({
	body: z.object({
		name: z.string({ required_error: "Name is required" }).trim(),
	}),
})
export const changePasswordSchema = z.object({
	body: z.object({
		old_password: z
			.string({
				required_error: "Old password is required",
			})
			.min(6, "Old password must be at least 6 characters long")
			.trim(),
		new_password: z
			.string({
				required_error: "New password is required",
			})
			.min(6, "New password must be at least 6 characters long")
			.trim(),
	}),
})

export type CreateUserInput = z.TypeOf<typeof createUserSchema>["body"]
export type LoginInput = z.infer<typeof loginSchema>["body"]
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"]
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"]
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"]
