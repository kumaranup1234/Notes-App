const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
const { connectToMongoDB } = require("./database");
const { createProxyMiddleware } = require('http-proxy-middleware');



app.use(cors({
    origin: ["https://notes-app-frontend-navy.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))


app.set("jwtSecret", process.env.ACCESS_TOKEN_SECRET);

const router = require("./routes");
app.use("/", router);


app.use(
    '/',
    createProxyMiddleware({
        target: 'http://localhost:5173',
        changeOrigin: true,
    })
);


const port = process.env.PORT || 8000;

async function startServer() {
    await connectToMongoDB();
    app.listen(port, () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
}
startServer();