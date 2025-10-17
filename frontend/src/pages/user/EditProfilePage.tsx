import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';

// Mock initial data - in a real app, you'd fetch this
const initialProfileData = {
  name: 'John Doe',
  phoneNumber: '123-456-7890',
  bio: 'Lover of coffee and code.',
  searchStatus: 'LOOKING',
  lifestyleHashtags: '#earlybird,#nightowl',
  isSmoker: false,
  hasPets: true,
};

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfileData);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: string, enabled: boolean) => {
    setProfile((prev) => ({ ...prev, [name]: enabled }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this data to your backend API
    console.log('Saving profile:', profile);
    // Potentially navigate away or show a success message
    navigate('/profile');
  };

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
            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                Name
              </label>
              <div className='mt-1'>
                <input
                  id='name'
                  name='name'
                  type='text'
                  autoComplete='name'
                  value={profile.name}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm'
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
                  value={profile.phoneNumber}
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
                  value={profile.bio}
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
                value={profile.searchStatus}
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
                  value={profile.lifestyleHashtags}
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
                enabled={profile.isSmoker}
                onChange={(enabled) => handleToggleChange('isSmoker', enabled)}
              />
              <ToggleSwitch
                label='Do you have pets?'
                enabled={profile.hasPets}
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
