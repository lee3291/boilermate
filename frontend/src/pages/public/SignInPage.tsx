import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import { signIn } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { verifyCaptcha as apiVerifyCaptcha } from '@/services/reCaptcha.service';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify CAPTCHA first
      const captchaResult = await apiVerifyCaptcha({ token: captchaToken });
      if (!captchaResult.success) {
        setError('reCAPTCHA verification failed.');
        setIsLoading(false);
        setCaptchaToken(null);
        return;
      }

      const data = await signIn({ email, password });
      login(data.access_token);
      navigate('/listings');
    } catch {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen justify-center bg-gray-100 py-12">
        <div
            className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
            style={{ height: 'fit-content' }}
        >
          <h1 className="mb-6 text-center text-2xl font-bold">
            Sign In to Your Account
          </h1>

          {error && <p className="mb-4 text-center text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <InputField
                label="Purdue Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@purdue.edu"
                required
            />
            <InputField
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <div className="flex justify-center">
              <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token: string | null) => setCaptchaToken(token)}
              />
            </div>

            <button
                type="submit"
                disabled={isLoading || !captchaToken}
                className="
              mt-2 w-full rounded-lg bg-blue-500 py-2 text-white
              hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
  );
};

export default SignInPage;

