import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyCaptcha as apiVerifyCaptcha } from "@/services/reCaptcha.service";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function ReCaptchaForm() {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!captchaToken) {
            alert("Please complete the reCAPTCHA!");
            return;
        }

        try {
            const result = await apiVerifyCaptcha({ token: captchaToken });

            if (result.success) {
                navigate("/");
            } else {
                alert("reCAPTCHA verification failed.");
                setCaptchaToken(null);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Something went wrong.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
            <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token: string | null) => setCaptchaToken(token)}
            />
            <button
                type="submit"
                disabled={!captchaToken}
                className="
          bg-blue-500 text-white font-medium py-2 px-4 rounded
          hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
            >
                Submit
            </button>
        </form>
    );
}

