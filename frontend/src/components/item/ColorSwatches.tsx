import type { ItemColor } from "../../api/items";

type ColorSwatchesProps = {
	colors: ItemColor[];
	/** Name of the selected color. */
	value: string;
	onChange: (name: string) => void;
	/** id of the visible label element. */
	labelledBy?: string;
	className?: string;
};

/** Round color picker (single choice). */
export default function ColorSwatches({
	colors,
	value,
	onChange,
	labelledBy,
	className = "",
}: ColorSwatchesProps) {
	return (
		<div
			role="radiogroup"
			aria-labelledby={labelledBy}
			className={["flex flex-wrap gap-3 p-1", className].join(" ")}
		>
			{colors.map((color) => {
				const selected = color.name === value;
				return (
					<button
						key={color.name}
						type="button"
						role="radio"
						aria-checked={selected}
						aria-label={color.name}
						title={color.name}
						onClick={() => onChange(color.name)}
						style={{ backgroundColor: color.hex }}
						className={[
							"size-12 cursor-pointer rounded-full border-2 border-black/20 sm:size-14",
							"outline-offset-4 transition-[outline-color] focus-visible:outline-3",
							selected
								? "outline-3 outline-black"
								: "outline-0 focus-visible:outline-brand-red-dark",
						].join(" ")}
					/>
				);
			})}
		</div>
	);
}
