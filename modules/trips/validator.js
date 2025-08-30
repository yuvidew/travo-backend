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
    validatorGetTripById : [
        param("tripId").notEmpty().withMessage("Trip is is required"),
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
    validatorGetChartBoatData : [
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
    validatorInterest : [
        body("travel_styles")
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
    ]
};