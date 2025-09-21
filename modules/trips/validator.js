const {
    body,
    validationResult,
    param,
    query
} = require("express-validator");

module.exports = {
    validatorCreateTrip: [
        body("country").notEmpty().withMessage("Country is required"),
        body("group_type").notEmpty().withMessage("Group type is required"),
        body("travel_style").notEmpty().withMessage("Travel style is required"),
        body("interest").notEmpty().withMessage("Interest is required"),
        body("budget_estimate").notEmpty().withMessage("Budget estimate must be a number"),
        body("images").notEmpty().withMessage("Images must be valid URLs"),
        body("result").notEmpty().withMessage("Result is required"),
        body("userId").notEmpty().withMessage("User ID is required"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorGetTrips: [
        param("user_id").notEmpty().withMessage("User ID is required"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorGetTripById: [
        param("tripId").notEmpty().withMessage("Trip Id is required"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorGetChartBoatData: [
        body("message").notEmpty().withMessage("Message is required"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorTravelStyle: [
        query("travel_styles")
            .notEmpty()
            .withMessage("travel styles query is required")
            .customSanitizer((value) => {
                // convert "adventure,relaxation" → ["adventure","relaxation"]
                return value.split(",").map((s) => s.trim());
            })
            .isArray({ min: 1 })
            .withMessage("travel styles must be a non-empty array"),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorToBookTrip: [
        body("trip_id")
            .notEmpty().withMessage("Trip ID is required")
            .bail()
            .isInt().withMessage("Trip ID must be an integer"),
        body("user_id")
            .notEmpty().withMessage("User ID is required")
            .bail()
            .isInt().withMessage("User ID must be an integer"),
        body("price")
            .notEmpty().withMessage("Price is required")
            .bail()
            .isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
        body("start_date")
            .notEmpty().withMessage("Start date is required")
            .bail()
            .isISO8601().withMessage("Start date must be a valid date (YYYY-MM-DD)"),
        body("end_date")
            .notEmpty().withMessage("End date is required")
            .bail()
            .isISO8601().withMessage("End date must be a valid date (YYYY-MM-DD)"),
        body("booking_date")
            .notEmpty().withMessage("booking_date is required")
            .bail()
            .isISO8601().withMessage("booking_date must be a valid date (YYYY-MM-DD)"),
        body("destination").notEmpty().withMessage("Destination is required"),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ],
    validatorToGetTripByTripsIdList: [
        body("ids")
            .isArray({ min: 1 })
            .withMessage("ids must be a non-empty array"),

        body("ids.*.trip_id")
            .isInt({ gt: 0 })
            .withMessage("trip_id must be a positive integer"),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: errors.array()[0].msg,
                });
            }
            next();
        },
    ]
};
