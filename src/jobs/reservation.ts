import { sql } from "../db"
import { sendMail } from "../libs/mailer"
import { reservationReminderMail } from "../mails/reservation-reminder"

/**
 * Remove pending reservations that have been pending for more than 20 minutes since they were last updated
 */
export const removePendingReservation = async () => {
	try {
		await sql`DELETE FROM reservations WHERE status = 'pending' AND updated_at < NOW() - INTERVAL '20 minutes'`
		return true
	} catch (error) {
		console.error("Error running remove pending reservation jobs", error)
	}
}

/**
 * Notify users about showtime starting soon...
 * Users will receive an email reminder 1 hour before the showtime starts
 * Only confirmed reservations will be considered
 */
export const notifyUserAboutShowtime = async () => {
	try {
		const showtime = await sql`
			SELECT
				users.email AS email,
				users.name AS name,
				showtime.start_time AS start_time,
				reservations.seat_number AS seat_number,
				movies.title AS movie_title
			FROM
				reservations
			JOIN
				showtime
			ON
				reservations.showtime_id = showtime.id
			JOIN
				users
			ON
				reservations.user_id = users.id
			JOIN
				movies
			ON
				showtime.movie_id = movies.id
			WHERE
				showtime.status = 'pending'
			AND
				showtime.start_time >= NOW() - INTERVAL '1 hour'
			AND
				reservations.status = 'confirmed'
		`

		if (!showtime.length) return

		for (const data of showtime) {
			await sendMail({
				to: data.email,
				subject: "Reminder - Showtime starting soon....",
				html: reservationReminderMail({
					customer_name: data.name,
					start_time: data.start_time,
					seat: data.seat_number,
					movie_title: data.movie_title,
				}),
			})
		}
	} catch (error) {
		console.error(
			"Error running notify user job about upcoming showtime jobs",
			error
		)
	}
}
