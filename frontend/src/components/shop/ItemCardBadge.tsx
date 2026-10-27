export type ItemBadgeVariant = 'new' | 'sale' | 'lowStock' | 'outOfStock' | 'none'

type VisibleVariant = Exclude<ItemBadgeVariant, 'none'>

const BADGES: Record<VisibleVariant, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-brand-green' },
    sale: { label: 'On sale', color: 'bg-brand-red' },
    lowStock: { label: 'Low stock', color: 'bg-brand-orange' },
    outOfStock: { label: 'Out of stock', color: 'bg-black' },
}

type ItemCardBadgeProps = {
    variant: ItemBadgeVariant
    /** Position it from the parent, e.g. "absolute left-0 top-0". */
    className?: string
}

/** Small label for an item. The "none" variant renders nothing. */
export default function ItemCardBadge({ variant, className = '' }: ItemCardBadgeProps) {
    if (variant === 'none') return null

    const { label, color } = BADGES[variant]

    return (
        <span
            className={[
                'inline-block whitespace-nowrap px-2 py-1.5 font-display text-[10px] font-extrabold uppercase leading-none tracking-tight text-white [font-stretch:125%]',
                color,
                className,
            ].join(' ')}
        >
            {label}
        </span>
    )
}