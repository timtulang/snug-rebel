import { Minus, Plus } from "lucide-react";

type QuantityStepperProps = {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max: number;
	labelledBy?: string;
	className?: string;
};

const stepButton =
	"inline-flex size-7 shrink-0 cursor-pointer items-center justify-center bg-brand-red-dark text-white " +
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black " +
	"disabled:cursor-not-allowed disabled:opacity-40";

/** Minus / number / plus. The number can also be typed. Stays between `min` and `max`. */
export default function QuantityStepper({
	value,
	onChange,
	min = 1,
	max,
	labelledBy,
	className = "",
}: QuantityStepperProps) {
	const clamp = (n: number) => Math.min(Math.max(n, min), Math.max(max, min));

	return (
		<div
			role="group"
			aria-labelledby={labelledBy}
			className={["flex items-center gap-4", className].join(" ")}
		>
			<button
				type="button"
				aria-label="Decrease quantity"
				className={stepButton}
				disabled={value <= min}
				onClick={() => onChange(clamp(value - 1))}
			>
				<Minus size={14} strokeWidth={3} aria-hidden="true" />
			</button>

			<input
				type="text"
				inputMode="numeric"
				aria-label="Quantity"
				value={value}
				onChange={(e) => {
					const digits = e.target.value.replace(/\D/g, "");
					onChange(clamp(digits ? parseInt(digits, 10) : min));
				}}
				className="h-14 w-14 border-[3px] border-brand-red-dark bg-white text-center font-display text-4xl font-bold [font-stretch:62%] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:h-16"
			/>

			<button
				type="button"
				aria-label="Increase quantity"
				className={stepButton}
				disabled={value >= max}
				onClick={() => onChange(clamp(value + 1))}
			>
				<Plus size={14} strokeWidth={3} aria-hidden="true" />
			</button>
		</div>
	);
}
