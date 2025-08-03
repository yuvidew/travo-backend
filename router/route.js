const express = require("express");

const {signin , signup , otpCheck, verifyEmail, verifyPinCode, resetPassword} = require("../controller/admin/auth.controller");
const { validatorSignUp, validatorSignIn, validatorOTP, validateForgerPasswordEmail, validateResetPassword } = require("../modules/authetication/validator");


const router = express.Router();

// start to admin authentication
router.post("/auth/sign-up" , validatorSignUp , signup);
router.post("/auth/sign-in" , validatorSignIn , signin);
router.post("/auth/verify-otp" , validatorOTP , otpCheck);

router.post("/auth/verify-email" , validateForgerPasswordEmail , verifyEmail);
router.post("/auth/verify-forget-password-opt" , validatorOTP , verifyPinCode);
router.put("/auth/reset-new-password" , validateResetPassword , resetPassword);
// end to admin authentication 


module.exports = router