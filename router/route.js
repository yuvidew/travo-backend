const express = require("express");

const {signin , signup , otpCheck, verifyEmail, verifyPinCode, resetPassword, googleAuth} = require("../controller/admin/auth.controller");
const { validatorSignUp, validatorSignIn, validatorOTP, validateForgerPasswordEmail, validateResetPassword, validateGoogleAuth } = require("../modules/authetication/validator");
const { validatorCreateTrip, validatorGetTrips, validatorGetTripById, validatorGetChartBoatData } = require("../modules/trips/validator");
const { createTrip, getTrips, getTripByID, getChartBoatData } = require("../controller/trips/trips.controller");
const { authenticate } = require("../modules/authetication/authentication");


const router = express.Router();

// start to admin authentication
router.post("/auth/sign-up" , validatorSignUp , signup);
router.post("/auth/sign-in" , validatorSignIn , signin);
router.post("/auth/verify-otp" , validatorOTP , otpCheck);

router.post("/auth/verify-email" , validateForgerPasswordEmail , verifyEmail);
router.post("/auth/verify-forget-password-opt" , validatorOTP , verifyPinCode);
router.put("/auth/reset-new-password" , validateResetPassword , resetPassword);

router.post("/auth/google-login" , validateGoogleAuth , googleAuth)
// end to admin authentication 


// start to trips
router.post("/trip/create-trip", validatorCreateTrip, authenticate, createTrip);
router.get("/trip/get-trips/:user_id", validatorGetTrips, authenticate, getTrips);
router.get("/trip/get-trip-by-id/:tripId" , validatorGetTripById , authenticate , getTripByID)
router.get("/trip/get-trips-search" , validatorGetChartBoatData , authenticate , getChartBoatData)
// end to trips

module.exports = router