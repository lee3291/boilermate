import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile } from '../../services/profile.service';
import type { ProfileData } from '../../types/profile';
import { UsernameDisplay } from '@/components/UsernameDisplay';

const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const response = await getPublicProfile(username);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  if (!profile) {
    return <div>User not found.</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 py-12'>
      <div className='mx-auto w-full max-w-lg'>
        <div className='rounded-lg bg-white p-10 shadow-md'>
          <div className="flex justify-center items-center">
            <UsernameDisplay user={profile} className="text-3xl font-bold text-gray-900" />
            <h2 className='text-3xl font-bold text-gray-900'>'s Profile</h2>
          </div>
          <div className='mt-8 space-y-6'>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>Bio</h3>
              <p className='mt-2 text-gray-600'>
                {profile.bio || 'No bio provided.'}
              </p>
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                Search Status
              </h3>
              <p className='mt-2 text-gray-600'>{profile.searchStatus}</p>
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>Lifestyle</h3>
              <div className='mt-2 space-y-2'>
                <p>Smoker: {profile.isSmoker ? 'Yes' : 'No'}</p>
                <p>Has Pets: {profile.hasPets ? 'Yes' : 'No'}</p>
                {profile.lifestyleHashtags &&
                  profile.lifestyleHashtags.length > 0 && (
                    <div>
                      <h4 className='font-medium'>Hashtags:</h4>
                      <div className='flex flex-wrap gap-2'>
                        {profile.lifestyleHashtags.map((tag) => (
                          <span
                            key={tag}
                            className='rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
