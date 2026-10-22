import { useEffect, useState } from 'react'
import { Search, ShoppingBag, User } from 'lucide-react'
import logo from '../assets/snugrebel_logo_white.svg'
import { useHideOnScroll } from '../hooks/useHideOnScroll.ts'
import { NAV_LINKS, type Page } from '../routes.ts'
import NavButton, { RoughFilter } from './NavButton.tsx'
import NavIconButton from './NavIconButton.tsx'
import ShopMenu from './ShopMenu.tsx'

export type Utility = 'search' | 'cart' | 'account'

type NavBarProps = {
  /** Current page (null on pages that aren't in the nav). Drives the selected style. */
  page: Page | null
  onNavigate: (page: Page) => void
  /** Called when a SHOP dropdown filter is picked (null = all). */
  onShopFilter: (filter: string | null) => void
  /** Fires when a utility icon is toggled on (its name) or off (null). One is active at a time. */
  onUtilityChange?: (utility: Utility | null) => void
}

const LINK_GAP = 'gap-8'

const slide = (hidden: boolean) =>
  [
    'transition-transform duration-300 ease-out motion-reduce:transition-none',
    hidden ? 'translate-y-(--nav-hide-shift)' : 'translate-y-0',
  ].join(' ')

export default function NavBar({ page, onNavigate, onShopFilter, onUtilityChange }: NavBarProps) {
  const scrolledAway = useHideOnScroll()
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [activeUtility, setActiveUtility] = useState<Utility | null>(null)

  const hidden = scrolledAway && !shopMenuOpen && !keyboardFocus

  const toggleUtility = (utility: Utility) => {
    const next = activeUtility === utility ? null : utility
    setActiveUtility(next)
    onUtilityChange?.(next)
  }

  useEffect(() => {
    if (!activeUtility) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setActiveUtility(null)
      onUtilityChange?.(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeUtility, onUtilityChange])

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 text-black font-display"
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setKeyboardFocus(false)
      }}
    >
      <RoughFilter />

      <div
        aria-hidden="true"
        className={[
          'pointer-events-auto absolute inset-x-0 top-0 h-(--nav-h) bg-white shadow-[0_2px_0_rgba(0,0,0,0.08)]',
          slide(hidden),
        ].join(' ')}
      />

      <nav
        aria-label="Main"
        className="relative grid h-(--nav-h) grid-cols-[1fr_auto_1fr] items-center px-(--nav-edge)"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('home')
          }}
          aria-label="Snug Rebel, home"
          className={[
            'pointer-events-auto justify-self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black',
            slide(hidden),
          ].join(' ')}
        >
          <img src={logo} alt="" className="h-(--nav-logo-h) w-auto brightness-0" draggable={false} />
        </a>

        <ul className={['pointer-events-auto flex items-center', LINK_GAP, slide(hidden)].join(' ')}>
          {NAV_LINKS.map(({ page: target, label }) => (
            <li key={target}>
              {target === 'shop' ? (
                <ShopMenu
                  label={label}
                  selected={page === target}
                  onFilter={onShopFilter}
                  onOpenChange={setShopMenuOpen}
                />
              ) : (
                <NavButton
                  label={label}
                  selected={page === target}
                  onClick={() => onNavigate(target)}
                />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end">
          <NavIconButton
            label="Search"
            icon={Search}
            active={activeUtility === 'search'}
            onClick={() => toggleUtility('search')}
            className={['pointer-events-auto', slide(hidden)].join(' ')}
          />

          <div
            className={[
              'pointer-events-auto flex size-16 items-center justify-center rounded-full bg-white',
              'transition-[translate,box-shadow] duration-300 ease-out motion-reduce:transition-none',
              hidden
                ? 'translate-x-(--cart-dock-x) shadow-[0_2px_0_rgba(0,0,0,0.2)] translate-y-4'
                : 'translate-x-0 shadow-none',
            ].join(' ')}
          >
            <NavIconButton
              label="Cart"
              icon={ShoppingBag}
              active={activeUtility === 'cart'}
              onClick={() => toggleUtility('cart')}
            />
          </div>

          <div className={['pointer-events-auto relative', slide(hidden)].join(' ')}>
            <NavIconButton
              label="Account"
              icon={User}
              active={activeUtility === 'account'}
              onClick={() => toggleUtility('account')}
            />

            {activeUtility === 'account' && (
              <div className="absolute right-0 top-full mt-2 w-48 flex flex-col bg-white border-[4px] border-black z-50 py-4 origin-top-right animate-in fade-in zoom-in duration-200 ease-out">
                <button 
                  onClick={() => {
                    toggleUtility('account');
                    // Route to Log In
                    onNavigate('login' as Page);
                  }}
                  className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest text-black hover:text-[#e60000] transition-colors focus:outline-none focus:text-[#e60000]"
                >
                  Log In
                </button>
                <button 
                  onClick={() => {
                    toggleUtility('account');
                    // Route to Sign Up
                    onNavigate('signup' as Page);
                  }}
                  className="px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest text-black hover:text-[#e60000] transition-colors focus:outline-none focus:text-[#e60000]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  )
}