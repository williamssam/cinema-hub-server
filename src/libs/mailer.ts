import nodemailer, { type SendMailOptions } from "nodemailer"
import { config } from "../config/configuration"

// test details
const smtp = {
	host: config.SMTP_HOST,
	port: 2525,
	secure: false,
	auth: {
		user: config.SMTP_USERNAME,
		pass: config.SMTP_PASSWORD,
	},
}

const transporter = nodemailer.createTransport({
	...smtp,
	connectionTimeout: 5 * 60 * 1000,
})

export const sendMail = async (payload: Omit<SendMailOptions, "from">) => {
	transporter.sendMail(
		{
			from: "Cinema Hub <admin@cinemahub.com>",
			...payload,
		},
		(err, info) => {
			if (err) {
				console.error(err, "Error sending email")
				return
			}

			console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
		}
	)
}
