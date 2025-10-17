import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate} from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import { useLocation } from "react-router-dom";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const location = useLocation();
  const email = location.state?.email; // user’s email
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

  const handleSubmit = async (e: FormEvent) => {
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
    try {
      const response = await fetch("http://localhost:3000/otp/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Change password successfully!");
        navigate("/");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

  };

  return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="border border-gray-200 rounded-lg p-8 space-y-6">

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
                  className="w-full h-11 text-base font-medium bg-blue-500 text-white rounded-lg
             hover:bg-blue-600 transition-colors duration-200"
              >
                Change password
              </button>
              <div className="text-center mt-4">
                <a href="/" className="text-blue-500 hover:underline font-bold">
                  Already have an account? Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>
  );
}
