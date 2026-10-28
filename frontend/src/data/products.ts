import type { ItemBadgeVariant } from '../components/shop/ItemCardBadge'
import { apiFetch } from "../api/api";

export type Category = 'tops' | 'bottoms' | 'outerwear' | 'best-selling' | 'accessories'
export type SortKey = 'best-selling' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

export type Product = {
    id: string
    name: string
    imageSrc: string
    price: number
    salePrice?: number
    rating: number
    reviewCount: number
    soldCount: number
    stockLeft?: number
    badge?: ItemBadgeVariant
    categories: Category[]
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'best-selling', label: 'Best selling' },
    { value: 'name-asc', label: 'Alphabetically, A-Z' },
    { value: 'name-desc', label: 'Alphabetically, Z-A' },
    { value: 'price-asc', label: 'Price, low to high' },
    { value: 'price-desc', label: 'Price, high to low' },
]

/** `sidebar: false` keeps a category in the nav dropdown and URL filter, but hides its sidebar button. (mainly for the "best selling" option) */
export const CATEGORIES: { value: Category; label: string; sidebar?: boolean }[] = [
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'best-selling', label: 'Best selling', sidebar: false },
    { value: 'accessories', label: 'Accessories' },
]

/** Grey square stand-in. Swap each product's imageSrc for a real image URL. */
const PLACEHOLDER =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#7a7a7a"/></svg>',
    )

const base = { imageSrc: PLACEHOLDER, rating: 5, reviewCount: 10, soldCount: 20 }

// export const PRODUCTS: Product[] = [
//     { ...base, id: 'p1', name: 'Item name', price: 500, badge: 'new', categories: ['tops'] },
//     { ...base, id: 'p2', name: 'Item name na mahaba', price: 500, salePrice: 250, soldCount: 64, categories: ['bottoms', 'best-selling'] },
//     { ...base, id: 'p3', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, soldCount: 48, categories: ['outerwear'] },
//     { ...base, id: 'p4', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, soldCount: 31, categories: ['tops'] },
//     { ...base, id: 'p5', name: 'Item name', price: 450, badge: 'new', categories: ['tops'] },
//     { ...base, id: 'p6', name: 'Item name na mahaba', price: 600, salePrice: 300, soldCount: 120, categories: ['bottoms', 'best-selling'] },
//     { ...base, id: 'p7', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, categories: ['outerwear'] },
//     { ...base, id: 'p8', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, categories: ['accessories'] },
//     { ...base, id: 'p9', name: 'Item name', price: 550, badge: 'new', categories: ['bottoms'] },
//     { ...base, id: 'p10', name: 'Item name na mahaba', price: 500, salePrice: 250, soldCount: 87, categories: ['tops', 'best-selling'] },
//     { ...base, id: 'p11', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, categories: ['outerwear'] },
//     { ...base, id: 'p12', name: 'Item name na mahaba', price: 250, badge: 'lowStock', stockLeft: 5, categories: ['accessories'] },
// ]

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/Product/ProductList");
}