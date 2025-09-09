const { getDB } = require("../../db/connectDB");

const getTripsBySelectedTravelStyle = async (req, res) => {
    const { travel_styles } = req.query;


    try {
        const db = getDB();


        const [rows] = await db.query(
            `SELECT * FROM trips WHERE is_published = ?`,
            [1]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Trip not found",
            });
        }

        const user_travel_styles_trips = rows.filter((item) => 
            travel_styles.split(",").some(
                (travel_style) => travel_style.toLowerCase() === item.travel_style.toLowerCase()
            )
        );

        if (user_travel_styles_trips.length === 0) {
            return res.status(404).json({
                code: 404,
                success: false,
                message: "No trips found matching the selected travel styles",
            });
        }

        return res.status(200).json({
            code: 200,
            success: true,
            trips: user_travel_styles_trips,
        })

    } catch (error) {
        console.log("e");
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching the trip.",
            error: error.message,
        });
    }
};

const getTripsByIdForUser = async (req, res) => {
    const { tripId } = req.params;

    try {
        const db = getDB();

        if (!tripId) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "Trip id is required" 
            })
        }

        const [rows] = await db.query(
            "SELECT * FROM trips WHERE id = ? AND is_published = 1",
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
            result : JSON.parse(rows[0].result)
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: "Something went wrong while fetching the trip.",
            error: error.message,
        });
    }
}

module.exports = {
    getTripsBySelectedTravelStyle,
    getTripsByIdForUser
}