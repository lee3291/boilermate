import { useState} from "react";
import type {ChangeEvent} from "react";
import EmailInput from "../../components/EmailInput";
import { useNavigate } from "react-router-dom";
//Need to design UI later
export default function OTPRequestPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/verify-otp");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                <EmailInput value={email} onChange={handleEmailChange} />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
