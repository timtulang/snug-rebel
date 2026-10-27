import type { ComponentPropsWithoutRef } from "react";

export type AngledButtonVariant = "buyNow" | "addToBag";

/**
 * Each variant has its own jagged outline (points in a 0-100 box, stretched to the button's size)
 * and its own resting style. Hover swaps it: "buyNow" fills in, "addToBag" turns into an outline,
 * and both get a black drop shadow.
 */
const VARIANTS: Record<
	AngledButtonVariant,
	{ points: string; fill: string; label: string }
> = {
	buyNow: {
		points: "2,22 94,8 100,62 90,96 6,100",
		fill: "fill-white group-hover:fill-brand-red-dark",
		label: "text-brand-red-dark group-hover:text-white",
	},
	addToBag: {
		points: "0,6 88,0 100,60 96,100 0,100",
		fill: "fill-brand-red-dark group-hover:fill-white",
		label: "text-white group-hover:text-brand-red-dark",
	},
};

type AngledButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children"
> & {
	variant: AngledButtonVariant;
	children: string;
};

/** Chunky hand-cut button used for "Buy Now" and "Add to Bag". Size it from the parent with className. */
export default function AngledButton({
	variant,
	className = "",
	type = "button",
	children,
	...rest
}: AngledButtonProps) {
	const { points, fill, label } = VARIANTS[variant];

	return (
		<button
			type={type}
			className={[
				"group relative inline-flex h-14 cursor-pointer items-center justify-center px-8",
				"font-display text-[1.15rem] font-extrabold tracking-tight [font-stretch:125%]",
				"transition-transform duration-150 active:translate-y-px",
				"focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black",
				"disabled:pointer-events-none disabled:opacity-40",
				className,
			].join(" ")}
			{...rest}
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				className="absolute inset-0 size-full overflow-visible"
			>
				{/* drop shadow, only visible on hover */}
				<polygon
					points={points}
					transform="translate(3 10)"
					className="fill-black opacity-0 transition-opacity duration-150 group-hover:opacity-100"
				/>
				<polygon
					points={points}
					strokeWidth={3}
					strokeLinejoin="miter"
					vectorEffect="non-scaling-stroke"
					className={[
						"stroke-brand-red-dark transition-[fill] duration-150",
						fill,
					].join(" ")}
				/>
			</svg>

			<span
				className={[
					"relative whitespace-nowrap transition-colors duration-150",
					label,
				].join(" ")}
			>
				{children}
			</span>
		</button>
	);
}
