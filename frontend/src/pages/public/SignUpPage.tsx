import React, { useState, type FormEvent } from 'react';
import InputField from '../../components/InputField';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting with:', { email, password }); // This will be replaced with backend code
  };

  return (
    <div className='min-h screen flex justify-center bg-gray-100 py-12'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        <h1 className='mb-6 text-center text-2xl font-bold'>
          Create Your Account
        </h1>
        <form onSubmit={handleSubmit}>
          <InputField
            label='Purdue Email'
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='username@purdue.edu'
          />

          <InputField
            label='Password'
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            label='Confirm Password'
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type='submit'
            className='mt-2 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600'
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
