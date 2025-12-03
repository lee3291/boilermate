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

    if (value.length === 0) setError("Email cannot be empty");
    else if (!value.includes("@")) setError("Email must contain @");
    else if (!value.endsWith("@purdue.edu")) setError("Email must end with @purdue.edu");
    else setError("");
  };

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email cannot be empty");
      return;
    }
    if (!email.includes("@")) setError("Email must contain @");
    if (!email.endsWith("@purdue.edu")) {
      setError("Email must end with @purdue.edu");
      return;
    }

    try {
      await fetch("http://localhost:3000/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error(error);
    }

    navigate("/verify-otp", { state: { email } });
  };

  return (
      <div className="bg-mainbrown flex min-h-screen flex-col items-center p-4">
        <div className="flex w-full grow items-center justify-center">
          <div className="border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8">
            <Link to="/" className="flex items-center gap-2 text-maingray mb-6 hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <h1 className="font-sourceserif4-18pt-regular text-maingray mb-6 text-center text-3xl">
              Reset your password
            </h1>

            <p className="text-center text-maingray mb-4">
              Enter your Purdue email to receive a one-time password (OTP)
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <label htmlFor="email" className="font-sourceserif4-18pt-regular text-maingray">
                Purdue Email
              </label>

              <EmailInput
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="username@purdue.edu"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                  type="submit"
                  className="font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg hover:underline"
              >
                Send code
              </button>

              <p className="text-center text-maingray">
                Remember your password?{" "}
                <Link to="/signin" className="hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
  );
}
