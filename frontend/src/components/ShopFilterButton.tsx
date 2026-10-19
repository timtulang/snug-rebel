import { useState, type ComponentPropsWithoutRef, type ReactNode, type MouseEvent } from 'react'
import '../styles/ShopFilterButton.css'

type ShopFilterButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
    label?: string // text to display in the button (matches NavButton convention)
    text?: string // alias for label so <ShopFilterButton text="..." /> also works
    selected?: boolean // optional controlled selected state
    defaultSelected?: boolean // initial state when uncontrolled
    trailing?: ReactNode // defaults to the star icon
}

const DefaultStarIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
)

export default function ShopFilterButton({
    label,
    text,
    selected: controlledSelected,
    defaultSelected = false,
    trailing = DefaultStarIcon,
    className = '',
    onClick,
    ...rest
}: ShopFilterButtonProps) {
    const [internalSelected, setInternalSelected] = useState(defaultSelected)

    // Use controlled prop if passed; otherwise fall back to internal toggle state
    const isSelected = controlledSelected !== undefined ? controlledSelected : internalSelected
    const displayText = label ?? text ?? 'FILTER'

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (controlledSelected === undefined) {
            setInternalSelected((prev) => !prev)
        }
        onClick?.(e)
    }

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            data-selected={isSelected || undefined}
            onClick={handleClick}
            className={[
                'shop-filter-btn relative inline-flex w-fit cursor-pointer items-center justify-start',
                // pl-7 left-aligns the text; pr-14 reserves room on the right for the star
                'bg-transparent pl-7 pr-14 py-3 outline-none',
                'font-display text-[19px] font-extrabold uppercase leading-none tracking-tight [font-stretch:125%]',
                className,
            ].join(' ')}
            style={{ minHeight: '52px' }}
            {...rest}
        >
            <svg
                aria-hidden="true"
                className="shop-filter-btn__stamp"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
            >
                {/*
                  Uneven polygon matching reference images:
                  Top edge slopes slightly up toward the right (4,12 -> 100,4).
                  Left edge slants outward toward the bottom-left (4,12 -> 0,94).
                  Bottom edge slopes slightly down toward the right (0,94 -> 100,98).
                */}
                <polygon
                    className="shop-filter-btn__shadow"
                    points="4,12 100,4 100,98 0,94"
                />
                <polygon
                    className="shop-filter-btn__fill"
                    points="4,12 100,4 100,98 0,94"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            <span className="shop-filter-btn__label">{displayText}</span>
            {trailing && <span className="shop-filter-btn__trailing">{trailing}</span>}
        </button>
    )
}