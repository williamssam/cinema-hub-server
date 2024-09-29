import { sql } from "../db"

/**
 * This job will run every minute to update showtime status to 'active' if the start_time is greater than or equal to the current time.
 * This job will fetch all showtime with status 'pending' and start_time greater than or equal to NOW()
 * and update the status to 'active' for those showtime.
 */
export const updateShowtimeAsActive = async () => {
	try {
		const showtime = await sql`
			SELECT
				status
			FROM
				showtime
			WHERE
				status = 'pending' AND start_time >= NOW()
			`

		if (!showtime.length) return

		await sql`UPDATE showtime SET status = 'active' WHERE status = 'pending' AND start_time >= NOW()`
	} catch (error) {
		console.error("Error running update showtime as active jobs", error)
	}
}

/**
 * Update showtime status to 'done' when the showtime is over.
 * This job should be run every minute to update the showtime status.
 * The job will fetch all showtime with status 'active' and end_time <= NOW()
 * and update the status to 'done' for those showtime.
 */
export const updateShowtimeAsDone = async () => {
	try {
		const showtime = await sql`
			SELECT
				status
			FROM
				showtime
			WHERE
				status = 'active' AND end_time <= NOW()
			`

		if (!showtime.length) return

		await sql`UPDATE showtime SET status = 'done' WHERE status = 'active' AND end_time <= NOW()`
	} catch (error) {
		console.error("Error running update showtime as done jobs", error)
	}
}