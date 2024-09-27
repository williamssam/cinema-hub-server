import type { Showtime } from "../showtime/showtime.type"

type Reservation = {
	id: number
	seat_number: string
	status: string
	showtime: Showtime
	created_at: Date
	updated_at: Date
}

export type { Reservation }
