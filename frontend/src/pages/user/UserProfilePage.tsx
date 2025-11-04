import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';
import { getProfile } from '../../services/profile.service';
import type { ProfileData } from '../../types/profile';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchUsername, setSearchUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await getProfile();
          setProfile(response.data);
          setError(null);
        } catch (err) {
          setError('Failed to fetch profile data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/profile/${searchUsername.trim()}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        {profile ? (
          <>
            <div className='mb-4 flex justify-center'>
              <Avatar
                src={profile.avatarURL}
                alt={`${profile.email}'s avatar`}
                className='h-32 w-32 rounded-full object-cover'
              />
            </div>
            <h1 className='mb-2 text-4xl font-bold'>
              Welcome, {profile.username}!
            </h1>
            <p className='mb-8 text-lg text-gray-600'>
              You are signed in as {profile.email}.
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
