import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import EmailInput from "../../components/EmailInput";
import { ArrowLeft } from "lucide-react";

export default function OTPRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Live error checking
    if (value.length === 0) {
      setError("Email cannot be empty");
    } else if (!value.includes("@")) {
      setError("Email must contain @");
    } else if (!value.endsWith("@purdue.edu")) {
      setError("Email must end with @purdue.edu");
    } else {
      setError(""); // valid
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email cannot be empty");
      return;
    }
    if (!email.includes("@")) {
      setError("Email must contain @");
    }
    if (!email.endsWith("@purdue.edu")) {
      setError("Email must end with @purdue.edu");
      return;
    }
    //Send email to verify page so user can later ask for resend OTP
    navigate("/verify-otp", { state: { email } });
  };

  return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="border border-gray-200 rounded-lg p-8 space-y-6">
          <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Reset your password</h1>
              <p className="text-base text-gray-600 leading-relaxed">
                Enter your email address to receive a one-time password (OTP)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email address *
                </label>
                <EmailInput
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="abc@purdue.edu"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Send code
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/" className="font-medium text-gray-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
  );
}
