const { getDB } = require("../../db/connectDB");

/**
 * Creates a new trip for the specified user.
 *
 * @param {import("express").Request} req - Express request object containing trip details in the body.
 * @param {string} req.body.country - Country of the trip.
 * @param {string} req.body.group_type - Group type (e.g., solo, family, friends).
 * @param {string} req.body.travel_style - Travel style (e.g., luxury, budget, adventure).
 * @param {string} req.body.interest - Main interest of the trip (e.g., sightseeing, hiking).
 * @param {string|number} req.body.budget_estimate - Estimated budget for the trip.
 * @param {string} req.body.image - Image URL for the trip.
 * @param {string} req.body.result - AI-generated trip description or summary.
 * @param {string|number} req.body.userId - ID of the user creating the trip.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response indicating success or failure.
 */

const createTrip = async (req, res) => {
    const {
        country,
        group_type,
        travel_style,
        interest,
        budget_estimate,
        images,
        result,
        userId,
    } = req.body;

    try {
        const db = getDB();

        const [rows] = await db.query(
            `INSERT INTO trips 
            (country, group_type, travel_style, interest, budget_estimate, images, result, user_id, is_published) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                country,
                group_type,
                travel_style,
                interest,
                budget_estimate,
                images,
                result,
                userId,
                1 // is_published default true
            ]
        );

        if (rows.affectedRows === 0) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Failed to create trip",
            });
        }

        return res.status(201).json({
            code: 201,
            success: true,
            message: "Trip created successfully",
            data : { id: rows.insertId }, // Return the ID of the newly created trip,
            trip : rows
        });
    } catch (error) { 
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while creating the trip.",
            error: error.message,
        });
    }
};

/**
 * Retrieves all trips for a specific user.
 *
 * @param {import("express").Request} req - Express request object containing userId in the params.
 * @param {string|number} req.params.userId - ID of the user whose trips are to be fetched.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with the trips or an error message.
 */

const getTrips = async (req , res) => {
    const {userId} = req.params;
    try {
        const db = getDB();

        if (!userId) {
            return res.status(409).json({
                code: 409,
                success: false,
                message: "User ID is required",
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM trips WHERE userId = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found for this user",
            });
        }

        return res.status(200).json({
            code: 200,
            success: true,
            data: rows,
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching trips.",
            error: error.message,
        });
    }
}

const getTripByID = async (req, res) => {
    const { tripId } = req.params;

    try {
        const db = getDB();

        if (!tripId) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Trip ID is required",
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM trips WHERE id = ?",
            [tripId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Trip not found",
            });
        }

        return res.status(200).json({
            code: 200,
            success: true,
            trip: rows[0],
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching the trip.",
            error: error.message,
        });
    }
};

module.exports = {
    createTrip,
    getTrips,
    getTripByID
};
