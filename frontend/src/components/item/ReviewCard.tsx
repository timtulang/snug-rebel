import type { Review } from "../../api/items";
import StarRating from "../ui/StarRating";

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});

function VerifiedIcon() {
	return (
		<span
			role="img"
			aria-label="Verified buyer"
			title="Verified buyer"
			className="inline-flex"
		>
			<svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
				<circle cx="10" cy="10" r="10" fill="#22c55e" />
				<path
					d="M5.5 10.5l3 3 6-6.5"
					fill="none"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</span>
	);
}

/** One customer review. */
export default function ReviewCard({ review }: { review: Review }) {
	return (
		<article className="flex h-full flex-col rounded-2xl border border-brand-red-dark/40 bg-white px-7 py-6">
			<StarRating value={review.rating} size={20} />

			<h3 className="mt-3 flex items-center gap-2 font-display text-base font-bold">
				{review.author}
				{review.verified && <VerifiedIcon />}
			</h3>

			<p className="mt-3 flex-1 text-[13px] leading-relaxed text-neutral-600">
				“{review.body}”
			</p>

			<p className="mt-5 text-[13px] text-neutral-600">
				Posted on{" "}
				<time dateTime={review.postedAt}>
					{formatDate(review.postedAt)}
				</time>
			</p>
		</article>
	);
}
