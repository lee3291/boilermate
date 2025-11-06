import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';



import ListingDetails from './pages/user/listings/ListingDetails.tsx';

// Import all top-level views/components
import ChatPage from './pages/user/chat/ChatPage.tsx';

// Auth pages
import LandingPage from './pages/public/LandingPage';
import SignInPage from './pages/public/SignInPage';
import SignUpPage from './pages/public/SignUpPage';

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
import BugReportPage from './pages/bug-report/BugReportPage.tsx';
import ReportPage from './pages/report/ReportPage.tsx';
import ReportTestPage from './pages/report/ReportTestPage.tsx';
// import ListingsCreateTest from './pages/user/ListingsTest.tsx';

import ProtectedRoute from './components/ProtectedRoute';
import UserProfilePage from './pages/user/UserProfilePage';
// Updated: Renamed from PreferencesPage to ProfilePage (better semantic naming)
import ProfilePage from './pages/user/profile/ProfilePage.tsx';
import RoommatesPage from './pages/user/roommates/RoommatesPage.tsx';
import ProfileViewPage from './pages/user/roommates/ProfileViewPage.tsx';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
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

  // Protected routes
  {
    // element: <ProtectedRoute />,
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
      {
        path: '/bug-report',
        element: <BugReportPage />,
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
        element: <ReportTestPage/>,
      },
      {
        path: '/user-reports',
        element: <UserReportsDashboard />,
      },
      {
        path: '/bug-reports',
        element: <BugReportsDashboard />,
      },
    ],
  },
]);

import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      {/* <AuthProvider> */}
        <RouterProvider router={router} />
      {/* </AuthProvider> */}
    </UserProvider>
  </StrictMode>,
)
