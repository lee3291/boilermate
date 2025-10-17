import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BugReportPage from './pages/bug-report/BugReportPage';

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
// import ListingsCreateTest from './pages/user/ListingsTest.tsx';

import UserProfilePage from './pages/user/UserProfilePage';

const router = createBrowserRouter([
  // Auth Routes
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
    path: '/profile',
    element: <UserProfilePage />,
  },

  // Existing App Routes
  {
    path: '/bug-report',
    element: <BugReportPage />,
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
  // Dashboard
  // Map
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
    path: '/listings/',
    element: <Listings />,
    errorElement: <div>404 Page Not Found</div>,
    children: [{}],
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
    path: '/temp-account/',
    element: <TempAccount />,
    errorElement: <div>404 Page Not Found</div>,
    children: [{}],
  },
  {
    path: '/messages',
    element: <ChatPage />,
  },
]);

import { AuthProvider } from './contexts/AuthContext';
// ...existing code...
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </UserProvider>
  </StrictMode>,
);
