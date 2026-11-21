const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Dossier backend running on port ${PORT}`);
    });
};

startServer();
