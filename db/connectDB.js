const mysql = require("mysql2/promise");
require("dotenv").config();

let connection;

const connectDB = async () => {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("✅ MySQL database is connected.");
    } catch (error) {
        console.error("❌ MySQL connection failed:", error.message);
        throw error;
    }
}

const getDB = () => {
    if (!connection) throw new Error("DB not connected yet!");
    return connection;
};

module.exports = {
    connectDB,
    getDB
};