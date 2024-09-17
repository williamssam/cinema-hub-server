import { hash, verify } from "@node-rs/argon2"
import jwt from "jsonwebtoken"
import { config } from "../../config/configuration"
import { log } from "../../utils/logger"

type HashedPassword = {
	user_password: string
	password_hash: string
}

export const hashPassword = async ({
	user_password,
}: Pick<HashedPassword, "user_password">) => {
	return await hash(user_password, {
		// recommended minimum parameters: https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/signup.ts
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	})
}

export const verifyHashedPassword = async ({
	user_password,
	password_hash,
}: HashedPassword) => {
	try {
		return await verify(password_hash, user_password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})
	} catch (error) {
		log.error("Error verifying password", error)
	}
}

export const signAccessJWT = (payload: Object) => {
	try {
		return jwt.sign(payload, config.access_token.key, {
			expiresIn: config.access_token.expires_in,
		})
	} catch (error) {
		console.log("JWT sign error", error)
	}
}

export const verifyAccessJWT = async (
	token: string,
	options?: jwt.VerifyOptions
) => {
	try {
		const decoded = jwt.verify(token, config.access_token.key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
	}
}

export const signRefreshJWT = (payload: Object) => {
	try {
		return jwt.sign(payload, config.access_token.key, {
			expiresIn: config.access_token.expires_in,
		})
	} catch (error) {
		console.log("JWT sign error", error)
	}
}

export const verifyRefreshJWT = async (
	token: string,
	options?: jwt.VerifyOptions
) => {
	try {
		const decoded = jwt.verify(token, config.access_token.key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
	}
}


