const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { connectToMongoDB } = require("./database");
// const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(express.json());

// https://notes-app-frontend-navy.vercel.app

// Configure CORS
app.use(cors({
    origin: "https://notes-app-frontend-navy.vercel.app",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

// Set JWT secret
app.set("jwtSecret", process.env.ACCESS_TOKEN_SECRET);

// Import and use routes
const router = require("./routes");
app.use("/", router);

/*

// Proxy middleware
app.use(
    '/',
    createProxyMiddleware({
        target: 'https://notes-app-frontend-navy.vercel.app',
        changeOrigin: true,
    })
);

 */

// Define port
const port = process.env.PORT || 8000;

// Start the server
async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

startServer();
