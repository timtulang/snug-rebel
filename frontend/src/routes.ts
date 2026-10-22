export const ROUTES = {
  home: '/',
  shop: '/shop',
  about: '/about',
  orders: '/orders',
  login: '/login',
  signup: '/signup',
} as const;

export type Page = keyof typeof ROUTES;

/** Main nav links, in display order. Add a page here (and in ROUTES) and it shows up in the bar. */
export const NAV_LINKS: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'shop', label: 'Shop' },
  { page: 'about', label: 'About' },
  // Removed login and signup from here so they only show in your Account dropdown
];

/** Which nav page a URL belongs to (so /shop/tops still highlights Shop). null = none. */
export function pageFromPath(pathname: string): Page | null {
  const pages = Object.keys(ROUTES) as Page[];
  const match = pages.find((page) => {
    const path = ROUTES[page];
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  });
  return match ?? null;
}