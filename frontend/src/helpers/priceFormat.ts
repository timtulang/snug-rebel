const PESO_WHOLE = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const PESO_CENTS = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const COMPACT = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** 500 -> "₱500", 499.5 -> "₱499.50" */
export function formatPrice(amount: number) {
  return (Number.isInteger(amount) ? PESO_WHOLE : PESO_CENTS).format(amount)
}

/** 20 -> "20", 1200 -> "1.2K" */
export function formatCount(count: number) {
  return COMPACT.format(count)
}
