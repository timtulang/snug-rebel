import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import '../../styles/NavButton.css'

export const ROUGH_FILTER_ID = 'button-rough-edge'

// Stamp geometry (px). Keep --inset in NavButton.css = GAP + STROKE + 1
const STAMP_GAP = 4 // empty space between the black box and the outer stroke
const STAMP_STROKE = 3 // thickness of the outer black stroke

/**
 * One filter does everything:
 *  1. roughens the whole stamp layer (fill + marker) in a single pass
 *     (3 displacement layers: wobble -> chips -> grain)
 *  2. reads the "selected" marker (red channel) to get the rough silhouette
 *  3. grows that silhouette outward twice (feMorphology dilate) to build an
 *     outer black stroke that follows the exact same rough edge
 *  4. paints the black box itself on top
 *  5. softens the stair-stepped edges (slight anti-aliasing)
 *  6. ???
 *  7. profit (only for genius)
 *
 * Tuning knobs are noted with TUNING in the comments below:
 */
export function RoughFilter() {
    return (
        <svg width="0" height="0" aria-hidden="true" className="absolute">
            <defs>
                <filter
                    id={ROUGH_FILTER_ID}
                    x="-20%"
                    y="-50%"
                    width="140%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                >
                    {/* 1a. slow wobble: wavy, uneven edges.
                        TUNING: scale (big waviness) */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.03 0.045"
                        numOctaves="2"
                        seed="42"
                        result="wobbleNoise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="wobbleNoise"
                        scale="20"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="wobble"
                    />

                    {/* 1b. mid-frequency chips: small bites out of the edge.
                        TUNING: scale (chunkiness) */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.14"
                        numOctaves="2"
                        seed="11"
                        result="chipNoise"
                    />
                    <feDisplacementMap
                        in="wobble"
                        in2="chipNoise"
                        scale="5"
                        xChannelSelector="G"
                        yChannelSelector="B"
                        result="chips"
                    />

                    {/* 1c. fine grain: torn / jagged detail.
                        TUNING: scale (fine jaggedness) */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="1"
                        seed="3"
                        result="grainNoise"
                    />
                    <feDisplacementMap
                        in="chips"
                        in2="grainNoise"
                        scale="3.5"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="rough"
                    />

                    {/* 2. gets the silhouette of the selected state: alpha = red channel */}
                    <feColorMatrix
                        in="rough"
                        type="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                        result="shape"
                    />

                    {/* 3. grow the rough silhouette outward */}
                    <feMorphology
                        in="shape"
                        operator="dilate"
                        radius={STAMP_GAP}
                        result="gapZone"
                    />
                    <feMorphology
                        in="shape"
                        operator="dilate"
                        radius={STAMP_GAP + STAMP_STROKE}
                        result="outerZone"
                    />

                    {/* outer stroke = outer zone minus gap zone (gap stays transparent) */}
                    <feFlood floodColor="#000" result="black" />
                    <feComposite in="black" in2="outerZone" operator="in" result="outerBlack" />
                    <feComposite in="outerBlack" in2="gapZone" operator="out" result="stroke" />

                    {/* 4. the black box itself (drops the red marker colour) */}
                    <feColorMatrix
                        in="rough"
                        type="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                        result="core"
                    />

                    <feMerge result="stamp">
                        <feMergeNode in="stroke" />
                        <feMergeNode in="core" />
                    </feMerge>

                    {/* 5. slight anti-aliasing: tiny blur, then re-sharpen the alpha.
                        TUNING: stdDeviation (lower = crisp; higher = softer) */}
                    <feGaussianBlur
                        in="stamp"
                        stdDeviation="1.2"
                        result="soft"
                    />
                    <feComponentTransfer in="soft">
                        {/* alpha' = 5a - 2  ->  edge transition ~0.2 wide; lower slope = softer */}
                        <feFuncA type="linear" slope="5" intercept="-2" />
                    </feComponentTransfer>
                </filter>
            </defs>
        </svg>
    )
}

type NavButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
    label: string // text to display in the button
    selected?: boolean // whether the button is currently selected
    trailing?: ReactNode // small icon after the label (e.g. the shop chevron). Sits in the right padding, so it never changes the button's width
}

export default function NavButton({
    label,
    selected = false,
    trailing,
    className = '',
    ...rest
}: NavButtonProps) {
    return (
        <button
            type="button"
            aria-current={selected ? 'page' : undefined}
            data-selected={selected || undefined}
            className={[
                'nav-btn relative inline-flex cursor-pointer items-center justify-center',
                'bg-transparent px-6 py-4 text-black outline-none',
                'font-display text-[19px] font-extrabold uppercase leading-none tracking-tight [font-stretch:125%]',
                className,
            ].join(' ')}
            {...rest}
        >
            <span
                aria-hidden="true"
                className="nav-btn__stamp"
                style={{ filter: `url(#${ROUGH_FILTER_ID})` }}
            >
                <span className="nav-btn__fill" />
            </span>

            <span className="nav-btn__label">{label}</span>
            {trailing && <span className="nav-btn__trailing">{trailing}</span>}
        </button>
    )
}