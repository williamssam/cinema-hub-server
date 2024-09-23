import { sql } from "../db"
import type { Showtime } from "../modules/showtime/showtime.type"

type ShowtimeType = Pick<Showtime, "status" | "start_time" | "end_time">

// update showtime status: "active" when showtime starts and "done" when showtime ends, "cancelled" when showtime is cancelled
export const updateShowtimeStatus = async () => {
	const data = await sql<
		ShowtimeType[]
	>`SELECT status, start_time, end_time FROM showtime`

	const showtime = data.at(0)
	const now = new Date().toISOString()

	if (!showtime) return

	if (showtime.start_time >= now) {
		await sql`UPDATE showtime SET status = 'active'`
		return
	}

	if (showtime.status === "active" && showtime.end_time >= now) {
		await sql`UPDATE showtime SET status = 'done'`
		return
	}
}