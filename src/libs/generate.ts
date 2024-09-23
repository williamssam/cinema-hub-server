import { customAlphabet } from "nanoid"
import { ALPHABETS } from "../constants/api"

export const generateCustomId = customAlphabet(ALPHABETS, 12)

type SeatNumbering = {
	totalSeats: number
	seatsPerRow: number
}

/**
 * Generates an array of seat numbers with the given total seats and seats per row
 *
 * @param {SeatNumbering} params
 * @param {number} params.totalSeats - The total number of seats in the theatre
 * @param {number} params.seatsPerRow - The number of seats per row in the theatre
 * @returns {SeatNumbers[]} - An array of seat numbers with the given total seats and seats per row
 */
export const generateSeatNumbers = ({
	totalSeats,
	seatsPerRow,
}: SeatNumbering) => {
	/**
	 * Create an array with the given total seats length
	 */
	const seats: string[] = Array.from({ length: totalSeats }, (_, i) => {
		/**
		 * Calculate the row letter (e.g. A, B, C, etc.) by using the ASCII value of A (65)
		 * and adding the floor of the index divided by the seats per row
		 */
		const row = String.fromCharCode(65 + Math.floor(i / seatsPerRow))

		/**
		 * Calculate the padded seat number (e.g. 001, 002, etc.) by using the remainder of
		 * the index divided by the seats per row and adding 1, then padding it with zeros
		 * to a length of 3
		 */
		const paddedSeatNumber = ((i % seatsPerRow) + 1).toString().padStart(3, "0")

		/**
		 * Return an object with the seat number, theatre ID, and reserved status
		 */
		return `${row}${paddedSeatNumber}`
	})

	/**
	 * Return the array of seat numbers
	 */
	return seats
}
