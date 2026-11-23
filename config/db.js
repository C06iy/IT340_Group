//File responsible for establishing connection with database (PostgreSQL or pg)

const { Pool } = require("pg");

//Pool object, which is responsible for maintaining minimum connections and handling connection lifecycles
const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
});

//Uses an async function in order to connect to database without disrupting other Node.js processes
const connectDB = async () => {
    try {
        const result = await pool.query("SELECT NOW()"); //sends SQL query to database for date and time

        console.log("PostgreSQL connected successfully!"); //confirms connection
        console.log("Database time:", result.rows[0].now);

    } catch (error) {
        console.error("PostgreSQL connection failed:", error.message);
        process.exit(1); //Used to indicate an error and stop code execution
    }
};

module.exports = { pool, connectDB }; //exports pool object and connectDB function for use in other files within back end
