import type { ItemSize } from "../../api/items";

type SizeSelectorProps = {
	sizes: ItemSize[];
	/** Label of the selected size. */
	value: string;
	onChange: (label: string) => void;
	/** id of the visible label element. */
	labelledBy?: string;
	className?: string;
};

/** Square size picker (single choice). Unavailable sizes are struck through and can't be picked. */
export default function SizeSelector({
	sizes,
	value,
	onChange,
	labelledBy,
	className = "",
}: SizeSelectorProps) {
	return (
		<div
			role="radiogroup"
			aria-labelledby={labelledBy}
			className={["flex flex-wrap gap-3 p-1", className].join(" ")}
		>
			{sizes.map((size) => {
				const selected = size.label === value;
				return (
					<button
						key={size.label}
						type="button"
						role="radio"
						aria-checked={selected}
						disabled={!size.available}
						title={size.available ? undefined : "Out of stock"}
						onClick={() => onChange(size.label)}
						className={[
							"flex h-14 w-16 cursor-pointer items-center justify-center border-2 bg-white sm:h-16 sm:w-[4.5rem]",
							"font-display text-3xl font-bold uppercase [font-stretch:62%]",
							"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
							"disabled:cursor-not-allowed disabled:line-through",
							selected
								? "border-brand-red-dark text-black"
								: "border-neutral-300 text-neutral-300 enabled:hover:text-neutral-500",
						].join(" ")}
					>
						{size.label}
					</button>
				);
			})}
		</div>
	);
}
