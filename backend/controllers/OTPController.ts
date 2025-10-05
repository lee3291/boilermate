import { Request, Response } from "express";
import nodemailer from "nodemailer";

// In-memory store for OTPs
const otpStore: Record<string, { otp: string; expires: number }> = {};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(req: Request, res: Response) {
    const { email } = req.body;
    const otp = generateOTP();
    // OTP valid for 5 minutes
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    await transporter.sendMail({
        from: "BoilerMate",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}. It expires in 5 minutes`
    });

    res.json({ message: "OTP sent" });
}

export function verifyOTP(req: Request, res: Response) {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
        return res.status(400).json({ message: "OTP not found" });
    }
    if (record.expires < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    res.json({ message: "OTP verified" });
}
