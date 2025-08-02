const nodemailer =  require("nodemailer");

const sendVerificationCode = async (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"Travo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code",
        text: `Your 6-digit verification code is: ${code}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return code;
}


module.exports = {
    sendVerificationCode
}