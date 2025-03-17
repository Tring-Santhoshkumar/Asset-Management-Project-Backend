const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail({ to, subject, text, html }) {
    const mailOptions = {from : process.env.EMAIL_USER, to, subject, text, html };
    try{
        await transporter.sendMail(mailOptions);
        console.log("Email Successfully sent to ",to);
    }
    catch(error) {
        console.error("Email Error : ",error);
        throw error;
    }
}

module.exports = { sendEmail };
