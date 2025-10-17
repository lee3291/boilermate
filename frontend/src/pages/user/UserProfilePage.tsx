import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        <h1 className='mb-4 text-4xl font-bold'>Welcome!</h1>
        {user ? (
          <>
            <p className='mb-8 text-lg text-gray-600'>
              You are signed in as {user.email}.
            </p>
            <button
              onClick={logout}
              className='rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600'
            >
              Logout
            </button>
            <Link
              to='/profile/edit'
              className='ml-4 rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600'
            >
              Edit Profile
            </Link>
          </>
        ) : (
          <p className='mb-8 text-lg text-gray-600'>You are not signed in.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
