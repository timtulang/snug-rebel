import reviewsHeader from "../../assets/shoppingpage_reviews_header.svg";
import type { Review } from "../../api/items";
import ReviewCard from "./ReviewCard";

/** The SVG's viewBox is 245 x 89. The text sits inside its red shape, as % of the SVG's size. */
const HEADER = {
	width: 245,
	height: 89,
	top: 19,
	right: 13,
	bottom: 20,
	left: 14,
	fontSizeCqw: 17,
};

type ReviewsSectionProps = {
	reviews: Review[];
	className?: string;
};

/** "Reviews" header (on its SVG container) and the grid of review cards. */
export default function ReviewsSection({
	reviews,
	className = "",
}: ReviewsSectionProps) {
	return (
		<section aria-labelledby="reviews-heading" className={className}>
			<div
				className="relative"
				style={{
					aspectRatio: `${HEADER.width} / ${HEADER.height}`,
					width: `min(100%, ${HEADER.width}px)`,
					containerType: "inline-size",
				}}
			>
				<img
					src={reviewsHeader}
					alt=""
					draggable={false}
					className="absolute inset-0 size-full select-none"
				/>
				<h2
					id="reviews-heading"
					className="absolute flex items-center justify-center whitespace-nowrap font-display font-bold leading-none tracking-tight text-white [font-stretch:70%]"
					style={{
						top: `${HEADER.top}%`,
						right: `${HEADER.right}%`,
						bottom: `${HEADER.bottom}%`,
						left: `${HEADER.left}%`,
						fontSize: `${HEADER.fontSizeCqw}cqw`,
					}}
				>
					Reviews
				</h2>
			</div>

			{reviews.length > 0 ? (
				<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
					{reviews.map((review) => (
						<li key={review.id}>
							<ReviewCard review={review} />
						</li>
					))}
				</ul>
			) : (
				<p className="mt-6 font-display text-neutral-600 lg:px-12">
					No reviews yet.
				</p>
			)}
		</section>
	);
}
