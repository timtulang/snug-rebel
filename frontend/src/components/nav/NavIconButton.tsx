import type { ComponentPropsWithoutRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import '../../styles/NavIconButton.css'

type NavIconButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
    label: string // accessible name (icon buttons have no visible text)
    icon: LucideIcon // a lucide-react icon component
    active?: boolean // pressed / open state: black circle + white icon
}

export default function NavIconButton({
    label,
    icon: Icon,
    active = false,
    className = '',
    ...rest
}: NavIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            data-active={active || undefined}
            className={['nav-icon-btn', className].join(' ')}
            {...rest}
        >
            <span aria-hidden="true" className="nav-icon-btn__disc" />
            <Icon className="nav-icon-btn__icon" size={20} strokeWidth={2.25} />
        </button>
    )
}