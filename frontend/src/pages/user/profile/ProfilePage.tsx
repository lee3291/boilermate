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

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '../components/Navbar';
import useProfileLogic from './useProfileLogic';
import ProfileHeader from './components/ProfileHeader';
import BioSection from './components/BioSection';
import LifestyleSection from './components/LifestyleSection';
import RoommateSection from './components/RoommateSection';

export default function ProfilePage() {
  const { user } = useAuth();
  
  // ProtectedRoute already ensures user exists, so we can safely assert it
  const userId = user!.id;
  
  const logic = useProfileLogic(userId);

  // Mock user data (replace with real data from backend later)
  // TODO: Use logic.profileData once backend returns complete user info
  const [mockUser] = useState({
    id: userId,
    name: 'Alex Johnson',
    age: 22,
    major: 'Computer Science',
    year: 'Junior',
    profileImage: 'https://i.pravatar.cc/300?img=12', // Mock avatar
    bio: "Hey! I'm Alex, a CS major who loves coding, coffee, and late-night study sessions. Looking for a chill roommate who respects quiet hours but also enjoys good conversation. I'm clean, organized, and always down to share snacks! 🎮☕📚",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - Centralized Container */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Removed: Fake User ID Tester - Now using auth context */}

        {/* Error Display */}
        {logic.error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-600 text-sm">⚠️ {logic.error}</p>
          </div>
        )}

        {/* Section 1: Profile Header (Name + Image + Personal Info + Vote Stats) */}
        <ProfileHeader 
          user={mockUser}
          voteStats={logic.voteStats}
          onAvatarChange={logic.handleAvatarChange}
        />

        {/* Section 2: Bio Section */}
        <BioSection bio={mockUser.bio} />

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
      </div>
    </div>
  );
}
