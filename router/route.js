const express = require("express");

const {signin , signup , otpCheck, verifyEmail, verifyPinCode, resetPassword, googleAuth} = require("../controller/admin/auth.controller");
const { validatorSignUp, validatorSignIn, validatorOTP, validateForgerPasswordEmail, validateResetPassword, validateGoogleAuth } = require("../modules/authetication/validator");
const { validatorCreateTrip, validatorGetTrips } = require("../modules/trips/validator");
const { createTrip, getTrips } = require("../controller/trips/trips.controller");
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
router.get("/trip/get-trips", validatorGetTrips, authenticate, getTrips);
// end to trips

module.exports = router