//File responsible for providing functions for requesting database operations related to users 


const { pool } = require("../config/db"); //imports pool project from db.js

// Create a new user through an async function, back end is requesting this from database
const createUser = async (username, email, passwordHash) => {
    const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3) //known as parameterized queries, SQL injection protection. Separates SQL input from input code.
        RETURNING id, username, email, created_at
    `;

    const values = [username, email, passwordHash];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Find a user by username
const findUserByUsername = async (username) => {
    const query = `
        SELECT id, username, email, password_hash
        FROM users
        WHERE username = $1
    `;

    const result = await pool.query(query, [username]);

    return result.rows[0];
};

// Check whether username or email already exists
const findUserByUsernameOrEmail = async (username, email) => {
    const query = `
        SELECT id
        FROM users
        WHERE username = $1 OR email = $2
    `;

    const result = await pool.query(query, [username, email]);

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByUsername,
    findUserByUsernameOrEmail
};
