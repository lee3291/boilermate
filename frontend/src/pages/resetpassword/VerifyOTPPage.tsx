import React, { useState, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import OTPInput from "../../components/OTPInput";
import { ArrowLeft } from "lucide-react";
import HomeNavbar from "../home/components/HomeNavbar";

export default function VerifyOTPPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:3000/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();

            if (data.valid) {
                navigate("/reset-password", { state: { email } });
            } else {
                setError("Invalid OTP. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:3000/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            await response.json();
            alert("A new OTP has been sent to your email.");
        } catch (err) {
            console.error(err);
            setError("Failed to resend OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-mainbrown flex min-h-screen flex-col items-center p-4">
            <HomeNavbar />
            <div className="flex w-full grow items-center justify-center">
                <div
                    className="border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8"
                    style={{ height: "fit-content" }}
                >
                    <Link
                        to="/otp-request"
                        className="flex items-center gap-2 text-sm text-maingray hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>

                    <h1 className="font-sourceserif4-18pt-regular text-maingray mb-4 text-center text-3xl">
                        Verify OTP
                    </h1>

                    {error && <p className="mb-4 text-center text-red-500">{error}</p>}

                    <p className="text-center text-maingray mb-6 text-sm">
                        Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                    </p>

                    <OTPInput length={6} onComplete={setOtp} />

                    <button
                        onClick={handleSubmit as any}
                        disabled={isLoading}
                        className="font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-6 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50"
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <p className="text-center text-sm text-maingray mt-4">
                        Didn’t receive the code?{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="text-blue-500 hover:text-blue-700 font-medium underline"
                        >
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
