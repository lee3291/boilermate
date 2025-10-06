import React, { useState, type FormEvent } from 'react';
import InputField from '../../components/InputField';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting with:', { email, password });
  };

  return (
    <div className='flex items-center justify-center min-h screen bg-gray-100'>
      <div className='p-8 bg-white rounded-lg shadow-md w-full max-w-wd'>
        <h1 className='text-2hl font-bold mb-6 text-center'>Create Your Account</h1>
        <form onSubmit={handleSubmit}></form>
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

        <button type='submit' className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-2'>
            Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUpPage;
