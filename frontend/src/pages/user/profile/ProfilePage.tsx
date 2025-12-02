/**
 * ProfilePage - Main page for user profile management
 * Beautiful Tinder-inspired design with sections:
 * 1. Profile Header (avatar + name + vote stats)
 * 2. Bio Section (user introduction)
 * 3. Lifestyle Preferences (I am...)
 * 4. Roommate Preferences (I want...)
 *
 * Features:
 * - Avatar upload capability (AvatarUploader component)
 * - Vote stats display (likes/dislikes received from /profile/me endpoint)
 * - Full preference management
 *
 * Recent Changes:
 * - Renamed from PreferencesPage to ProfilePage (more semantic)
 * - Added AvatarUploader component for avatar changes
 * - Integrated vote stats from backend (/profile/me)
 * - Added handleAvatarChange handler (ready for AWS S3 integration)
 * - Stats display shows likes, dislikes, and approval percentage
 * - Updated to use auth context instead of hardcoded user ID
 */

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '../components/Navbar';
import useProfileLogic from './useProfileLogic';
import useRoommateLogic from './useRoommateLogic';
import ProfileHeader from './components/ProfileHeader';
import BioSection from './components/BioSection';
import LifestyleSection from './components/LifestyleSection';
import RoommateSection from './components/RoommateSection';
import ProfileActionBar from './components/ProfileActionBar';
import ProfileSidebar from './components/ProfileSidebar';
import RoommateManagementSection from './components/RoommateManagementSection';
import MyReviewsSection from './components/MyReviewsSection';
import { useState } from 'react';
import DeactivateAccountModal from '@/components/DeactivateAccountModal';
import { deactivateAccount } from '@/services/account.service';
import FollowButton from './components/FollowButton';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'roommate' | 'reviews' | 'settings'>('profile');
  const userId = user!.id;
  const logic = useProfileLogic(userId);
  
  // Roommate logic hook
  const roommateLogic = useRoommateLogic(userId);

  // Use real profile data from backend
  const profile = logic.profileData;

  // Only show follow/unfollow button if viewing another user's profile
  const isOtherUser = profile && profile.id !== userId;

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    setTimeout(() => {
      setIsFollowing((prev) => !prev);
      setFollowLoading(false);
    }, 600); // Simulate network delay
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50'>
      <Navbar />
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Two-column layout: Sidebar + Main content */}
        <div className='flex gap-6'>
          {/* Navigation Sidebar */}
          <ProfileSidebar
            activeTab={activeTab}
            onSetActiveTab={setActiveTab}
          />

          {/* Main Content */}
          <div className='flex-1 max-w-4xl'>
            {logic.error && (
              <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
                <p className='text-sm text-red-600'>⚠️ {logic.error}</p>
              </div>
            )}

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <>
                {/* Section 1: Profile Header (Legal Name + Verified Badge + Personal Info + Vote Stats) */}
                {profile && (
                  <ProfileHeader
                    user={{
                      id: profile.id,
                      legalName: profile.legalName || '',
                      email: profile.email || '',
                      name: profile.legalName || profile.name || '',
                      profileImage: profile.avatarURL || profile.profileImage || '',
                      phoneNumber: profile.phoneNumber || '',
                      searchStatus: profile.searchStatus || '',
                      isVerified: profile.isVerified || false,
                    }}
                    voteStats={logic.voteStats}
                    onAvatarChange={logic.handleAvatarChange}
                  />
                )}

                {/* Section 2: Bio Section */}
                {profile && (
                  <BioSection
                    bio={profile.bio || ''}
                    legalName={profile.legalName || ''}
                    phoneNumber={profile.phoneNumber || ''}
                    searchStatus={profile.searchStatus || ''}
                    onSave={async (data) => {
                      // Use updateProfile from profile.service.ts (legacy) or implement in profileService.ts
                      const { name, phone, bio, searchStatus } = data;
                      // You may need to adjust the API call and payload to match backend
                      await (
                        await import('@/services/profile.service')
                      ).updateProfile({
                        legalName: name,
                        phoneNumber: phone,
                        bio,
                        searchStatus,
                      });
                      await logic.fetchMyProfile(userId);
                    }}
                  />
                )}

                {/* Section 3: Lifestyle Preferences (I am...) */}
                <LifestyleSection
                  allPreferences={logic.allPreferences}
                  userPreferences={logic.userProfilePreferences}
                  onAddPreference={logic.handleSetUserProfilePreference}
                  onUpdatePreference={logic.handleUpdateUserProfilePreference}
                  onRemovePreference={logic.handleDeleteUserProfilePreference}
                  loading={logic.loadingUserProfile || logic.loadingMasterList}
                />

                {/* Section 4: Roommate Preferences (I want...) */}
                <RoommateSection
                  allPreferences={logic.allPreferences}
                  roommatePreferences={logic.roommatePreferences}
                  onAddPreference={logic.handleSetRoommatePreference}
                  onUpdatePreference={logic.handleUpdateRoommatePreference}
                  onRemovePreference={logic.handleDeleteRoommatePreference}
                  loading={logic.loadingRoommate || logic.loadingMasterList}
                />
                
                {/* Section 5: Action Bar (Buttons) */}
                <ProfileActionBar
                  actions={[
                    {
                      label: 'Verify ID',
                      onClick: () => {
                        window.location.href = '/verification';
                      },
                      type: 'primary' as const,
                    },
                    ...(user?.role === 'ADMIN'
                      ? [
                          {
                            label: 'Verification Requests',
                            onClick: () => {
                              window.location.href = '/admin/verification-requests';
                            },
                            type: 'primary' as const,
                          },
                        ]
                      : []),
                    {
                      label: 'Deactivate',
                      onClick: () => setShowDeactivateModal(true),
                      type: 'secondary' as const,
                    },
                  ]}
                />
                
                {isOtherUser && (
                  <div className='mt-4 flex justify-center'>
                    <FollowButton
                      isFollowing={isFollowing}
                      loading={followLoading}
                      onToggle={handleFollowToggle}
                    />
                  </div>
                )}
              </>
            )}

            {/* Roommate Tab Content */}
            {activeTab === 'roommate' && (
              <RoommateManagementSection
                requests={roommateLogic.requests}
                roommates={roommateLogic.roommates}
                currentUserId={userId}
                onAcceptRequest={roommateLogic.handleAcceptRequest}
                onRejectRequest={roommateLogic.handleRejectRequest}
                onWithdrawRequest={roommateLogic.handleWithdrawRequest}
                onEndRoommate={roommateLogic.handleEndRoommate}
                onRefreshRequests={roommateLogic.refreshRequests}
                loading={roommateLogic.loading}
              />
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'reviews' && (
              <MyReviewsSection currentUserId={userId} />
            )}

            {/* Settings Tab Content */}
            {activeTab === 'settings' && (
              <div className='bg-white rounded-xl shadow-sm p-8'>
                <h2 className='text-3xl font-bold text-gray-800 mb-4'>⚙️ Settings</h2>
                <p className='text-gray-600'>Settings functionality coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <DeactivateAccountModal
          open={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          onConfirm={async () => {
            await deactivateAccount();
            logout();
            window.location.href = '/signin';
          }}
        />
      </div>
    </div>
  );
}
