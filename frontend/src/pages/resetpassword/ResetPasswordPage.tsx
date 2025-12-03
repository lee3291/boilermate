import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import HomeNavbar from "../home/components/HomeNavbar";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length === 0) setErrorPassword("Password cannot be empty.");
    else if (value.length < 8) setErrorPassword("Password must contain at least 8 characters.");
    else setErrorPassword("");
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value.length === 0) setErrorConfirmPassword("Password cannot be empty.");
    else if (value.length < 8) setErrorConfirmPassword("Password must contain at least 8 characters.");
    else setErrorConfirmPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password.length < 8 || confirmPassword.length < 8) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/otp/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Password changed successfully!");
        navigate("/");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="bg-mainbrown flex min-h-screen flex-col items-center p-4">
        <HomeNavbar />
        <div className="flex w-full grow items-center justify-center">
          <div className="border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8"
               style={{height: "fit-content"}}>
            <h1 className="font-sourceserif4-18pt-regular text-maingray mb-6 text-center text-3xl">
              Reset Password
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2"> {/* smaller space between fields */}
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-maingray">
                    New Password *
                  </label>
                  <PasswordInput
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{errorPassword || " "}</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="text-sm font-medium text-maingray">
                    Confirm New Password *
                  </label>
                  <PasswordInput
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                  />
                  <p className="text-red-500 text-sm min-h-[20px]">{errorConfirmPassword || " "}</p>
                </div>
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
              <div className="text-center mt-4">
                <Link to="/" className="text-blue-500 hover:underline font-bold">
                  Already have an account? Login
                </Link>
              </div>
            </form>

          </div>
        </div>
      </div>
  );
}
