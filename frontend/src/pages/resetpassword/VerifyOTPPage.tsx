import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import OTPInput from "../../components/OTPInput";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
export default function VerifyOTPPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // user’s email
    const [otp, setOtp] = useState("");
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        //Allow reset password if enter correct OTP
        try {
            const response = await fetch("http://localhost:3000/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (data.valid) {
                alert("OTP verified successfully!");
                navigate("/reset-password", { state: { email } });
            } else {
                alert("Invalid OTP");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="border border-gray-200 rounded-lg p-8 space-y-6">
                <Link
                    to="/otp-request"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>

                <div className="space-y-6">
                    <div className="space-y-4 text-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Verify</h1>
                        <p className="text-base text-gray-600 leading-relaxed">
                            Your code was sent to <span className="font-medium">{email}</span>.
                        </p>
                    </div>
                    <OTPInput length={6} onComplete={setOtp} />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <button
                            type="submit"
                            className="w-full h-11 text-base font-medium bg-blue-500 text-white rounded-lg
             hover:bg-blue-600 transition-colors duration-200"
                        >
                            Enter
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Didn’t receive code?{" "}
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        console.log(email);
                                        const response = await fetch("http://localhost:3000/otp/send", {
                                            method: "POST",
                                            headers: {"Content-Type": "application/json"},
                                            body: JSON.stringify({email}),
                                        });

                                        const data = await response.json();
                                        console.log("Resend response:", data);
                                    } catch (error) {
                                        console.error("OTP resend failed.");
                                        console.error(error);
                                    }
                                    alert("A new OTP has been sent to your email.");
                                }}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                                Resend
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}
