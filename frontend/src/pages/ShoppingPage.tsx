import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PillButton from "../components/ui/PillButton";
import ShopItemCard from "../components/shop/ShopItemCard";
import ShopSidebar from "../components/shop/ShopSidebar";
import { itemPath } from "../routes";
import {
	CATEGORIES,
	PRODUCTS,
	type Category,
	type Product,
	type SortKey,
} from "../data/products";

const effectivePrice = (p: Product) => p.salePrice ?? p.price;

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
	"best-selling": (a, b) => b.soldCount - a.soldCount,
	"name-asc": (a, b) => a.name.localeCompare(b.name),
	"name-desc": (a, b) => b.name.localeCompare(a.name),
	"price-asc": (a, b) => effectivePrice(a) - effectivePrice(b),
	"price-desc": (a, b) => effectivePrice(b) - effectivePrice(a),
};

export default function Shop() {
	const [sort, setSort] = useState<SortKey>("best-selling");

	// The category lives in the URL (/shop?filter=tops) so the nav dropdown can link straight to it.
	const [searchParams, setSearchParams] = useSearchParams();
	const categoryParam = searchParams.get("filter");
	const category: Category | null =
		CATEGORIES.find((c) => c.value === categoryParam)?.value ?? null;
	const setCategory = (next: Category | null) =>
		setSearchParams(next ? { filter: next } : {});

	const products = useMemo(() => {
		const filtered = category
			? PRODUCTS.filter((p) => p.categories.includes(category))
			: PRODUCTS;
		return [...filtered].sort(SORTERS[sort]);
	}, [sort, category]);

	// TODO: hook these up to your cart / checkout.
	const handleBuyNow = (product: Product) =>
		console.log("buy now", product.id);
	const handleAddToCart = (product: Product) =>
		console.log("add to cart", product.id);

	return (
		<div>
			<div className="grid min-h-[calc(100vh-var(--nav-h))] md:grid-cols-[minmax(280px,32%)_1fr]">
				<ShopSidebar
					sort={sort}
					onSortChange={setSort}
					category={category}
					onCategoryChange={setCategory}
				/>

				<section
					aria-label="Products"
					className="bg-neutral-200 px-6 pb-16 pt-8 md:px-10"
				>
					{products.length > 0 ? (
						<ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-6 gap-y-6">
							{products.map((product) => (
								<li key={product.id}>
									<ShopItemCard
										imageSrc={product.imageSrc}
										name={product.name}
										price={product.price}
										salePrice={product.salePrice}
										rating={product.rating}
										reviewCount={product.reviewCount}
										soldCount={product.soldCount}
										stockLeft={product.stockLeft}
										badge={product.badge}
										onBuyNow={() => handleBuyNow(product)}
										onAddToCart={() =>
											handleAddToCart(product)
										}
										href={itemPath(product.id)}
									/>
								</li>
							))}
						</ul>
					) : (
						<div className="flex flex-col items-start gap-4 pt-16">
							<p className="font-display text-xl font-extrabold [font-stretch:125%]">
								No items in this category yet.
							</p>
							<PillButton onClick={() => setCategory(null)}>
								Show all items
							</PillButton>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
