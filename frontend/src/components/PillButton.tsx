import type { ComponentPropsWithoutRef } from "react";

export type PillButtonVariant = "black" | "red";

/** Outline pill that fills in on hover. Add a variant here to get a new colour. */
const VARIANTS: Record<PillButtonVariant, string> = {
	black: "border-black text-black enabled:hover:bg-black enabled:hover:text-white focus-visible:outline-black",
	red: "border-brand-red text-brand-red enabled:hover:bg-brand-red enabled:hover:text-white focus-visible:outline-brand-red",
};

type PillButtonProps = ComponentPropsWithoutRef<"button"> & {
	variant?: PillButtonVariant;
};

/**
 * Pill-shaped button. Sizes to its label by default; stretch it with a className
 * from the parent (e.g. `flex-1` or `w-full`).
 */
export default function PillButton({
	variant = "black",
	className = "",
	type = "button",
	children,
	...rest
}: PillButtonProps) {
	return (
		<button
			type={type}
			className={[
				"inline-flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border-2 bg-white px-5",
				"font-display text-[13px] font-extrabold tracking-tight [font-stretch:125%]",
				"transition-colors duration-200",
				"focus-visible:outline-2 focus-visible:outline-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-40",
				VARIANTS[variant],
				className,
			].join(" ")}
			{...rest}
		>
			{children}
		</button>
	);
}
