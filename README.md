# Cinema Hub (A Movie Reservation System) __(Work in progress)__

## Overview
The Movie Reservation System is a web application that allows users to manage movie reservations, including signing up, logging in, and making reservations for showtime. Admins have additional functionalities for managing movies, showtime, and user roles.

## Tech Stack
- Node js
- Express js
- Postgres.js
- PostgreSQL (Database)
- Node cron
- Paystack (Payment processing)
- Zod (for validation)

## Key Functionalities
- User authentication and authorization
- Movie management
	1. Admins can create, read, update and delete movies
	2. Users can view movie information
- Theatre Management: For managing cinema with more than one theatre. Admin can create, read, update and delete theatre.
- Showtime Management
	1. Admins can manage (create, read, update and delete) showtime for movies.
	2. Admins can view showtime reservations
	3. Users can view upcoming showtime for specific movies
- Reservation Management
	1. Users can check available seats for a specific showtime.
	2. Users can reserve seats and pay for a showtime. If payment is not received within 20minutes, reserved seats are discarded and made available for others
	3. Users can view their upcoming reservations and cancel them if needed.
	4. Admins can view all reservations, including capacity and revenue statistics.
- Reporting: Admin can generate report for showtime reservations

## Getting Started
- Clone repository
	```bash
		git clone < repository- url >
	```
- Install the dependencies
	```bash
		pnpm i
	```
- Run the application
	```bash
		pnpm dev
	```

- Access the Api: Use tools like Postman or Thunder Client to interact with the endpoints

## Conclusion
This Movie Reservation System provides a comprehensive solution for managing movie reservations, catering to both users and admins. With its robust authentication and management features, it aims to enhance the movie-going experience.

## Reference
Project URL: [https://roadmap.sh/projects/movie-reservation-system](https://roadmap.sh/projects/movie-reservation-system)

(Work in progress)