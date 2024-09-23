export type Showtime = {
		id: number
		movie_id: number
		theatre_id: number
		start_time: string
		end_time: string
		price: number
		status: "pending" | "active" | "done" | "cancelled"
		created_at: Date
		updated_at: Date
	}