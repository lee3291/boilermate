import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HomeNavbar from '../home/components/HomeNavbar';
import { isAxiosError } from 'axios';
import {
  requestReactivationCode,
  reactivateAccount,
} from '../../services/auth.service';
import OTPInput from '../../components/OTPInput';

const ReactivateAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { reactivationToken } = location.state || {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeRequested, setIsCodeRequested] = useState(false);

  useEffect(() => {
    if (!reactivationToken) {
      // If there's no token, redirect to sign-in
      navigate('/signin');
      return;
    }
  }, [reactivationToken, navigate]);

  const handleRequestCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await requestReactivationCode(reactivationToken);
      setMessage('A verification code has been sent to your email.');
      setIsCodeRequested(true);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reactivateAccount(reactivationToken, otp);
      login(data.access_token);
      navigate('/profile');
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to reactivate account.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    navigate('/signin');
  };

  return (
    <div className='bg-mainbrown flex min-h-screen flex-col items-center p-4'>
      <HomeNavbar />
      <div className='flex w-full grow items-center justify-center'>
        <div
          className='border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8 text-center'
          style={{ height: 'fit-content' }}
        >
          <h1 className='font-sourceserif4-18pt-regular text-maingray mb-4 text-3xl'>
            Reactivate Your Account
          </h1>
          <p className='text-maingray mb-6'>
            {isCodeRequested
              ? 'Enter the 6-digit code sent to your email to reactivate your account.'
              : 'Your account is currently deactivated. To reactivate, request a verification code.'}
          </p>
          {error && <p className='mb-4 text-red-500'>{error}</p>}
          {message && !error && (
            <p className='mb-4 text-green-500'>{message}</p>
          )}

          {!isCodeRequested && (
            <button
              onClick={handleRequestCode}
              disabled={isLoading}
              className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mb-6 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          )}

          {isCodeRequested && (
            <div className='mb-6'>
              <OTPInput onComplete={setOtp} />
            </div>
          )}

          <div className='flex flex-col gap-4'>
            <button
              onClick={handleReactivate}
              disabled={isLoading || !isCodeRequested || otp.length !== 6}
              className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
            >
              {isLoading ? 'Reactivating...' : 'Reactivate Account'}
            </button>
            <button
              onClick={handleSignOut}
              className='font-sourceserif4-18pt-regular text-maingray w-full rounded-lg border border-transparent py-2 text-lg transition-colors hover:underline'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactivateAccountPage;
