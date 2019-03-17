require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO: Use express middleware to handle cookies (JWT)
// TODO: Use express middleware to populate current User 

server.start({ 
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    }
}, ({ port }) => {
    console.log(`The server is now running on port http://localhost:${port}`);
})