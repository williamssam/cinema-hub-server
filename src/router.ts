import express from "express";
import moviesRoutes from "./modules/movies/movies.routes";
import reservationsRoutes from "./modules/reservations/reservations.routes"
import showtimeRoutes from "./modules/showtime/showtime.routes"
import theatresRoutes from "./modules/theatres/theatres.routes"
import usersRoutes from "./modules/users/users.routes"
import { HttpStatusCode } from "./utils/status-codes";

const router = express.Router();

export default () => {
	// console.log("received request");
	router.get("/health-check", (req, res) => {
		res.sendStatus(HttpStatusCode.OK)
	})

	moviesRoutes(router)
	theatresRoutes(router)
	showtimeRoutes(router)
	usersRoutes(router)
	reservationsRoutes(router)

	return router
};