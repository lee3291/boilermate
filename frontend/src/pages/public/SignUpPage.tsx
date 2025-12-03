import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import { requestCode, verifyCode, register } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { signIn } from '../../services/auth.service';
import HomeNavbar from '../home/components/HomeNavbar';
import ReCAPTCHA from 'react-google-recaptcha';
import { verifyCaptcha as apiVerifyCaptcha } from '@/services/reCaptcha.service';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

type Step = 1 | 2 | 3;

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleApiError = (error: any) => {
    if (error.response) {
      const backendMessage = error.response.data?.message;
      const message = Array.isArray(backendMessage)
        ? backendMessage[0]
        : backendMessage || 'An unexpected error occurred.';
      setError(message);
    } else {
      setError('Network error. Please check your connection.');
    }
  };

  const handleRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA!');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const captchaResult = await apiVerifyCaptcha({ token: captchaToken });
      if (!captchaResult.success) {
        setError('reCAPTCHA verification failed.');
        setIsLoading(false);
        setCaptchaToken(null);
        return;
      }
      await requestCode(email);
      setStep(2);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await verifyCode(email, code);
      setStep(3);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordErrors = [];
    if (password.length <= 8) {
      passwordErrors.push('longer than 8 characters');
    }
    if (!/\d/.test(password)) {
      passwordErrors.push('at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('at least one special character');
    }

    if (passwordErrors.length > 0) {
      setError(`Password must be ${passwordErrors.join(', ')}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(email, password);
      const data = await signIn({ email, password });
      login(data.access_token);
      navigate('/profile');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
            <form onSubmit={handleRequestCode}>
              <InputField
                  label='Purdue Email'
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='username@purdue.edu'
                  required
              />
              <div className='flex justify-center mt-4'>
                <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token: string | null) => setCaptchaToken(token)}
                />
              </div>
              <button
                  type='submit'
                  disabled={isLoading}
                  className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
        );
      case 2:
        return (
            <form onSubmit={handleVerifyCode}>
              <p className='text-maingray mb-4 text-center text-sm'>
                A verification code was sent to <strong>{email}</strong>.
              </p>
            <InputField
              label='Verification Code'
              id='code'
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='xxxxxx'
              required
            />
            <button
              type='submit'
              disabled={isLoading}
              className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        );
      case 3:
        return (
            <form onSubmit={handleRegister}>
              <InputField
                  label='Password'
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
              <p className='text-maingray mt-2 text-xs'>
                Password must be longer than 8 characters, and contain at least
                one number and one special character.
              </p>
              <InputField
                  label='Confirm Password'
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
              />
              <button
                  type='submit'
                  disabled={isLoading}
                  className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
        );
      default:
        return null;
    }
  };

  return (
      <div className='bg-mainbrown flex min-h-screen flex-col items-center p-4'>
        <HomeNavbar/>
        <div className='flex w-full grow items-center justify-center'>
        <div
          className='border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8'
          style={{ height: 'fit-content' }}
        >
          <h1 className='font-sourceserif4-18pt-regular text-maingray mb-6 text-center text-3xl'>
            Create Your Account
          </h1>
          {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
