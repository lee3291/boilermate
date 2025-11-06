import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import { signIn } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import HomeNavbar from '../home/components/HomeNavbar';
import { isAxiosError } from 'axios';

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await signIn({ email, password });
      if (data.status === 'deactivated') {
        navigate('/reactivate-account', {
          state: { reactivationToken: data.reactivationToken },
        });
      } else if (data.access_token) {
        login(data.access_token);
        navigate('/profile');
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(
          err.response.data.message ||
            'Failed to sign in. Please check your credentials.',
        );
      } else {
        setError('Failed to sign in. An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-mainbrown flex min-h-screen flex-col items-center p-4'>
      <HomeNavbar />
      <div className='flex w-full grow items-center justify-center'>
        <div
          className='border-grayline bg-sharkgray-light w-full max-w-md rounded-lg border p-8'
          style={{ height: 'fit-content' }}
        >
          <h1 className='font-sourceserif4-18pt-regular text-maingray mb-6 text-center text-3xl'>
            Sign In to Your Account
          </h1>
          {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
          <form onSubmit={handleSubmit}>
            <InputField
              label='Purdue Email'
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='username@purdue.edu'
              required
            />
            <InputField
              label='Password'
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='submit'
              disabled={isLoading}
              className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-50'
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
