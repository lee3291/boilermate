import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; 

// Import all top-level views/components

// Components used for protected areas
import App from './App.tsx'
import OTPRequestPage from "./pages/resetpassword/OTPRequestPage.tsx";
import ResetPasswordPage from './pages/resetpassword/ResetPasswordPage.tsx';
import VerifyOTPPage from './pages/resetpassword/VerifyOTPPage.tsx';

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
  // NOTES: you can just do a similar setup to test the page you created
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
