import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport({
    port: 3000,
    host: "martyna0038@gmail.com",
    auth: {
        user: "martyna0038@gmail.com",
        pass: SENDGRID_API_KEY,
    },
    secure: false,
    tls: {
        rejectUnauthorized: false,
    },
});

export const sendEmail = async (verifyToken, email) => {
    console.log({ SENDGRID_API_KEY });
    const verifyLink = `http://localhost:3000/api/users/auth/verify/${verifyToken}`;
    const mailData = {
        from: "martyna0038@gmail.com",
        to: "martyna00038@gmail.com",
        subject: "Verification email",
        text: verifyLink,
    };

    const sendingInfo = await transporter.sendMail(mailData);

    return sendingInfo;
};
