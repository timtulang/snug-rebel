import { createBrowserRouter } from 'react-router'
import { ROUTES } from './routes.ts'
import RootLayout from './layouts/RootLayout.tsx'
import LandingPage from './pages/LandingPage.tsx'
import PlaceholderPage from './pages/PlaceholderPage.tsx'
import OrderTrackingPage from './pages/OrderTrackingPage.tsx'

/** Route table. Swap each PlaceholderPage for the real page when it is made. */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.home, element: <LandingPage /> },
      { path: ROUTES.shop, element: <PlaceholderPage title="Shop" /> },
      { path: ROUTES.about, element: <PlaceholderPage title="About" /> },
      { path: ROUTES.tracking, element: <OrderTrackingPage/> },
      { path: '*', element: <PlaceholderPage title="Page not found" /> },
    ],
  },
])