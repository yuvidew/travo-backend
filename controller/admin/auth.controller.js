const { getDB } = require("../../db/connectDB");
const { sendVerificationCode } = require("../../verification/SendVerificationCode")

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// TODO: implement forget password api 


const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const db = getDB();

        const [existing] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (existing.length > 0) {
            return res.status(409).json({
                code: 409,
                success: false,
                message: "User already exists",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO admins (name , email , password) VALUES (?, ?, ?)", [
            name,
            email,
            hashPassword
        ]);


        return res.status(200).json({
            code: 200,
            message: "Sign up successfully"
        })


    } catch (error) {
        console.log("Sign up Error: " ,error);
        return res.status(400).json({
            code: 400,
            message: "Something went wrong. Please check the password and email!",
            error: error.message,
        });
    }
};


const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = getDB();

        const [users] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                code: 401,
                message: "Invalid email or password"
            });
        };

        const code = await sendVerificationCode(email);
        console.log("Generated OTP:", code); 

        if (!code) {
            return res.status(500).json({ success: false, message: "Failed to generate OTP" });
        }
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await db.query(
            "UPDATE admins SET otp_code = ?, otp_expiry = ? WHERE email = ?",
            [code, expiry, email]
        );


        return res.status(200).json({
            success : true,
            message : "OTP sent to your email. Please verify to complete login."
        })

    } catch (error) {
        console.log("Sign in Error: " ,error);
        return res.status(400).json({
            code: 400,
            message: "Something went wrong. Please check the password and email!",
            error: error.message,
        });
    }
}

const otpCheck = async (req, res) => {
    const { email, pin } = req.body;

    try {
        const db = getDB();

        const [users] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        console.log("the user data " , user);

        if (!user.otp_code || !user.otp_expiry) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "No OTP request found. Please sign in first.",
            });
        }

        const now = new Date();
        const isExpired = now > user.otp_expiry;
        const isMatch = user.otp_code === pin;

        if (!isMatch) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid OTP.",
            });
        }

        if (isExpired) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        await db.query("UPDATE admins SET otp_code = NULL, otp_expiry = NULL WHERE email = ?", [email]);

        const token = jwt.sign(
            {
                id : user.id,
                email : user.email,
                name : user.username
            },
            process.env.JWT_SECRET
        )

        return res.status(200).json({
            code: 200,
            success: true,
            message: "OTP verified successfully!",
            token,
            user : {
                id : user.id,
                email : user.email,
                name : user.username
            }
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            success: false,
            message: "Internal server error",
        });
    }
};

// start to forget password

const verifyEmail = async (req , res) => {
    const {email} = req.body;

    try {
        const db = getDB();

        const [users] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid email."
            });
        }

        const code = await sendVerificationCode(email);

        if (!code) {
            return res.status(500).json({ success: false, message: "Failed to generate OTP" });
        }
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await db.query(
            "UPDATE admins SET otp_code = ?, otp_expiry = ? WHERE email = ?",
            [code, expiry, email]
        );

        return res.status(200).json({
            success : true,
            message : "OTP sent to your email. Please verify to complete login."
        })
    } catch (error) {
        console.log("Verify email Error: " ,error);
        return res.status(400).json({
            code: 400,
            message: "Something went wrong. Please check the password and email!",
            error: error.message,
        });
    }
}

const verifyPinCode = async (req , res) => {
    const { email, pin } = req.body;

    try {
        const db = getDB();

        const [users] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        if (!user.otp_code || !user.otp_expiry) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "No OTP request found. Please sign in first.",
            });
        }

        const now = new Date();
        const isExpired = now > user.otp_expiry;
        const isMatch = user.otp_code === pin;

        if (!isMatch) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid OTP.",
            });
        }

        if (isExpired) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        return res.status(200).json({
            code : 200,
            success : true,
            message : "OTP verified successfully"
        })
    } catch (error) {
        console.error("from forget password verify pin code ", error);
        return res.status(500).json({
            code: 500,
            success: false,
            message: "Internal server error",
        });
    }
}

const resetPassword = async (req , res) => {
    const { email, newPassword } = req.body;

    try {
        const db = getDB();

        const [users] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: "Invalid email."
            });
        }

        const user = users[0];

        if (!user.otp_code || !user.otp_expiry) {
            return res.status(400).json({
                code: 400,
                success: false,
                message: "No OTP request found. Please sign in first.",
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE admins SET password = ? WHERE email = ?", [hashPassword, email]);

        return res.status(200).json({
            code: 200,
            success: true,
            message: "Password reset successfully.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            code: 500,
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
}

module.exports = {
    signin,
    signup,
    otpCheck,
    verifyEmail,
    verifyPinCode,
    resetPassword
}