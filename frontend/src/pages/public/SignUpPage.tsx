import React, { useState, type FormEvent } from 'react';
import InputField from '../../components/InputField';
import api from '../../services/api';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // client side password validation
    if (password !== confirmPassword) {
      alert('Password do not match.');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        email,
        password,
      });
      alert(`Account created for ${res.data.email}`);
      console.log('Registration Success:', res.data);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response) {
        console.error('Server error:', error.response.data);

        const backendMessage = error.response.data?.message;

        // Normalize message (string or array)
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || 'Something went wrong.';

        alert(`${message}`);
      } else {
        console.error('Network error:', error.message);
        alert('Network error — check if backend is running.');
      }
    }
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
