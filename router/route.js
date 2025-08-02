const express = require("express");

const {signin , signup , otpCheck} = require("../controller/admin/auth.controller");
const { validatorSignUp, validatorSignIn, validatorOTP } = require("../modules/authetication/validator");


const router = express.Router();

// start to admin authentication
router.post("/auth/sign-up" , validatorSignUp , signup);
router.post("/auth/sign-in" , validatorSignIn , signin);
router.post("/auth/verify-otp" , validatorOTP , otpCheck);
// end to admin authentication 


module.exports = router