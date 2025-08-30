const express = require("express");

const {
    signin,
    signup,
    otpCheck,
    verifyEmail,
    verifyPinCode,
    resetPassword,
    googleAuth,
} = require("../controller/admin/auth.controller");
const {
    validatorSignUp,
    validatorSignIn,
    validatorOTP,
    validateForgerPasswordEmail,
    validateResetPassword,
    validateGoogleAuth,
} = require("../modules/authetication/validator");
const {
    validatorCreateTrip,
    validatorGetTrips,
    validatorGetTripById,
    validatorGetChartBoatData,
    validatorInterest,
} = require("../modules/trips/validator");
const {
    createTrip,
    getTrips,
    getTripByID,
    getChartBoatData,
} = require("../controller/trips/trips.controller");
const { authenticate } = require("../modules/authetication/authentication");

const {
    signin: user_sign_in,
    signup: user_sign_up,
    otpCheck: user_otp_check,
    verifyEmail: user_verify_email,
    verifyPinCode: user_verify_pin_code,
    resetPassword : user_reset_password,
    googleAuth : user_google_auth,
} = require("../controller/user/auth.controller");
const { getTripsBySelectedInterest } = require("../controller/trips/user_trips.controller");

const router = express.Router();

// start to admin authentication
router.post("/auth/sign-up", validatorSignUp, signup);
router.post("/auth/sign-in", validatorSignIn, signin);
router.post("/auth/verify-otp", validatorOTP, otpCheck);

router.post("/auth/verify-email", validateForgerPasswordEmail, verifyEmail);
router.post("/auth/verify-forget-password-opt", validatorOTP, verifyPinCode);
router.put("/auth/reset-new-password", validateResetPassword,authenticate, resetPassword);

router.post("/auth/google-login", validateGoogleAuth, googleAuth);
// end to admin authentication

// start to users authentication
router.post("/auth/user/sign-up", validatorSignUp, user_sign_up);
router.post("/auth/user/sign-in", validatorSignIn, user_sign_in);
router.post("/auth/user/verify-otp", validatorOTP, user_otp_check);
router.post("/auth/user/verify-email", validateForgerPasswordEmail, user_verify_email);
router.post("/auth/user/verify-forget-password-opt", validatorOTP, user_verify_pin_code);
router.put("/auth/user/reset-new-password", validateResetPassword, authenticate, user_reset_password);
router.post("/auth/user/google-login", validateGoogleAuth, user_google_auth);

// end to users authentication

// start to trips
router.post("/trip/create-trip", validatorCreateTrip, authenticate, createTrip);
router.get(
    "/trip/get-trips/:user_id",
    validatorGetTrips,
    authenticate,
    getTrips
);
router.get(
    "/trip/get-trip-by-id/:tripId",
    validatorGetTripById,
    authenticate,
    getTripByID
);
router.get(
    "/trip/get-trips-search",
    validatorGetChartBoatData,
    authenticate,
    getChartBoatData
);
// end to trips


// start to user trips api
router.get(
    "/trip/get-trips-by-interest",
    validatorInterest,
    authenticate,
    getTripsBySelectedInterest
)
// end to user trips api

module.exports = router;
