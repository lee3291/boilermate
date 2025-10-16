import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ListingDetails from './pages/user/listings/ListingDetails.tsx';

// Import all top-level views/components

// Components used for protected areas
import App from './App.tsx'
import Listings from './pages/user/listings/Listings.tsx'
import TempAccount from './pages/user/listings/temp/TempAccount.tsx';
import { UserProvider } from './pages/user/listings/temp/UserContext.tsx';
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
      {
        // do similar for other page
      }
      // you can add other public page here (About, ...)
    ]
  },

  // login page
  {},
  // signup page
  {},

  // admin role here, page related to admin role in here
  {

  },

  // user role here, page related to user role in here
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
    path: '/temp-account/',
    element: <TempAccount/>,
    errorElement: <div>404 Page Not Found</div>,
    children: [{}]
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
