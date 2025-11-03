import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const [searchUsername, setSearchUsername] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/profile/${searchUsername.trim()}`);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        {user ? (
          <>
            <div className='mb-4 flex justify-center'>
              <Avatar
                src={user.avatarURL}
                alt={`${user.email}'s avatar`}
                className='h-32 w-32 rounded-full object-cover'
              />
            </div>
            <h1 className='mb-2 text-4xl font-bold'>Welcome!</h1>
            <p className='mb-8 text-lg text-gray-600'>
              You are signed in as {user.email}.
            </p>
            <div className='mb-8'>
              <form onSubmit={handleSearch} className='flex'>
                <input
                  type='text'
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder='Find another user'
                  className='w-full rounded-l-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
                />
                <button
                  type='submit'
                  className='rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                >
                  Search
                </button>
              </form>
            </div>
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
