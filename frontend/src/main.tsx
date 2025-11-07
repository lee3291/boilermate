import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ListingDetails from './pages/user/listings/ListingDetails.tsx';
// Import all top-level views/components
import ChatPage from './pages/user/chat/ChatPage.tsx';

// Auth pages
// import LandingPage from './pages/public/LandingPage';
import Homepage from './pages/home/Homepage.tsx'
import SignInPage from './pages/public/SignInPage';
import SignUpPage from './pages/public/SignUpPage';
import ReactivateAccountPage from './pages/public/ReactivateAccountPage';

import OTPRequestPage from './pages/resetpassword/OTPRequestPage.tsx';
import ResetPasswordPage from './pages/resetpassword/ResetPasswordPage.tsx';
import VerifyOTPPage from './pages/resetpassword/VerifyOTPPage.tsx';
import ListingMap from './pages/listing/ListingMap.tsx';
import ListingForm from './pages/listing/ListingForm.tsx';
import Listings from './pages/user/listings/Listings.tsx';
import TempAccount from './pages/user/listings/temp/TempAccount.tsx';
import { UserProvider } from './pages/user/listings/temp/UserContext.tsx';
import SavedListings from './pages/user/listings/SavedListings';
import UserReportsDashboard from './pages/admin/UserReportsDashboard.tsx';
import BugReportsDashboard from './pages/admin/BugReportDashboard.tsx';
import ReportBug from './pages/bug-report/ReportBug.tsx';

import ReportPage from './pages/report/ReportPage.tsx';
import ReportTestPage from './pages/report/ReportTestPage.tsx';
// import ListingsCreateTest from './pages/user/ListingsTest.tsx';

import ProtectedRoute from './components/ProtectedRoute';
// import UserProfilePage from './pages/user/UserProfilePage';
// Updated: Renamed from PreferencesPage to ProfilePage (better semantic naming)
import ProfilePage from './pages/user/profile/ProfilePage.tsx';
import RoommatesPage from './pages/user/roommates/RoommatesPage.tsx';
import ProfileViewPage from './pages/user/roommates/ProfileViewPage.tsx';
// Ethan
//import PublicProfilePage from './pages/user/PublicProfilePage';

//import EditProfilePage from './pages/user/EditProfilePage';
import VerificationPage from './pages/user/VerificationPage';
import VerificationDashboard from './pages/admin/VerificationDashboard';

import ReCaptchaPage from './pages/reCaptcha/reCaptchaForm';

import AnnouncementsDashboard from './pages/admin/AnnouncementsDashboard.tsx';
import UserAnnouncements from "./pages/admin/UserAnnouncements";


const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Homepage />,
    errorElement: <div>404 Page Not Found</div>,
  },
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/reactivate-account',
    element: <ReactivateAccountPage />,
  },
  {
    path: '/otp-request',
    element: <OTPRequestPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOTPPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-captcha',
    element: <ReCaptchaPage />,
  },

  // Protected routes
  {
    //element: <ProtectedRoute />,
    children: [
      {
        path: '/preferences',
        element: <ProfilePage />,
      },
      // Legacy route - kept for backward compatibility
      // TODO: Remove after migrating all references to /profile
      // {
      //   path: '/preferences',
      //   element: <ProfilePage />,
      // },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/roommates',
        element: <RoommatesPage />,
      },
      {
        path: '/profile/:userId',
        element: <ProfileViewPage />,
      },
      // Ethan profile route
      // {
      //   path: '/profile',
      //   element: <UserProfilePage />,
      // },
      // {
      //   path: '/profile/:username',
      //   element: <PublicProfilePage />,
      // },
      // {
      //   path: '/profile/edit',
      //   element: <EditProfilePage />,
      // },
      {
        path: '/verification',
        element: <VerificationPage />,
      },
      {
        path: '/report-bug',
        element: <ReportBug />,
      },
      {
        path: '/listing-map',
        element: <ListingMap />,
      },
      {
        path: '/listing-form',
        element: (
          <ListingForm isOpen={true} onClose={() => console.log('closed')} />
        ),
      },
      {
        path: '/listings',
        element: <Listings />,
      },
      {
        path: '/mylistings',
        element: <MyListings />,
      },
      {
        path: '/listings/:id',
        element: <ListingDetails />,
      },
      {
        path: '/saved',
        element: <SavedListings />,
      },
      {
        path: '/temp-account',
        element: <TempAccount />,
      },
      {
        path: '/messages',
        element: <ChatPage />,
      },
      {
        path: '/report',
        element: <ReportPage />,
      },
      {
        path: '/reporttest',
        element: <ReportTestPage />,
      },
      {
        path: '/user-reports',
        element: <UserReportsDashboard />,
      },
      {
        path: '/admin/bug-dashboard',
        element: <BugDashboard />,
      },
      {
        path: '/admin/verification-requests',
        element: <VerificationDashboard />,
      },
      {
        path: '/announcements',
        element: <AnnouncementsDashboard />,
      },
      {
        path: "/announcementspage",
        element: <UserAnnouncements />,
      },

    ],
  },
]);

import { AuthProvider } from './contexts/AuthContext';
import { Home } from 'lucide-react';
import MyListings from './pages/user/listings/user/MyListings.tsx';
import BugDashboard from './pages/admin/BugDashboard.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </UserProvider>
  </StrictMode>,
);
