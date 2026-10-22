/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "../data/products.ts";
import NavButton from "./NavButton.tsx";

const itemClass =
	"block w-full px-5 py-2 text-left font-display text-base font-extrabold uppercase tracking-tight [font-stretch:125%] hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:outline-none";

const CLOSE_DELAY_MS = 150;

type ShopMenuFilter = { value: string; label: string };

type ShopMenuProps = {
	label: string;
	selected: boolean; // Set to true when the current page is the shop page itself.
	filters?: ShopMenuFilter[]; // Dropdown entries.
	/** Called with a filter value, or null for "All" (also what clicking the SHOP button itself does). */
	onFilter: (filter: string | null) => void;
	onOpenChange?: (open: boolean) => void;
};

/** The SHOP link plus its filter dropdown. Hover (or keyboard focus) opens it; clicking SHOP goes to "All". No dropdown on the shop page itself. */
export default function ShopMenu({
	label,
	selected,
	filters = CATEGORIES,
	onFilter,
	onOpenChange,
}: ShopMenuProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const closeTimer = useRef<number | undefined>(undefined);

	const hasDropdown = !selected;
	const isOpen = hasDropdown && open;

	const changeOpen = useCallback(
		(next: boolean) => {
			setOpen(next);
			onOpenChange?.(next);
		},
		[onOpenChange],
	);

	const cancelClose = () => window.clearTimeout(closeTimer.current);
	const openMenu = () => {
		if (!hasDropdown) return;
		cancelClose();
		changeOpen(true);
	};
	const scheduleClose = () => {
		cancelClose();
		closeTimer.current = window.setTimeout(
			() => changeOpen(false),
			CLOSE_DELAY_MS,
		);
	};

	useEffect(() => () => window.clearTimeout(closeTimer.current), []);

	const pick = (filter: string | null) => {
		cancelClose();
		changeOpen(false);
		onFilter(filter);
	};

	// arriving on the shop page while the menu is open (e.g. after picking a filter) closes it
	useEffect(() => {
		if (selected && open) changeOpen(false);
	}, [selected, open, changeOpen]);

	// close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) =>
			e.key === "Escape" && changeOpen(false);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, changeOpen]);

	return (
		<div
			ref={rootRef}
			className="relative"
			onPointerEnter={(e) => e.pointerType !== "touch" && openMenu()}
			onPointerLeave={(e) => e.pointerType !== "touch" && scheduleClose()}
			onFocus={(e) => e.target.matches(":focus-visible") && openMenu()}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget))
					changeOpen(false);
			}}
		>
			<NavButton
				label={label}
				selected={selected}
				trailing={
					hasDropdown ? (
						<ChevronDown size={14} strokeWidth={3} />
					) : undefined
				}
				aria-haspopup={hasDropdown ? "menu" : undefined}
				aria-expanded={hasDropdown ? isOpen : undefined}
				onClick={() => pick(null)}
			/>

			{isOpen && (
				<>
					{/* invisible bridge so the pointer can travel from the button down to the menu */}
					<span
						aria-hidden="true"
						className="absolute left-1/2 top-full h-8 w-52 -translate-x-1/2"
					/>

					<ul
						role="menu"
						style={{ top: "calc(50% + var(--nav-h) / 2 + 8px)" }}
						className="absolute left-1/2 min-w-52 -translate-x-1/2 border-[3px] border-black bg-white py-2"
					>
						<li role="none">
							<button
								role="menuitem"
								type="button"
								className={itemClass}
								onClick={() => pick(null)}
							>
								All
							</button>
						</li>
						{filters.map((filter) => (
							<li key={filter.value} role="none">
								<button
									role="menuitem"
									type="button"
									className={itemClass}
									onClick={() => pick(filter.value)}
								>
									{filter.label}
								</button>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
