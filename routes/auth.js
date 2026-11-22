
const express = require("express");
const bcrypt = require("bcrypt");

const {
    createUser,
    findUserByUsername,
    findUserByUsernameOrEmail
} = require("../models/user");

const router = express.Router();

// Registration endpoint
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedUsername = username.toLowerCase().trim();
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await findUserByUsernameOrEmail(
            normalizedUsername,
            normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await createUser(
            normalizedUsername,
            normalizedEmail,
            passwordHash
        );

        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Username or email already exists."
            });
        }

        return res.status(500).json({
            message: "An error occurred during registration."
        });
    }
});


// Login endpoint
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
            });
        }

        const normalizedUsername = username.toLowerCase().trim();

        const user = await findUserByUsername(normalizedUsername);

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        return res.status(200).json({
            message: "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "An error occurred during login."
        });
    }
});

module.exports = router;
