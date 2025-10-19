import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        <h1 className='mb-16 text-4xl font-bold'>Welcome to Boilermate</h1>
        <div className='flex justify-center gap-4'>
          <Link
            to='/signin'
            className='rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600'
          >
            Sign In
          </Link>
          <Link
            to='/signup'
            className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
