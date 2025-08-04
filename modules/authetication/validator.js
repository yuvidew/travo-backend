const {
    body,
    validationResult,
    param,
    query
} = require("express-validator");

module.exports = {
    validatorSignUp: [
        body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({
            min: 3,
        })
        .withMessage("Name must be at least 3 characters long."),

        body("email").trim().isEmail().withMessage("Invalid email format."),

        body("password")
        .trim()
        .isLength({
            min: 8,
        })
        .withMessage("Password must be at least 8 characters long."),
        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ],

    validatorSignIn: [
        body("email").trim().isEmail().withMessage("Invalid email format."),

        body("password")
        .trim()
        .isLength({
            min: 8,
        })
        .withMessage("Password is required."),

        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ],

    validatorOTP: [
        body("email").trim().isEmail().withMessage("Invalid email format."),

        body("pin")
        .trim()
        .isLength({
            min: 6,
            max: 6
        })
        .withMessage("PIN must be 6 digits long.")
        .isNumeric()
        .withMessage("PIN must contain only numbers"),

        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ],

    validateForgerPasswordEmail: [
        body("email").trim().isEmail().withMessage("Invalid email format."),
        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ],

    validateResetPassword: [
        body("newPassword")
        .trim()
        .isLength({
            min: 8,
        })
        .withMessage("New password is required."),

        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ],
    validateGoogleAuth: [
        body("id")
        .trim()
        .notEmpty().withMessage("Google id is required")
        .isLength({
            min: 3
        }).withMessage("Google id must be at least 3 characters long."),

        body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({
            min: 3
        }).withMessage("Name must be at least 3 characters long."),

        body("email")
        .trim()
        .isEmail().withMessage("Invalid email format."),

        body("picture")
        .trim()
        .notEmpty().withMessage("User picture is required")
        .isURL().withMessage("User picture must be a valid URL."),

        (req, res, next) => {
            const error = validationResult(req);

            if (!error.isEmpty())
                return res.status(400).send({
                    code: 400,
                    message: error.array()[0].msg,
                });

            next();
        },
    ]
};