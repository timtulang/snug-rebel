import { createSearchParams, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import NavBar from '../components/nav/NavBar.tsx'
import { pageFromPath, ROUTES } from '../routes.ts'

/** Wraps every page: the nav bar on top, the current page below it. Connects the nav to the router. */
export default function RootLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const goToShop = (filter: string | null) =>
    navigate({
      pathname: ROUTES.shop,
      search: filter ? `?${createSearchParams({ filter }).toString()}` : '',
    })

  return (
    <>
      <NavBar
        page={pageFromPath(pathname)}
        onNavigate={(page) => navigate(ROUTES[page])}
        onShopFilter={goToShop}
      />

      {/* the bar is fixed, so push the page down by its height */}
      <main className="pt-(--nav-h)">
        <Outlet />
        <ScrollRestoration />
      </main>
    </>
  )
}