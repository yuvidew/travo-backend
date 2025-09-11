const { getDB } = require("../../db/connectDB");
const { sanitizeAndFixSql, shortMessage } = require("../../utils");
const { getGeminiResult } = require("../../utils/gemini-ai");

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
                0 // is_published default true
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
            data: { id: rows.insertId }, // Return the ID of the newly created trip,
            trip: rows
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while creating the trip.",
            error: error.message,
        });
    }
};

const onTogglePublishTrip = async (req, res) => {
    const { tripId } = req.params

    try {
        const db = getDB();

        if (!tripId) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Trip ID is required",
            });
        }

        const [findTrip] = await db.query(
            "SELECT * FROM trips WHERE id = ?",
            [tripId]
        );

        if (findTrip.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found for this trip id",
            });
        }

        const isToggle = findTrip[0].is_published === 1 ? 0 : 1

        const [updateResult] = await db.query(
            "UPDATE trips SET is_published = ? WHERE id = ?",
            [isToggle, tripId]
        );

        if (!updateResult || updateResult.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found for this trip id",
            });
        }

        return res.status(200).json({
            code: 200,
            message: "Trip publish status updated",
            success: true,
            trip: { id: tripId, is_published: isToggle }
        })
    } catch (error) {
        console.log("Error to update trips publish ", error);
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching trips.",
            error: error.message,
        });
    }
}

/**
 * Retrieves all trips for a specific user.
 *
 * @param {import("express").Request} req - Express request object containing userId in the params.
 * @param {string|number} req.params.userId - ID of the user whose trips are to be fetched.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with the trips or an error message.
 */

const getTrips = async (req, res) => {
    const { user_id } = req.params;
    // console.log("🔍 Fetching trips for userId:", user_id);
    try {
        const db = getDB();

        if (!user_id) {
            return res.status(409).json({
                code: 409,
                success: false,
                message: "User ID is required",
            });
        }



        const [rows] = await db.query(
            "SELECT * FROM trips WHERE user_id = ?",
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found for this user",
            });
        }

        // console.log("the row " , rows);

        return res.status(200).json({
            code: 200,
            success: true,
            trips: rows,
        });
    } catch (error) {
        console.log("Error to get the data by use user is ", error);
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

const onBookingTrip = async (req, res) => {
    const { trip_id, user_id, start_date, end_date, price, booking_date, destination } = req.body;

    try {
        const db = getDB();

        if (!user_id || !trip_id || !price || !start_date || !end_date) {
            return res.status(400).json({
                code: 400,
                message: "All fields are required",
                success: false
            });
        }

        const [findTrip] = await db.query(
            "SELECT * FROM bookings WHERE trip_id = ?",
            [trip_id]
        );

        if (findTrip.length > 0) {
            return res.status(404).json({
                code: 404,  
                success: false,
                message: "Trip already booked with this trip id",
            });
        }

        const sql = `
            INSERT INTO bookings (user_id, trip_id, price, start_date, end_date, booking_date , destination)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [rows] = await db.query(sql, [user_id, trip_id, price, start_date, end_date, booking_date, destination]);

        if (rows.affectedRows === 0) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Failed to book the trip",
            });
        }

        return res.status(201).json({
            code: 201,
            success: true,
            message: "Booking created successfully",
            bookingId: rows.insertId
        })

    } catch (error) {
        console.log("Error to book the trip", error);
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching the trip.",
            error: error.message,
        });
    }
}

const getAllBooking = async (req, res) => {
    try {
        const db = getDB();

        const [bookings] = await db.query(`
            SELECT b.id AS booking_id, b.user_id, b.trip_id, b.price, b.start_date, b.end_date, 
                b.status, b.booking_date, b.destination,
                u.name AS user_name, u.email AS user_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
        `);
        if (bookings.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No bookings found",
            });
        }

        const [trips] = await db.query(`
        SELECT * FROM trips
        `);

        if (trips.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found",
            });
        }

        const userBookingsMap = {};

        bookings.forEach(booking => {
            const trip = trips.find(t => t.id === booking.trip_id);

            const tripData = trip ? {
                ...trip,
                images: trip.images ? trip.images.split(",") : [],
                result: trip.result ? JSON.parse(trip.result) : null,
                booking: {
                    id: booking.id,
                    user_name: booking.user_name,
                    email: booking.user_email,
                    price: booking.price,
                    start_date: booking.start_date,
                    end_date: booking.end_date,
                    status: booking.status,
                    booking_date: booking.booking_date,
                    destination: booking.destination
                }
            } : null;

            if (!userBookingsMap[booking.user_id]) {
                userBookingsMap[booking.user_id] = {
                    user_id: booking.user_id,
                    trips: []
                };
            }

            if (tripData) {
                userBookingsMap[booking.user_id].trips.push(tripData);
            }
        })

        const result = Object.values(userBookingsMap);

        return res.status(200).json({
            code: 200,
            success: true,
            trips: result
        })


    } catch (error) {
        console.log("Error to book the trip", error);
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching the trip.",
            error: error.message,
        });
    }
}


// const getChartBoatData = async(req , res) => {
//     const {message} = req.body;
//     console.log("the message" , message);

//     try {
//         const db = getDB();
//         if (!message) {
//             return res.status(400).json({
//                 code: 400,
//                 success: false,
//                 message: "Message is required is required",
//             });
//         }

//         const [rows] = await db.query("SELECT * FROM trips");

//         if (rows.length === 0) { 
//             return res.status(404).json({
//                 code: 404,
//                 success: false,
//                 message: "Trip not found",
//             });
//         }

//         const result = await getGeminiResult(message , rows);

//         return res.status(200).json({
//             code: 200,
//             success: true,
//             result,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             code: 500,
//             message: "Something went wrong while fetching the trip.",
//             error: error.message,
//         });
//     }
// }

const getChartBoatData = async (req, res) => {
    const { message } = req.body;
    try {
        const db = getDB();

        if (!message) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Message is required.",
            });
        }

        const [allRows] = await db.query("SELECT * FROM trips LIMIT 200");

        if (allRows.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Trip not found",
            });
        }

        const generated = await getGeminiResult(message, allRows);

        const { sql, warnings } = sanitizeAndFixSql(generated);

        const [filtered] = await db.query(sql);

        const data = filtered.map(r => {
            if (r?.result && typeof r.result === "string") {
                try {
                    return { ...r, result: JSON.parse(r.result) };
                } catch {
                    return r;
                }
            }
            return r;
        });

        return res.status(200).json({
            code: 200,
            success: true,
            message: `Here are the results for your request: "${shortMessage(message)}". We searched trips that match your filters.`,
            sql,
            warnings,
            count: data.length,
            data
        });
    } catch (error) {
        console.error("getChartBoatData error:", error);
        return res.status(500).json({
            code: 500,
            success: false,
            message: "Something went wrong while fetching trips.",
            error: error.message,
        });
    }
};

module.exports = {
    createTrip,
    getTrips,
    getTripByID,
    getChartBoatData,
    onTogglePublishTrip,
    onBookingTrip,
    getAllBooking
};

