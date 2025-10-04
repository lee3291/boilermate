import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import { ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Live error checking
    if (value.length === 0) {
      setErrorPassword("Password cannot be empty.");
    } else if (value.length < 8) {
      setErrorPassword("Password must contain at least 8 characters.");
    } else {
      setErrorPassword(""); // valid
    }
  };
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    // Live error checking
    if (value.length === 0) {
      setErrorConfirmPassword("Password cannot be empty.");
    } else if (value.length < 8) {
      setErrorConfirmPassword("Password must contain at least 8 characters.");
    } else {
      setErrorConfirmPassword(""); // valid
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return;
    }
    if (password.length < 8 || confirmPassword.length < 8) {
      return;
    }
    if (password != confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    //Go to the login page
    navigate("/");
  };

  return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="border border-gray-200 rounded-lg p-8 space-y-6">
          <Link
              to="/verify-otp"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4"/>
            Back
          </Link>

          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Enter new password</h1>
              <p className="text-base text-gray-600 leading-relaxed ">
                Enter a new password below to change your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-900 ">
                  New password *
                </label>
                <PasswordInput
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <p className="text-red-500 text-sm min-h-[20px]">
                  {errorPassword || " "}
                </p>

                <label htmlFor="password" className="text-sm font-medium text-gray-900 ">
                  Confirm new password *
                </label>
                <PasswordInput
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                <p className="text-red-500 text-sm min-h-[20px]">
                  {errorConfirmPassword || " "}
                </p>

              </div>

              <button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Change password
              </button>
            </form>
          </div>
        </div>
      </main>
  );
}