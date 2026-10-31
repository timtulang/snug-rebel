export type AuthUser = {
  pkUserId?: string
  userEmail: string
  firstName: string
  lastName: string
  phoneNumber?: string
  role: string
  isActive: boolean
}

export type SessionUser = {
  user: AuthUser
  provider: 'email' | 'oauth'
}

export type ProductItem = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'Active' | 'Low stock' | 'Draft'
  sku: string
  variants: number
}

export type CategoryItem = {
  id: string
  name: string
  slug: string
  products: number
  status: 'Active' | 'Hidden'
}

export type CollectionItem = {
  id: string
  name: string
  products: number
  status: 'Live' | 'Scheduled'
  launch: string
}

export type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded'

export type OrderItem = {
  id: string
  customer: string
  total: number
  status: OrderStatus
  date: string
  channel: 'Web' | 'Marketplace' | 'In-store'
  shippingAddress?: string
  items?: Array<{ name: string; qty: number; price: number }>
  paymentMethod?: 'Card' | 'GCash' | 'Maya' | 'Bank transfer' | 'COD'
}
