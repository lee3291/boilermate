import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { getProfile, updateProfile } from '../../services/profile.service';
import type { ProfileData, UpdateProfileDto } from '../../types/profile';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === 'lifestyleHashtags') {
      setProfile((prev) =>
        prev
          ? { ...prev, [name]: value.split(',').map((s) => s.trim()) }
          : null,
      );
    } else {
      setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleToggleChange = (name: string, enabled: boolean) => {
    setProfile((prev) => (prev ? { ...prev, [name]: enabled } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const profileToUpdate: UpdateProfileDto = {
      phoneNumber: profile.phoneNumber,
      bio: profile.bio,
      searchStatus: profile.searchStatus,
      lifestyleHashtags: profile.lifestyleHashtags,
      isSmoker: profile.isSmoker,
      hasPets: profile.hasPets,
    };

    try {
      await updateProfile(profileToUpdate);
      navigate('/profile');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <div className='min-h-screen bg-gray-100 py-12'>
      <div className='mx-auto w-full max-w-lg'>
        <form
          onSubmit={handleSave}
          className='space-y-8 rounded-lg bg-white p-10 shadow-md'
        >
          <h2 className='text-center text-3xl font-bold text-gray-900'>
            Edit Profile
          </h2>
          <div className='mt-8 space-y-6'>
            {/* Username */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700'
              >
                Username
              </label>
              <div className='mt-1'>
                <input
                  id='username'
                  name='username'
                  type='text'
                  value={profile.username}
                  readOnly
                  className='w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-sm font-medium text-gray-700'
              >
                Phone Number
              </label>
              <div className='mt-1'>
                <input
                  id='phoneNumber'
                  name='phoneNumber'
                  type='tel'
                  autoComplete='tel'
                  value={profile.phoneNumber || ''}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor='bio'
                className='block text-sm font-medium text-gray-700'
              >
                Bio
              </label>
              <div className='mt-1'>
                <textarea
                  id='bio'
                  name='bio'
                  rows={3}
                  value={profile.bio || ''}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
                  placeholder='Tell us a little about yourself'
                />
              </div>
            </div>

            {/* Search Status */}
            <div>
              <label
                htmlFor='searchStatus'
                className='block text-sm font-medium text-gray-700'
              >
                Looking for a Roommate?
              </label>
              <select
                id='searchStatus'
                name='searchStatus'
                value={profile.searchStatus || 'LOOKING'}
                onChange={handleInputChange}
                className='mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
              >
                <option value='LOOKING'>Actively Looking</option>
                <option value='NOT_LOOKING'>Not Looking Right Now</option>
                <option value='HIDDEN'>Hidden from Searches</option>
              </select>
            </div>

            {/* Lifestyle Hashtags */}
            <div>
              <label
                htmlFor='lifestyleHashtags'
                className='block text-sm font-medium text-gray-700'
              >
                Lifestyle Hashtags
              </label>
              <div className='mt-1'>
                <input
                  id='lifestyleHashtags'
                  name='lifestyleHashtags'
                  type='text'
                  value={
                    Array.isArray(profile.lifestyleHashtags)
                      ? profile.lifestyleHashtags.join(', ')
                      : profile.lifestyleHashtags || ''
                  }
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
                  placeholder='e.g., #earlybird, #nightowl'
                />
              </div>
            </div>

            {/* Toggles */}
            <div className='space-y-4'>
              <ToggleSwitch
                label='Do you smoke?'
                enabled={profile.isSmoker || false}
                onChange={(enabled) => handleToggleChange('isSmoker', enabled)}
              />
              <ToggleSwitch
                label='Do you have pets?'
                enabled={profile.hasPets || false}
                onChange={(enabled) => handleToggleChange('hasPets', enabled)}
              />
            </div>
          </div>
          {/* Save Button */}
          <div className='flex justify-end'>
            <button
              type='submit'
              className='rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
