import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import NavButton from './NavButton.tsx'

// Placeholder filters: replace with the real ones.
const DEFAULT_FILTERS = ['New arrivals', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']

const itemClass =
  'block w-full px-5 py-2 text-left font-display text-base font-extrabold uppercase tracking-tight [font-stretch:125%] hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:outline-none'

type ShopMenuProps = {
  label: string
  /** True on the shop page: the chevron and dropdown go away and the button just opens the shop. */
  selected: boolean
  filters?: string[]
  /** Called with a filter name, or null for "all". */
  onFilter: (filter: string | null) => void
  /** Lets the nav bar stay visible while the dropdown is open. */
  onOpenChange?: (open: boolean) => void
}

/** The SHOP link plus its filter dropdown. */
export default function ShopMenu({
  label,
  selected,
  filters = DEFAULT_FILTERS,
  onFilter,
  onOpenChange,
}: ShopMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const hasDropdown = !selected
  const isOpen = hasDropdown && open

  const changeOpen = useCallback(
    (next: boolean) => {
      setOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const pick = (filter: string | null) => {
    changeOpen(false)
    onFilter(filter)
  }

  // close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) changeOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && changeOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, changeOpen])

  const items: (string | null)[] = [null, ...filters]

  return (
    <div ref={rootRef} className="relative">
      <NavButton
        label={label}
        selected={selected}
        trailing={hasDropdown ? <ChevronDown size={14} strokeWidth={3} /> : undefined}
        aria-haspopup={hasDropdown ? 'menu' : undefined}
        aria-expanded={hasDropdown ? isOpen : undefined}
        onClick={() => (hasDropdown ? changeOpen(!isOpen) : pick(null))}
      />

      {isOpen && (
        <ul
          role="menu"
          // starts just below the bar (this wrapper is vertically centred in it)
          style={{ top: 'calc(50% + var(--nav-h) / 2 + 8px)' }}
          className="absolute left-1/2 min-w-52 -translate-x-1/2 border-[3px] border-black bg-white py-2"
        >
          {items.map((filter) => (
            <li key={filter ?? 'all'} role="none">
              <button role="menuitem" type="button" className={itemClass} onClick={() => pick(filter)}>
                {filter ?? 'All'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}