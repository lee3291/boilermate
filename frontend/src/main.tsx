import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import all top-level views/components
import ChatPage from './pages/user/chat/ChatPage.tsx';

// Components used for protected areas
import App from './App.tsx'

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

  },

  {
    path: '/messages',
    element: <ChatPage />
  }

  // NOTES: you can just do a similar setup to test the page you created
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
