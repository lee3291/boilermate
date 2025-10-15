import React, { useState, type FormEvent } from 'react';
import InputField from '../../components/InputField';
import { requestCode, verifyCode, register } from '../../services/api';

type Step = 1 | 2 | 3;

const SignUpPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setError(null);
    try {
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
    setIsLoading(true);
    setError(null);
    try {
      const res = await register(email, password);
      alert(
        `Success! Account created for ${res.data.email}. You can now log in.`,
      );
      // Optionally, redirect to login page
      // history.push('/login');
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
            <button
              type='submit'
              disabled={isLoading}
              className='mt-2 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyCode}>
            <p className='mb-4 text-center text-sm'>
              A verification code was sent to <strong>{email}</strong>.
            </p>
            <InputField
              label='Verification Code'
              id='code'
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='123456'
              required
            />
            <button
              type='submit'
              disabled={isLoading}
              className='mt-2 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
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
              className='mt-2 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
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
    <div className='flex min-h-screen justify-center bg-gray-100 py-12'>
      <div
        className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'
        style={{ height: 'fit-content' }}
      >
        <h1 className='mb-6 text-center text-2xl font-bold'>
          Create Your Account
        </h1>
        {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
        {renderStep()}
      </div>
    </div>
  );
};

export default SignUpPage;
