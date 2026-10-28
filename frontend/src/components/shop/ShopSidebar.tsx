import type { ReactNode } from "react";
import categoryHeader from "../../assets/shoppingpage_category_filter_header.svg";
import sortHeader from "../../assets/shoppingpage_sort_filter_header.svg";
import starBg from "../../assets/snugrebel_star_bg.png";
import ShopFilterButton from "./ShopFilterButton";
import {
	CATEGORIES,
	SORT_OPTIONS,
	type Category,
	type SortKey,
} from "../../data/products";

type ShopSidebarProps = {
	sort: SortKey;
	onSortChange: (sort: SortKey) => void;
	category: Category | null; // null means "all categories".
	onCategoryChange: (category: Category | null) => void;
	className?: string;
};

type HeadingArt = {
	src: string;
	width: number;
	height: number;
	textBox: { top: number; right: number; bottom: number; left: number };
	fontSizeCqw: number;
};

/** SVG headings render at this scale proportional to the .svg files in src/assets/ */
const HEADING_SCALE = 0.7;

const SORT_HEADING: HeadingArt = {
	src: sortHeader,
	width: 359,
	height: 118,
	textBox: { top: 17, right: 10, bottom: 32, left: 15.5 },
	fontSizeCqw: 15,
};

const CATEGORY_HEADING: HeadingArt = {
	src: categoryHeader,
	width: 469,
	height: 174,
	textBox: { top: 21, right: 11, bottom: 28, left: 5 },
	fontSizeCqw: 11,
};

function SidebarHeading({
	id,
	art,
	children,
}: {
	id: string;
	art: HeadingArt;
	children: ReactNode;
}) {
	const { top, right, bottom, left } = art.textBox;

	return (
		<div
			className="relative"
			style={{
				aspectRatio: `${art.width} / ${art.height}`,
				width: `min(100%, ${art.width * HEADING_SCALE}px)`,
				containerType: "inline-size",
			}}
		>
			<img
				src={art.src}
				alt=""
				draggable={false}
				className="absolute inset-0 size-full select-none"
			/>
			<h2
				id={id}
				className="absolute flex items-center justify-center whitespace-nowrap text-center font-display font-black leading-none tracking-tight text-white [font-stretch:110%]"
				style={{
					top: `${top}%`,
					right: `${right}%`,
					bottom: `${bottom}%`,
					left: `${left}%`,
					fontSize: `${art.fontSizeCqw}cqw`,
				}}
			>
				{children}
			</h2>
		</div>
	);
}

export default function ShopSidebar({
	sort,
	onSortChange,
	category,
	onCategoryChange,
	className = "",
}: ShopSidebarProps) {
	return (
		<aside
			className={[
				"bg-[#19191c] bg-cover bg-center px-8 py-12 md:pl-[8%]",
				className,
			].join(" ")}
			style={{ backgroundImage: `url(${starBg})` }}
		>
			<div className="md:sticky md:top-[calc(var(--nav-h)+24px)]">
				<section aria-labelledby="shop-sort-heading">
					<SidebarHeading id="shop-sort-heading" art={SORT_HEADING}>
						Sort By:
					</SidebarHeading>
					<div className="mt-4 flex flex-col items-start gap-5">
						{SORT_OPTIONS.map((option) => (
							<ShopFilterButton
								key={option.value}
								label={option.label}
								selected={sort === option.value}
								onClick={() => onSortChange(option.value)}
							/>
						))}
					</div>
				</section>

				<section
					aria-labelledby="shop-category-heading"
					className="mt-12"
				>
					<SidebarHeading
						id="shop-category-heading"
						art={CATEGORY_HEADING}
					>
						CATEGORIES
					</SidebarHeading>
					<div className="mt-4 flex flex-col items-start gap-2">
						{CATEGORIES.filter(
							(option) => option.sidebar !== false,
						).map((option) => (
							<ShopFilterButton
								key={option.value}
								label={option.label}
								selected={category === option.value}
								// clicking the active category again clears the filter
								onClick={() =>
									onCategoryChange(
										category === option.value
											? null
											: option.value,
									)
								}
							/>
						))}
					</div>
				</section>
			</div>
		</aside>
	);
}
