//File responsible for initializing and starting Node.js, as well as handling incoming HTTP requests and actively connects BE to PostgreSQL
require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");



const app = express(); //creates express app, handles important tasks such as HTTP requests

app.use(express.json()); //allows JSON data to be read

app.use("/api/auth", authRoutes); //Use routes defined in routes/auth.js

const PORT = process.env.PORT || 3000; //Port number for Node.js

const startServer = async () => {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Dossier backend running on port ${PORT}`);
    });
};

startServer();
