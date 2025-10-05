import { Router } from "express";
import { sendOTP, verifyOTP } from "../controllers/OTPController";

const router = Router();
// Define endpoint paths

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
5
export default router;
