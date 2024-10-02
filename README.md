# Cinema Hub (A Movie Reservation System)

The Movie Reservation System is a web application that allows users to manage movie reservations, including signing up, logging in, and making reservations for showtime. Admins have additional functionalities for managing movies, showtime, and user roles.

## Tech Stack
- Node js
- Express js
- Postgres.js
- PostgreSQL (Database)
- Node cron
- Paystack (Payment processing)
- Zod (for validation)
- Biome (for formatting and linting)

## Key Functionalities
- User authentication and authorization
	1. Singup and Signin
	2. Regenerate access token after expiration
	3. Secure access to the API using JSON Web Tokens.
- Movie management
	1. Admins can create, read, update and delete movies
	2. Users can view movie information
- Theatre Management:
	1. Admins can manage (create, read, update and delete) showtime for movies.
	2. Admins can choose theatre for each shwotime
- Showtime Management
	1. Admins can manage (create, read, update and delete) showtime for movies.
	2. Admins can view showtime reservations
	3. Users can view upcoming showtime for specific movies
- Reservation Management
	1. Users can check available seats for a specific showtime.
	2. Users can reserve seats and pay for a showtime. If payment is not received within 20minutes, reserved seats are discarded and made available for others
	3. Users can view their upcoming reservations and cancel them if needed.
	4. Admins can view all reservations, including capacity and revenue statistics.
	5. Users receives reservation confirmation mail and pay for their reservations.
- Reporting: Admin can generate report for showtime reservations

## Getting Started
- Clone repository
	```bash
		git clone https://github.com/williamssam/cinema-hub-server
	```
- Install the dependencies
	```bash
		pnpm i
	```
- Run migration to DB
	```bash
		pnpm migrate
	```

- Run the application
	```bash
		pnpm dev
	```

- Access the Api: Use tools like Postman or Thunder Client to interact with the endpoints


## API Endpoints
The application provides several API endpoints for the functionalities mentioned above. Below are some key endpoints:

|  Name 	|  Path 	|  Method 	|  Query 	|  Allows 	|
|---	|---	|---	|---	|---	|
| Register  	|  **/auth/register** 	|  POST 	|  - 	|   	|
| Login 	|  **/auth/login** 	|  POST 	|  - 	|   	|
| Create movie 	|  **/movies** 	|  POST 	|  - 	|  only admin 	|
| Add Theatres 	|  **/theatres** 	|  POST 	|  - 	|  only admin 	|
| Add Showtime 	|  **/showtime** 	|  POST 	|  - 	|  only admin 	|
| Add Reservation 	|  **/reservations** 	|  POST 	|  - 	|   	|
| Cancel Reservation 	|  **/reservations/:id/cancel** 	|  POST 	|  - 	|   	|
| Get available seats for a showtime 	|  **/showtime/:id/seats** 	|  GET 	|  - 	|   	|
| Get reservations 	|  **/reservations** 	|  GET 	|  append_to_response=movies,theatres,showtime 	|  only admins 	|
| Get user reservations 	|  **/reservations/:id/user** 	|  GET 	|  - 	|   	|

**NOTES:**
- There's a doc folder that contains all endpoints in a thunder client collection. You can import it to test.
- The seat numbers for each theatres are generated on the fly, the best decision should have been to store them in the DB.
- Made some decisions: Theatre cannot have more than 200 seats and each row cannot contain more than 15 seats
- For some endpoints, you can add "append_to_response" to get more info from the query

## Conclusion
This Movie Reservation System provides a comprehensive solution for managing movie reservations, catering to both users and admins. With its robust authentication and management features, it aims to enhance the movie-going experience.

## Reference
Project URL: [https://roadmap.sh/projects/movie-reservation-system](https://roadmap.sh/projects/movie-reservation-system)