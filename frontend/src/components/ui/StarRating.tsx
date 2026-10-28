import { Star } from "lucide-react";

type StarRatingProps = {
	/** 0 to 5. Fractions fill the star partway (4.5 = four and a half stars). */
	value: number;
	/** Star size in px. */
	size?: number;
	className?: string;
};

/** Five stars, filled to `value`. */
export default function StarRating({
	value,
	size = 16,
	className = "",
}: StarRatingProps) {
	return (
		<span
			role="img"
			aria-label={`${value.toFixed(1)} out of 5 stars`}
			className={["inline-flex items-center gap-0.5", className].join(
				" ",
			)}
		>
			{Array.from({ length: 5 }, (_, i) => {
				const filled = Math.min(1, Math.max(0, value - i));
				return (
					<span
						key={i}
						className="relative inline-block shrink-0"
						style={{ width: size, height: size }}
					>
						<Star
							size={size}
							aria-hidden="true"
							className="absolute inset-0 fill-neutral-300 text-neutral-300"
						/>
						<span
							className="absolute inset-y-0 left-0 overflow-hidden"
							style={{ width: `${filled * 100}%` }}
						>
							<Star
								size={size}
								aria-hidden="true"
								className="max-w-none fill-amber-400 text-amber-400"
							/>
						</span>
					</span>
				);
			})}
		</span>
	);
}
