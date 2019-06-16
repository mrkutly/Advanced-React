const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

// Use express middleware to populate current User
// decode the JWT so we can get the UserID on each request
server.express.use((req, res, next) => {
	// grab token from request
	const { token } = req.cookies;
	// decode token
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		// put the user id onto the req for the next request to access it
		req.userId = userId;
	}
	next();
});

// another piece of middleware that populates the user of each request
server.express.use(async (req, res, next) => {
	if (!req.userId) return next();

	const user = await db.query.user(
		{ where: { id: req.userId } },
		"{id, email, name, permissions} "
	);
	req.user = user;
	next();
});

server.start(
	{
		cors: {
			credentials: true,
			origin: process.env.FRONTEND_URL,
		},
	},
	({ port }) => {
		console.log(`The server is now running on port http://localhost:${port}`);
	}
);
