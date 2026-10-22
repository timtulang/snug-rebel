import type { ComponentPropsWithoutRef } from "react";
import { ShoppingBag } from "lucide-react";

type AddToCartButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"children"
> & {
	label?: string;
};

export default function AddToCartButton({
	label = "Add to cart",
	className = "",
	type = "button",
	...rest
}: AddToCartButtonProps) {
	return (
		<button
			type={type}
			aria-label={label}
			title={label}
			className={[
				"inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black text-white",
				"transition-transform duration-200 enabled:hover:scale-110 enabled:active:scale-95",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
				"disabled:cursor-not-allowed disabled:opacity-40",
				className,
			].join(" ")}
			{...rest}
		>
			<ShoppingBag size={16} strokeWidth={2.25} aria-hidden="true" />
		</button>
	);
}
