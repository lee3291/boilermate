import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BugReportPage from './pages/bug-report/BugReportPage';

import ListingDetails from './pages/user/listings/ListingDetails.tsx';

// Import all top-level views/components
import ChatPage from './pages/user/chat/ChatPage.tsx';

// Components used for protected areas
import App from './App.tsx'
import OTPRequestPage from "./pages/resetpassword/OTPRequestPage.tsx";
import ResetPasswordPage from './pages/resetpassword/ResetPasswordPage.tsx';
import VerifyOTPPage from './pages/resetpassword/VerifyOTPPage.tsx';
import ListingMap from './pages/listing/ListingMap.tsx';
import ListingForm from './pages/listing/ListingForm.tsx';
import Listings from './pages/user/listings/Listings.tsx'
import TempAccount from './pages/user/listings/temp/TempAccount.tsx';
import { UserProvider } from './pages/user/listings/temp/UserContext.tsx';
import SavedListings from './pages/user/listings/SavedListings';
// import ListingsCreateTest from './pages/user/ListingsTest.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // layout for the homepage
    errorElement: <div>404 Page Not Found</div>,
    children: [
      {
        index: true, // true means default contents of the page
        path: 'idk', // enter path you want
        element: <App /> // should be <Home/>
      },
      // you can add other public page here (About, ...)
    ]

  },

  // login page
  //{},
  // signup page
  //{},

  // admin role here, page related to admin role in here
 // {},

  // user role here, page related to user role in here
  //{},
  // For reset password
  {
        path: '/bug-report',
        element: <BugReportPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOTPPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  // Dashboard
  // Map
  {
    path: "/listing-map",
    element: <ListingMap />,
  },
  {
    path: "/listing-form",
    element: <ListingForm
        isOpen={true}
        onClose={() => console.log('closed')}
    />,
  },
      {
    path: '/listings/',
    element: <Listings/>,
    errorElement: <div>404 Page Not Found</div>,
    children: [{}]
  },
  {
    path: '/listings/:id',
    element: <ListingDetails />
  },
  {
    path: '/saved',
    element: <SavedListings/>
  },
  {
    path: '/temp-account/',
    element: <TempAccount/>,
    errorElement: <div>404 Page Not Found</div>,
    children: [{}]
  },
  {
    path: '/messages',
    element: <ChatPage />
  },
  {
    path: "/otp-request",
    element: <OTPRequestPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOTPPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  // Dashboard
  // Map
  {
    path: "/listing-map",
    element: <ListingMap />,
  },
  {
    path: "/listing-form",
    element: <ListingForm
        isOpen={true}
        onClose={() => console.log('closed')}
    />,
  },
  // NOTES: you can just do a similar setup to test the page you created
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <UserProvider>
          <RouterProvider router={router} />
      </UserProvider>
  </StrictMode>,
)
